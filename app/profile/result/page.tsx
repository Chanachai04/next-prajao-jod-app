"use client";
import React from "react";
import Sidebar from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function Result() {
  const pathname = usePathname();
  return (
    <div className="min-h-screen px-4 md:px-10 lg:px-20 py-5 bg-gray-50">
      <hr className="border-3 border-gray-600" />

      {/* พื้นหลังขาว ไม่มีขอบโค้ง */}
      <div className="flex flex-col lg:flex-row bg-white shadow-sm overflow-hidden min-h-[80vh] lg:gap-x-8">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 p-6 flex flex-col items-start min-h-[85vh]">
          <h1 className="text-4xl md:text-5xl mb-6 text-gray-600">
            สรุปผลรายได้
          </h1>
          <Sidebar currentPathname={pathname} />
        </div>

        {/* Form Section */}
        <div className="w-full lg:w-1/2 flex flex-col py-25">
          <div className="space-y-4">
            <div className="text-gray-600 text-3xl">Total income</div>
            <div className="flex-col space-y-5">
              <div className="flex justify-between">
                <div className="card text-lg">
                  0.00 <br />
                  Total Earning
                </div>
                <div className="card text-lg">
                  0.00 <br />
                  Total Booking Monthly
                </div>
                <div className="card text-lg">
                  0.00 <br />
                  Booking Monthly
                </div>
                <div className="card text-lg">
                  0.00 <br />
                  Earning Money
                </div>
              </div>
              <div className="flex justify-between">
                <div className="card text-lg">
                  0.00 <br />
                  Booking Hourly
                </div>
                <div className="card text-lg">
                  0.00 <br />
                  Earning Hourly
                </div>
                <div className="card text-lg">
                  0.00 <br />
                  Booking Daily
                </div>
                <div className="card text-lg">
                  0.00 <br />
                  Earning Daily
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
