"use client";

import { useEffect, useState } from "react";
import { Car, User } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. ตรวจสอบ login และดึง userId
        const res = await fetch("/api/me", {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) {
          setIsLoggedIn(false);
          setImage(null);
          return;
        }
        const data = await res.json();
        setIsLoggedIn(data.loggedIn);

        // 2. ถ้ามี userId ดึง image ของ user
        if (data.userId) {
          const { data: userData, error } = await supabase
            .from("users")
            .select("image_url")
            .eq("id", data.userId)
            .single();
          if (!error && userData) setImage(userData.image_url);
        }
      } catch (err) {
        console.error(err);
        setIsLoggedIn(false);
        setImage(null);
      }
    };

    fetchData();

    // Event listener สำหรับ login/logout
    const handler = () => fetchData();
    window.addEventListener("loginStatusChanged", handler);
    return () => window.removeEventListener("loginStatusChanged", handler);
  }, []);

  return (
    <nav className="bg-[#44444E] max-w-full">
      <div className="py-2 sm:py-3 px-3 sm:px-6 mx-auto container">
        <div className="flex justify-between items-center gap-2">
          <Link
            href="/"
            className="font-bold text-white text-center flex justify-start items-center"
          >
            <span className="text-sm md:text-lg leading-tight">
              PRAJAO
              <br />
              JOD
            </span>
            <Car size={32} className="pl-1 sm:pl-2 sm:w-12 sm:h-12" />
          </Link>

          <div className="text-white flex gap-2 sm:gap-4">
            {isLoggedIn ? (
              <>
                <Link href="/rent" className="hidden sm:block">
                  <Button
                    variant="outline"
                    className="px-2 sm:px-4 py-1 sm:py-2 h-8 sm:h-10 text-sm md:text-lg"
                  >
                    ปล่อยเช่าที่จอดรถ
                  </Button>
                </Link>
                <Link href="/rent" className="sm:hidden">
                  <Button variant="outline" className="px-2 py-1 h-8 text-sm">
                    เช่าที่จอด
                  </Button>
                </Link>
                <Link href="/profile/detail">
                  {image ? (
                    <Image
                      src={image as string}
                      width={40}
                      height={40}
                      className="rounded-full h-10 border-2"
                      alt="profile"
                    />
                  ) : (
                    <User size={40} className="border rounded-full p-1" />
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="px-2 sm:px-4 py-1 sm:py-2 h-8 sm:h-10 text-sm md:text-lg cursor-pointer"
                  >
                    เข้าสู่ระบบ
                  </Button>
                </Link>
                <Link href="/rent" className="hidden sm:block">
                  <Button
                    variant="outline"
                    className="px-2 sm:px-4 py-1 sm:py-2 h-8 sm:h-10 text-sm md:text-lg cursor-pointer"
                  >
                    ปล่อยเช่าที่จอดรถ
                  </Button>
                </Link>
                <Link href="/rent" className="sm:hidden">
                  <Button
                    variant="outline"
                    className="px-2 py-1 h-8 text-sm cursor-pointer"
                  >
                    เช่าที่จอด
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
