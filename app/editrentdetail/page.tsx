"use client";
import React from "react";
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
import LabelAndInput from "@/components/form/LabelAndInputForm";
import Link from "next/link";
import AlertModal from "@/components/ui/modal";
import useRentDetail from "@/hook/useRentDetail";

export default function EditRentDetail() {
  const {
    images,
    removeImage,
    handleImageChange,
    submitStatus,
    isSubmitting,
    modalOpen,
    modalType,
    modalTitle,
    modalDescription,
    closeModal,
    formValues,
    parkingTypes,
    timeOptions,
    schedules,
    facilityOptions,
    selectedFacilities,
    agreeTerms,
    agreeFee,
    handleFieldChange,
    toggleFacility,
    toggleSelectAllDays,
    toggleDay,
    changeTime,
    toggleAllDay,
    handleSubmit,
    setFormValues,
    setAgreeTerms,
    setAgreeFee,
  } = useRentDetail();

  return (
    <>
      <form
        className="min-h-screen container mx-auto px-4  py-5"
        onSubmit={handleSubmit}
      >
        {/* --ส่วนหัว */}
        <div className="space-y-3">
          <h1 className="text-3xl pt-5 font-semibold">แก้ไขข้อมูลที่จอดรถ</h1>
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
              <SelectTrigger className="mt-2 min-h-10 w-full text-left">
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

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>

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

        {/* --checkbox เวลาเปิดปิด */}
        <div className="py-5">
          <Label className="text-lg">เวลาเปิดปิดที่จอด *</Label>

          {/* หัวข้อ: วัน / เวลาเปิด / เวลาปิด */}
          <div className="grid grid-cols-12 items-center py-2 gap-2">
            <div className="col-span-6 sm:col-span-3 flex items-center gap-2">
              <Checkbox
                id="everyday"
                className="border border-black"
                checked={schedules.every((s) => s.selected)}
                onCheckedChange={(checked) =>
                  toggleSelectAllDays(checked === true)
                }
              />
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
          {schedules.map((row, index) => (
            <div key={row.day}>
              <div className="grid grid-cols-12 items-center py-3 gap-2 sm:gap-4">
                {/* วัน */}
                <div className="col-span-6 sm:col-span-3 flex items-center gap-2">
                  <Checkbox
                    id={row.day}
                    className="border border-black"
                    checked={row.selected}
                    onCheckedChange={(checked) =>
                      toggleDay(index, checked === true)
                    }
                  />
                  <Label htmlFor={row.day}>{row.day}</Label>
                </div>

                {/* เปิด 24 ชม. */}
                <div className="col-span-6 sm:col-span-2 flex items-center gap-2">
                  <Checkbox
                    id={`${row.day}-24h`}
                    className="border border-black"
                    checked={row.allDay}
                    onCheckedChange={(checked) =>
                      toggleAllDay(index, checked === true)
                    }
                  />
                  <Label htmlFor={`${row.day}-24h`}>เปิด 24 ชม.</Label>
                </div>

                {/* เวลาเปิด */}
                <div className="col-span-6 sm:col-span-4 flex justify-start mt-2 sm:mt-0">
                  <Select
                    value={row.open_time}
                    onValueChange={(value) =>
                      changeTime(index, "open_time", value)
                    }
                    disabled={!row.selected || row.allDay}
                  >
                    <SelectTrigger className="border-2 border-gray-400 w-full sm:w-[250px]">
                      <SelectValue placeholder="06:00" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* เวลาปิด */}
                <div className="col-span-6 sm:col-span-3 flex justify-start mt-2 sm:mt-0">
                  <Select
                    value={row.close_time}
                    onValueChange={(value) =>
                      changeTime(index, "close_time", value)
                    }
                    disabled={!row.selected || row.allDay}
                  >
                    <SelectTrigger className="border-2 border-gray-400 w-full sm:w-[250px]">
                      <SelectValue placeholder="20:00" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <hr className="border-gray-300" />
            </div>
          ))}
        </div>

        {/* --- ส่วนรูปภาพ --- */}
        <div className="py-5">
          <Label className="text-lg">รูปภาพ (ไม่เกิน 10 รูป)</Label>
        </div>

        {/* Input จริง ถูกซ่อนและมี ID */}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          id="file-upload"
          className="hidden"
        />

        {images.length === 0 && (
          <Label
            htmlFor="file-upload"
            className="w-70 h-40 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-400 rounded-lg text-gray-500 hover:bg-gray-50 transition"
          >
            <p>คลิกเพื่อเลือกไฟล์</p>
          </Label>
        )}

        {images.length > 0 && (
          <div className="mt-4">
            {/* ปุ่มสำหรับเพิ่มรูปภาพอื่น ๆ เมื่อมีรูปแล้ว */}
            <Label
              htmlFor="file-upload"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              เพิ่มรูปภาพ
            </Label>
          </div>
        )}

        {/* ส่วนแสดงรูปภาพที่เลือกไว้ */}
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
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

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

        {/* --ราคา */}
        <div className="py-5">
          <h1 className="pb-3 text-2xl">ราคา</h1>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-3 py-3">
            {facilityOptions.map((facility) => {
              const id = `facility-${facility}`;
              return (
                <div className="flex items-center gap-2" key={facility}>
                  <Checkbox
                    id={id}
                    className="border border-black"
                    checked={selectedFacilities.includes(facility)}
                    onCheckedChange={(checked) =>
                      toggleFacility(facility, checked === true)
                    }
                  />
                  <Label htmlFor={id} className="text-base">
                    {facility}
                  </Label>
                </div>
              );
            })}
          </div>

          {/* --term */}
          <div className="grid grid-cols-4 gap-y-3 py-3">
            {" "}
            <div className="flex items-center gap-2">
              {" "}
              <Checkbox
                id="agree_terms"
                className="border border-black"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked === true)}
              />
              <Label htmlFor="agree_terms" className="text-base">
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
              <Checkbox
                id="agree_fee"
                className="border border-black"
                checked={agreeFee}
                onCheckedChange={(checked) => setAgreeFee(checked === true)}
              />
              <Label htmlFor="agree_fee" className="text-base">
                รับทราบว่ามีการเก็บค่าธรรมเนียมในการปล่อยเช่าและรอบการโอนเงินจากพระเจ้าจอด
                ตาม คู่มือการใช้งาน
              </Label>
            </div>
          </div>
        </div>

        <Button
          className="px-12 h-12 cursor-pointer mt-6 mb-10"
          type="submit"
          disabled={isSubmitting || !agreeTerms || !agreeFee}
        >
          {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
        <AlertModal
          open={modalOpen}
          onClose={closeModal}
          type={modalType}
          title={modalTitle}
          description={modalDescription}
        />
      </form>
    </>
  );
}
