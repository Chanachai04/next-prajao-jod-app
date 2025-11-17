import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const protectedRoutes = ["/rent", "/rentdetail", "/profile", "/payment"];
const authRoutes = ["/login", "/register", "/forgotpassword"];

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const userId = req.cookies.get("userId")?.value;
  const url = req.nextUrl.clone();

  // ถ้า user เข้าหน้า login/register แต่มี token อยู่แล้ว
  if (authRoutes.some((path) => url.pathname.startsWith(path))) {
    if (token && userId) {
      const redirectTo = url.searchParams.get("redirect");
      if (redirectTo) {
        return NextResponse.redirect(
          new URL(decodeURIComponent(redirectTo), req.url)
        );
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ถ้าเป็น protected routes
  if (protectedRoutes.some((path) => url.pathname.startsWith(path))) {
    if (!token || !userId) {
      const fullPath = req.nextUrl.pathname + req.nextUrl.search;
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", encodeURIComponent(fullPath));
      return NextResponse.redirect(loginUrl);
    }

    // สำหรับ /payment/* ให้แน่ใจว่า userId อยู่ใน query
    if (url.pathname.startsWith("/payment")) {
      if (!url.searchParams.has("userId")) {
        url.searchParams.set("userId", userId);
        return NextResponse.redirect(url);
      }
    }

    // ถ้าเข้า /rent ต้องเช็ค is_checked
    if (url.pathname === "/rent") {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: userData } = await supabase
          .from("users")
          .select("is_checked")
          .eq("id", userId)
          .single();

        if (userData?.is_checked) {
          return NextResponse.redirect(new URL("/rentdetail", req.url));
        }
      } catch (error) {
        console.error("Error checking user:", error);
      }
    }
  }

  return NextResponse.next();
}

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
