"use client";
import { Button } from "@/components/ui/button";

import { MapPlus, Minimize2, MousePointerClick } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import DateForm from "@/components/form/DateForm";
import TimeForm from "@/components/form/TimeForm";
import SelectForm from "@/components/form/SelectForm";
import { useRouter } from "next/navigation";
import ProvinceSearch from "@/components/form/ProvinceSearch";
import { districts, provinces, subDistricts } from "@/lib/thaiData";

export default function Home() {
  const router = useRouter();

  // โหมดที่เลือก (รายชั่วโมง / รายวัน / รายเดือน)
  const [selectedOption, setSelectedOption] = useState("hourly");

  // วันที่เข้าจอด (ค่าเริ่มต้น = วันนี้)
  const [dateIn, setDateIn] = useState<Date>(new Date());

  // วันที่นำรถออก (ค่าเริ่มต้น = พรุ่งนี้)
  const [dateOut, setDateOut] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });

  // เวลาเข้า-เวลาออก
  const [timeIn, setTimeIn] = useState<string>("00:00");
  const [timeOut, setTimeOut] = useState<string>("01:00");

  // ชื่อสถานที่ (อาจเป็น text หรือชื่อจากจังหวัด/อำเภอ/ตำบล)
  const [location, setLocation] = useState("");

  // id จังหวัด / อำเภอ / ตำบล ที่เลือก
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [subDistrictId, setSubDistrictId] = useState<number | null>(null);

  // ตัวแสดง error ถ้าขาดข้อมูลสำคัญ
  const [error, setError] = useState<string | null>(null);

  // จำนวนเดือน (เฉพาะโหมดรายเดือน)
  const [monthDurationKey, setMonthDurationKey] = useState("threeMonths");

  // ตัวเลือกจำนวนเดือน
  const timeOption = {
    threeMonths: "3 เดือน",
    sixMonths: "6 เดือน",
    oneYears: "1 ปี",
  };

  // ตัวเลือกโหมดค้นหา
  const options = [
    { key: "hourly", label: "รายชั่วโมง" },
    { key: "daily", label: "รายวัน" },
    { key: "monthly", label: "รายเดือน" },
  ];

  // function ส่งข้อมูลเข้า booking page หลัง validate เสร็จ
  const handleSubmit = () => {
    // ตรวจว่าผู้ใช้ยังไม่เลือกที่ตั้งแบบครบ หรือไม่พิมพ์ชื่อสถานที่
    if (!location.trim() && (!provinceId || !districtId || !subDistrictId)) {
      setError("กรุณาเลือกจังหวัด เขต และแขวง หรือพิมพ์ชื่อสถานที่");
      return;
    }

    // ล้าง error
    setError(null);

    // เตรียม query string
    const params = new URLSearchParams();
    params.set("mode", selectedOption);

    // ชื่อสถานที่ (เก็บทั้ง location & search)
    const trimmedLocation = location.trim();
    if (trimmedLocation) {
      params.set("location", trimmedLocation);
      params.set("search", trimmedLocation);
    }

    // ใส่ค่า province/district/subdistrict
    if (provinceId) params.set("provinceId", String(provinceId));
    if (districtId) params.set("districtId", String(districtId));
    if (subDistrictId) params.set("subDistrictId", String(subDistrictId));

    // เก็บข้อมูลวันที่/เวลา ตามโหมดที่เลือก
    if (dateIn) params.set("dateIn", dateIn.toISOString());

    if (selectedOption === "monthly") {
      // โหมดรายเดือนเก็บจำนวนเดือน
      params.set("monthDurationKey", monthDurationKey);
    } else {
      // โหมดรายชั่วโมง/รายวัน
      if (dateOut) params.set("dateOut", dateOut.toISOString());
      if (timeIn) params.set("timeIn", timeIn);
      if (timeOut) params.set("timeOut", timeOut);
    }

    // ไปหน้า booking พร้อม query ครบชุด
    router.push(`/booking?${params.toString()}`);
  };

  return (
    <div className="min-h-screen  ">
      {/* -- ส่วนค้นหาและเลือกช่วงเวลา รวมภาพด้านซ้าย + ฟอร์มด้านขวา -- */}
      <div className="flex mb-6 flex-col md:mb-10 sm:flex-row justify-between container mx-auto lg:my-15 ">
        {/* -- ภาพประกอบด้านซ้าย -- */}
        <div className="mb-6 xl:mb-0">
          <Image
            src="/park.png"
            alt="Park Image"
            width={410}
            height={500}
            className="mt-10 hidden xl:block w-full max-w-sm sm:max-w-md"
          />
        </div>

        {/* -- ส่วนฟอร์มค้นหา ที่อยู่ด้านขวา -- */}
        <div className="flex flex-col px-4 md:mt-10  xl:px-0  justify-center w-full xl:w-2/3">
          {/* -- ปุ่มเลือกโหมด (รายชั่วโมง/รายวัน/รายเดือน) -- */}
          <div className="flex flex-wrap gap-2 md:gap-4">
            {options.map(({ key, label }) => (
              <Button
                key={key}
                onClick={() => setSelectedOption(key)}
                variant={selectedOption === key ? "default" : "link"}
                className={`text-sm sm:text-base lg:text-lg cursor-pointer ${
                  selectedOption === key ? "text-white" : "text-black"
                }`}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* -- ฟอร์มเก็บข้อมูลสถานที่/เวลา ตามโหมดที่เลือก -- */}
          <form action="" className="w-full  mt-4 space-y-4">
            {/* --- โหมดรายชั่วโมง --- */}
            {selectedOption === "hourly" ? (
              <>
                {/* -- ค้นหาจังหวัด/อำเภอ/ตำบล -- */}
                <ProvinceSearch
                  onChange={(pId, dId, sId) => {
                    setProvinceId(pId);
                    setDistrictId(dId);
                    setSubDistrictId(sId);

                    // อัปเดต location เป็นชื่อที่เลือก
                    if (sId) {
                      const sub = subDistricts.find((s) => s.id === sId);
                      setLocation(sub?.name_th || "");
                    } else if (dId) {
                      const district = districts.find((d) => d.id === dId);
                      setLocation(district?.name_th || "");
                    } else if (pId) {
                      const province = provinces.find((p) => p.id === pId);
                      setLocation(province?.name_th || "");
                    } else {
                      setLocation("");
                    }
                  }}
                />

                {/* -- วันที่/เวลา เข้าออกสำหรับรายชั่วโมง -- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <DateForm
                    title="วันที่เข้าจอด"
                    date={dateIn}
                    setDate={setDateIn}
                    placeholder="เลือกวันที่เข้าจอด"
                    id="dateIn"
                  />
                  <TimeForm
                    title="เวลาเข้าจอด"
                    time={timeIn}
                    setTime={setTimeIn}
                  />
                  <DateForm
                    title="วันที่นำรถออก"
                    date={dateOut}
                    setDate={setDateOut}
                    placeholder="เลือกวันที่นำรถออก"
                    id="dateOut"
                  />
                  <TimeForm
                    title="เวลานำรถออก"
                    time={timeOut}
                    setTime={setTimeOut}
                  />
                </div>
              </>
            ) : selectedOption === "daily" ? (
              <>
                {/* --- โหมดรายวัน: เลือกจังหวัด + วันเข้า/วันออก --- */}
                <ProvinceSearch
                  onChange={(pId, dId, sId) => {
                    setProvinceId(pId);
                    setDistrictId(dId);
                    setSubDistrictId(sId);

                    // อัปเดตชื่อสถานที่ตามตัวเลือก
                    if (sId) {
                      const sub = subDistricts.find((s) => s.id === sId);
                      setLocation(sub?.name_th || "");
                    } else if (dId) {
                      const district = districts.find((d) => d.id === dId);
                      setLocation(district?.name_th || "");
                    } else if (pId) {
                      const province = provinces.find((p) => p.id === pId);
                      setLocation(province?.name_th || "");
                    } else {
                      setLocation("");
                    }
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <DateForm
                    title="วันที่เข้าจอด"
                    date={dateIn}
                    setDate={setDateIn}
                    placeholder="เลือกวันที่เข้าจอด"
                    id="dateIn"
                  />
                  <DateForm
                    title="วันที่นำรถออก"
                    date={dateOut}
                    setDate={setDateOut}
                    placeholder="เลือกวันที่นำรถออก"
                    id="dateOut"
                  />
                </div>
              </>
            ) : (
              <>
                {/* --- โหมดรายเดือน: เลือกจังหวัด + วันเข้า + จำนวนเดือน --- */}
                <ProvinceSearch
                  onChange={(pId, dId, sId) => {
                    setProvinceId(pId);
                    setDistrictId(dId);
                    setSubDistrictId(sId);

                    // ตั้งชื่อสถานที่
                    if (sId) {
                      const sub = subDistricts.find((s) => s.id === sId);
                      setLocation(sub?.name_th || "");
                    } else if (dId) {
                      const district = districts.find((d) => d.id === dId);
                      setLocation(district?.name_th || "");
                    } else if (pId) {
                      const province = provinces.find((p) => p.id === pId);
                      setLocation(province?.name_th || "");
                    } else {
                      setLocation("");
                    }
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <DateForm
                    title="วันที่เข้าจอด"
                    date={dateIn}
                    setDate={setDateIn}
                    placeholder="เลือกวันที่เข้าจอด"
                    id="dateIn"
                  />
                  <SelectForm
                    title="จํานวนเดือน"
                    placeholder="เลือกจํานวนเดือน"
                    itemList={timeOption}
                    leadingIcon={<Minimize2 />}
                    value={monthDurationKey}
                    onValueChange={setMonthDurationKey}
                  />
                </div>
              </>
            )}

            {/* -- แสดง error ถ้ามี -- */}
            {error && (
              <div className="text-red-600 my-2 text-sm sm:text-base mt-6">
                {error}
              </div>
            )}

            {/* -- ปุ่มกดค้นหา -- */}
            <Button
              type="button"
              onClick={handleSubmit}
              className=" w-full text-sm sm:text-base lg:text-lg py-4 sm:py-6 cursor-pointer"
            >
              ค้นหาที่จอดรถ
            </Button>
          </form>
        </div>
      </div>

      {/* --------------------------------------- */}
      {/* -- ส่วนรายละเอียดหน้าเว็บ (จุดเด่น/รายละเอียดบริการ) -- */}
      <div className="bg-white">
        <div className="container mx-auto py-20 px-4">
          <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start">
            {/* -- ตัวหนังสืออธิบายฟีเจอร์ -- */}
            <div className="mb-8 lg:mb-0">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center lg:text-left flex flex-col">
                ค้นหาที่จอดรถที่ดีที่สุดได้ที่ <br />
                PRAJAO JOD
              </p>

              {/* -- หัวข้อค้นหาที่จอดรถ -- */}
              <div className="mt-4">
                <div className="flex items-center">
                  <MapPlus size={28} />
                  <p className="text-sm sm:text-base lg:text-lg pl-2 pb-2">
                    ค้นหาที่จอดรถ
                  </p>
                </div>
                <p className="text-sm sm:text-base lg:text-lg">
                  ค้นหาที่จอดรถของคุณได้ง่าย สะดวกและสบายได้ที่ PRAJAO JOD
                </p>
              </div>

              {/* -- หัวข้อจองที่จอดรถ -- */}
              <div className="mt-4">
                <div className="flex items-center">
                  <MousePointerClick size={28} />
                  <p className="text-sm sm:text-base lg:text-lg pl-2 pb-2">
                    จองที่จอดรถ
                  </p>
                </div>
                <p className="text-sm sm:text-base lg:text-lg">
                  จองที่จอดรถได้ทันที ชำระค่าบริการออนไลน์ ใช้สะดวก รวดเร็ว
                  ปลอดภัย
                </p>
              </div>
            </div>

            {/* -- รูปภาพประกอบด้านขวา -- */}
            <div>
              <Image src={"/park2.png"} alt="Park2" width={232} height={271} />
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------- */}
      {/* -- โลโก้พาร์ทเนอร์และผู้สนับสนุน -- */}
      <div className="container mx-auto py-20">
        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">
          พาร์ทเนอร์และผู้สนับสนุน
        </p>

        {/* -- แสดงโลโก้เรียงเป็น grid -- */}
        <div className="grid grid-cols-2 px-4 sm:grid-cols-3    items-center justify-items-center gap-4 mt-10 ">
          <Image
            src="/sau.png"
            alt="sau"
            width={150}
            height={55}
            className="w-30 sm:w-40"
          />
          <Image
            src="/nvidia.png"
            alt="nvidia"
            width={114}
            height={114}
            className="w-30 sm:w-40"
          />
          <Image
            src="/microsoft.png"
            alt="microsoft"
            width={273}
            height={58}
            className="w-30 sm:w-40"
          />
          <Image
            src="/google.png"
            alt="google"
            width={234}
            height={79}
            className="w-30 sm:w-40"
          />
          <Image
            src="/tesla.png"
            alt="tesla"
            width={115}
            height={115}
            className="w-30 sm:w-40"
          />
          <Image
            src="/honda.png"
            alt="honda"
            width={172}
            height={110}
            className="w-30 sm:w-40"
          />
        </div>
      </div>
      {/* --------------------------------------- */}
    </div>
  );
}
