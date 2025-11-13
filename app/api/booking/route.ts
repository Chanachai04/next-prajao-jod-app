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
  latitude: number | null;
  longitude: number | null;
};

const MAX_DISTANCE_KM = 5;
const toRadians = (deg: number) => (deg * Math.PI) / 180;

const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const provinceParam = searchParams.get("province")?.trim();
  const modeParamRaw = searchParams.get("mode")?.trim()?.toLowerCase();
  const modeParam =
    modeParamRaw === "monthly" || modeParamRaw === "daily"
      ? "monthly"
      : modeParamRaw === "hourly"
      ? "hourly"
      : undefined;

  const detailQuery = supabase
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
        "latitude",
        "longitude",
      ].join(",")
    );

  const {
    data: rentDetailData,
    error: rentDetailError,
    status,
  } = provinceParam
    ? await detailQuery.eq("province", provinceParam)
    : await detailQuery;

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

  const searchParam = searchParams.get("search")?.trim();
  if (searchParam) {
    const keyword = searchParam.toLowerCase();
    data = data.filter((item) => {
      // include name, address and landmark so free-text typed searches
      // (when user doesn't pick a suggestion) can still find results
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

  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");
  const latNum = latParam ? Number(latParam) : null;
  const lonNum = lonParam ? Number(lonParam) : null;
  if (
    latNum !== null &&
    lonNum !== null &&
    Number.isFinite(latNum) &&
    Number.isFinite(lonNum)
  ) {
    data = data
      .map((item) => {
        if (
          item.latitude === null ||
          item.longitude === null ||
          Number.isNaN(item.latitude) ||
          Number.isNaN(item.longitude)
        ) {
          return { item, distance: Number.POSITIVE_INFINITY };
        }
        const distance = calculateDistanceKm(
          latNum,
          lonNum,
          item.latitude,
          item.longitude
        );
        return { item, distance };
      })
      .filter(({ distance }) => distance <= MAX_DISTANCE_KM)
      .sort((a, b) => a.distance - b.distance)
      .map(({ item }) => item);
  }

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
