import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { createClient } from "@supabase/supabase-js";

const SECRET_KEY = process.env.SECRET_KEY as string;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// หน้าที่เข้าได้โดยไม่ต้อง login
const publicRoutes = ["/", "/booking", "/terms"];

// หน้าที่ต้อง login ก่อนถึงจะเข้าได้
const protectedRoutes = ["/rent", "/rentdetail", "/profile"];

// หน้าที่ login แล้วห้ามเข้า
const authRoutes = [
  "/login",
  "/register",
  "/forgotpassword",
  "/reset",
  "/terms",
];

const isPublicRoute = (path: string) =>
  publicRoutes.some((route) => path === route || path.startsWith(route + "/"));

const isProtectedRoute = (path: string) =>
  protectedRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );

const isAuthRoute = (path: string) =>
  authRoutes.some((route) => path === route || path.startsWith(route + "/"));

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get("token")?.value;

  // ไม่มี token
  if (!token) {
    // ถ้าพยายามเข้าหน้าที่ต้อง login → redirect ไป login
    if (isProtectedRoute(path)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // หน้า public หรือหน้า auth → ให้ผ่าน
    return NextResponse.next();
  }

  // มี token → ตรวจสอบความถูกต้อง
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET_KEY)
    );
    const userId = req.cookies.get("userId")?.value;

    // login แล้วแต่พยายามเข้าหน้า auth → redirect ไปหน้าแรก
    if (isAuthRoute(path)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

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

    // token ถูกต้อง → ให้ผ่านปกติ
    return NextResponse.next();
  } catch (err) {
    console.log("Token verify error:", err);

    // token ไม่ถูกต้อง → ลบ token
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
