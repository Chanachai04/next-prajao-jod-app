"use client";
import React from "react";
import Sidebar from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface HistoryItem {
  image: string;
  name: string;
  type: string;
  slot: string;
}

export default function History() {
  const pathname = usePathname();
  const data: HistoryItem[] = [];
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
        <div className="pt-10">
          <div className="flex items-center">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-gray-700 text-xl font-semibold border-b">
                    <th className="py-6 px-6 text-center min-w-[200px]">
                      รูปภาพ
                    </th>
                    <th className="py-6 px-6 text-center min-w-[300px]">
                      ชื่อสถานที่จอด
                    </th>
                    <th className="py-6 px-6 text-center min-w-[220px]">
                      จำนวนวันที่จอด
                    </th>
                    <th className="py-6 px-6 text-center min-w-[180px]">
                      ราคา
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center text-gray-400 py-20 text-lg"
                      >
                        ไม่มีข้อมูล
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b hover:bg-gray-50 text-lg"
                      >
                        <td className="py-6 px-6 text-center">
                          <Image
                            src={item.image}
                            alt=""
                            className="w-24 h-24 object-cover rounded-lg mx-auto"
                          />
                        </td>
                        <td className="py-6 px-6 text-center">{item.name}</td>
                        <td className="py-6 px-6 text-center">{item.type}</td>
                        <td className="py-6 px-6 text-center">{item.slot}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
