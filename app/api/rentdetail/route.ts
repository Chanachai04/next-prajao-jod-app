import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Buffer } from "node:buffer";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";
import { RentDetailPayload } from "@/types/rentDetail";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    //ตรวจสอบ user จาก cookies
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ" },
        { status: 401 }
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

    // ใช้ owner_id จาก cookie แทนที่จะใช้จาก body (เพื่อความปลอดภัย)
    const owner_id = userId;
    //validate
    if (
      !name ||
      !type ||
      !address ||
      typeof total_slot !== "number" ||
      !subdistrict ||
      !district ||
      !province ||
      !landmark ||
      !owner_id
    ) {
      return NextResponse.json(
        { message: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }
    //นำข้อมูลลงตาราง rent_detail
    const { data, error } = await supabase
      .from("rent_detail")
      .insert({
        name,
        type,
        description: description ?? "",
        total_slot,
        address,
        subdistrict,
        district,
        province,
        landmark,
        owner_id,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Insert rent_detail error:", error);
      return NextResponse.json(
        { message: "ไม่สามารถบันทึกข้อมูลได้" },
        { status: 500 }
      );
    }

    if (!data?.id) {
      return NextResponse.json(
        { message: "ไม่สามารถบันทึกข้อมูลได้" },
        { status: 500 }
      );
    }
    //นำข้อมูลลงตาราง price
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

    let priceId: string | null = null;
    let facilityIds: string[] | undefined;
    let scheduleIds: string[] | undefined;
    let imageIds: string[] | undefined;
    if (hasPrice) {
      const { data: priceRows, error: priceError } = await supabase
        .from("price")
        .insert({
          rent_id: data.id,
          price_per_hour: pricePerHour,
          price_per_day: pricePerDay,
          price_per_month: pricePerMonth,
          deposit,
        })
        .select("id")
        .single();

      if (priceError) {
        console.error("Insert price error:", priceError);
        return NextResponse.json(
          { message: "บันทึกข้อมูลราคาไม่สำเร็จ" },
          { status: 500 }
        );
      }
      priceId = priceRows?.id ?? null;
    }
    //นำข้อมูลลงตาราง facilities
    if (Array.isArray(facilities) && facilities.length > 0) {
      const uniqueFacilities = Array.from(new Set(facilities));
      const facilityRows = uniqueFacilities.map((facilityName) => ({
        rent_id: data.id,
        name: facilityName,
      }));

      const { data: facilityData, error: facilitiesError } = await supabase
        .from("rent_facilities")
        .insert(facilityRows)
        .select("id");

      if (facilitiesError) {
        console.error("Insert facilities error:", facilitiesError);
        return NextResponse.json(
          { message: "บันทึกข้อมูลสิ่งอำนวยความสะดวกไม่สำเร็จ" },
          { status: 500 }
        );
      }
      facilityIds =
        facilityData?.map((facility) => facility.id).filter(Boolean) ?? [];
    }
    //นำข้อมูลลงตาราง schedule
    if (Array.isArray(schedule) && schedule.length > 0) {
      const toPgTime = (t: string) => (t?.length === 5 ? `${t}:00` : t);
      const rows = schedule.map((item) => ({
        rent_id: data.id,
        available_days: [item.day],
        open_time: toPgTime(item.open_time),
        close_time: toPgTime(item.close_time),
      }));
      const { data: scheduleData, error: scheduleError } = await supabase
        .from("rent_schedule")
        .insert(rows)
        .select("id");
      if (scheduleError) {
        console.error("Insert schedule error:", scheduleError);
        return NextResponse.json(
          { message: "บันทึกเวลาเปิดปิดไม่สำเร็จ" },
          { status: 500 }
        );
      }
      scheduleIds = scheduleData?.map((item) => item.id).filter(Boolean) ?? [];
    }
    //ส่วนอัปโหลดรูปภาพ
    if (images.length > 0) {
      const uploadedUrls: string[] = [];
      const uploadedImageIds: string[] = [];
      for (const file of images) {
        if (!file || !file.size) continue;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filePath = `${data.id}/${randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("parking_bk")
          .upload(filePath, buffer, {
            contentType: file.type || "image/jpeg",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload image error:", uploadError);
          return NextResponse.json(
            { message: "อัปโหลดรูปภาพไม่สำเร็จ" },
            { status: 500 }
          );
        }

        const { data: publicUrlData } = supabase.storage
          .from("parking_bk")
          .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
          console.error("Get public URL failed for", filePath);
          return NextResponse.json(
            { message: "สร้างลิงก์รูปภาพไม่สำเร็จ" },
            { status: 500 }
          );
        }

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      if (uploadedUrls.length > 0) {
        const imageRows = uploadedUrls.map((url) => ({
          rent_id: data.id,
          image_url: url,
        }));

        const { data: imageData, error: imageError } = await supabase
          .from("rent_images")
          .insert(imageRows)
          .select("id");

        if (imageError) {
          console.error("Insert images error:", imageError);
          return NextResponse.json(
            { message: "บันทึกรูปภาพไม่สำเร็จ" },
            { status: 500 }
          );
        }
        uploadedImageIds.push(
          ...(imageData?.map((item) => item.id).filter(Boolean) ?? [])
        );

        imageIds = uploadedImageIds;
      }
    }

    if (priceId) {
      const { error: priceUpdateErr } = await supabase
        .from("rent_detail")
        .update({ price_id: priceId })
        .eq("id", data.id);
      if (priceUpdateErr) {
        console.error("Update rent_detail price_id error:", priceUpdateErr);
        return NextResponse.json(
          { message: "อัปเดตข้อมูลอ้างอิงราคาไม่สำเร็จ" },
          { status: 500 }
        );
      }
    }
    
    const tryUpdateArrayThenSingle = async (
      column: string,
      ids?: string[] | null
    ) => {
      if (!ids) return null;
      if (ids.length === 0) return null;
      const payloadArray: Record<string, unknown> = {};
      payloadArray[column] = ids;
      let res = await supabase
        .from("rent_detail")
        .update(payloadArray)
        .eq("id", data.id);
      if (!res.error) return null;
      const payloadSingle: Record<string, unknown> = {};
      payloadSingle[column] = ids[0];
      res = await supabase
        .from("rent_detail")
        .update(payloadSingle)
        .eq("id", data.id);
      if (!res.error) return null;
      return res.error;
    };

    if (facilityIds && facilityIds.length > 0) {
      const err = await tryUpdateArrayThenSingle("facilities_id", facilityIds);
      if (err) {
        console.error("Update rent_detail facilities_id error:", err);
        return NextResponse.json(
          { message: "อัปเดตข้อมูลสิ่งอำนวยความสะดวกไม่สำเร็จ" },
          { status: 500 }
        );
      }
    }

    if (scheduleIds && scheduleIds.length > 0) {
      const err = await tryUpdateArrayThenSingle("schedule_id", scheduleIds);
      if (err) {
        console.error("Update rent_detail schedule_id error:", err);
        return NextResponse.json(
          { message: "อัปเดตข้อมูลเวลาไม่สำเร็จ" },
          { status: 500 }
        );
      }
    }

    if (imageIds && imageIds.length > 0) {
      const err = await tryUpdateArrayThenSingle("image_id", imageIds);
      if (err) {
        console.error("Update rent_detail image_id error:", err);
        return NextResponse.json(
          { message: "อัปเดตรูปภาพไม่สำเร็จ" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: "บันทึกข้อมูลสำเร็จ", id: data?.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Rent detail API error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดภายในระบบ" },
      { status: 500 }
    );
  }
}
