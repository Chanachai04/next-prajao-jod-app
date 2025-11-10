import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const SECRET_KEY = process.env.SECRET_KEY as string;

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user)
      return NextResponse.json({ message: "ไม่พบผู้ใช้" }, { status: 401 });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return NextResponse.json(
        { message: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );

    // สร้าง JWT token ด้วย jose
    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(SECRET_KEY));

    const res = NextResponse.json({ message: "Login success" });
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
