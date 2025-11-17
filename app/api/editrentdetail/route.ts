import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Buffer } from "node:buffer";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";

export const runtime = "nodejs";

type RentDetailPayload = {
  name?: string;
  type?: string;
  description?: string;
  total_slot?: number;
  address?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  landmark?: string;
  price?: {
    price_per_hour?: number | null;
    price_per_day?: number | null;
    price_per_month?: number | null;
    deposit?: number | null;
  };
  facilities?: string[];
  schedule?: Array<{
    day: string;
    open_time: string;
    close_time: string;
  }>;
};

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
      return NextResponse.json(
        { message: "ไม่พบ rent_id" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { message: "ไม่พบ rent_id" },
        { status: 400 }
      );
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

    const body = JSON.parse(payloadRaw) as RentDetailPayload;

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
    const deposit =
      typeof price?.deposit === "number" ? price.deposit : null;

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

    // อัปเดต facilities - ลบเก่าแล้วเพิ่มใหม่
    await supabase.from("rent_facilities").delete().eq("rent_id", rentId);

    if (Array.isArray(facilities) && facilities.length > 0) {
      const uniqueFacilities = Array.from(new Set(facilities));
      const facilityRows = uniqueFacilities.map((facilityName) => ({
        rent_id: rentId,
        name: facilityName,
      }));

      await supabase.from("rent_facilities").insert(facilityRows);
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
          await supabase
            .from("rent_images")
            .delete()
            .in("id", deletedImageIds);
        }
      } catch (err) {
        console.error("Error parsing deleted_image_ids:", err);
      }
    }

    // เพิ่มรูปภาพใหม่ (ถ้ามี)
    if (images.length > 0) {
      const uploadedUrls: string[] = [];
      for (const file of images) {
        if (!file || !file.size) continue;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileExt =
          file.name.split(".").pop()?.toLowerCase() || "jpg";
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

        await supabase.from("rent_images").insert(imageRows);
      }
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

