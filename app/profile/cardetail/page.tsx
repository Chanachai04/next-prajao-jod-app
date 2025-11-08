"use client";
import React from "react";
import Sidebar from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CarDetail() {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 md:px-10 lg:px-20 py-5">
        <hr className="border-3 border-gray-600" />
        <div className="flex flex-col lg:flex-row bg-white shadow-sm overflow-hidden min-h-[80vh] lg:gap-x-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/3 p-6 flex flex-col items-start min-h-[85vh]">
            <h1 className="text-4xl md:text-5xl mb-6 text-gray-600">
              ข้อมูลรถของคุณ
            </h1>
            <Sidebar currentPathname={pathname} />
          </div>

          {/* Form Section */}
          <div className="w-full lg:w-2/3 flex flex-col py-6">
            <div className="space-y-4">
              <Button className="w-full md:w-auto">
                <Link href="/profile/addcar">เพิ่มรถใหม่</Link>
              </Button>

              {/* ตารางข้อมูลรถ */}
              <div className="overflow-x-auto">
                <div className="min-w-[500px] grid grid-cols-5 gap-x-4 text-gray-600 font-medium py-2">
                  <div>No.</div>
                  <div>เลขทะเบียน</div>
                  <div>ยี่ห้อ</div>
                  <div>โมเดล</div>
                  <div>สี</div>
                </div>
                <hr />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
