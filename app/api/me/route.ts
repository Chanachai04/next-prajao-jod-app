import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.SECRET_KEY as string;

export async function GET() {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET_KEY)
    );

    // payload เป็น object ที่คุณ encode ตอนสร้าง token
    return NextResponse.json({ loggedIn: true, user: payload });
  } catch (err) {
    console.log("Token verify error:", err);
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }
}
