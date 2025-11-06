"use client";
import React from "react";
import Sidebar from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import LabelAndInput from "@/components/form/LabelAndInputForm";

export default function Detail() {
  const pathname = usePathname();
  return (
    <div className="min-h-screen px-4 md:px-10 lg:px-20 py-5 bg-gray-50">
      <hr className="border-3 border-gray-600" />

      {/* พื้นหลังขาว ไม่มีขอบโค้ง */}
      <div className="flex flex-col lg:flex-row bg-white shadow-sm overflow-hidden min-h-[80vh] lg:gap-x-8">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 p-6 flex flex-col items-start min-h-[85vh]">
          <h1 className="text-4xl md:text-5xl mb-6 text-gray-600">
            ข้อมูลส่วนตัว
          </h1>
          <Sidebar currentPathname={pathname} />
        </div>

        {/* Form Section */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <div className="space-y-4">
            <LabelAndInput
              title="อีเมล *"
              id="email"
              type="text"
              placeholder=""
              leadingIcon={""}
              trailingIcon={""}
              className="resize-none border-gray-300 w-full"
            />

            <LabelAndInput
              title="ชื่อ *"
              id="name"
              type="text"
              placeholder=""
              leadingIcon={""}
              trailingIcon={""}
              className="resize-none border-gray-300 w-full"
            />

            <LabelAndInput
              title="นามสกุล *"
              id="surname"
              type="text"
              placeholder=""
              leadingIcon={""}
              trailingIcon={""}
              className="resize-none border-gray-300 w-full"
            />

            <LabelAndInput
              title="เลขประจำตัวประชาชน"
              id="id"
              type="text"
              placeholder=""
              leadingIcon={""}
              trailingIcon={""}
              className="resize-none border-gray-300 w-full"
            />

            <LabelAndInput
              title="Line ID"
              id="lineid"
              type="text"
              placeholder=""
              leadingIcon={""}
              trailingIcon={""}
              className="resize-none border-gray-300 w-full"
            />

            <LabelAndInput
              title="เบอร์โทรศัพท์"
              id="phonenumber"
              type="text"
              placeholder=""
              leadingIcon={""}
              trailingIcon={""}
              className="resize-none border-gray-300 w-full"
            />
          </div>

          <hr className="my-6" />

          <div className="flex justify-start">
            <Button className="w-full sm:w-auto">บันทึกข้อมูล</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
