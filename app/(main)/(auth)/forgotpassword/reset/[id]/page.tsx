"use client";

import bcrypt from "bcryptjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Label } from "@radix-ui/react-label";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import AlertModal from "@/components/ui/modal";

export default function ResetPassword() {
  const router = useRouter(); // Hook สำหรับการนำทาง
  const { id } = useParams(); // ดึง id ผู้ใช้จาก URL parameter

  // สถานะ (State) สำหรับเก็บค่าและควบคุม UI
  const [isShowPassword, setIsShowPassword] = useState(false); // สถานะเปิด/ปิดการแสดงรหัสผ่าน
  const [password, setPassword] = useState(""); // รหัสผ่านใหม่
  const [loading, setLoading] = useState(false); // สถานะแสดงผลระหว่างการโหลด
  const [error, setError] = useState<string | null>(null); // ข้อความแสดงข้อผิดพลาดของฟอร์ม

  const [modalOpen, setModalOpen] = useState(false); // สถานะเปิด/ปิด Modal
  const [modalType, setModalType] = useState<"success" | "error">("success"); // ชนิดของ Modal

  // ฟังก์ชันจัดการการส่งฟอร์ม (Submit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // การตรวจสอบความถูกต้องของรหัสผ่าน
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true); // เริ่มการโหลด
    setError(null); // ล้างข้อผิดพลาดในฟอร์ม

    try {
      // 1. การแฮชรหัสผ่านเพื่อความปลอดภัย (โดยใช้ bcryptjs)
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 2. อัปเดตข้อมูลใน Supabase
      const { error: supabaseError } = await supabase
        .from("users") // อัปเดตตาราง 'users'
        .update({ password: hashedPassword }) // ตั้งค่ารหัสผ่านที่ถูกแฮช
        .eq("id", id); // เงื่อนไข: อัปเดตเฉพาะ ID ที่ตรงกับ URL parameter

      // 3. จัดการผลลัพธ์การอัปเดต
      if (supabaseError) {
        console.error(supabaseError);
        setModalType("error");
      } else {
        setModalType("success");
      }

      setModalOpen(true); // เปิด modal เพื่อแจ้งผลลัพธ์
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่"); // ข้อผิดพลาดทั่วไป
    } finally {
      setLoading(false); // สิ้นสุดการโหลด
    }
  };

  // ส่วนของการแสดงผล UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-1">รีเซ็ตรหัสผ่าน</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ช่องกรอกรหัสผ่านใหม่ */}
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
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
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
            {/* ส่วนแสดงข้อความผิดพลาดของฟอร์ม (ถ้ามี) */}
            {error && (
              <div className="text-red-600 my-2 text-sm sm:text-base">
                {error}
              </div>
            )}
          </div>

          {/* ปุ่มรีเซ็ตรหัสผ่าน */}
          <Button
            type="submit"
            className="w-full rounded-lg font-medium text-white"
            disabled={loading} // ปิดการใช้งานปุ่มขณะกำลังโหลด
          >
            {/* เปลี่ยนข้อความปุ่มตามสถานะ loading */}
            {loading ? "กำลังรีเซ็ต..." : "รีเซ็ตรหัสผ่าน"}
          </Button>
        </form>

        {/* Modal แจ้งผลการรีเซ็ตรหัสผ่าน */}
        <AlertModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            // ถ้าสำเร็จ ให้เปลี่ยนเส้นทางไปยังหน้า Login
            if (modalType === "success") router.push("/login");
          }}
          type={modalType}
          title={
            modalType === "success"
              ? "รีเซ็ตรหัสผ่านสำเร็จ"
              : "รีเซ็ตรหัสผ่านไม่สำเร็จ"
          }
          description={
            modalType === "success"
              ? "รหัสผ่านถูกรีเซ็ตเรียบร้อยแล้ว"
              : "ไม่สามารถรีเซ็ตรหัสผ่านได้ กรุณาลองใหม่"
          }
        />
      </div>
    </div>
  );
}
