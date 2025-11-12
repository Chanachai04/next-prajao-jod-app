import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { supabase } from "@/lib/supabaseClient";

const SECRET_KEY = process.env.SECRET_KEY as string;

export async function GET() {
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

    const { data, error } = await supabase
      .from("users")
      .select("email, first_name, last_name, image_url")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return NextResponse.json({ message: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    return NextResponse.json({
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      imageUrl: data.image_url,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}