import { supabase } from "@/lib/supabaseClient";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // ดึง Cookie Store
  const cookie = await cookies();

  // ดึง Query Parameters จาก URL
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id"); // ID ของสถานที่จอดรถ

  // ดึง userId จากคุกกี้
  const userId = cookie.get("userId")?.value;

  // 1. ตรวจสอบว่ามี ID ถูกส่งมาหรือไม่
  if (!id) {
    return NextResponse.json({ message: "ID is required" }, { status: 400 });
  }

  // 2. ดึงข้อมูลรายละเอียดการเช่าหลัก (rent_detail)
  const { data: rentDetail, error: rentDetailError } = await supabase
    .from("rent_detail")
    .select("*")
    .eq("id", id)
    .single(); // คาดหวังผลลัพธ์เดียว

  // 3. ดึงข้อมูลย่อยที่เกี่ยวข้องทั้งหมดตาม rent_id (ID)

  // ดึงข้อมูลราคา (price)
  const { data: price, error: priceError } = await supabase
    .from("price")
    .select("*")
    .eq("rent_id", id)
    .single();

  // ดึงข้อมูลสิ่งอำนวยความสะดวก (rent_facilities)
  const { data: facilities, error: facilitiesError } = await supabase
    .from("rent_facilities")
    .select("*")
    .eq("rent_id", id);

  // ดึงข้อมูลตารางเวลา (rent_schedule)
  const { data: schedules, error: schedulesError } = await supabase
    .from("rent_schedule")
    .select("*")
    .eq("rent_id", id);

  // ดึงข้อมูลรูปภาพ (rent_images)
  const { data: images, error: imagesError } = await supabase
    .from("rent_images")
    .select("*")
    .eq("rent_id", id);

  // 4. จัดการข้อผิดพลาดในการดึงข้อมูล
  if (
    rentDetailError ||
    priceError ||
    facilitiesError ||
    schedulesError ||
    imagesError
  ) {
    // ส่งข้อความผิดพลาดที่เกี่ยวข้องกลับไป
    return NextResponse.json(
      {
        message:
          rentDetailError?.message ||
          priceError?.message ||
          facilitiesError?.message ||
          schedulesError?.message ||
          imagesError?.message,
      },
      { status: 500 }
    );
  }

  // 5. ส่งข้อมูลทั้งหมดกลับไปพร้อมกับ userId
  return NextResponse.json(
    {
      rentDetail: rentDetail,
      price: price,
      facilities: facilities,
      schedules: schedules,
      images: images,
      userId: userId, // ID ผู้ใช้จากคุกกี้
    },
    { status: 200 }
  );
}
