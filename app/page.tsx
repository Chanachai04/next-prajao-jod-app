"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@radix-ui/react-select";
import { Calendar, Clock, MapPin, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { DiJava } from "react-icons/di";

export default function Home() {
  const [selectedOption, setSelectedOption] = useState("hourly");
  return (
    <div className="min-h-screen">
      <div className="flex justify-between">
        <div>
          <Image
            src="/park.png"
            alt="Park Image"
            width={410}
            height={500}
            className="mt-10"
          />
        </div>
        <div className="flex flex-col justify-center">
          <div>
            <Button
              onClick={() => setSelectedOption("hourly")}
              variant={selectedOption === "hourly" ? "default" : "link"}
              className={
                selectedOption === "hourly" ? "text-white" : "text-black"
              }
            >
              รายชั่วโมง
            </Button>
            <Button
              onClick={() => setSelectedOption("daily")}
              variant={selectedOption === "daily" ? "default" : "link"}
              className={
                selectedOption === "daily" ? "text-white" : "text-black"
              }
            >
              รายวัน
            </Button>
            <Button
              onClick={() => setSelectedOption("monthly")}
              variant={selectedOption === "monthly" ? "default" : "link"}
              className={
                selectedOption === "monthly" ? "text-white" : "text-black"
              }
            >
              รายเดือน
            </Button>
          </div>
          <form action="" className="w-2xl  mt-4">
            {selectedOption === "hourly" ? (
              <div>
                <div>
                  <Label htmlFor="location">สถานที่</Label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="ชื่อสถานที่หรือบริเวณใกล้เคียง"
                      className="pl-10 pr-10 w-full"
                    />

                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 space-x-3 mt-4">
                  <div>
                    <Label htmlFor="dateIn">วันที่เข้าจอด</Label>
                    <div className="relative mt-2">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        id="dateIn"
                        type="date"
                        className="no-picker-icon pl-10   "
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="time">เวลาเข้าจอด</Label>
                    <div className="relative mt-2">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        id="timeOut"
                        type="time"
                        className="no-picker-icon pl-10  "
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dateOut">วันที่นำรถออก</Label>
                    <div className="relative mt-2">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        id="dateOut"
                        type="date"
                        className="no-picker-icon pl-10  "
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="timeOut">เวลานำรถออก</Label>
                    <div className="relative mt-2">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        id="timeOut"
                        type="time"
                        className="no-picker-icon pl-10  "
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedOption === "daily" ? (
              <div>
                <div>
                  <Label htmlFor="location">สถานที่</Label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="ชื่อสถานที่หรือบริเวณใกล้เคียง"
                      className="pl-10 pr-10 w-full"
                    />

                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 space-x-3 mt-4">
                  <div>
                    <Label htmlFor="dateIn">วันที่เข้าจอด</Label>
                    <div className="relative mt-2">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        id="dateIn"
                        type="date"
                        className="no-picker-icon pl-10 pr-10 w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dateOut">วันที่นำรถออก</Label>
                    <div className="relative mt-2">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        id="dateOut"
                        type="date"
                        className="no-picker-icon pl-10 pr-10  w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div>
                  <Label htmlFor="location">สถานที่</Label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="ชื่อสถานที่หรือบริเวณใกล้เคียง"
                      className="pl-10 pr-10 w-full"
                    />

                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <div>
                    <Label htmlFor="dateIn">วันที่เข้าจอด</Label>
                    <div className="relative mt-2">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        id="dateIn"
                        type="date"
                        className="no-picker-icon pl-10 pr-10 "
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dateOut">ระยะเวลาจอด</Label>
                    <div className="relative mt-2">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Select></Select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
