"use client";
import React, { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import MapPicker from "@/components/map/MapPicker";
import LabelAndInput from "@/components/form/LabelAndInputForm";
import Link from "next/link";
import ProvinceSearch from "@/components/form/ProvinceSearch";
import { districts, provinces, subDistricts } from "@/lib/thaiData";

export default function RentDetail() {
  const [images, setImages] = useState<File[]>([]);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    type: "",
    description: "",
    total_slot: "",
    address: "",
    subdistrict: "",
    district: "",
    province: "",
    landmark: "",
    price_per_hour: "",
    price_per_day: "",
    price_per_month: "",
    deposit: "",
  });
  const parkingTypes = useMemo(
    () => [
      "ที่จอดรถในบ้าน",
      "ที่จอดรถในคอนโด",
      "ที่จอดรถในห้าง",
      "ที่จอดรถสำนักงาน",
      "อื่นๆ",
    ],
    []
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const updated = [...images, ...files].slice(0, 10);
    setImages(updated);
  };

  const handleFieldChange =
    (field: keyof typeof formValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormValues((prev) => ({ ...prev, [field]: value }));
    };

  const handleProvinceSearchChange = (
    pId: number | null,
    dId: number | null,
    sId: number | null
  ) => {
    if (sId) {
      const sub = subDistricts.find((s) => s.id === sId);
      setFormValues((prev) => ({
        ...prev,
        subdistrict: sub?.name_th || prev.subdistrict,
      }));
    } else if (dId) {
      const district = districts.find((d) => d.id === dId);
      setFormValues((prev) => ({
        ...prev,
        district: district?.name_th || prev.district,
      }));
    } else if (pId) {
      const province = provinces.find((p) => p.id === pId);
      setFormValues((prev) => ({
        ...prev,
        province: province?.name_th || prev.province,
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus(null);

    if (!formValues.name.trim()) {
      setSubmitStatus({ type: "error", message: "กรุณากรอกชื่อที่จอดรถ" });
      return;
    }
    if (!formValues.type) {
      setSubmitStatus({ type: "error", message: "กรุณาเลือกประเภทที่จอด" });
      return;
    }
    if (!formValues.total_slot.trim()) {
      setSubmitStatus({ type: "error", message: "กรุณากรอกจำนวนที่จอด" });
      return;
    }
    if (Number.isNaN(Number(formValues.total_slot))) {
      setSubmitStatus({ type: "error", message: "จำนวนที่จอดต้องเป็นตัวเลข" });
      return;
    }

    const toNumberOrNull = (value: string, field: string) => {
      if (!value.trim()) return null;
      const num = Number(value);
      if (Number.isNaN(num)) {
        throw new Error(`กรุณากรอก${field}เป็นตัวเลข`);
      }
      return num;
    };
    if (!formValues.address.trim()) {
      setSubmitStatus({ type: "error", message: "กรุณากรอกที่อยู่" });
      return;
    }
    if (!formValues.province.trim()) {
      setSubmitStatus({ type: "error", message: "กรุณากรอกจังหวัด" });
      return;
    }
    if (!formValues.district.trim()) {
      setSubmitStatus({ type: "error", message: "กรุณากรอกเขต/อำเภอ" });
      return;
    }
    if (!formValues.subdistrict.trim()) {
      setSubmitStatus({ type: "error", message: "กรุณากรอกแขวง/ตำบล" });
      return;
    }
    if (!formValues.landmark.trim()) {
      setSubmitStatus({ type: "error", message: "กรุณากรอกจุดสังเกต" });
      return;
    }

    let pricePayload: {
      price_per_hour: number | null;
      price_per_day: number | null;
      price_per_month: number | null;
      deposit: number | null;
    };

    try {
      pricePayload = {
        price_per_hour: toNumberOrNull(
          formValues.price_per_hour,
          "ราคาต่อชั่วโมง"
        ),
        price_per_day: toNumberOrNull(formValues.price_per_day, "ราคาต่อวัน"),
        price_per_month: toNumberOrNull(
          formValues.price_per_month,
          "ราคาต่อเดือน"
        ),
        deposit: toNumberOrNull(
          formValues.deposit,
          "ค่าประกันบัตร อุปกรณ์เข้าจอด และสติ๊กเกอร์"
        ),
      };
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "ข้อมูลราคาไม่ถูกต้อง",
      });
      return;
    }

    const payload = {
      name: formValues.name.trim(),
      type: formValues.type,
      description: formValues.description.trim(),
      total_slot: Number(formValues.total_slot) || 0,
      address: formValues.address.trim(),
      subdistrict: formValues.subdistrict.trim(),
      district: formValues.district.trim(),
      province: formValues.province.trim(),
      landmark: formValues.landmark.trim(),
      price: pricePayload,
    };

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/rentdetail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || "บันทึกข้อมูลไม่สำเร็จ");
      }

      setSubmitStatus({ type: "success", message: "บันทึกข้อมูลสำเร็จ" });
      setFormValues({
        name: "",
        type: "",
        description: "",
        total_slot: "",
        address: "",
        subdistrict: "",
        district: "",
        province: "",
        landmark: "",
        price_per_hour: "",
        price_per_day: "",
        price_per_month: "",
        deposit: "",
      });
    } catch (error) {
      console.error(error);
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "บันทึกข้อมูลไม่สำเร็จ",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form
        className="min-h-screen container mx-auto px-4  py-5"
        onSubmit={handleSubmit}
      >
        {/* --ส่วนหัว */}
        <div className="space-y-3">
          <h1 className="text-3xl pt-5 font-semibold">ปล่อยเช่าที่จอดรถ</h1>
          <h1 className="text-xl">ข้อมูลทั่วไปที่จอดรถ</h1>
        </div>

        {/* --ฟอร์มข้อมูลทั่วไป */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-5">
          {/* ชื่อที่จอดรถ */}
          <LabelAndInput
            title="ชื่อที่จอดรถ (ไม่เกิน 80 ตัวอักษร) *"
            id="parkingname"
            type="text"
            placeholder="ชื่อที่จะแสดงในหน้าเว็บ"
            className="w-full"
            value={formValues.name}
            onChange={handleFieldChange("name")}
          />

          {/* ประเภท */}
          <div>
            <Label className="text-lg">ประเภท *</Label>
            <Select
              value={formValues.type}
              onValueChange={(value) =>
                setFormValues((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className="mt-2 h-10 w-full text-left">
                <SelectValue placeholder="เลือกประเภท" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {parkingTypes.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* คำบรรยาย */}
          <div className="md:col-span-2">
            <LabelAndInput
              title="คำบรรยาย"
              id="description"
              type="textarea"
              placeholder="รายละเอียดของที่จอดรถ"
              className="w-full"
              value={formValues.description}
              onChange={handleFieldChange("description")}
            />
          </div>

          {/* จำนวนที่จอด + ที่อยู่ */}
          <LabelAndInput
            title="จำนวนที่จอด (คัน) *"
            id="amount"
            type="number"
            placeholder=""
            className="w-full"
            value={formValues.total_slot}
            onChange={handleFieldChange("total_slot")}
          />
          <LabelAndInput
            title="ที่อยู่ (บ้านเลขที่ หมู่บ้าน ซอย ถนน) *"
            id="location"
            type="text"
            placeholder=""
            className="w-full"
            value={formValues.address}
            onChange={handleFieldChange("address")}
          />

          <LabelAndInput
            title="จังหวัด *"
            id="province"
            type="text"
            placeholder=""
            className="w-full"
            value={formValues.province}
            onChange={handleFieldChange("province")}
          />

          {/* แขวง / เขต */}
          <LabelAndInput
            title="แขวง / ตำบล *"
            id="subdistrict"
            type="text"
            placeholder=""
            className="w-full"
            value={formValues.subdistrict}
            onChange={handleFieldChange("subdistrict")}
          />
          <LabelAndInput
            title="เขต / อำเภอ *"
            id="county"
            type="text"
            placeholder=""
            className="w-full"
            value={formValues.district}
            onChange={handleFieldChange("district")}
          />

          {/* จุดสังเกต */}
          <div className="md:col-span-2">
            <LabelAndInput
              title="จุดสังเกต *"
              id="Landmark"
              type="text"
              placeholder="จะหาที่จอดรถของคุณได้อย่างไร"
              className="w-full"
              value={formValues.landmark}
              onChange={handleFieldChange("landmark")}
            />
          </div>
        </div>

        {/* --checkbox */}
        <div className="py-5">
          <Label className="text-lg">เวลาเปิดปิดที่จอด *</Label>

          {/* หัวข้อ: วัน / เวลาเปิด / เวลาปิด */}
          <div className="grid grid-cols-12 items-center py-2 gap-2">
            <div className="col-span-6 sm:col-span-3 flex items-center gap-2">
              <Checkbox id="everyday" className="border border-black" />
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
                  <Checkbox id={day} className="border border-black" />
                  <Label htmlFor={day}>{day}</Label>
                </div>

                {/* เปิด 24 ชม. */}
                <div className="col-span-6 sm:col-span-2 flex items-center gap-2">
                  <Checkbox id={`${day}-24h`} className="border border-black" />
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
          <Label className="text-lg">รูปภาพ (ไม่เกิน 10 รูป)</Label>
        </div>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="image-container-horizontal"
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
          <Label className="text-lg">ตำแหน่งที่จอดรถ *</Label>
          <p className="py-3 text-sm">
            พิมพ์เพื่อค้นหาตำแหน่งที่ใกล้เคียง
            และเลื่อนพิกัดในแผนที่เพื่อความละเอียดอีกครั้ง
          </p>
          <ProvinceSearch onChange={handleProvinceSearchChange} />
          <div className="h-[400px] w-full relative pt-3">
            <MapPicker
              height="400px"
              zoom={13}
              onMapReady={() => console.log("Map loaded")}
            />
          </div>
        </div>
        <hr className="border-gray-300" />
        {/* --ราคา */}
        <div className="py-5">
          <h1 className="pb-3 text-2xl">ราคา</h1>
          <div className="flex flex-col md:flex-row gap-10 pt-3">
            <LabelAndInput
              title="ราคาต่อชั่วโมง"
              id="priceperhour"
              type="number"
              placeholder=""
              className="w-full"
              value={formValues.price_per_hour}
              onChange={handleFieldChange("price_per_hour")}
            />
            <LabelAndInput
              title="ราคาต่อวัน"
              id="priceperday"
              type="number"
              placeholder=""
              className="w-full"
              value={formValues.price_per_day}
              onChange={handleFieldChange("price_per_day")}
            />
            <LabelAndInput
              title="ราคาต่อเดือน"
              id="pricepermonth"
              type="number"
              placeholder=""
              className="w-full"
              value={formValues.price_per_month}
              onChange={handleFieldChange("price_per_month")}
            />
          </div>
          <div className="py-3">
            <LabelAndInput
              title="ค่าประกันบัตร อุปกรณ์เข้าจอด และสติ๊กเกอร์ (เฉพาะรายเดือน)"
              id="deposit"
              type="number"
              placeholder=""
              className="w-full"
              value={formValues.deposit}
              onChange={handleFieldChange("deposit")}
            />
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
          <h1 className="pb-3 text-2xl">สิ่งอำนวยความสะดวก</h1>

          <div className="grid grid-cols-4 gap-y-3 py-3">
            {" "}
            <div className="flex items-center gap-2">
              {" "}
              <Checkbox id="ประตูเปิดปิด" className="border border-black" />
              <Label htmlFor="ประตูเปิดปิด" className="text-base">
                มีประตูเปิดปิด
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {" "}
              <Checkbox
                id="ระบบรักษาความปลอดภัย"
                className="border border-black"
              />
              <Label htmlFor="ระบบรักษาความปลอดภัย" className="text-base">
                มีระบบรักษาความปลอดภัย
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {" "}
              <Checkbox id="หลังคา" className="border border-black" />
              <Label className="text-base" htmlFor="หลังคา">
                มีหลังคา
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {" "}
              <Checkbox id="เจ้าหน้าที่ดูแล" className="border border-black" />
              <Label className="text-base" htmlFor="เจ้าหน้าที่ดูแล">
                มีเจ้าหน้าที่ดูแล
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {" "}
              <Checkbox id="จอดค้างคืน" className="border border-black" />
              <Label htmlFor="จอดค้างคืน" className="text-base">
                จอดค้างคืน
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {" "}
              <Checkbox id="บริการรับรถ" className="border border-black" />
              <Label htmlFor="บริการรับรถ" className="text-base">
                มีบริการรับรถ
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {" "}
              <Checkbox id="กล้องวงจรปิด" className="border border-black" />
              <Label htmlFor="กล้องวงจรปิด" className="text-base">
                กล้องวงจรปิด
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {" "}
              <Checkbox id="ห้องน้ำ" className="border border-black" />
              <Label htmlFor="ห้องน้ำ" className="text-base">
                ห้องน้ำ
              </Label>
            </div>
          </div>

          {/* --term */}
          <div className="grid grid-cols-4 gap-y-3 py-3">
            {" "}
            <div className="flex items-center gap-2">
              {" "}
              <Checkbox id="ข้อตกลง" className="border border-black" />
              <Label htmlFor="ข้อตกลง" className="text-base">
                อ่านและยอมรับ{" "}
                <Link href="/terms" className="text-blue-500">
                  ข้อตกลงและเงื่อนไขในการให้บริการ
                </Link>
              </Label>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-y-3">
            {" "}
            <div className="flex items-center gap-2 whitespace-nowrap">
              {" "}
              <Checkbox id="ข้อตกลง" className="border border-black" />
              <Label htmlFor="ข้อตกลง" className="text-base">
                รับทราบว่ามีการเก็บค่าธรรมเนียมในการปล่อยเช่าและรอบการโอนเงินจากพระเจ้าจอด
                ตาม คู่มือการใช้งาน
              </Label>
            </div>
          </div>
        </div>
        {submitStatus && (
          <p
            className={`mt-4 text-sm ${
              submitStatus.type === "success"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {submitStatus.message}
          </p>
        )}
        <Button
          className="px-12 h-12 cursor-pointer mt-6"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "กำลังส่งข้อมูล..." : "ส่งข้อมูล"}
        </Button>
      </form>
    </>
  );
}
