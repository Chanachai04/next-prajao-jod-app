import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Buffer } from "node:buffer";
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
  latitude?: number;
  longitude?: number;
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

export async function POST(req: Request) {
  try {
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
      latitude,
      longitude,
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
      !landmark ||
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return NextResponse.json(
        { message: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

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
        latitude,
        longitude,
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
      const { error: priceError } = await supabase.from("price").insert({
        rent_id: data.id,
        price_per_hour: pricePerHour,
        price_per_day: pricePerDay,
        price_per_month: pricePerMonth,
        deposit,
      });

      if (priceError) {
        console.error("Insert price error:", priceError);
        return NextResponse.json(
          { message: "บันทึกข้อมูลราคาไม่สำเร็จ" },
          { status: 500 }
        );
      }
    }

    if (Array.isArray(facilities) && facilities.length > 0) {
      const uniqueFacilities = Array.from(new Set(facilities));
      const facilityRows = uniqueFacilities.map((facilityName) => ({
        rent_id: data.id,
        name: facilityName,
      }));

      const { error: facilitiesError } = await supabase
        .from("rent_facilities")
        .insert(facilityRows);

      if (facilitiesError) {
        console.error("Insert facilities error:", facilitiesError);
        return NextResponse.json(
          { message: "บันทึกข้อมูลสิ่งอำนวยความสะดวกไม่สำเร็จ" },
          { status: 500 }
        );
      }
    }

    if (Array.isArray(schedule) && schedule.length > 0) {
      const toPgTime = (t: string) => (t?.length === 5 ? `${t}:00` : t);
      const rows = schedule.map((item) => ({
        rent_id: data.id,
        // If column is text[] in DB, wrap as single-element array
        available_days: [item.day],
        open_time: toPgTime(item.open_time),
        close_time: toPgTime(item.close_time),
      }));
      const { error: scheduleError } = await supabase
        .from("rent_schedule")
        .insert(rows);
      if (scheduleError) {
        console.error("Insert schedule error:", scheduleError);
        return NextResponse.json(
          { message: "บันทึกเวลาเปิดปิดไม่สำเร็จ" },
          { status: 500 }
        );
      }
    }

    if (images.length > 0) {
      const uploadedUrls: string[] = [];
      for (const file of images) {
        if (!file || !file.size) continue;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileExt =
          file.name.split(".").pop()?.toLowerCase() || "jpg";
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

        const { error: imageError } = await supabase
          .from("rent_images")
          .insert(imageRows);

        if (imageError) {
          console.error("Insert images error:", imageError);
          return NextResponse.json(
            { message: "บันทึกรูปภาพไม่สำเร็จ" },
            { status: 500 }
          );
        }
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

