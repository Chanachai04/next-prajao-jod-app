import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { supabase } from "@/lib/supabaseClient";

const SECRET_KEY = process.env.SECRET_KEY as string;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const userId = cookieStore.get("userId")?.value;

    if (!token || !userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
      if (payload && typeof payload === "object" && "userId" in payload) {
        if ((payload as { userId?: string }).userId !== userId) {
          return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
      }
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("users")
      .select("email, first_name, last_name, citizen_id, line_id, phone, image_url")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return NextResponse.json({ message: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    return NextResponse.json({
      email: data.email,
      phone: data.phone,
      firstName: data.first_name,
      lastName: data.last_name,
      citizenId: data.citizen_id,
      lineId: data.line_id,
      imageUrl: data.image_url,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST route: FormData + upload image to "user_bk"
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const userId = cookieStore.get("userId")?.value;

    if (!token || !userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
      if (payload && typeof payload === "object" && "userId" in payload) {
        if ((payload as { userId?: string }).userId !== userId) {
          return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
      }
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // อ่าน FormData
    const formData = await req.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const citizenId = formData.get("citizenId") as string;
    const lineId = formData.get("lineId") as string;
    const phone = formData.get("phone") as string;
    const image = formData.get("image") as File | null;

    let imageUrl: string | null = null;

    if (image && image.name) {
      // Best-effort: remove previous image file from storage if present
      try {
        const { data: existing, error: existingErr } = await supabase
          .from("users")
          .select("image_url")
          .eq("id", userId)
          .single();

        if (existingErr) {
          console.warn("Could not read existing user image_url:", existingErr);
        } else if (existing?.image_url) {
          try {
            const parsed = new URL(existing.image_url);
            const path = parsed.pathname || ""; // e.g. /storage/v1/object/public/user_bk/{filePath}
            const marker = "/user_bk/";
            const idx = path.indexOf(marker);
            if (idx !== -1) {
              const filePath = path.slice(idx + marker.length);
              if (filePath) {
                const { error: removeErr } = await supabase.storage
                  .from("user_bk")
                  .remove([decodeURIComponent(filePath)]);
                if (removeErr) {
                  console.warn("Could not remove previous user image file:", removeErr);
                }
              }
            }
          } catch (e) {
            console.warn("Could not parse existing image URL", existing.image_url, e);
          }
        }
      } catch (e) {
        console.error("Unexpected error while cleaning previous image:", e);
      }

      const fileName = `user_${userId}/${Date.now()}_${image.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("user_bk") // <-- ใช้ bucket จริงของคุณ
        .upload(fileName, image, { upsert: true });

      if (uploadError) {
        console.error("❌ Upload error:", uploadError);
        return NextResponse.json({ message: "อัปโหลดรูปไม่สำเร็จ" }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage
        .from("user_bk")
        .getPublicUrl(uploadData.path);

      imageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from("users")
      .update({
        first_name: firstName,
        last_name: lastName,
        email,
        citizen_id: citizenId,
        line_id: lineId,
        phone,
        ...(imageUrl ? { image_url: imageUrl } : {}),
      })
      .eq("id", userId);

    if (error) {
      console.error("❌ Update error:", error);
      return NextResponse.json({ message: "อัปเดตข้อมูลไม่สำเร็จ" }, { status: 500 });
    }

    return NextResponse.json({ message: "อัปเดตข้อมูลสำเร็จ" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
