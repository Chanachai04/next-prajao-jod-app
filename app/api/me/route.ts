import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // ดึง cookies จาก request (ใน server component / API route)
    const cookieStore = await cookies(); // Note: ใน Next.js 13+ cookies() เป็น synchronous, ไม่ต้อง await ก็ได้
    // ดึงค่า token และ userId จาก cookie
    const token = cookieStore.get("token")?.value;
    const userId = cookieStore.get("userId")?.value;

    // ถ้า token หรือ userId ไม่มี => ยังไม่ได้ login
    if (!token || !userId) {
      return NextResponse.json({ loggedIn: false }, { status: 401 });
    }

    // ถ้ามี token และ userId => login อยู่ ส่งกลับข้อมูล
    return NextResponse.json({ loggedIn: true, token, userId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }
}
