"use client";

import { useEffect, useState } from "react";
import { Car, User } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // สถานะเข้าสู่ระบบ
  const [image, setImage] = useState<string | null>(null); // URL รูปภาพโปรไฟล์

  // Effect สำหรับตรวจสอบสถานะ Login และดึงรูปภาพ
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. ตรวจสอบสถานะ Login ผ่าน API Route /api/me
        const res = await fetch("/api/me", {
          cache: "no-store",
          credentials: "include", // ต้องรวมคุกกี้ในการเรียก API
        });

        if (!res.ok) {
          setIsLoggedIn(false);
          setImage(null);
          return;
        }

        const data = await res.json();
        setIsLoggedIn(data.loggedIn);

        // 2. ถ้าเข้าสู่ระบบแล้ว (มี userId) ให้ดึง URL รูปภาพโปรไฟล์จาก Supabase
        if (data.userId) {
          const { data: userData } = await supabase
            .from("users")
            .select("image_url")
            .eq("id", data.userId)
            .single();

          if (userData?.image_url) {
            // เพิ่ม Query parameter เพื่อป้องกันการ Cache รูปภาพเก่า
            setImage(userData.image_url + `?t=${Date.now()}`);
          }
        }
      } catch (err) {
        console.error(err);
        setIsLoggedIn(false);
        setImage(null);
      }
    };

    fetchData();

    // 3. Setup Event Listener สำหรับการ Login/Logout
    // ดักฟัง Custom Event เมื่อสถานะ Login มีการเปลี่ยนแปลง (ถูกเรียกจาก LoginForm/Logout API)
    const handler = () => fetchData();
    window.addEventListener("loginStatusChanged", handler);

    // Cleanup: ลบ Event Listener เมื่อ Component ถูก Unmount
    return () => {
      window.removeEventListener("loginStatusChanged", handler);
    };
  }, []);

  return (
    <nav className="bg-[#44444E] max-w-full">
      <div className="py-2 sm:py-3 px-3 sm:px-6 mx-auto container">
        <div className="flex justify-between items-center gap-2">
          {/* ส่วนโลโก้ (ลิงก์กลับหน้าหลัก) */}
          <Link
            href="/"
            className="font-bold text-white text-center flex justify-start items-center"
          >
            <span className="text-sm sm:text-base lg:text-lg leading-tight">
              PRAJAO
              <br />
              JOD
            </span>
            <Car
              size={32}
              className="pl-1 sm:pl-2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12"
            />
          </Link>

          {/* ปุ่มและลิงก์ฝั่งขวา */}
          <div className="text-white flex gap-2 sm:gap-4">
            {isLoggedIn ? (
              // ------------------ แสดงเมื่อเข้าสู่ระบบแล้ว ------------------
              <>
                {/* ปุ่มปล่อยเช่าที่จอดรถ (แสดงบนจอใหญ่) */}
                <Link href="/rent" className="hidden sm:block">
                  <Button
                    variant="outline"
                    className="px-2 sm:px-4 py-1 sm:py-2 h-8 sm:h-10 text-sm sm:text-base lg:text-lg cursor-pointer"
                  >
                    ปล่อยเช่าที่จอดรถ
                  </Button>
                </Link>

                {/* ปุ่มเช่าที่จอด (แสดงบนจอมือถือ) */}
                <Link href="/rent" className="sm:hidden">
                  <Button
                    variant="outline"
                    className="px-2 py-1 h-8 text-sm cursor-pointer"
                  >
                    เช่าที่จอด
                  </Button>
                </Link>

                {/* รูปโปรไฟล์ / ไอคอน User (ลิงก์ไปหน้า Profile) */}
                <Link href="/profile/detail">
                  {image ? (
                    <Image
                      src={image}
                      width={40}
                      height={40}
                      className="rounded-full w-8 h-8 sm:w-10 sm:h-10 border-2"
                      alt="profile"
                    />
                  ) : (
                    <User className="border rounded-full p-1 w-8 h-8 sm:w-10 sm:h-10" />
                  )}
                </Link>
              </>
            ) : (
              // ------------------ แสดงเมื่อยังไม่เข้าสู่ระบบ ------------------
              <>
                {/* ปุ่มเข้าสู่ระบบ */}
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="px-2 sm:px-4 py-1 sm:py-2 h-8 sm:h-10 text-sm sm:text-base lg:text-lg cursor-pointer"
                  >
                    เข้าสู่ระบบ
                  </Button>
                </Link>

                {/* ปุ่มปล่อยเช่าที่จอดรถ (แสดงบนจอใหญ่) */}
                <Link href="/rent" className="hidden sm:block">
                  <Button
                    variant="outline"
                    className="px-2 sm:px-4 py-1 sm:py-2 h-8 sm:h-10 text-sm sm:text-base lg:text-lg cursor-pointer"
                  >
                    ปล่อยเช่าที่จอดรถ
                  </Button>
                </Link>

                {/* ปุ่มปล่อยเช่า (แสดงบนจอมือถือ) */}
                <Link href="/rent" className="sm:hidden">
                  <Button
                    variant="outline"
                    className="px-2 py-1 h-8 text-sm cursor-pointer"
                  >
                    ปล่อยเช่า
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
