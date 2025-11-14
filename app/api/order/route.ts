import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "ID is required" }, { status: 400 });
  }
  const { data: rentDetail, error: rentDetailError } = await supabase
    .from("rent_detail")
    .select("*")
    .eq("id", id)
    .single();

  const { data: price, error: priceError } = await supabase
    .from("price")
    .select("*")
    .eq("rent_id", id)
    .single();
  const { data: facilities, error: facilitiesError } = await supabase
    .from("rent_facilities")
    .select("*")
    .eq("rent_id", id);
  const { data: schedules, error: schedulesError } = await supabase
    .from("rent_schedule")
    .select("*")
    .eq("rent_id", id);
  const { data: images, error: imagesError } = await supabase
    .from("rent_images")
    .select("*")
    .eq("rent_id", id);
  if (
    rentDetailError ||
    priceError ||
    facilitiesError ||
    schedulesError ||
    imagesError
  ) {
    return NextResponse.json(
      {
        message:
          rentDetailError?.message ||
          priceError?.message ||
          facilitiesError?.message ||
          schedulesError?.message ||
          imagesError?.message,
      },
      { status: 500 }
    );
  }
  return NextResponse.json(
    {
      rentDetail: rentDetail,
      price: price,
      facilities: facilities,
      schedules: schedules,
      images: images,
    },
    { status: 200 }
  );
}
