"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LockKeyhole, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import AlertModal from "@/components/ui/modal";

export default function RegisterForm() {
  // สถานะ (State) สำหรับเก็บค่าและควบคุม UI
  const [phone, setPhone] = useState(""); // หมายเลขโทรศัพท์
  const [email, setEmail] = useState(""); // อีเมล
  const [password, setPassword] = useState(""); // รหัสผ่าน
  const [isShowPassword, setIsShowPassword] = useState(false); // สถานะเปิด/ปิดการแสดงรหัสผ่าน
  const [loading, setLoading] = useState(false); // สถานะแสดงผลระหว่างการโหลด
  const [error, setError] = useState<string | null>(null); // สถานะเก็บข้อความแสดงข้อผิดพลาดของฟอร์ม
  const [modalOpen, setModalOpen] = useState(false); // สถานะเปิด/ปิด Modal
  const [modalType, setModalType] = useState<"success" | "error">("success"); // ชนิดของ Modal (สำเร็จ/ผิดพลาด)
  const searchParams = useSearchParams(); // ดึงค่า query parameters จาก URL

  // ฟังก์ชันจัดการการส่งฟอร์มสมัครสมาชิก
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันการรีเฟรชหน้าเว็บ
    setError(null); // ล้างข้อความแสดงข้อผิดพลาดเก่า

    // การตรวจสอบความถูกต้องของข้อมูล (Client-side Validation)
    if (!phone) {
      setError("กรุณากรอกหมายเลขโทรศัพท์");
      return;
    }
    if (phone.length !== 10) {
      setError("กรุณากรอกหมายเลขโทรศัพท์ 10 หลัก");
      return;
    }
    if (!email) {
      setError("กรุณากรอกอีเมล");
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true); // เริ่มการโหลด

    // การเรียก API สำหรับการสมัครสมาชิก
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, phone }),
      });

      // จัดการผลลัพธ์จาก API
      if (res.ok) {
        // ส่ง Custom Event เมื่อสมัครสมาชิกสำเร็จ (เช่น เพื่ออัปเดตสถานะ Login)
        window.dispatchEvent(new Event("loginStatusChanged"));
        setModalType("success");
        setModalOpen(true);
      } else {
        // หากเกิดข้อผิดพลาดในการตอบกลับ
        setModalType("error");
        setModalOpen(true);
        // ในสถานการณ์จริง ควร fetch res.json() เพื่อดึงข้อความ error จาก server
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่"); // ข้อผิดพลาดในการเชื่อมต่อ
    } finally {
      setLoading(false); // สิ้นสุดการโหลด
    }
  };

  // ส่วนของการแสดงผล UI
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      <div className="border rounded-2xl p-6 sm:p-10 shadow-2xl w-full max-w-[500px]">
        <p className="text-2xl sm:text-4xl">สมัครสมาชิกใหม่</p>
        <form onSubmit={handleRegister}>
          {/* ช่องกรอกหมายเลขโทรศัพท์ */}
          <div className="my-2">
            <Label htmlFor="phone" className="text-lg">
              หมายเลขโทรศัพท์
            </Label>
            <div className="relative mt-2">
              <Phone className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
              <Input
                id="phone"
                type="tel"
                placeholder="กรอกหมายเลขโทรศัพท์ของคุณ"
                className="pl-10 pr-10 w-full text-sm md:text-lg h-10"
                value={phone}
                onChange={(e) => {
                  // กรองให้เหลือเฉพาะตัวเลขเท่านั้น
                  const onlyNumbers = e.target.value.replace(/\D/g, "");
                  setPhone(onlyNumbers);
                }}
                maxLength={10} // กำหนดความยาวสูงสุด 10 หลัก
              />
            </div>
          </div>
          {/* ช่องกรอกอีเมล */}
          <div className="my-2">
            <Label htmlFor="email" className="text-lg">
              อีเมล
            </Label>
            <div className="relative mt-2">
              <Mail className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
              <Input
                id="email"
                type="email"
                placeholder="กรอกอีเมลของคุณ"
                className="pl-10 pr-10 w-full text-sm md:text-lg h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          {/* ช่องกรอกรหัสผ่าน */}
          <div>
            <Label htmlFor="password" className="text-lg">
              รหัสผ่าน
            </Label>
            <div className="relative mt-2">
              <LockKeyhole className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
              <Input
                id="password"
                // สลับ type เพื่อแสดง/ซ่อนรหัสผ่าน
                type={isShowPassword ? "text" : "password"}
                placeholder="กรอกรหัสผ่านของคุณ"
                className="pl-10 pr-10 w-full text-sm md:text-lg h-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* ปุ่มสลับการแสดงรหัสผ่าน */}
              <button
                type="button"
                className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setIsShowPassword(!isShowPassword)}
              >
                {/* แสดงไอคอนที่เหมาะสม */}
                {isShowPassword ? (
                  <EyeOff className="w-6 h-6" />
                ) : (
                  <Eye className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
          {/* Checkbox ยอมรับข้อตกลงและเงื่อนไข */}
          <div className="flex items-center mt-4">
            <Checkbox
              id="terms"
              className="mr-2 h-4 w-4 border-black"
              required // กำหนดให้ต้องเลือก
            />
            <Label htmlFor="terms" className="text-lg">
              ฉันยอมรับ{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                ข้อตกลงและเงื่อนไข
              </Link>
              .
            </Label>
          </div>
          {/* ส่วนแสดงข้อความผิดพลาดของฟอร์ม (ถ้ามี) */}
          {error && (
            <div className="text-red-600 my-2 text-sm sm:text-base">
              {error}
            </div>
          )}
          {/* ปุ่มสมัครสมาชิก */}
          <Button
            className="my-2 w-full text-lg py-5 cursor-pointer"
            disabled={loading} // ปิดการใช้งานปุ่มขณะกำลังโหลด
          >
            {/* เปลี่ยนข้อความปุ่มตามสถานะ loading */}
            {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
          </Button>
        </form>
      </div>
      {/* Modal แจ้งผลการสมัครสมาชิก */}
      <AlertModal
        open={modalOpen}
        onClose={async () => {
          setModalOpen(false);
          if (modalType === "success") {
            // หน่วงเวลาเล็กน้อยเพื่อให้แน่ใจว่า cookie ถูก set แล้ว
            await new Promise((resolve) => setTimeout(resolve, 100));

            // ดึงพาธสำหรับ redirect หรือใช้ '/' เป็นค่าเริ่มต้น
            const redirectPath = searchParams.get("redirect") || "/";
            // เปลี่ยนหน้าเว็บไปยังพาธที่ต้องการ พร้อมรีเฟรชหน้าใหม่
            window.location.href = decodeURIComponent(redirectPath);
          }
        }}
        type={modalType}
        title={
          modalType === "success"
            ? "สมัครสมาชิกสําเร็จ"
            : "สมัครสมาชิกไม่สําเร็จ"
        }
      />
    </div>
  );
}
