"use client";
import React from "react";
import Sidebar from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
            <Field>
              <FieldLabel htmlFor="email" className="text-lg text-gray-600">
                อีเมล *
              </FieldLabel>
              <Input id="email" placeholder="" required />
            </Field>

            <Field>
              <FieldLabel htmlFor="name" className="text-lg text-gray-600">
                ชื่อ *
              </FieldLabel>
              <Input id="name" placeholder="" required />
            </Field>

            <Field>
              <FieldLabel htmlFor="surname" className="text-lg text-gray-600">
                นามสกุล *
              </FieldLabel>
              <Input id="surname" placeholder="" required />
            </Field>

            <Field>
              <FieldLabel htmlFor="id" className="text-lg text-gray-600">
                เลขประจำตัวประชาชน
              </FieldLabel>
              <Label className="text-gray-600 text-sm">
                สำหรับกรณีทำหนังสือสัญญาเช่ารายเดือน
              </Label>
              <Input id="id" placeholder="" required />
            </Field>

            <Field>
              <FieldLabel htmlFor="lineid" className="text-lg text-gray-600">
                Line ID
              </FieldLabel>
              <Input id="lineid" placeholder="" required />
            </Field>

            <Field>
              <FieldLabel htmlFor="phone" className="text-lg text-gray-600">
                เบอร์โทรศัพท์
              </FieldLabel>
              <Input id="phone" placeholder="" required />
            </Field>
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
