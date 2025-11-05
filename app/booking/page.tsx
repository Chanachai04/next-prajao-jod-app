"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import DateForm from "@/components/search_form/DateForm";
import LabelAndInput from "@/components/search_form/LabelAndInput";
import SelectForm from "@/components/search_form/SelectForm";
import TimeForm from "@/components/search_form/TimeForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin } from "lucide-react";
import Loading from "./loading";
import Image from "next/image";

// โหลด MapPicker แบบ dynamic (ไม่ SSR)
const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
});

export default function Booking() {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [dateIn, setDateIn] = useState<Date>();
  const [selectedOption, setSelectedOption] = useState("hourly");
  const [timeOut, setTimeOut] = useState("01:00");

  const timeOption = {
    threeMonths: "3 เดือน",
    sixMonths: "6 เดือน",
    oneYears: "1 ปี",
  };

  return (
    <div className="min-h-screen flex">
      {/* โหลด MapPicker ก่อน */}
      <div className="flex-1 relative">
        <MapPicker
          height="100vh"
          onMapReady={() => setIsMapLoaded(true)} // รับ callback จาก MapPicker
        />

        {/* ถ้ายังโหลดไม่เสร็จ แสดง loading overlay */}
        {!isMapLoaded && <Loading />}
      </div>

      {/* แสดง UI เฉพาะตอนแผนที่โหลดเสร็จ */}
      {isMapLoaded && (
        <div className="w-xl bg-[#EBEBEB] p-4">
          <form className="">
            <h1 className="text-4xl my-4">กรุงเทพมหานคร</h1>
            <LabelAndInput
              title="ค้นหาที่จอดรถในบริเวณ"
              placeholder="ค้นหา..."
              leadingIcon={<MapPin />}
              textLabelSize="text-xl"
              className="bg-white"
            />

            {selectedOption === "hourly" ? (
              <>
                <div className="grid grid-cols-2 gap-2 my-4">
                  <DateForm
                    id="dateIn"
                    date={dateIn}
                    setDate={setDateIn}
                    className="bg-white "
                  />
                  <SelectForm itemList={timeOption} className="bg-white" />
                </div>
                <div className="flex justify-between">
                  <div>
                    <Button
                      type="button"
                      onClick={() => setSelectedOption("hourly")}
                      className="text-lg rounded-full mr-2"
                    >
                      รายวัน/ชม.
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setSelectedOption("daily")}
                      className="text-lg rounded-full bg-white text-black"
                    >
                      รายเดือน
                    </Button>
                  </div>
                  <Button type="button" className="text-lg">
                    ค้นหา
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 my-4">
                  <DateForm
                    id="dateIn"
                    date={dateIn}
                    setDate={setDateIn}
                    className="bg-white "
                  />
                  <TimeForm
                    time={timeOut}
                    setTime={setTimeOut}
                    className="bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 my-4">
                  <DateForm
                    id="dateOut"
                    date={dateIn}
                    setDate={setDateIn}
                    className="bg-white "
                  />
                  <TimeForm
                    time={timeOut}
                    setTime={setTimeOut}
                    className="bg-white"
                  />
                </div>
                <div className="flex justify-between">
                  <div>
                    <Button
                      type="button"
                      onClick={() => setSelectedOption("hourly")}
                      className="text-lg rounded-full mr-2 bg-white text-black"
                    >
                      รายวัน/ชม.
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setSelectedOption("daily")}
                      className="text-lg rounded-full"
                    >
                      รายเดือน
                    </Button>
                  </div>
                  <Button type="button" className="text-lg">
                    ค้นหา
                  </Button>
                </div>
              </>
            )}
            <div className="mt-2 flex-1 overflow-y-auto pr-2">
              {/* card ทั้งหมด */}
              {[...Array(10)].map((_, i) => (
                <Card key={i} className="mt-4">
                  <CardHeader>
                    <div className="flex">
                      <Image
                        src="/image.jpg"
                        alt="รูปที่จอดรถ"
                        width={200}
                        height={100}
                        className="rounded-xl mr-2"
                      />
                      <div>
                        <CardTitle className="text-xl">ABC</CardTitle>
                        <CardDescription className="p-2 rounded-md text-white bg-blue-600">
                          รายวัน/ชม
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center items-end">
                      <p>฿ 1,000/เดือน</p>
                      <Button className="ml-2">จองทันที</Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
