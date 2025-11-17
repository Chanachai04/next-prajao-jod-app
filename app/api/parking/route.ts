import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return Response.json(
        { error: "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    // ดึงข้อมูลจาก rent_detail
    const { data, error } = await supabase
      .from("rent_detail")
      .select("id, name, type, total_slot, image_id")
      .eq("owner_id", userId);

    if (error) {
      console.error("Supabase error:", error);
      return Response.json(
        { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
        { status: 500 }
      );
    }

    // ดึงรูปภาพสำหรับแต่ละรายการ
    const formattedData = await Promise.all(
      (data || []).map(async (item) => {
        let imageUrl = null;

        if (item.image_id) {
          // ดึง image_url จาก rent_images โดยใช้ image_id
          const { data: imageData } = await supabase
            .from("rent_images")
            .select("image_url")
            .eq("id", item.image_id)
            .single();

          imageUrl = imageData?.image_url || null;
        }

        return {
          id: item.id,
          name: item.name,
          type: item.type,
          total_slot: item.total_slot,
          image_url: imageUrl,
        };
      })
    );

    return Response.json({
      success: true,
      data: formattedData || [],
      count: formattedData?.length || 0,
    });
  } catch (err) {
    console.error("Server error:", err);
    return Response.json(
      { error: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return Response.json(
        { error: "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const rentId = searchParams.get("rent_id");

    if (!rentId) {
      return Response.json(
        { error: "ไม่พบ rent_id" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า rent_id นี้เป็นของ owner_id นี้หรือไม่
    const { data: rentData, error: checkError } = await supabase
      .from("rent_detail")
      .select("id, owner_id")
      .eq("id", rentId)
      .eq("owner_id", userId)
      .single();

    if (checkError || !rentData) {
      return Response.json(
        { error: "ไม่พบข้อมูลหรือไม่มีสิทธิ์ลบข้อมูลนี้" },
        { status: 404 }
      );
    }

    // ลบข้อมูลที่เกี่ยวข้องทั้งหมด (เฉพาะ record ในตาราง ไม่ลบไฟล์จาก storage)
    // 1. ลบ rent_images (ลบเฉพาะ record ไม่ลบไฟล์)
    await supabase
      .from("rent_images")
      .delete()
      .eq("rent_id", rentId);

    // 2. ลบ rent_facilities
    await supabase
      .from("rent_facilities")
      .delete()
      .eq("rent_id", rentId);

    // 3. ลบ rent_schedule
    await supabase
      .from("rent_schedule")
      .delete()
      .eq("rent_id", rentId);

    // 4. ลบ price
    await supabase
      .from("price")
      .delete()
      .eq("rent_id", rentId);

    // 5. ลบ rent_detail (ลบสุดท้าย)
    const { error: deleteError } = await supabase
      .from("rent_detail")
      .delete()
      .eq("id", rentId);

    if (deleteError) {
      console.error("Delete rent_detail error:", deleteError);
      return Response.json(
        { error: "เกิดข้อผิดพลาดในการลบข้อมูล" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "ลบข้อมูลสำเร็จ",
    });
  } catch (err) {
    console.error("Server error:", err);
    return Response.json(
      { error: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}