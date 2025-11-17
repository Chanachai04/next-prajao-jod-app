import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const SECRET_KEY = process.env.SECRET_KEY as string;

export async function POST(req: Request) {
  try {
    // รับข้อมูลจาก body ของ request (JSON)
    const { email, password } = await req.json();

    // หา user ในฐานข้อมูล Supabase ตาม email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    // ถ้าไม่พบ user หรือเกิด error => ส่ง status 401
    if (!user || error)
      return NextResponse.json({ message: "ไม่พบผู้ใช้" }, { status: 401 });

    // ตรวจสอบรหัสผ่านโดยใช้ bcrypt
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return NextResponse.json(
        { message: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );

    // สร้าง JWT token โดยเก็บ userId ใน payload
    const jwtToken = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .sign(new TextEncoder().encode(SECRET_KEY));

    // สร้าง response JSON แจ้ง login success
    const res = NextResponse.json({ message: "Login success" });

    // ตั้งค่า httpOnly cookie สำหรับ JWT token
    res.cookies.set({
      name: "token",
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    // ตั้งค่า cookie สำหรับ userId (client JS สามารถอ่านได้)
    res.cookies.set({
      name: "userId",
      value: user.id,
      httpOnly: false, // เปลี่ยนเป็น false เพื่อให้ client-side อ่านได้
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    // ส่ง response กลับ client
    return res;
  } catch (err) {
    // กรณีเกิด error อื่นๆ
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
