import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.SECRET_KEY as string;

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, error: "กรุณาเข้าสู่ระบบ" },
                { status: 401 }
            );
        }

        let userId: string;
        try {
            const { payload } = await jwtVerify(
                token,
                new TextEncoder().encode(SECRET_KEY)
            );
            userId = payload.userId as string;
        } catch (error) {
            return NextResponse.json(
                { success: false, error: "Token ไม่ถูกต้อง" },
                { status: 401 }
            );
        }

        // ดึงข้อมูลผู้เช่าจากตาราง rent_payments
        const { data: renters, error } = await supabase
            .from("rent_payments")
            .select(
                `
        id,
        rent_history:rent_history_id (
          id,
          rent_detail:rent_id (
            id,
            name,
            owner_id,
            rent_images:image_id (
              image_url
            )
          )
        ),
        users:user_id (
          first_name,
          last_name,
          phone
        )
      `
            )
            .eq("rent_history.rent_detail.owner_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching renters:", error);
            return NextResponse.json(
                { success: false, error: "ไม่สามารถดึงข้อมูลได้" },
                { status: 500 }
            );
        }

        // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
        const formattedData = renters
            .filter((item: any) => item.rent_history?.rent_detail)
            .map((item: any) => ({
                id: item.id,
                imageUrl:
                    item.rent_history?.rent_detail?.rent_images?.image_url ||
                    null,
                parkingName: item.rent_history?.rent_detail?.name || "-",
                firstName: item.users?.first_name || "-",
                lastName: item.users?.last_name || "-",
                phoneNumber: item.users?.phone || "-",
            }));

        return NextResponse.json({
            success: true,
            data: formattedData,
        });
    } catch (error) {
        console.error("Error in renter API:", error);
        return NextResponse.json(
            { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, error: "กรุณาเข้าสู่ระบบ" },
                { status: 401 }
            );
        }

        try {
            await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
        } catch (error) {
            return NextResponse.json(
                { success: false, error: "Token ไม่ถูกต้อง" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const paymentId = searchParams.get("id");

        if (!paymentId) {
            return NextResponse.json(
                { success: false, error: "ไม่พบ ID" },
                { status: 400 }
            );
        }

        // ลบข้อมูล rent_payments
        const { error: deleteError } = await supabase
            .from("rent_payments")
            .delete()
            .eq("id", paymentId);

        if (deleteError) {
            console.error("Error deleting payment:", deleteError);
            return NextResponse.json(
                { success: false, error: "ไม่สามารถลบข้อมูลได้" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "ลบข้อมูลสำเร็จ",
        });
    } catch (error) {
        console.error("Error in delete renter API:", error);
        return NextResponse.json(
            { success: false, error: "เกิดข้อผิดพลาดในการลบข้อมูล" },
            { status: 500 }
        );
    }
}
