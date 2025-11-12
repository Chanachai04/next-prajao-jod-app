import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type RentDetailPayload = {
  name?: string;
  type?: string;
  description?: string;
  total_slot?: number;
  address?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  landmark?: string;
  price?: {
    price_per_hour?: number | null;
    price_per_day?: number | null;
    price_per_month?: number | null;
    deposit?: number | null;
  };
  facilities?: string[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RentDetailPayload;

    const {
      name,
      type,
      description,
      total_slot,
      address,
      subdistrict,
      district,
      province,
      landmark,
      price,
      facilities,
    } = body;

    if (
      !name ||
      !type ||
      !address ||
      typeof total_slot !== "number" ||
      !subdistrict ||
      !district ||
      !province ||
      !landmark
    ) {
      return NextResponse.json(
        { message: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("rent_detail")
      .insert({
        name,
        type,
        description: description ?? "",
        total_slot,
        address,
        subdistrict,
        district,
        province,
        landmark,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Insert rent_detail error:", error);
      return NextResponse.json(
        { message: "ไม่สามารถบันทึกข้อมูลได้" },
        { status: 500 }
      );
    }

    if (!data?.id) {
      return NextResponse.json(
        { message: "ไม่สามารถบันทึกข้อมูลได้" },
        { status: 500 }
      );
    }

    const pricePerHour =
      typeof price?.price_per_hour === "number" ? price.price_per_hour : null;
    const pricePerDay =
      typeof price?.price_per_day === "number" ? price.price_per_day : null;
    const pricePerMonth =
      typeof price?.price_per_month === "number" ? price.price_per_month : null;
    const deposit =
      typeof price?.deposit === "number" ? price.deposit : null;

    const hasPrice =
      pricePerHour !== null ||
      pricePerDay !== null ||
      pricePerMonth !== null ||
      deposit !== null;

    if (hasPrice) {
      const { error: priceError } = await supabase.from("price").insert({
        rent_id: data.id,
        price_per_hour: pricePerHour,
        price_per_day: pricePerDay,
        price_per_month: pricePerMonth,
        deposit,
      });

      if (priceError) {
        console.error("Insert price error:", priceError);
        return NextResponse.json(
          { message: "บันทึกข้อมูลราคาไม่สำเร็จ" },
          { status: 500 }
        );
      }
    }

    if (Array.isArray(facilities) && facilities.length > 0) {
      const uniqueFacilities = Array.from(new Set(facilities));
      const facilityRows = uniqueFacilities.map((facilityName) => ({
        rent_id: data.id,
        name: facilityName,
      }));

      const { error: facilitiesError } = await supabase
        .from("rent_facilities")
        .insert(facilityRows);

      if (facilitiesError) {
        console.error("Insert facilities error:", facilitiesError);
        return NextResponse.json(
          { message: "บันทึกข้อมูลสิ่งอำนวยความสะดวกไม่สำเร็จ" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: "บันทึกข้อมูลสำเร็จ", id: data?.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Rent detail API error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดภายในระบบ" },
      { status: 500 }
    );
  }
}

