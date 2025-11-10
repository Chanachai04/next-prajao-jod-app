import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.SECRET_KEY as string;

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
    await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
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
