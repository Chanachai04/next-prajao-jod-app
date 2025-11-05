"use client";
import React, { useState } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import MapPicker from "@/components/map/MapPicker";

export default function RentDetail() {
  const [images, setImages] = useState<File[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const updated = [...images, ...files].slice(0, 10);
    setImages(updated);
  };

  return (
    <>
      <div className="min-h-screen px-4 md:px-10 lg:px-20 py-5">
        {/* --ส่วนหัว */}
        <h1 className="text-3xl pt-10">ปล่อยเช่าที่จอดรถ</h1>
        <p className="py-2">ข้อมูลทั่วไปที่จอดรถ</p>

        {/* --ส่วน field */}
        <div className="flex flex-col space-y-6">
          {/* บรรทัด: ชื่อที่จอด + ประเภท */}
          <div className="flex flex-col md:flex-row gap-6">
            <Field className="flex-1">
              <FieldLabel htmlFor="rentname">
                ชื่อที่จอดรถ (ไม่เกิน 80 ตัวอักษร) *
              </FieldLabel>
              <Input
                id="rentname"
                placeholder="ชื่อที่จะแสดงในหน้าเว็บ"
                required
                className="border-2 border-gray-400 w-full"
              />
            </Field>

            <div className="flex flex-col w-full md:w-[250px] pt-3 md:pt-0">
              <FieldLabel className="pb-3">ประเภท *</FieldLabel>
              <Select>
                <SelectTrigger className="border-2 border-gray-400 w-full">
                  <SelectValue placeholder="เลือกประเภทที่จอด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ที่จอดรถในบ้าน">
                      ที่จอดรถในบ้าน
                    </SelectItem>
                    <SelectItem value="ที่จอดรถในคอนโด">
                      ที่จอดรถในคอนโด
                    </SelectItem>
                    <SelectItem value="ที่จอดรถในห้าง">
                      ที่จอดรถในห้าง
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* คำบรรยาย */}
          <Field>
            <FieldLabel htmlFor="Description">คำบรรยาย</FieldLabel>
            <Textarea
              id="Description"
              placeholder="รายละเอียดที่จอด"
              className="resize-none border-2 border-gray-400 w-full"
            />
          </Field>
        </div>

        {/* --จำนวน/บ้านเลขที่ */}
        <div className="flex flex-col md:flex-row gap-6 pt-3">
          <Field className="flex-1">
            <FieldLabel htmlFor="amout">จำนวนที่จอด (คัน) *</FieldLabel>
            <Input id="amout" className="border-2 border-gray-400 w-full" />
          </Field>
          <Field className="flex-1">
            <FieldLabel htmlFor="houseno">
              ที่อยู่ (บ้านเลขที่ หมู่บ้าน ซอย ถนน) *
            </FieldLabel>
            <Input id="houseno" className="border-2 border-gray-400 w-full" />
          </Field>
        </div>

        {/* --แขวง/เขต */}
        <div className="flex flex-col md:flex-row gap-6 pt-3">
          <Field className="flex-1">
            <FieldLabel htmlFor="district">แขวง / ตำบล *</FieldLabel>
            <Input id="district" className="border-2 border-gray-400 w-full" />
          </Field>
          <Field className="flex-1">
            <FieldLabel htmlFor="country">เขต / อำเภอ *</FieldLabel>
            <Input id="country" className="border-2 border-gray-400 w-full" />
          </Field>
        </div>

        {/* --จุดสังเกต */}
        <div className="flex flex-col pt-3">
          <Field>
            <FieldLabel htmlFor="landmark">จุดสังเกต *</FieldLabel>
            <Input
              id="landmark"
              placeholder="จะหาที่จอดรถคุณได้อย่างไร"
              required
              className="border-2 border-gray-400 w-full"
            />
          </Field>
        </div>

        {/* --checkbox */}
        <div className="py-5">
          <Label>เวลาเปิดปิดที่จอด *</Label>

          {/* หัวข้อ: วัน / เวลาเปิด / เวลาปิด */}
          <div className="grid grid-cols-12 items-center py-2 gap-2">
            <div className="col-span-6 sm:col-span-3 flex items-center gap-2">
              <Checkbox id="everyday" />
              <Label htmlFor="everyday">เลือกทั้งหมด (กรุณาเลือกเวลา)</Label>
            </div>
            <div className="col-span-6 sm:col-span-2"></div>
            <Label className="col-span-6 sm:col-span-4 flex justify-start px-25">
              เวลาเปิด
            </Label>
            <Label className="col-span-6 sm:col-span-3 flex justify-start px-25">
              เวลาปิด
            </Label>
          </div>
        </div>

        {/* --รายการวันจันทร์ - อาทิตย์ */}
        <div className="space-y-1">
          {[
            "วันจันทร์",
            "วันอังคาร",
            "วันพุธ",
            "วันพฤหัสบดี",
            "วันศุกร์",
            "วันเสาร์",
            "วันอาทิตย์",
          ].map((day, index) => (
            <div key={index}>
              <div className="grid grid-cols-12 items-center py-3 gap-2 sm:gap-4">
                {/* วัน */}
                <div className="col-span-6 sm:col-span-3 flex items-center gap-2">
                  <Checkbox id={day} />
                  <Label htmlFor={day}>{day}</Label>
                </div>

                {/* เปิด 24 ชม. */}
                <div className="col-span-6 sm:col-span-2 flex items-center gap-2">
                  <Checkbox id={`${day}-24h`} />
                  <Label htmlFor={`${day}-24h`}>เปิด 24 ชม.</Label>
                </div>

                {/* เวลาเปิด */}
                <div className="col-span-6 sm:col-span-4 flex justify-start mt-2 sm:mt-0">
                  <Select>
                    <SelectTrigger className="border-2 border-gray-400 w-full sm:w-[250px]">
                      <SelectValue placeholder="06:00" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Array.from({ length: 24 }, (_, i) => {
                          const time = `${String(i).padStart(2, "0")}:00`;
                          return (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* เวลาปิด */}
                <div className="col-span-6 sm:col-span-3 flex justify-start mt-2 sm:mt-0">
                  <Select>
                    <SelectTrigger className="border-2 border-gray-400 w-full sm:w-[250px]">
                      <SelectValue placeholder="20:00" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Array.from({ length: 24 }, (_, i) => {
                          const time = `${String(i).padStart(2, "0")}:00`;
                          return (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <hr className="border-gray-300" />
            </div>
          ))}
        </div>
        {/* --รูปภาพ */}
        <div className="py-5">
          <Label>รูปภาพ (ไม่เกิน 10 รูป)</Label>
        </div>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="image-container"
        />
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {images.map((file, index) => (
              <div
                key={index}
                className="relative border rounded-md overflow-hidden group"
              >
                <Image
                  width={150}
                  height={100}
                  src={URL.createObjectURL(file)}
                  alt={`preview-${index}`}
                  className="object-cover w-full h-40"
                />
                <button
                  type="button"
                  onClick={() =>
                    setImages((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* --map */}
        <div className="py-5">
          <Label>ตำแหน่งที่จอดรถ *</Label>
          <p className="py-3 text-sm">
            พิมพ์เพื่อค้นหาตำแหน่งที่ใกล้เคียง
            และเลื่อนพิกัดในแผนที่เพื่อความละเอียดอีกครั้ง
          </p>
          <div className="h-[400px] w-full relative">
            <MapPicker
              height="400px"
              onMapReady={() => console.log("Map loaded")}
            />
          </div>
        </div>
        <hr className="border-gray-300" />
        {/* --ราคา */}
        <div className="py-5">
          <Label className="text-2xl">ราคา</Label>

          <div className="flex flex-col md:flex-row gap-6 pt-3">
            <Field className="flex-1">
              <FieldLabel htmlFor="priceperhour">ราคาต่อชั่วโมง</FieldLabel>
              <Input
                id="district"
                className="border-2 border-gray-400 w-full"
              />
            </Field>
            <Field className="flex-1">
              <FieldLabel htmlFor="priceperday">ราคาต่อวัน</FieldLabel>
              <Input id="country" className="border-2 border-gray-400 w-full" />
            </Field>
            <Field className="flex-1">
              <FieldLabel htmlFor="pricepermonth">ราคาต่อเดือน</FieldLabel>
              <Input id="country" className="border-2 border-gray-400 w-full" />
            </Field>
          </div>
          <div className="py-3">
            <Field className="flex-1 w-[1155px]">
              <FieldLabel htmlFor="rentname">
                ค่าประกันบัตร อุปกรณ์ที่เข้าจอด และสติ๊กเกอร์ (เฉพาะรายเดือน)
              </FieldLabel>
              <Input
                id=""
                placeholder="1000"
                required
                className="border-2 border-gray-400 w-full"
              />
            </Field>
          </div>
          <p className="text-sm">
            *พระเจ้าจอด ทำการเก็บเงินสัญญา และอุปกรณ์การเข้าจอด
            จากผู้เช่าโดยจะทำการส่งมอบให้
            <br />
            เจ้าของพื้นที่เมื่อผู้เช่าผิดสัญญาหรือทำอุปกรณ์เข้าจอดชำรุดหรือสูญหาย
          </p>
        </div>
        {/* --สิ่งอำนวยความสะดวก */}
        <hr className="border-gray-300" />
        <div className="py-5">
          <Label className="text-2xl">สิ่งอำนวยความสะดวก</Label>

          <div className="grid grid-cols-4 gap-y-3 py-3">
            {" "}
            <div className="flex items-center gap-2">
              {" "}
              <Checkbox id="ประตูเปิดปิด" />
              <Label htmlFor="ประตูเปิดปิด" className="text-base">
                มีประตูเปิดปิด
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {" "}
              <Checkbox id="ระบบรักษาความปลอดภัย" />
              <Label htmlFor="ระบบรักษาความปลอดภัย" className="text-base">
                มีระบบรักษาความปลอดภัย
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {" "}
              <Checkbox id="หลังคา" />
              <Label className="text-base" htmlFor="หลังคา">
                มีหลังคา
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {" "}
              <Checkbox id="เจ้าหน้าที่ดูแล" />
              <Label className="text-base" htmlFor="เจ้าหน้าที่ดูแล">
                มีเจ้าหน้าที่ดูแล
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {" "}
              <Checkbox id="จอดค้างคืน" />
              <Label htmlFor="จอดค้างคืน" className="text-base">
                จอดค้างคืน
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {" "}
              <Checkbox id="บริการรับรถ" />
              <Label htmlFor="บริการรับรถ" className="text-base">
                มีบริการรับรถ
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {" "}
              <Checkbox id="กล้องวงจรปิด" />
              <Label htmlFor="กล้องวงจรปิด" className="text-base">
                กล้องวงจรปิด
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {" "}
              <Checkbox id="ห้องน้ำ" />
              <Label htmlFor="ห้องน้ำ" className="text-base">
                ห้องน้ำ
              </Label>
            </div>
          </div>
        </div>
        <div className="py-5">
          <Button className="rounded-none h-12">ส่งข้อมูล</Button>
        </div>
      </div>
    </>
  );
}
