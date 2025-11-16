import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createClient } from "@supabase/supabase-js";

// หน้าที่ต้อง login ก่อนถึงจะเข้าได้
const protectedRoutes = ["/rent", "/rentdetail", "/profile", "/payment"];

// หน้าที่ login แล้วห้ามเข้า
const authRoutes = ["/login", "/register", "/forgotpassword", "/reset"];

const isProtectedRoute = (path: string) =>
  protectedRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );

const isAuthRoute = (path: string) =>
  authRoutes.some((route) => path === route || path.startsWith(route + "/"));

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get("token")?.value;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  // ไม่มี token
  if (!token) {
    if (isProtectedRoute(path)) {
      // ส่ง user ไป login พร้อมเก็บ path ที่อยากไป
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // token มีแล้ว → ตรวจสอบความถูกต้อง
  try {
    const userId = req.cookies.get("userId")?.value;

    // login แล้วพยายามเข้าหน้า auth → redirect ไป /
    if (isAuthRoute(path)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // login อยู่แล้ว แต่เปิด /login หรือ /register → redirect ไป referer หรือ /
    if (path === "/login" || path === "/register") {
      const previous = req.headers.get("referer") || "/";
      return NextResponse.redirect(previous);
    }

    // ตรวจสอบ is_checked สำหรับ /rent
    if (path === "/rent" && userId) {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("is_checked")
          .eq("id", userId)
          .single();

        if (!error && data && data.is_checked === true) {
          return NextResponse.redirect(new URL("/rentdetail", req.url));
        }
      } catch (err) {
        console.log("Error checking is_checked:", err);
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.log("Token verify error:", err);

    const res = isProtectedRoute(path)
      ? NextResponse.redirect(new URL("/login", req.url))
      : NextResponse.next();

    res.cookies.delete("token");
    res.cookies.delete("userId");

    return res;
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico)).*)",
  ],
};
