"use client";
import React from "react";
// สมมติว่า Sidebar มีการจัดการ responsive ภายในตัวอยู่แล้ว
import Sidebar from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function Result() {
  const pathname = usePathname();
  return (
    <div className="min-h-screen px-4 md:px-10 lg:px-20 py-5 bg-gray-50">
      <hr className="border-3 border-gray-600" />
      <div className="flex flex-col lg:flex-row bg-white shadow-sm overflow-hidden min-h-[80vh] lg:gap-x-8">
        <div className="w-full lg:w-1/3 p-6 flex flex-col items-start min-h-[85vh]">
          <h1 className="text-4xl md:text-5xl mb-6 text-gray-600">
            สรุปผลรายได้
          </h1>
          <Sidebar currentPathname={pathname} />
        </div>

        {/* Form Section */}
        <div className="w-full lg:w-2/3 flex flex-col py-6 lg:py-10 pr-6">
          <div className="space-y-6">
            {" "}
            <h2 className="text-gray-600 text-3xl">Total income</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="card text-lg p-4 border rounded shadow-md text-center">
                <div className="text-2xl">0.00</div>
                <div className="text-sm text-gray-500">Total Earning</div>
              </div>

              <div className="card text-lg p-4 border rounded shadow-md text-center">
                <div className="text-2xl">0.00</div>
                <div className="text-sm text-gray-500">
                  Total Booking Monthly
                </div>
              </div>
              <div className="card text-lg p-4 border rounded shadow-md text-center">
                <div className="text-2xl">0.00</div>
                <div className="text-sm text-gray-500">Booking Monthly</div>
              </div>
              <div className="card text-lg p-4 border rounded shadow-md text-center">
                <div className="text-2xl">0.00</div>
                <div className="text-sm text-gray-500">Earning Money</div>
              </div>
              <div className="card text-lg p-4 border rounded shadow-md text-center">
                <div className="text-2xl">0.00</div>
                <div className="text-sm text-gray-500">Booking Hourly</div>
              </div>
              <div className="card text-lg p-4 border rounded shadow-md text-center">
                <div className="text-2xl">0.00</div>
                <div className="text-sm text-gray-500">Earning Hourly</div>
              </div>
              <div className="card text-lg p-4 border rounded shadow-md text-center">
                <div className="text-2xl">0.00</div>
                <div className="text-sm text-gray-500">Booking Daily</div>
              </div>
              <div className="card text-lg p-4 border rounded shadow-md text-center">
                <div className="text-2xl">0.00</div>
                <div className="text-sm text-gray-500">Earning Daily</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
