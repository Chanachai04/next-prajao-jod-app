"use client";
import React from "react";
import Sidebar from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AddCar() {
  const pathname = usePathname();
  return (
    <div className="min-h-screen px-4 md:px-10 lg:px-20 py-5 bg-gray-50">
      <hr className="border-3 border-gray-600" />

      {/* พื้นหลังขาว ไม่มีขอบโค้ง */}
      <div className="flex flex-col lg:flex-row bg-white shadow-sm overflow-hidden min-h-[80vh] lg:gap-x-8">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 p-6 flex flex-col items-start min-h-[85vh]">
          <h1 className="text-4xl md:text-5xl mb-6 text-gray-600">
            ข้อมูลรถของคุณ
          </h1>
          <Sidebar currentPathname={pathname} />
        </div>

        {/* Form Section */}
        <div className="w-full lg:w-1/2 flex flex-col py-25">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-xl text-gray-600">ข้อมูลรถ</div>
              <div className="text-gray-600">เช่น1กข8462</div>
            </div>
            <div className="flex">
              <Field>
                <FieldLabel
                  htmlFor="email"
                  className="text-lg text-gray-600 font-normal"
                >
                  เลขทะเบียนรถยนต์ *
                </FieldLabel>
                <Input id="email" placeholder="" required />
              </Field>
            </div>
            <Field>
              <FieldLabel
                htmlFor="email"
                className="text-lg text-gray-600 font-normal"
              >
                จังหวัด *
              </FieldLabel>
              <Input id="email" placeholder="" required />
            </Field>
            <Field>
              <FieldLabel
                htmlFor="email"
                className="text-lg text-gray-600 font-normal"
              >
                ยี่ห้อ *
              </FieldLabel>
              <Input id="email" placeholder="" required />
            </Field>
            <Field>
              <FieldLabel
                htmlFor="email"
                className="text-lg text-gray-600 font-normal"
              >
                โมเดล / รุ่น *
              </FieldLabel>
              <Input id="email" placeholder="" required />
            </Field>
            <Field>
              <FieldLabel
                htmlFor="email"
                className="text-lg text-gray-600 font-normal"
              >
                สี
              </FieldLabel>
              <Input id="email" placeholder="" required />
            </Field>
            <hr className="my-6" />
            <div className="flex justify-start">
              <Button className="w-full sm:w-auto">บันทึกข้อมูล</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
