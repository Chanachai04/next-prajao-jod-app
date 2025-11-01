import React from "react";
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

export default function ForRentDetail() {
  return (
    <>
      {/* --ส่วนหัว */}
      <div className="min-h-screen px-4 md:px-10 lg:px-20 py-5">
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

            <div className="flex flex-col w-full md:w-[250px] pt-3">
              <FieldLabel>ประเภท *</FieldLabel>
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
        <div className="flex gap-10 pt-3">
          <Field>
            <FieldLabel htmlFor="name">จำนวนที่จอด (คัน) *</FieldLabel>
            <Input
              id="amout"
              placeholder=""
              required
              className="border-2 border-gray-400"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="surname">
              ที่อยู่ (บ้านเลขที่ หมู่บ้าน ซอย ถนน) *
            </FieldLabel>
            <Input
              id="้houseno"
              placeholder=""
              required
              className="border-2 border-gray-400"
            />
          </Field>
        </div>
        {/* --แขวง/เขต */}
        <div className="flex gap-10 pt-3">
          <Field>
            <FieldLabel htmlFor="name">แขวง / ตำบล *</FieldLabel>
            <Input
              id="district"
              placeholder=""
              required
              className="border-2 border-gray-400"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="surname">เขต / อำเภอ *</FieldLabel>
            <Input
              id="country"
              placeholder=""
              required
              className="border-2 border-gray-400"
            />
          </Field>
        </div>
        <div className="flex gap-10 pt-3">
          <Field>
            <FieldLabel htmlFor="name">จุดสังเกต *</FieldLabel>
            <Input
              id="landmark"
              placeholder="จะหาที่จอดรถคุณได้อย่างไร"
              required
              className="border-2 border-gray-400"
            />
          </Field>
        </div>
        {/* --checkbox */}
        <div className="">
          <div></div>
        </div>
      </div>
    </>
  );
}
