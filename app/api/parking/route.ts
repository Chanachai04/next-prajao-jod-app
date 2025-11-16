import { cookies } from 'next/headers';
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return Response.json(
        { error: 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    // ดึงข้อมูลจาก rent_detail
    const { data, error } = await supabase
      .from('rent_detail')
      .select('id, name, type, total_slot, image_id')
      .eq('owner_id', userId);

    if (error) {
      console.error('Supabase error:', error);
      return Response.json(
        { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
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
            .from('rent_images')
            .select('image_url')
            .eq('id', item.image_id)
            .single();

          imageUrl = imageData?.image_url || null;
        }

        return {
          name: item.name,
          type: item.type,
          total_slot: item.total_slot,
          image_url: imageUrl
        };
      })
    );

    return Response.json({
      success: true,
      data: formattedData || [],
      count: formattedData?.length || 0
    });

  } catch (err) {
    console.error('Server error:', err);
    return Response.json(
      { error: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}