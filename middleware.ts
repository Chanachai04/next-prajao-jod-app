import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.SECRET_KEY as string;

// หน้าที่เข้าได้โดยไม่ต้อง login
const publicRoutes = ["/", "/booking"];

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
    await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));

    // login แล้วแต่พยายามเข้าหน้า auth → redirect ไปหน้าแรก
    if (isAuthRoute(path)) {
      return NextResponse.redirect(new URL("/", req.url));
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
    return res;
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico)).*)",
  ],
};
