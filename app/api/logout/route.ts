import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });

  // ลบ cookie ทั้งสอง
  res.cookies.delete({ name: "token", path: "/" });
  res.cookies.delete({ name: "userId", path: "/" });

  return res;
}
