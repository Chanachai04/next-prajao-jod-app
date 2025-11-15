import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { supabase } from "@/lib/supabaseClient";

const SECRET_KEY = process.env.SECRET_KEY as string;

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const userId = cookieStore.get("userId")?.value;

    if (!token || !userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
      if (payload && typeof payload === "object" && "userId" in payload) {
        if ((payload as { userId?: string }).userId !== userId) {
          return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
      }
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { license_plate, province, brand, model, color } = body;

    if (!license_plate || !province || !brand || !model || !color) {
      return NextResponse.json({ message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const newId = randomUUID();

    const { data: insertData, error: insertErr } = await supabase
      .from("user_car")
      .insert({
        id: newId,
        user_id: userId,
        license_plate,
        province,
        brand,
        model,
        color,
      })
      .select("id")
      .single();

    if (insertErr) {
      console.error("Insert user_car error:", insertErr);
      return NextResponse.json({ message: "บันทึกข้อมูลรถไม่สำเร็จ" }, { status: 500 });
    }

    const carId = insertData?.id ?? newId;

    const { error: updateErr } = await supabase
      .from("users")
      .update({ car_id: carId })
      .eq("id", userId);

    if (updateErr) {
      console.error("Update users.car_id error:", updateErr);
      // we return success for insert but inform about update failure
      return NextResponse.json(
        { message: "บันทึกข้อมูลรถสำเร็จ แต่ไม่สามารถอัปเดตผู้ใช้ได้", car_id: carId },
        { status: 200 }
      );
    }

    return NextResponse.json({ message: "บันทึกข้อมูลรถสำเร็จ", car_id: carId }, { status: 201 });
  } catch (err) {
    console.error("Add car API error:", err);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 });
  }
}
