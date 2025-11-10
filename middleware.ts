import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.SECRET_KEY as string;

// หน้า public ที่ไม่ต้องตรวจ token
const publicRoutes = ["/login", "/register", "/forgotpassword", "/terms", "/"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ถ้าเป็นหน้า public ไม่ต้องตรวจ token
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  console.log("Middleware token:", token);

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

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)",
  ],
};
