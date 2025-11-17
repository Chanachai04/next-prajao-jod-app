"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import LabelAndInput from "@/components/form/LabelAndInputForm";
import { useRouter } from "next/navigation";

export default function Rent() {
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [citizenId, setCitizenId] = useState<string>("");
  const [lineId, setLineId] = useState<string>("");

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await fetch("/api/rent", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        setEmail(data.email ?? "");
        setPhone(data.phone ?? "");
      } catch (e) {
        console.error(e);
      }
    };
    fetchContact();
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch("/api/rent", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          citizenId,
          lineId,
          phone,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.message ?? "บันทึกข้อมูลไม่สำเร็จ");
        return;
      }
      router.replace("/rentdetail");
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

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
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <LabelAndInput
          title="นามสกุล *"
          id="surname"
          type="text"
          className="w-full"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <LabelAndInput
          title="อีเมล *"
          id="email"
          type="text"
          className="w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <LabelAndInput
          title="รหัสประจำตัวประชาชน *"
          id="id"
          type="text"
          className="w-full"
          value={citizenId}
          onChange={(e) => setCitizenId(e.target.value)}
        />

        <LabelAndInput
          title="Line ID *"
          id="lineid"
          type="text"
          className="w-full"
          value={lineId}
          onChange={(e) => setLineId(e.target.value)}
        />
        <LabelAndInput
          title="เบอร์โทรศัพท์ *"
          id="phone"
          type="text"
          className="w-full"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {/* ปุ่มบันทึก (อยู่ใต้คอลัมน์ขวา) */}
        <div className="md:col-start-2 flex justify-end pt-4">
          <Button
            className="px-10 text-white bg-blue-600 hover:bg-blue-700"
            onClick={handleSave}
          >
            <div className="text-lg font-light">บันทึกข้อมูล</div>
          </Button>
        </div>
      </div>
    </div>
  );
}
