"use client";
import { Button } from "@/components/ui/button";

import { MapPlus, MousePointerClick } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import LocationInput from "@/components/search_form/LocationInput";
import DateForm from "@/components/search_form/DateForm";
import TimeForm from "@/components/search_form/TimeForm";
import SelectForm from "@/components/search_form/SelectForm";

export default function Home() {
  const [selectedOption, setSelectedOption] = useState("hourly");
  const [dateIn, setDateIn] = useState<Date>();
  const [dateOut, setDateOut] = useState<Date>();
  const [timeIn, setTimeIn] = useState<string>("00:00");
  const [timeOut, setTimeOut] = useState<string>("01:00");
  const timeOption = {
    threeMonths: "3 เดือน",
    sixMonths: "6 เดือน",
    oneYears: "1 ปี",
  };
  return (
    <div className="min-h-screen ">
      {/* -- ค้นหาและเลือกช่วงเวลา -- */}
      <div className="flex flex-col xl:flex-row justify-between container mx-auto">
        <div className="mb-6 xl:mb-0">
          <Image
            src="/park.png"
            alt="Park Image"
            width={410}
            height={500}
            className="mt-10 hidden xl:block w-full max-w-sm xl:max-w-md"
          />
        </div>
        <div className="flex flex-col mt-10 sm:mt-10 justify-center w-full xl:w-2/3">
          <div className="flex flex-wrap gap-2 md:gap-4">
            <Button
              onClick={() => setSelectedOption("hourly")}
              variant={selectedOption === "hourly" ? "default" : "link"}
              className={
                selectedOption === "hourly"
                  ? "text-white text-sm md:text-lg"
                  : "text-black text-sm md:text-lg"
              }
            >
              รายชั่วโมง
            </Button>
            <Button
              onClick={() => setSelectedOption("daily")}
              variant={selectedOption === "daily" ? "default" : "link"}
              className={
                selectedOption === "daily"
                  ? "text-white text-sm md:text-lg"
                  : "text-black text-sm md:text-lg"
              }
            >
              รายวัน
            </Button>
            <Button
              onClick={() => setSelectedOption("monthly")}
              variant={selectedOption === "monthly" ? "default" : "link"}
              className={
                selectedOption === "monthly"
                  ? "text-white text-sm md:text-lg"
                  : "text-black text-sm md:text-lg"
              }
            >
              รายเดือน
            </Button>
          </div>
          <form action="" className="w-full  mt-4 space-y-4">
            {selectedOption === "hourly" ? (
              <>
                <LocationInput
                  title="สถานที่"
                  id="location"
                  type="text"
                  placeholder="ชื่อสถานที่หรือบริเวณใกล้เคียง"
                />
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
                <LocationInput
                  title="สถานที่"
                  id="location"
                  type="text"
                  placeholder="ชื่อสถานที่หรือบริเวณใกล้เคียง"
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
                <LocationInput
                  title="สถานที่"
                  id="location"
                  type="text"
                  placeholder="ชื่อสถานที่หรือบริเวณใกล้เคียง"
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
                    title="จํานวนวัน"
                    placeholder="เลือกจํานวนวัน"
                    itemList={timeOption}
                  />
                </div>
              </>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button className="mt-6 w-full text-lg py-6">
                ค้นหาที่จอดรถ
              </Button>
              <Button className="mt-6 w-full text-lg py-6">
                ค้นหาที่จอดรถใกล้ฉัน
              </Button>
            </div>
          </form>
        </div>
      </div>
      {/* --------------------------------------- */}
      {/* -- รายละเอียดเกี่ยวกับเว็บ -- */}
      <div className="bg-white">
        <div className="container mx-auto py-20">
          <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start">
            <div className="mb-8 lg:mb-0">
              <p className="text-3xl md:text-4xl font-bold text-center lg:text-left flex flex-col">
                ค้นหาที่จอดรถที่ดีที่สุดได้ที่ <br />
                PRAJAO JOD
              </p>
              <div className="mt-4">
                <div className="flex items-center">
                  <MapPlus size={34} />
                  <p className="text-lg pl-2 pb-2">ค้นหาที่จอดรถ</p>
                </div>
                <p>ค้นหาที่จอดรถของคุณได้ง่าย สะดวกและสบายได้ที่ PRAJAO JOD</p>
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  <MousePointerClick size={34} />
                  <p className="text-lg pl-2 pb-2">จองที่จอดรถ</p>
                </div>
                <p>
                  จองที่จอดรถได้ทันที ชำระค่าบริการออนไลน์ ใช้สะดวก รวดเร็ว
                  ปลอดภัย
                </p>
              </div>
            </div>
            <div>
              <Image src={"/park2.png"} alt="Park2" width={232} height={271} />
            </div>
          </div>
        </div>
      </div>
      {/* --------------------------------------- */}
      {/* -- พาร์ทเนอร์และผู้สนับสนุน -- */}
      <div className="container mx-auto py-20">
        <p className="text-3xl md:text-4xl font-bold text-center">
          พาร์ทเนอร์และผู้สนับสนุน
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 items-center justify-items-center gap-4 mt-10">
          <Image src="/sau.png" alt="sau" width={150} height={55} />
          <Image src="/nvidia.png" alt="nvidia" width={114} height={114} />
          <Image src="/microsoft.png" alt="microsoft" width={273} height={58} />
          <Image src="/google.png" alt="google" width={234} height={79} />
          <Image src="/tesla.png" alt="tesla" width={115} height={115} />
          <Image src="/honda.png" alt="honda" width={172} height={110} />
        </div>
      </div>
      {/* --------------------------------------- */}
    </div>
  );
}
