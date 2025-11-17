import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });

  // ลบ cookie ทั้งสอง
  res.cookies.set("token", "", { path: "/" });
  res.cookies.set("userId", "", { path: "/" });

  return res;
}
