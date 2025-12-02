import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// เส้นทางที่ต้องมีการตรวจสอบการเข้าสู่ระบบ
const protectedRoutes = ["/rent", "/rentdetail", "/profile", "/payment"];
// เส้นทางสำหรับเข้าสู่ระบบ/สมัครสมาชิก
const authRoutes = ["/login", "/register", "/forgotpassword"];

export async function middleware(req: NextRequest) {
  // 1. ดึงข้อมูลเบื้องต้น
  const token = req.cookies.get("token")?.value; // ดึง Token จากคุกกี้
  const userId = req.cookies.get("userId")?.value; // ดึง User ID จากคุกกี้
  const url = req.nextUrl.clone();
  const hasAuth = !!(token && userId); // สถานะการเข้าสู่ระบบ

  // 2. กรณีเข้าหน้า Auth Routes (Login, Register)
  if (authRoutes.some((path) => url.pathname.startsWith(path))) {
    if (hasAuth) {
      // มี auth แล้ว → Redirect ออกไปหน้าที่ต้องการ (ถ้ามี parameter 'redirect')
      const redirectTo = url.searchParams.get("redirect");
      if (redirectTo) {
        return NextResponse.redirect(
          new URL(decodeURIComponent(redirectTo), req.url)
        );
      }
      // ถ้าไม่มี redirect parameter ให้ไปหน้าหลัก
      return NextResponse.redirect(new URL("/", req.url));
    }
    // ไม่มี auth → ปล่อยให้เข้าหน้า Auth ได้
    return NextResponse.next();
  }

  // 3. กรณีเข้าหน้า Protected Routes
  if (protectedRoutes.some((path) => url.pathname.startsWith(path))) {
    if (!hasAuth) {
      // ไม่มี auth → Redirect ไปหน้า Login พร้อมบันทึก path ปัจจุบัน
      const fullPath = req.nextUrl.pathname + req.nextUrl.search;
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", encodeURIComponent(fullPath));
      return NextResponse.redirect(loginUrl);
    }

    // มี auth แล้ว → ตรวจสอบเงื่อนไขพิเศษเฉพาะหน้า

    // สำหรับ /payment/* ให้แน่ใจว่า userId อยู่ใน query
    if (url.pathname.startsWith("/payment")) {
      if (!url.searchParams.has("userId")) {
        // เพิ่ม userId ลงใน URL query และ redirect ตัวเองใหม่
        url.searchParams.set("userId", userId);
        return NextResponse.redirect(url);
      }
    }

    // สำหรับ /rent (หน้าเริ่มต้นการปล่อยเช่า) ต้องเช็คสถานะการกรอกข้อมูล is_checked
    if (url.pathname === "/rent") {
      try {
        // สร้าง Supabase client เพื่อ Query ฐานข้อมูล (ต้องใช้ API Key)
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: userData } = await supabase
          .from("users")
          .select("is_checked")
          .eq("id", userId)
          .single();

        // ถ้า is_checked เป็น true (กรอกข้อมูลเบื้องต้นครบแล้ว)
        if (userData?.is_checked) {
          // Redirect ไปหน้าจัดการรายละเอียดที่จอดรถ
          return NextResponse.redirect(new URL("/rentdetail", req.url));
        }
      } catch (error) {
        console.error("Error checking user:", error);
      }
    }
  }

  // 4. ไม่ใช่ protected หรือ auth routes → ปล่อยผ่าน
  return NextResponse.next();
}

// กำหนด Path ที่ Middleware จะทำงานด้วย
export const config = {
  matcher: [
    "/rent",
    "/rentdetail",
    "/profile/:path*",
    "/payment/:path*",
    "/login",
    "/register",
    "/forgotpassword",
  ],
};
