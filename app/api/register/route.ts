import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const SECRET_KEY = process.env.SECRET_KEY as string;

export async function POST(req: Request) {
  try {
    const { email, password, name, phone } = await req.json();

    // ตรวจสอบว่า email มีคนใช้แล้วหรือไม่
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { message: "อีเมลนี้ถูกใช้งานแล้ว" },
        { status: 400 }
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user ลง database
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        email,
        password: hashedPassword,
        name,
        phone,
      })
      .select()
      .single();

    if (error || !newUser) {
      return NextResponse.json(
        { message: "สร้างบัญชีไม่สำเร็จ" },
        { status: 500 }
      );
    }

    // ถ้าต้องการสร้าง token ทันทีหลัง register
    const token = await new SignJWT({
      userId: newUser.id,
      email: newUser.email,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(SECRET_KEY));

    const res = NextResponse.json({ message: "Register success" });
    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
