"use client";
import React, { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import LabelAndInput from "@/components/form/LabelAndInputForm";
import Image from "next/image";

export default function Detail() {
  const pathname = usePathname();
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    } else {
      setImage(null);
    }
  };

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen px-4 md:px-10 lg:px-20 py-5 bg-gray-50">
      <hr className="border-3 border-gray-600" />
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
        <div className="w-full lg:w-1/3 p-6 flex flex-col mt-20">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">รูปภาพ</h2>

          {/* อัปโหลดรูปภาพ */}
          <div className="image-container-vertical border border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100 aspect-square">
            <div
              className="image-container-vertical border border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100 aspect-square cursor-pointer hover:bg-gray-200 transition"
              onClick={handleContainerClick}
            >
              {image ? (
                <Image
                  src={image}
                  alt="Uploaded"
                  className="object-cover w-full h-full"
                  width={150}
                  height={150}
                />
              ) : (
                <span className="text-gray-400 text-sm">
                  ยังไม่ได้เลือกรูปภาพ
                </span>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="mt-4 hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
