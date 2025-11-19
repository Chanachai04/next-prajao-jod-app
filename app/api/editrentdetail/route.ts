import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Buffer } from "node:buffer";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";
import { EditRentDetailPayload } from "@/types/editRentDetail";

export const runtime = "nodejs";

// GET - ดึงข้อมูล rent_detail พร้อมข้อมูลที่เกี่ยวข้อง
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const rentId = searchParams.get("rent_id");

    if (!rentId) {
      return NextResponse.json({ message: "ไม่พบ rent_id" }, { status: 400 });
    }

    // ดึงข้อมูล rent_detail
    const { data: rentDetail, error: rentDetailError } = await supabase
      .from("rent_detail")
      .select("*")
      .eq("id", rentId)
      .eq("owner_id", userId)
      .single();

    if (rentDetailError || !rentDetail) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลหรือไม่มีสิทธิ์เข้าถึง" },
        { status: 404 }
      );
    }

    // ดึงข้อมูล price
    const { data: price } = await supabase
      .from("price")
      .select("*")
      .eq("rent_id", rentId)
      .single();

    // ดึงข้อมูล facilities
    const { data: facilities } = await supabase
      .from("rent_facilities")
      .select("*")
      .eq("rent_id", rentId);

    // ดึงข้อมูล schedule
    const { data: schedules } = await supabase
      .from("rent_schedule")
      .select("*")
      .eq("rent_id", rentId);

    // ดึงข้อมูล images
    const { data: images } = await supabase
      .from("rent_images")
      .select("*")
      .eq("rent_id", rentId);

    return NextResponse.json({
      success: true,
      data: {
        rentDetail,
        price: price || null,
        facilities: facilities || [],
        schedules: schedules || [],
        images: images || [],
      },
    });
  } catch (error) {
    console.error("Get rent detail error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดภายในระบบ" },
      { status: 500 }
    );
  }
}

// PUT/PATCH - อัปเดตข้อมูล rent_detail
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const rentId = searchParams.get("rent_id");

    if (!rentId) {
      return NextResponse.json({ message: "ไม่พบ rent_id" }, { status: 400 });
    }

    // ตรวจสอบว่า rent_id นี้เป็นของ owner_id นี้หรือไม่
    const { data: rentData, error: checkError } = await supabase
      .from("rent_detail")
      .select("id, owner_id")
      .eq("id", rentId)
      .eq("owner_id", userId)
      .single();

    if (checkError || !rentData) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลหรือไม่มีสิทธิ์แก้ไขข้อมูลนี้" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const payloadRaw = formData.get("payload");
    const images = formData.getAll("images") as File[];

    if (typeof payloadRaw !== "string") {
      return NextResponse.json(
        { message: "ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const body = JSON.parse(payloadRaw) as EditRentDetailPayload;

    const {
      name,
      type,
      description,
      total_slot,
      address,
      subdistrict,
      district,
      province,
      landmark,
      price,
      facilities,
      schedule,
    } = body;

    if (
      !name ||
      !type ||
      !address ||
      typeof total_slot !== "number" ||
      !subdistrict ||
      !district ||
      !province ||
      !landmark
    ) {
      return NextResponse.json(
        { message: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    // อัปเดต rent_detail
    const { error: updateError } = await supabase
      .from("rent_detail")
      .update({
        name,
        type,
        description: description ?? "",
        total_slot,
        address,
        subdistrict,
        district,
        province,
        landmark,
      })
      .eq("id", rentId);

    if (updateError) {
      console.error("Update rent_detail error:", updateError);
      return NextResponse.json(
        { message: "ไม่สามารถอัปเดตข้อมูลได้" },
        { status: 500 }
      );
    }

    // อัปเดต price
    const pricePerHour =
      typeof price?.price_per_hour === "number" ? price.price_per_hour : null;
    const pricePerDay =
      typeof price?.price_per_day === "number" ? price.price_per_day : null;
    const pricePerMonth =
      typeof price?.price_per_month === "number" ? price.price_per_month : null;
    const deposit = typeof price?.deposit === "number" ? price.deposit : null;

    const hasPrice =
      pricePerHour !== null ||
      pricePerDay !== null ||
      pricePerMonth !== null ||
      deposit !== null;

    if (hasPrice) {
      // ตรวจสอบว่ามี price อยู่แล้วหรือไม่
      const { data: existingPrice } = await supabase
        .from("price")
        .select("id")
        .eq("rent_id", rentId)
        .single();

      if (existingPrice) {
        // อัปเดต price ที่มีอยู่
        await supabase
          .from("price")
          .update({
            price_per_hour: pricePerHour,
            price_per_day: pricePerDay,
            price_per_month: pricePerMonth,
            deposit,
          })
          .eq("rent_id", rentId);
      } else {
        // สร้าง price ใหม่
        await supabase.from("price").insert({
          rent_id: rentId,
          price_per_hour: pricePerHour,
          price_per_day: pricePerDay,
          price_per_month: pricePerMonth,
          deposit,
        });
      }
    }

    // อัปเดต facilities - ลบทั้งหมดแล้วเพิ่มใหม่
    // ขั้นตอนที่ 1: ดึงข้อมูล facilities เก่า
    const { data: existingFacilities } = await supabase
      .from("rent_facilities")
      .select("id, name")
      .eq("rent_id", rentId);

    const newFacilities = Array.isArray(facilities)
      ? Array.from(new Set(facilities))
      : [];

    console.log("Existing facilities:", (existingFacilities || []).map(f => f.name));
    console.log("New facilities:", newFacilities);

    // ขั้นตอนที่ 2: เซ็ต facilities_id ใน rent_detail เป็น null ก่อน (เพื่อหลีกเลี่ยง foreign key constraint)
    if (existingFacilities && existingFacilities.length > 0) {
      console.log("Setting facilities_id to null in rent_detail");

      const { error: nullifyError } = await supabase
        .from("rent_detail")
        .update({ facilities_id: null })
        .eq("id", rentId);

      if (nullifyError) {
        console.error("Nullify facilities_id error:", nullifyError);
      }
    }

    // ขั้นตอนที่ 3: ลบ facilities เก่าทั้งหมด
    if (existingFacilities && existingFacilities.length > 0) {
      console.log("Deleting all existing facilities for rent_id:", rentId);

      const { error: deleteFacilitiesError } = await supabase
        .from("rent_facilities")
        .delete()
        .eq("rent_id", rentId);

      if (deleteFacilitiesError) {
        console.error("Delete facilities error:", deleteFacilitiesError);
        return NextResponse.json(
          {
            message: "ไม่สามารถอัปเดตสิ่งอำนวยความสะดวกได้ กรุณาลองใหม่อีกครั้ง",
            error: deleteFacilitiesError.message
          },
          { status: 500 }
        );
      } else {
        console.log("Successfully deleted all existing facilities");
      }
    }

    // ขั้นตอนที่ 4: เพิ่ม facilities ใหม่ทั้งหมด
    if (newFacilities.length > 0) {
      const facilityRows = newFacilities.map((facilityName) => ({
        rent_id: rentId,
        name: facilityName,
      }));

      console.log("Inserting new facilities:", facilityRows);

      const { error: insertFacilitiesError } = await supabase
        .from("rent_facilities")
        .insert(facilityRows);

      if (insertFacilitiesError) {
        console.error("Insert facilities error:", insertFacilitiesError);
        return NextResponse.json(
          {
            message: "ไม่สามารถเพิ่มสิ่งอำนวยความสะดวกได้",
            error: insertFacilitiesError.message
          },
          { status: 500 }
        );
      } else {
        console.log("Successfully inserted new facilities");
      }
    }

    // อัปเดต schedule - ลบเก่าแล้วเพิ่มใหม่
    await supabase.from("rent_schedule").delete().eq("rent_id", rentId);

    if (Array.isArray(schedule) && schedule.length > 0) {
      const toPgTime = (t: string) => (t?.length === 5 ? `${t}:00` : t);
      const rows = schedule.map((item) => ({
        rent_id: rentId,
        available_days: [item.day],
        open_time: toPgTime(item.open_time),
        close_time: toPgTime(item.close_time),
      }));

      await supabase.from("rent_schedule").insert(rows);
    }

    // ลบรูปภาพที่ถูกลบ (ถ้ามี)
    const deletedImageIdsRaw = formData.get("deleted_image_ids");
    if (deletedImageIdsRaw && typeof deletedImageIdsRaw === "string") {
      try {
        const deletedImageIds: string[] = JSON.parse(deletedImageIdsRaw);
        if (Array.isArray(deletedImageIds) && deletedImageIds.length > 0) {
          await supabase.from("rent_images").delete().in("id", deletedImageIds);
        }
      } catch (err) {
        console.error("Error parsing deleted_image_ids:", err);
      }
    }

    // เพิ่มรูปภาพใหม่ (ถ้ามี)
    let firstNewImageId: string | null = null;
    if (images.length > 0) {
      const uploadedUrls: string[] = [];
      for (const file of images) {
        if (!file || !file.size) continue;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filePath = `${rentId}/${randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("parking_bk")
          .upload(filePath, buffer, {
            contentType: file.type || "image/jpeg",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload image error:", uploadError);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from("parking_bk")
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          uploadedUrls.push(publicUrlData.publicUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        const imageRows = uploadedUrls.map((url) => ({
          rent_id: rentId,
          image_url: url,
        }));

        const { data: insertedImages, error: insertImagesError } = await supabase
          .from("rent_images")
          .insert(imageRows)
          .select("id");

        if (insertImagesError) {
          console.error("Insert images error:", insertImagesError);
        } else if (insertedImages && insertedImages.length > 0) {
          // เก็บ ID ของรูปแรกที่อัปโหลด
          firstNewImageId = insertedImages[0].id;
        }
      }
    }

    // อัปเดต image_id ใน rent_detail ให้ชี้ไปที่รูปแรก
    // ลำดับความสำคัญ: รูปใหม่ที่อัปโหลดรูปแรก > รูปเก่าที่เหลืออยู่รูปแรก
    let imageIdToSet: string | null = null;

    if (firstNewImageId) {
      // ถ้ามีรูปใหม่ที่อัปโหลด ให้ใช้รูปแรกที่อัปโหลด
      imageIdToSet = firstNewImageId;
    } else {
      // ถ้าไม่มีรูปใหม่ ให้ดึงรูปเก่าที่เหลืออยู่รูปแรก
      const { data: remainingImages } = await supabase
        .from("rent_images")
        .select("id")
        .eq("rent_id", rentId)
        .order("created_at", { ascending: true })
        .limit(1);

      if (remainingImages && remainingImages.length > 0) {
        imageIdToSet = remainingImages[0].id;
      }
    }

    // อัปเดต image_id ใน rent_detail
    if (imageIdToSet) {
      await supabase
        .from("rent_detail")
        .update({ image_id: imageIdToSet })
        .eq("id", rentId);
    }

    return NextResponse.json({
      success: true,
      message: "อัปเดตข้อมูลสำเร็จ",
    });
  } catch (error) {
    console.error("Update rent detail error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดภายในระบบ" },
      { status: 500 }
    );
  }
}
