"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Car, User } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkLogin = async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      setIsLoggedIn(res.ok);
    } catch {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLogin();

    const handler = () => checkLogin();
    window.addEventListener("loginStatusChanged", handler);

    return () => window.removeEventListener("loginStatusChanged", handler);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.dispatchEvent(new Event("loginStatusChanged"));
    router.push("/");
  };

  if (loading) return null;

  return (
    <nav className="bg-[#44444E] max-w-full">
      <div className="py-2 sm:py-3 px-3 sm:px-6 mx-auto container">
        <div className="flex justify-between items-center gap-2">
          <div>
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
          </div>

          <div className="text-white flex gap-2 sm:gap-4">
            {isLoggedIn ? (
              <>
                <Link href="/rent" className="hidden sm:block">
                  <Button
                    variant="outline"
                    className="cursor-pointer text-sm px-2 sm:px-4 py-1 sm:py-2 h-8 sm:h-10 md:text-lg"
                  >
                    ปล่อยเช่าที่จอดรถ
                  </Button>
                </Link>
                <Link href="/rent" className="sm:hidden">
                  <Button
                    variant="outline"
                    className="cursor-pointer text-sm px-2 py-1 h-8"
                  >
                    เช่าที่จอด
                  </Button>
                </Link>
                {/* User button ไปหน้า profile ไม่ลบ token */}
                <Link href="/profile/detail">
                  <Button
                    variant="outline"
                    className="cursor-pointer px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-10"
                  >
                    <User size={20} className="sm:w-6 sm:h-6" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="cursor-pointer text-sm px-2 sm:px-4 py-1 sm:py-2 h-8 sm:h-10 md:text-lg"
                  >
                    เข้าสู่ระบบ
                  </Button>
                </Link>
                <Link href="/rent" className="hidden sm:block">
                  <Button
                    variant="outline"
                    className="cursor-pointer text-sm px-2 sm:px-4 py-1 sm:py-2 h-8 sm:h-10 md:text-lg"
                  >
                    ปล่อยเช่าที่จอดรถ
                  </Button>
                </Link>
                <Link href="/rent" className="sm:hidden">
                  <Button
                    variant="outline"
                    className="cursor-pointer text-sm px-2 py-1 h-8"
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
