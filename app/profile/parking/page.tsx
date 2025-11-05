"use client";
import React from "react";
import Sidebar from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { SquareArrowLeft, SquareArrowRight } from "lucide-react";

export default function Parking() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen px-4 md:px-10 lg:px-20 py-5 bg-gray-50">
      <hr className="border-3 border-gray-600" />

      {/* พื้นหลังขาว ไม่มีขอบโค้ง */}
      <div className="flex flex-col lg:flex-row bg-white shadow-sm overflow-hidden min-h-[80vh]">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 p-6 flex flex-col items-start min-h-[85vh]">
          <h1 className="text-4xl md:text-5xl mb-6 text-gray-600">
            ประวัติการจอง
          </h1>
          <Sidebar currentPathname={pathname} />
        </div>

        {/* ไอคอนลูกศร ติดกับ Sidebar */}
        <div className="pt-25">
          <div className="flex items-center">
            <SquareArrowLeft className="text-gray-600 w-7 h-7 hover:text-blue-600 cursor-pointer transition-colors" />
            <SquareArrowRight className="text-gray-600 w-7 h-7 hover:text-blue-600 cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}
