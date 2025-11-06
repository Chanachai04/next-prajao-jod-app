"use client";
import React from "react";
import Sidebar from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CarDetail() {
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
            <Button>
              {" "}
              <Link href="/profile/addcar">เพิ่มรถใหม่</Link>
            </Button>
            <div className="flex justify-between">
              <div className="text-gray-600">No.</div>
              <div className="text-gray-600">เลขทะเบียน</div>
              <div className="text-gray-600">ยี่ห้อ</div>
              <div className="text-gray-600">โมเดล</div>
              <div className="text-gray-600">สี</div>
            </div>
            <hr />
          </div>
        </div>
      </div>
    </div>
  );
}
