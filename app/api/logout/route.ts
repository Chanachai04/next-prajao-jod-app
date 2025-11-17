import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({
    message: "Logged out successfully",
    success: true,
  });

  // ลบ token cookie
  res.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0), // เพิ่มบรรทัดนี้
  });

  // ลบ userId cookie
  res.cookies.set({
    name: "userId",
    value: "",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0), // เพิ่มบรรทัดนี้
  });

  return res;
}
