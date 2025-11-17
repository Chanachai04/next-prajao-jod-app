import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || null;
    const userId = cookieStore.get("userId")?.value || null;

    return NextResponse.json({
      loggedIn: !!token && !!userId,
      token,
      userId,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }
}
