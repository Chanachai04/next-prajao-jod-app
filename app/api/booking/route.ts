import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

type PriceRow = {
  id: string;
  rent_id: string;
  price_per_hour: number | null;
  price_per_day: number | null;
  price_per_month: number | null;
  deposit: number | null;
};

type FacilityRow = {
  id: string;
  rent_id: string;
  name: string;
};

type ScheduleRow = {
  id: string;
  rent_id: string;
  available_days: string[] | null;
  open_time: string | null;
  close_time: string | null;
};

type ImageRow = {
  id: string;
  rent_id: string;
  image_url: string;
};

type RentDetailRow = {
  id: string;
  name: string | null;
  type: string | null;
  description: string | null;
  total_slot: number | null;
  address: string | null;
  subdistrict: string | null;
  district: string | null;
  province: string | null;
  landmark: string | null;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const provinceParam = searchParams.get("province")?.trim();
  const districtParam = searchParams.get("district")?.trim();
  const subdistrictParam = searchParams.get("subdistrict")?.trim();
  const searchParam = searchParams.get("search")?.trim();
  const modeParamRaw = searchParams.get("mode")?.trim()?.toLowerCase();
  const modeParam =
    modeParamRaw === "monthly" || modeParamRaw === "daily"
      ? "monthly"
      : modeParamRaw === "hourly"
      ? "hourly"
      : undefined;

  let detailQuery = supabase
    .from("rent_detail")
    .select(
      [
        "id",
        "name",
        "type",
        "description",
        "total_slot",
        "address",
        "subdistrict",
        "district",
        "province",
        "landmark",
      ].join(",")
    );

  // ใช้ subdistrict ก่อน จากนั้น district แล้วจึง province
  if (subdistrictParam) {
    detailQuery = detailQuery.eq("subdistrict", subdistrictParam);
  } else if (districtParam) {
    detailQuery = detailQuery.eq("district", districtParam);
  } else if (provinceParam) {
    detailQuery = detailQuery.eq("province", provinceParam);
  }

  const {
    data: rentDetailData,
    error: rentDetailError,
    status,
  } = await detailQuery;

  if (rentDetailError) {
    return NextResponse.json(
      { message: rentDetailError.message },
      { status: status ?? 500 }
    );
  }

  const rentDetailRows = (rentDetailData ?? []) as unknown as RentDetailRow[];

  if (!rentDetailRows || rentDetailRows.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const rentIds = rentDetailRows.map((item) => item.id);

  const [priceResult, facilityResult, scheduleResult, imageResult] =
    await Promise.all([
      supabase
        .from("price")
        .select(
          [
            "id",
            "rent_id",
            "price_per_hour",
            "price_per_day",
            "price_per_month",
            "deposit",
          ].join(",")
        )
        .in("rent_id", rentIds),
      supabase
        .from("rent_facilities")
        .select(["id", "rent_id", "name"].join(","))
        .in("rent_id", rentIds),
      supabase
        .from("rent_schedule")
        .select(
          ["id", "rent_id", "available_days", "open_time", "close_time"].join(
            ","
          )
        )
        .in("rent_id", rentIds),
      supabase
        .from("rent_images")
        .select(["id", "rent_id", "image_url"].join(","))
        .in("rent_id", rentIds),
    ]);

  if (priceResult.error) {
    return NextResponse.json(
      { message: priceResult.error.message },
      { status: priceResult.status ?? 500 }
    );
  }
  if (facilityResult.error) {
    return NextResponse.json(
      { message: facilityResult.error.message },
      { status: facilityResult.status ?? 500 }
    );
  }
  if (scheduleResult.error) {
    return NextResponse.json(
      { message: scheduleResult.error.message },
      { status: scheduleResult.status ?? 500 }
    );
  }
  if (imageResult.error) {
    return NextResponse.json(
      { message: imageResult.error.message },
      { status: imageResult.status ?? 500 }
    );
  }

  const priceRows = (priceResult.data ?? []) as unknown as PriceRow[];
  const facilityRows = (facilityResult.data ?? []) as unknown as FacilityRow[];
  const scheduleRows = (scheduleResult.data ?? []) as unknown as ScheduleRow[];
  const imageRows = (imageResult.data ?? []) as unknown as ImageRow[];

  const priceMap = new Map<string, PriceRow>();
  priceRows.forEach((price) => {
    priceMap.set(price.rent_id, price);
  });

  const facilityMap = new Map<string, FacilityRow[]>();
  facilityRows.forEach((facility) => {
    const list = facilityMap.get(facility.rent_id) ?? [];
    list.push(facility);
    facilityMap.set(facility.rent_id, list);
  });

  const scheduleMap = new Map<string, ScheduleRow[]>();
  scheduleRows.forEach((schedule) => {
    const list = scheduleMap.get(schedule.rent_id) ?? [];
    list.push(schedule);
    scheduleMap.set(schedule.rent_id, list);
  });

  const imageMap = new Map<string, ImageRow[]>();
  imageRows.forEach((image) => {
    const list = imageMap.get(image.rent_id) ?? [];
    list.push(image);
    imageMap.set(image.rent_id, list);
  });

  let data = rentDetailRows.map((rent) => {
    const price = priceMap.get(rent.id) ?? null;
    const facilities = facilityMap.get(rent.id) ?? [];
    const schedules = scheduleMap.get(rent.id) ?? [];
    const images = imageMap.get(rent.id) ?? [];
    return {
      ...rent,
      price,
      facilities,
      schedules,
      images,
    };
  });

  // กรองด้วย search keyword (free-text search)
  if (searchParam) {
    const keyword = searchParam.toLowerCase();
    data = data.filter((item) => {
      const fields = [
        item.subdistrict,
        item.district,
        item.province,
        item.name,
        item.address,
        item.landmark,
      ];
      return fields.some((field) =>
        (field ?? "").toLowerCase().includes(keyword)
      );
    });
  }

  // กรองตาม mode (hourly/monthly)
  if (modeParam === "hourly") {
    data = data.filter((item) => {
      const price = item.price;
      return (
        price?.price_per_hour !== null ||
        price?.price_per_hour === 0 ||
        price?.price_per_day !== null ||
        price?.price_per_day === 0
      );
    });
  } else if (modeParam === "monthly") {
    data = data.filter((item) => {
      const price = item.price;
      return price?.price_per_month !== null || price?.price_per_month === 0;
    });
  }

  return NextResponse.json({ data });
}
