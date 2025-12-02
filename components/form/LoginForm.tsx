"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const [isShowPassword, setIsShowPassword] = useState(false); // สถานะเปิด/ปิดการแสดงรหัสผ่าน
  const [password, setPassword] = useState(""); // สถานะเก็บค่ารหัสผ่าน
  const [email, setEmail] = useState(""); // สถานะเก็บค่าอีเมล
  const [loading, setLoading] = useState(false); // สถานะแสดงผลระหว่างการโหลด (เมื่อกำลังส่งฟอร์ม)
  const [error, setError] = useState<string | null>(null); // สถานะเก็บข้อความแสดงข้อผิดพลาด
  const searchParams = useSearchParams(); // ดึงค่า query parameters จาก URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันการรีเฟรชหน้าเว็บตามค่าเริ่มต้นของฟอร์ม
    setError(null); // ล้างข้อความแสดงข้อผิดพลาดเก่า

    // การตรวจสอบความถูกต้องของข้อมูล (Validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError("กรุณากรอกอีเมล");
      return;
    } else if (!emailRegex.test(email)) {
      setError("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    if (!password) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    } else if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true); // เริ่มการโหลด

    // การเรียก API (Fetch API) เพื่อส่งข้อมูลเข้าสู่ระบบ
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // <strong>จัดการผลลัพธ์จาก API</strong>
      if (res.ok && data.message === "Login success") {
        // ส่ง Custom Event เมื่อเข้าสู่ระบบสำเร็จ (อาจใช้เพื่ออัปเดตสถานะทั่วแอป)
        window.dispatchEvent(new Event("loginStatusChanged"));

        // หน่วงเวลาเล็กน้อยเพื่อให้แน่ใจว่าการตั้งค่า cookie เสร็จสมบูรณ์
        await new Promise((resolve) => setTimeout(resolve, 100));

        // ดึงพาธที่จะให้ redirect ไปหลัง login จาก URL หรือใช้ '/' เป็นค่าเริ่มต้น
        const redirectPath = searchParams.get("redirect") || "/";

        window.location.href = decodeURIComponent(redirectPath);
      } else {
        // แสดงข้อความผิดพลาดที่ได้รับจาก Server
        setError(data.message || "เข้าสู่ระบบไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง"); // ข้อผิดพลาดทั่วไปเมื่อเกิดข้อผิดพลาดในการเชื่อมต่อ
    } finally {
      setLoading(false); // สิ้นสุดการโหลด
    }
  };

  // <strong>โครงสร้าง UI (JSX)</strong>
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      {/* Container หลักของฟอร์ม พร้อม styling ด้วย Tailwind CSS */}
      <div className="border rounded-2xl p-6 sm:p-10 shadow-2xl w-full max-w-[500px]">
        <p className="text-2xl sm:text-4xl">เข้าสู่ระบบ</p>
        <form onSubmit={handleSubmit}>
          {/* ช่องกรอกอีเมล */}
          <div className="my-2">
            <Label htmlFor="email" className="text-lg">
              อีเมล
            </Label>
            <div className="relative mt-2">
              {/* ไอคอนอีเมล */}
              <Mail className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
              <Input
                id="email"
                type="email"
                placeholder="กรอกอีเมลของคุณ"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 pr-10 w-full text-sm md:text-lg h-10"
              />
            </div>
          </div>
          {/* ช่องกรอกรหัสผ่าน */}
          <div>
            <Label htmlFor="password" className="text-lg">
              รหัสผ่าน
            </Label>
            <div className="relative mt-2">
              {/* ไอคอนแม่กุญแจ */}
              <LockKeyhole className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
              <Input
                id="password"
                // เปลี่ยน type ระหว่าง 'password' กับ 'text' ตามสถานะ isShowPassword
                type={isShowPassword ? "text" : "password"}
                placeholder="กรอกรหัสผ่านของคุณ"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 w-full text-sm md:text-lg h-10"
              />
              {/* ปุ่มสลับการแสดง/ซ่อนรหัสผ่าน */}
              <button
                type="button"
                className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setIsShowPassword(!isShowPassword)}
              >
                {/* แสดงไอคอนที่เหมาะสมตามสถานะ */}
                {isShowPassword ? (
                  <EyeOff className="w-6 h-6" />
                ) : (
                  <Eye className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
          {/* ลิงก์ลืมรหัสผ่าน */}
          <div className="flex justify-end my-2">
            <Link
              href="/forgotpassword"
              className="hover:underline hover:text-blue-600"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>

          {/* ส่วนแสดงข้อความผิดพลาด (ถ้ามี) */}
          {error && (
            <div className="text-red-600 my-2 text-sm sm:text-base ">
              {error}
            </div>
          )}

          {/* ปุ่มเข้าสู่ระบบ */}
          <Button
            className="my-2 w-full text-lg py-5 cursor-pointer"
            disabled={loading} // ปิดการใช้งานปุ่มขณะกำลังโหลด
          >
            {/* เปลี่ยนข้อความปุ่มตามสถานะ loading */}
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>

          {/* ลิงก์สำหรับสมัครสมาชิก */}
          <div className="my-2">
            ยังไม่ได้เป็นสมาชิก?{" "}
            <Link href="/register" className="hover:underline text-blue-600">
              สมัครเลยตอนนี้
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
