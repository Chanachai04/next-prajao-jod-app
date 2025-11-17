import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const SECRET_KEY = process.env.SECRET_KEY as string;

export async function POST(req: Request) {
  try {
    const { email, password, name, phone } = await req.json();

    // ตรวจสอบ email ซ้ำ
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
      .insert({ email, password: hashedPassword, name, phone })
      .select()
      .single();

    if (!newUser || error) {
      return NextResponse.json(
        { message: "สร้างบัญชีไม่สำเร็จ" },
        { status: 500 }
      );
    }

    // สร้าง JWT payload เก็บ userId
    const jwtToken = await new SignJWT({ userId: newUser.id })
      .setProtectedHeader({ alg: "HS256" })
      .sign(new TextEncoder().encode(SECRET_KEY));

    const res = NextResponse.json({ message: "Register success" });

    //   cookie สำหรับ JWT
    res.cookies.set({
      name: "token",
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      // maxAge: 60 * 60 * 24 * 7,
    });

    // cookie สำหรับ userId
    res.cookies.set({
      name: "userId",
      value: newUser.id,
      httpOnly: false,
      path: "/",
      sameSite: "lax",
      // maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
