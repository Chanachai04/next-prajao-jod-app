import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { createClient } from "@supabase/supabase-js";

const SECRET_KEY = process.env.SECRET_KEY as string;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// หน้า public ที่ไม่ต้องตรวจ token
const publicRoutes = [
  "/login",
  "/register",
  "/forgotpassword/*",
  "/terms",
  "/",
  "/booking",
];

// ฟังก์ชันเช็คว่า path เป็น public หรือไม่
const isPublicRoute = (path: string) => {
  return publicRoutes.some((route) => {
    if (route.endsWith("/*")) {
      return path.startsWith(route.slice(0, -2)); // ลบ /* แล้วใช้ startsWith
    }
    return path === route;
  });
};

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ถ้าเป็นหน้า public ไม่ต้องตรวจ token
  if (isPublicRoute(path)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET_KEY)
    );
    const userId = req.cookies.get("userId")?.value;

    // ถ้าเป็นหน้า /rent ให้ตรวจสอบ is_checked
    if (path === "/rent" && userId) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
          .from("users")
          .select("is_checked")
          .eq("id", userId)
          .single();

        // ถ้า is_checked เป็น true ให้ redirect ไป rentdetail ทันที
        if (!error && data && data.is_checked === true) {
          return NextResponse.redirect(new URL("/rentdetail", req.url));
        }
      } catch (err) {
        console.log("Error checking is_checked:", err);
        // ถ้าเกิด error ให้ผ่านไปได้ (ไม่ block)
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.log("Token verify error:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// กำหนด matcher ให้ middleware ตรวจทุกหน้า ยกเว้น static, API, favicon, รูปภาพ
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)",
  ],
};
