import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // เข้าถึง Cookie Store
    const cookieStore = await cookies();

    // ดึงค่า Token และ User ID จากคุกกี้
    const token = cookieStore.get("token")?.value || null;
    const userId = cookieStore.get("userId")?.value || null;

    // ส่งสถานะการเข้าสู่ระบบกลับไป
    return NextResponse.json({
      // loggedIn: เป็น true ถ้ามีทั้ง token และ userId
      loggedIn: !!token && !!userId,
      token,
      userId,
    });
  } catch (err) {
    // จัดการข้อผิดพลาด
    console.error(err);
    // ส่งสถานะ loggedIn: false พร้อม HTTP Status 401
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }
}
