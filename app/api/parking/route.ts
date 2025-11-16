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
    const { data, error } = await supabase
      .from('rent_detail')
      .select('name, type, total_slot, image_id')
      .eq('owner_id', userId);

    if (error) {
      console.error('Supabase error:', error);
      return Response.json(
        { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });

  } catch (err) {
    console.error('Server error:', err);
    return Response.json(
      { error: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}
