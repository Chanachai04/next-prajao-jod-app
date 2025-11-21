"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import LabelAndInput from "@/components/form/LabelAndInputForm";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ui/confirm";

export default function Rent() {
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [citizenId, setCitizenId] = useState<string>("");
  const [lineId, setLineId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const handleSaveClick = () => {
    if (!firstName) {
      setError("กรุณากรอกชื่อ");
      return;
    } else if (!lastName) {
      setError("กรุณากรอกนามสกุล");
      return;
    } else if (!email) {
      setError("กรุณากรอกอีเมล");
      return;
    } else if (!citizenId || citizenId.length !== 13) {
      setError("กรุณากรอกรหัสประจำตัวประชาชน 13 หลัก");
      return;
    } else if (!lineId) {
      setError("กรุณากรอก Line ID");
      return;
    } else if (!phone || phone.length !== 10) {
      setError("กรุณากรอกเบอร์โทรศัพท์ 10 หลัก");
      return;
    }
    setError(null);
    setConfirmOpen(true);
  };

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

      setLoading(true);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.message ?? "บันทึกข้อมูลไม่สำเร็จ");
        return;
      }
      router.replace("/rentdetail");
    } catch (e) {
      console.error(e);
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-4 sm:space-y-5">
      {/* ส่วนหัว */}
      <h1 className="text-2xl sm:text-3xl pt-3 sm:pt-5 font-semibold">
        ปล่อยเช่าที่จอดรถ
      </h1>
      <h1 className="text-base sm:text-lg md:text-xl">
        กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการปล่อยเช่าที่จอดรถ
      </h1>

      {/* ฟอร์ม */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-10 gap-y-4 sm:gap-y-6 mt-4 sm:mt-6">
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
          maxLength={13}
          onChange={(e) => {
            const onlyNumbers = e.target.value.replace(/\D/g, "");
            setCitizenId(onlyNumbers);
          }}
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
          maxLength={10}
          onChange={(e) => {
            const onlyNumbers = e.target.value.replace(/\D/g, "");
            setPhone(onlyNumbers);
          }}
        />
        {error && (
          <div className="text-red-600 text-sm sm:text-base md:col-span-2">
            {error}
          </div>
        )}
        <div className="md:col-start-2 flex justify-end w-full md:w-auto">
          <Button
            className="cursor-pointer w-full sm:w-auto px-6 sm:px-10 text-white bg-blue-600 hover:bg-blue-700 text-base sm:text-lg font-light"
            disabled={loading}
            onClick={handleSaveClick}
          >
            {loading ? "กําลังบันทึก..." : "บันทึกข้อมูล"}
          </Button>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSave}
        title="ยืนยันการบันทึกข้อมูล"
        description="คุณต้องการบันทึกข้อมูลการปล่อยเช่าใช่หรือไม่?"
      />
    </div>
  );
}
