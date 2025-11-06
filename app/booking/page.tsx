"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import DateForm from "@/components/form/DateForm";
import LabelAndInput from "@/components/form/LabelAndInputForm";
import SelectForm from "@/components/form/SelectForm";
import TimeForm from "@/components/form/TimeForm";
import { Button } from "@/components/ui/button";

import { ArrowLeft, ArrowRight, MapPin, Minimize2, X } from "lucide-react";
import Loading from "./loading";
import BookingCard from "@/components/card/BookingCar";
import Image from "next/image";

// โหลด MapPicker แบบ dynamic (ไม่ SSR)
const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
});

export default function Booking() {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [dateIn, setDateIn] = useState<Date>();
  const [selectedOption, setSelectedOption] = useState("hourly");
  const [timeIn, setTimeIn] = useState("00:00");
  const [timeOut, setTimeOut] = useState("01:00");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionDetail, setSelectedOptionDetail] = useState("hourly");
  const [isShowing, setIsShowing] = useState(false);
  const images = ["/image.jpg", "/image.jpg", "/image.jpg"];
  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
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
          zoom={16}
          height="100vh"
          onMapReady={() => setIsMapLoaded(true)} // รับ callback จาก MapPicker
        />

        {/* ถ้ายังโหลดไม่เสร็จ แสดง loading overlay */}
        {!isMapLoaded && <Loading />}
      </div>

      {isMapLoaded && (
        <>
          {isShowing ? (
            <>
              <div className=" w-md bg-white mx-auto relative">
                {/* Main Image */}
                <div className="relative">
                  <Image
                    src={images[currentIndex]}
                    alt="รูปที่จอดรถ"
                    width={800}
                    height={250}
                    className="w-full h-[250px] object-cover"
                  />
                  <button
                    onClick={() => setIsShowing(false)}
                    className="absolute top-6 left-2 -translate-y-1/2 bg-white p-2 rounded-full shadow"
                  >
                    <X className="w-6 h-6 cursor-pointer" />
                  </button>
                  {/* Arrows */}
                  <button
                    onClick={prevImage}
                    className="absolute top-1/2 left-2 -translate-y-1/2 bg-white p-2 rounded-full shadow"
                  >
                    <ArrowLeft className="w-6 h-6 cursor-pointer" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute top-1/2 right-2 -translate-y-1/2 bg-white p-2 rounded-full shadow"
                  >
                    <ArrowRight className="w-6 h-6 cursor-pointer" />
                  </button>
                </div>

                {/* Thumbnails */}
                <div className="bg-[#F9F3F3] h-24 flex justify-center items-center space-x-2 mt-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <Image
                      key={index}
                      src={img}
                      alt={`thumbnail-${index}`}
                      width={100}
                      height={100}
                      className={`h-16 object-cover cursor-pointer border ${
                        index === currentIndex
                          ? "border-blue-500"
                          : "border-transparent"
                      }`}
                      onClick={() => setCurrentIndex(index)}
                    />
                  ))}
                </div>

                <div className="px-4 max-h-[500px] overflow-y-auto">
                  <p className="text-xl mt-4 ">ABC</p>
                  <div className="flex ">
                    <MapPin className="w-6 h-6" />
                    <p>ซอย ปลูกจิต ลุมพินี</p>
                  </div>
                  <hr className="border border-[#7C7C7C] my-4" />
                  <div>
                    <p className="text-xl mb-2">ข้อมูลราคา</p>
                    <div className="flex flex-wrap gap-2 md:gap-4">
                      <Button
                        onClick={() => setSelectedOptionDetail("hourly")}
                        variant={
                          selectedOptionDetail === "hourly" ? "default" : "link"
                        }
                        className={
                          selectedOptionDetail === "hourly"
                            ? "text-white text-sm md:text-lg"
                            : "text-black text-sm md:text-lg"
                        }
                      >
                        รายชั่วโมง
                      </Button>
                      <Button
                        onClick={() => setSelectedOptionDetail("daily")}
                        variant={
                          selectedOptionDetail === "daily" ? "default" : "link"
                        }
                        className={
                          selectedOptionDetail === "daily"
                            ? "text-white text-sm md:text-lg"
                            : "text-black text-sm md:text-lg"
                        }
                      >
                        รายวัน
                      </Button>
                      <Button
                        onClick={() => setSelectedOptionDetail("monthly")}
                        variant={
                          selectedOptionDetail === "monthly"
                            ? "default"
                            : "link"
                        }
                        className={
                          selectedOptionDetail === "monthly"
                            ? "text-white text-sm md:text-lg"
                            : "text-black text-sm md:text-lg"
                        }
                      >
                        รายเดือน
                      </Button>
                    </div>
                    <div className="text-center">
                      <div className="flex justify-between  my-4">
                        <p>ราคาค่าจอด</p>
                        <p>฿ 100</p>
                      </div>
                      <Button
                        type="button"
                        className="w-1/2 mt-10 cursor-pointer"
                      >
                        จองทันที
                      </Button>
                    </div>
                    <hr className="border border-[#7C7C7C] my-4" />
                    <div>
                      <p>จุดสังเกตุ</p>
                      <p className="text-sm text-[#7C7C7C]">
                        ซอย ปลูกจิต ลุมพินี
                      </p>
                    </div>
                    <hr className="border border-[#7C7C7C] my-4" />
                    <div>
                      <p>ประเภทที่จอด</p>
                      <p className="text-sm text-[#7C7C7C]">Building</p>
                    </div>
                    <hr className="border border-[#7C7C7C] my-4" />
                    <div>
                      <p>สิ่งอำนวยความสะดวก</p>
                      <p className="text-sm text-[#7C7C7C]">CCTV</p>
                    </div>
                    <hr className="border border-[#7C7C7C] my-4" />
                  </div>
                </div>
              </div>
              <div className="w-md bg-[#EBEBEB] p-4">
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
                        <SelectForm
                          itemList={timeOption}
                          className="bg-white"
                          leadingIcon={<Minimize2 />}
                        />
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
                          time={timeIn}
                          setTime={setTimeIn}
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
                  <div className="mt-2 flex-1 overflow-y-auto pr-2 max-h-[600px]">
                    {/* card ทั้งหมด */}
                    <BookingCard onClick={() => setIsShowing(true)} />

                    <BookingCard onClick={() => setIsShowing(true)} />
                  </div>
                </form>
              </div>
            </>
          ) : (
            <>
              <div className="w-md bg-[#EBEBEB] p-4">
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
                        <SelectForm
                          itemList={timeOption}
                          className="bg-white"
                          leadingIcon={<Minimize2 />}
                        />
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
                          time={timeIn}
                          setTime={setTimeIn}
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
                  <div className="mt-2 flex-1 overflow-y-auto pr-2 max-h-[600px]">
                    {/* card ทั้งหมด */}
                    <BookingCard onClick={() => setIsShowing(true)} />

                    <BookingCard onClick={() => setIsShowing(true)} />
                  </div>
                </form>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
