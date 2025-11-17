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

    const { data, error } = await supabase
      .from("rent_history")
      .select(
        "id, parking_time_hour, parking_time_day, parking_time_month, total_price, created_at, rent_id"
      )
      .eq("status", true)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return Response.json(
        { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
        { status: 500 }
      );
    }

    const formattedData = await Promise.all(
      (data || []).map(async (item) => {
        let name = "N/A";
        let imageUrl = null;

        if (item.rent_id) {
          const { data: detailData, error: detailError } = await supabase
            .from("rent_detail")
            .select("name, image_id")
            .eq("id", item.rent_id)
            .single();

          if (detailError) {
            console.error("Error fetching rent_detail:", detailError);
          }

          name = detailData?.name || "N/A";

          if (detailData?.image_id) {
            console.log("Looking for image with id:", detailData.image_id);

            const { data: imageData, error: imageError } = await supabase
              .from("rent_images")
              .select("image_url")
              .eq("id", detailData.image_id)
              .maybeSingle();

            if (imageError) {
              console.error("Error fetching image:", imageError);
            }

            if (imageData?.image_url) {
              console.log("Found image_url:", imageData.image_url);
              imageUrl = imageData.image_url;
            }
          }
        }

        let parkingTime = null;
        let parkingType = null;

        if (item.parking_time_hour !== null) {
          parkingTime = item.parking_time_hour;
          parkingType = "hour";
        } else if (item.parking_time_day !== null) {
          parkingTime = item.parking_time_day;
          parkingType = "day";
        } else if (item.parking_time_month !== null) {
          parkingTime = item.parking_time_month;
          parkingType = "month";
        }

        return {
          id: item.id,
          name,
          imageUrl,
          parkingTime,
          parkingType,
          totalPrice: item.total_price,
          createdAt: item.created_at,
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

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return Response.json(
        { error: "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const historyId = searchParams.get("id");

    if (!historyId) {
      return Response.json(
        { error: "กรุณาระบุรหัสประวัติที่ต้องการลบ" },
        { status: 400 }
      );
    }

    const { error, count } = await supabase
      .from("rent_history")
      .delete({ count: "exact" })
      .eq("id", historyId)
      .eq("user_id", userId);

    if (error) {
      console.error("Supabase delete error:", error);
      return Response.json(
        { error: "ไม่สามารถลบประวัติได้" },
        { status: 500 }
      );
    }

    if (!count) {
      return Response.json(
        { error: "ไม่พบข้อมูลที่ต้องการลบ" },
        { status: 404 }
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Server error:", err);
    return Response.json(
      { error: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}