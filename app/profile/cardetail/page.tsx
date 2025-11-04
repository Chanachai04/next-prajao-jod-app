"use client";
import React from "react";
import Sidebar from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function CarDetail() {
  const pathname = usePathname();
  return (
    <div className="min-h-screen px-4 md:px-10 lg:px-20 py-5">
      <div className="flex h-screen">
        <Sidebar currentPathname={pathname} />
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          <h1 className="text-2xl font-bold mb-6">ข้อมูลรถของคุณ</h1>
        </main>
      </div>
    </div>
  );
}
