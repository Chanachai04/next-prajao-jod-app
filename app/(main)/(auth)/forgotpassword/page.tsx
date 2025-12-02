"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@radix-ui/react-label";
import { Mail } from "lucide-react";

export default function ResetPassword() {
  // สถานะเก็บค่าอีเมลที่ผู้ใช้กรอก
  const [email, setEmail] = useState("");
  // Hook สำหรับจัดการการเปลี่ยนเส้นทาง
  const router = useRouter();
  // สถานะแสดงผลระหว่างการโหลด
  const [loading, setLoading] = useState(false);
  // สถานะเก็บข้อความแสดงข้อผิดพลาด
  const [error, setError] = useState<string | null>(null);

  // ฟังก์ชันจัดการการส่งฟอร์ม (handleSubmit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // การตรวจสอบความถูกต้องของข้อมูล (Validation)
    if (!email) {
      setError("กรุณากรอกอีเมล");
      return;
    }
    setLoading(true); // เริ่มการโหลด

    //การค้นหาผู้ใช้ใน Supabase
    try {
      // ค้นหาผู้ใช้จากตาราง "users" โดยใช้อีเมล
      const { data, error } = await supabase
        .from("users")
        .select("id") // เลือกเฉพาะคอลัมน์ ID
        .eq("email", email) // เงื่อนไข: อีเมลตรงกับที่กรอก
        .single(); // คาดหวังผลลัพธ์เดียว

      setLoading(false); // หยุดการโหลด

      // หากไม่พบข้อมูล (data เป็น null)
      if (!data) {
        alert("ไม่พบอีเมลนี้ในระบบ");
        // อาจตั้งค่า setError("ไม่พบอีเมลนี้ในระบบ"); แทน alert เพื่อให้แสดงผลสวยงามขึ้น
        return;
      }

      // หากเกิดข้อผิดพลาดในการเรียก Supabase (ที่ไม่ใช่แค่ไม่พบข้อมูล)
      if (error) {
        console.error(error);
        alert("เกิดข้อผิดพลาดในการค้นหาข้อมูล"); // แจ้งผู้ใช้
        return;
      } else {
        // หากพบผู้ใช้ ให้เปลี่ยนเส้นทางไปยังหน้าตั้งรหัสผ่านใหม่ พร้อมส่ง ID ผู้ใช้ไปใน URL
        router.push("/forgotpassword/reset/" + data.id);
        setEmail(""); // ล้างค่าอีเมลในฟอร์ม
      }
    } catch (err) {
      console.error(err);
      setLoading(false); // หยุดการโหลด
      alert("เกิดข้อผิดพลาด ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
  };

  // <strong>โครงสร้าง UI (JSX)</strong>
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-1">ลืมรหัสผ่าน</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                className="pl-10 pr-10 w-full text-sm md:text-lg h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {/* ส่วนแสดงข้อความผิดพลาด (ถ้ามี) */}
            {error && (
              <div className="text-red-600 my-2 text-sm sm:text-base">
                {error}
              </div>
            )}
          </div>
          {/* ปุ่มยืนยัน */}
          <Button
            type="submit"
            className={`w-full rounded-lg font-medium text-white mt-2 cursor-pointer`}
            disabled={loading} // ปิดการใช้งานปุ่มขณะกำลังโหลด
          >
            {/* เปลี่ยนข้อความปุ่มตามสถานะ loading */}
            {loading ? "กําลังโหลด..." : "ยืนยัน"}
          </Button>
        </form>
      </div>
    </div>
  );
}
