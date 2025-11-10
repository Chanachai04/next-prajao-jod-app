"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import LabelAndInput from "@/components/form/LabelAndInputForm";

export default function Rent() {
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await fetch("/api/rent", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        setEmail(data.email ?? "");
        setPhone(data.phone ?? "");
      } catch (e) {
        console.error(e);
      }
    };
    fetchContact();
  }, []);

  return (
    <div className="min-h-screen container mx-auto  px-4  py-5  space-y-5">
      {/* ส่วนหัว */}
      <h1 className="text-3xl pt-5 font-semibold">ปล่อยเช่าที่จอดรถ</h1>
      <h1 className="text-xl">
        กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการปล่อยเช่าที่จอดรถ
      </h1>

      {/* ฟอร์ม */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 mt-6">
        <LabelAndInput
          title="ชื่อ *"
          id="name"
          type="text"
          className="w-full"
        />
        <LabelAndInput
          title="นามสกุล *"
          id="surname"
          type="text"
          className="w-full"
        />

        <LabelAndInput
          title="อีเมล *"
          id="email"
          type="text"
          className="w-full"
          value={email}
        />
        <LabelAndInput
          title="รหัสประจำตัวประชาชน *"
          id="id"
          type="text"
          className="w-full"
        />

        <LabelAndInput
          title="Line ID *"
          id="lineid"
          type="text"
          className="w-full"
        />
        <LabelAndInput
          title="เบอร์โทรศัพท์ *"
          id="phone"
          type="text"
          className="w-full"
          value={phone}
        />

        {/* ปุ่มบันทึก (อยู่ใต้คอลัมน์ขวา) */}
        <div className="md:col-start-2 flex justify-end pt-4">
          <Button className="px-10 text-white bg-blue-600 hover:bg-blue-700">
            <div className="text-lg font-light">บันทึกข้อมูล</div>
          </Button>
        </div>
      </div>
    </div>
  );
}
