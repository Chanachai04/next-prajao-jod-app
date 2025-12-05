import { supabase } from "@/lib/supabaseClient";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// GET - ดึงข้อมูลสำหรับหน้า payment
export async function GET(req: Request) {
  const cookieStore = await cookies();
  const { searchParams } = new URL(req.url);
  const rentId = searchParams.get("rentId"); // ID ที่จอดรถจาก URL
  const userId = cookieStore.get("userId")?.value; // User ID จากคุกกี้

  // ตรวจสอบค่าที่จำเป็น
  if (!rentId) {
    return NextResponse.json(
      { message: "rentId is required" },
      { status: 400 }
    );
  }

  try {
    // ดึงข้อมูล rent_detail (รายละเอียดสถานที่จอดรถ)
    const { data: rentDetail, error: rentError } = await supabase
      .from("rent_detail")
      .select("id, name, district, subdistrict, province")
      .eq("id", rentId)
      .single();

    if (rentError) throw rentError;

    // ดึงข้อมูล price (ราคาต่อชั่วโมง/วัน/เดือน และเงินประกัน)
    const { data: price, error: priceError } = await supabase
      .from("price")
      .select("price_per_hour, price_per_day, price_per_month, deposit")
      .eq("rent_id", rentId)
      .single();

    if (priceError) throw priceError;

    // ดึงรูปภาพแรก (สำหรับแสดงในส่วนสรุป)
    const { data: images, error: imageError } = await supabase
      .from("rent_images")
      .select("image_url")
      .eq("rent_id", rentId)
      .limit(1);

    if (imageError) throw imageError;

    // ดึงข้อมูล user (ถ้ามี userId) เพื่อนำมาเติมในฟอร์มผู้จอง
    let userData = null;
    if (userId) {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id,first_name, last_name, citizen_id, phone, line_id")
        .eq("id", userId)
        .single();

      if (!userError && user) {
        userData = user;
      }
    }

    // ส่งข้อมูลทั้งหมดกลับไป
    return NextResponse.json({
      rentDetail,
      // แปลงค่าราคาที่ดึงมาเป็นตัวเลขทศนิยม (Float) ก่อนส่ง
      price: {
        price_per_hour: price.price_per_hour
          ? parseFloat(price.price_per_hour)
          : null,
        price_per_day: price.price_per_day
          ? parseFloat(price.price_per_day)
          : null,
        price_per_month: price.price_per_month
          ? parseFloat(price.price_per_month)
          : null,
        deposit: price.deposit ? parseFloat(price.deposit) : null,
      },
      image: images && images.length > 0 ? images[0].image_url : null,
      user: userData,
    });
  } catch (error) {
    console.error("Error fetching payment data:", error);
    return NextResponse.json(
      { message: "Error fetching data" },
      { status: 500 }
    );
  }
}

// POST - บันทึกข้อมูลการจอง
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      rentId,
      firstName,
      lastName,
      citizenId,
      phone,
      lineId,
      totalPrice,
      duration,
      mode,
    } = body;

    // ตรวจสอบค่าที่จำเป็นสำหรับบันทึกประวัติการจอง
    if (
      !userId ||
      !rentId ||
      totalPrice === undefined ||
      duration === undefined ||
      !mode
    ) {
      return NextResponse.json(
        {
          message:
            "userId, rentId, totalPrice, duration, and mode are required",
        },
        { status: 400 }
      );
    }

    // ตรวจสอบข้อมูลผู้จองที่จำเป็น (สำหรับการอัปเดต User Profile)
    if (!firstName || !lastName || !citizenId || !phone) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" },
        { status: 400 }
      );
    }

    // 1. ตรวจสอบข้อมูล User เดิม
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, citizen_id, first_name, last_name, phone")
      .eq("id", userId)
      .single();

    // 2. ถ้า User มีอยู่และข้อมูลส่วนตัวยังไม่ครบ ให้อัปเดตข้อมูลทั้งหมด
    if (
      existingUser &&
      (!existingUser.citizen_id ||
        !existingUser.first_name ||
        !existingUser.last_name ||
        !existingUser.phone)
    ) {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          first_name: firstName,
          last_name: lastName,
          citizen_id: citizenId,
          phone: phone,
          line_id: lineId || null,
          is_checked: true, // ตั้งค่า is_checked เป็น true
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating user:", updateError);
        throw updateError;
      }
    } else if (existingUser) {
      // 3. ถ้า User มีอยู่และมีข้อมูลครบอยู่แล้ว ให้อัปเดตเฉพาะ is_checked
      const { error: updateError } = await supabase
        .from("users")
        .update({
          is_checked: true, // ตั้งค่า is_checked เป็น true
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating user is_checked:", updateError);
        throw updateError;
      }
    }

    // 4. สร้าง object ข้อมูลสำหรับบันทึกลง rent_history
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const historyData: any = {
      user_id: userId,
      rent_id: rentId,
      status: true, // กำหนดสถานะการจองสำเร็จ
      created_at: new Date().toISOString(),
      total_price: totalPrice,
    };

    // เพิ่มคอลัมน์ระยะเวลา ตาม mode การจอง
    if (mode === "hourly") {
      historyData.parking_time_hour = duration;
    } else if (mode === "daily") {
      historyData.parking_time_day = duration;
    } else if (mode === "monthly") {
      historyData.parking_time_month = duration;
    }

    // 5. บันทึกข้อมูลการจองลง rent_history และดึง id ที่สร้างขึ้น
    const { data: historyResult, error: historyError } = await supabase
      .from("rent_history")
      .insert(historyData)
      .select("id")
      .single();

    if (historyError) {
      console.error("Error creating rent history:", historyError);
      throw historyError;
    }

    // 6. ส่งผลลัพธ์สำเร็จพร้อม rentHistoryId
    return NextResponse.json({
      success: true,
      message: "สร้างการจองสำเร็จ",
      rentHistoryId: historyResult.id,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการชำระเงิน" },
      { status: 500 }
    );
  }
}
