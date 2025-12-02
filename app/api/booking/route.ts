import { supabase } from "@/lib/supabaseClient";
import {
  FacilityRow,
  ImageRow,
  PriceRow,
  RentDetailRow,
  ScheduleRow,
} from "@/types/booking";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // ดึง Query Parameters จาก URL
  const { searchParams } = new URL(req.url);
  const provinceParam = searchParams.get("province")?.trim();
  const districtParam = searchParams.get("district")?.trim();
  const subdistrictParam = searchParams.get("subdistrict")?.trim();
  const searchParam = searchParams.get("search")?.trim();
  const modeParamRaw = searchParams.get("mode")?.trim()?.toLowerCase();

  // แปลงค่า modeParam ให้เป็น 'hourly', 'monthly' หรือ undefined
  const modeParam =
    modeParamRaw === "monthly" || modeParamRaw === "daily"
      ? "monthly"
      : modeParamRaw === "hourly"
      ? "hourly"
      : undefined;

  // 1. เริ่มต้น Query เพื่อดึงข้อมูลรายละเอียดการเช่าหลัก (rent_detail)
  let detailQuery = supabase
    .from("rent_detail")
    .select(
      [
        "id",
        "name",
        "type",
        "description",
        "total_slot",
        "address",
        "subdistrict",
        "district",
        "province",
        "landmark",
      ].join(",")
    );

  // 2. ใช้ Filter ตามลำดับความสำคัญของ Location (Subdistrict > District > Province)
  if (subdistrictParam) {
    detailQuery = detailQuery.eq("subdistrict", subdistrictParam);
  } else if (districtParam) {
    detailQuery = detailQuery.eq("district", districtParam);
  } else if (provinceParam) {
    detailQuery = detailQuery.eq("province", provinceParam);
  }

  // 3. ดำเนินการ Query รายละเอียดการเช่าหลัก
  const {
    data: rentDetailData,
    error: rentDetailError,
    status,
  } = await detailQuery;

  // จัดการข้อผิดพลาดจากการ Query หลัก
  if (rentDetailError) {
    return NextResponse.json(
      { message: rentDetailError.message },
      { status: status ?? 500 }
    );
  }

  const rentDetailRows = (rentDetailData ?? []) as unknown as RentDetailRow[];

  // หากไม่พบรายละเอียดการเช่าใดๆ ให้ส่ง array ว่างกลับไป
  if (!rentDetailRows || rentDetailRows.length === 0) {
    return NextResponse.json({ data: [] });
  }

  // ดึง ID ทั้งหมดของรายการที่พบเพื่อใช้ในการ Query ข้อมูลย่อยที่เกี่ยวข้อง
  const rentIds = rentDetailRows.map((item) => item.id);

  // 4. ดึงข้อมูลย่อยทั้งหมดที่เกี่ยวข้องพร้อมกัน (ราคา, สิ่งอำนวยความสะดวก, ตารางเวลา, รูปภาพ)
  const [priceResult, facilityResult, scheduleResult, imageResult] =
    await Promise.all([
      // ดึงข้อมูลราคา
      supabase
        .from("price")
        .select(
          [
            "id",
            "rent_id",
            "price_per_hour",
            "price_per_day",
            "price_per_month",
            "deposit",
          ].join(",")
        )
        .in("rent_id", rentIds),
      // ดึงข้อมูลสิ่งอำนวยความสะดวก
      supabase
        .from("rent_facilities")
        .select(["id", "rent_id", "name"].join(","))
        .in("rent_id", rentIds),
      // ดึงข้อมูลตารางเวลา
      supabase
        .from("rent_schedule")
        .select(
          ["id", "rent_id", "available_days", "open_time", "close_time"].join(
            ","
          )
        )
        .in("rent_id", rentIds),
      // ดึงข้อมูลรูปภาพ
      supabase
        .from("rent_images")
        .select(["id", "rent_id", "image_url"].join(","))
        .in("rent_id", rentIds),
    ]);

  // 5. จัดการข้อผิดพลาดจากการ Query ข้อมูลย่อย
  if (priceResult.error) {
    return NextResponse.json(
      { message: priceResult.error.message },
      { status: priceResult.status ?? 500 }
    );
  }
  if (facilityResult.error) {
    return NextResponse.json(
      { message: facilityResult.error.message },
      { status: facilityResult.status ?? 500 }
    );
  }
  if (scheduleResult.error) {
    return NextResponse.json(
      { message: scheduleResult.error.message },
      { status: scheduleResult.status ?? 500 }
    );
  }
  if (imageResult.error) {
    return NextResponse.json(
      { message: imageResult.error.message },
      { status: imageResult.status ?? 500 }
    );
  }

  const priceRows = (priceResult.data ?? []) as unknown as PriceRow[];
  const facilityRows = (facilityResult.data ?? []) as unknown as FacilityRow[];
  const scheduleRows = (scheduleResult.data ?? []) as unknown as ScheduleRow[];
  const imageRows = (imageResult.data ?? []) as unknown as ImageRow[];

  // 6. สร้าง Map เพื่อจัดกลุ่มข้อมูลย่อยตาม rent_id

  // Map สำหรับ Price (1:1)
  const priceMap = new Map<string, PriceRow>();
  priceRows.forEach((price) => {
    priceMap.set(price.rent_id, price);
  });

  // Map สำหรับ Facilities (1:N)
  const facilityMap = new Map<string, FacilityRow[]>();
  facilityRows.forEach((facility) => {
    const list = facilityMap.get(facility.rent_id) ?? [];
    list.push(facility);
    facilityMap.set(facility.rent_id, list);
  });

  // Map สำหรับ Schedule (1:N)
  const scheduleMap = new Map<string, ScheduleRow[]>();
  scheduleRows.forEach((schedule) => {
    const list = scheduleMap.get(schedule.rent_id) ?? [];
    list.push(schedule);
    scheduleMap.set(schedule.rent_id, list);
  });

  // Map สำหรับ Images (1:N)
  const imageMap = new Map<string, ImageRow[]>();
  imageRows.forEach((image) => {
    const list = imageMap.get(image.rent_id) ?? [];
    list.push(image);
    imageMap.set(image.rent_id, list);
  });

  // 7. รวมข้อมูลย่อยเข้ากับรายละเอียดการเช่าหลัก
  let data = rentDetailRows.map((rent) => {
    const price = priceMap.get(rent.id) ?? null;
    const facilities = facilityMap.get(rent.id) ?? [];
    const schedules = scheduleMap.get(rent.id) ?? [];
    const images = imageMap.get(rent.id) ?? [];
    return {
      ...rent,
      price,
      facilities,
      schedules,
      images,
    };
  });

  // 8. กรองข้อมูลด้วย Search Keyword (Free-text search)
  // เนื่องจาก Supabase ไม่รองรับ Full-Text Search ที่ซับซ้อนใน Query แรก จึงทำการกรองที่ฝั่ง Server (Node.js)
  if (searchParam) {
    const keyword = searchParam.toLowerCase();
    data = data.filter((item) => {
      const fields = [
        item.subdistrict,
        item.district,
        item.province,
        item.name,
        item.address,
        item.landmark,
      ];
      // ตรวจสอบว่ามี field ใด field หนึ่งที่รวม Keyword ที่ค้นหาหรือไม่
      return fields.some((field) =>
        (field ?? "").toLowerCase().includes(keyword)
      );
    });
  }

  // 9. กรองตาม Mode การจอง (Hourly/Monthly)
  if (modeParam === "hourly") {
    data = data.filter((item) => {
      const price = item.price;
      // รายชั่วโมงต้องมีราคาต่อชั่วโมง หรือราคาต่อวัน
      return (
        price?.price_per_hour !== null ||
        price?.price_per_hour === 0 ||
        price?.price_per_day !== null ||
        price?.price_per_day === 0
      );
    });
  } else if (modeParam === "monthly") {
    data = data.filter((item) => {
      const price = item.price;
      // รายเดือนต้องมีราคาต่อเดือน
      return price?.price_per_month !== null || price?.price_per_month === 0;
    });
  }

  // 10. ส่งผลลัพธ์สุดท้ายกลับไป
  return NextResponse.json({ data });
}
