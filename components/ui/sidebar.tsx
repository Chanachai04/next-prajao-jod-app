"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  User,
  History,
  Car,
  ParkingCircle,
  CalendarCheck,
  Wallet,
  LucideIcon,
  LogOut,
} from "lucide-react";

interface MenuItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  action?: () => void;
}

export default function Sidebar({
  currentPathname,
}: {
  currentPathname: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.dispatchEvent(new Event("loginStatusChanged"));
    router.push("/login");
  };

  const menuItems: MenuItem[] = [
    { name: "ข้อมูลส่วนตัว", href: "/profile/detail", icon: User },
    { name: "ประวัติการจอง", href: "/profile/history", icon: History },
    { name: "ข้อมูลรถของคุณ", href: "/profile/cardetail", icon: Car },
    { name: "ที่จอดรถของคุณ", href: "/profile/parking", icon: ParkingCircle },
    { name: "การเข้าจอง", href: "/profile/reservation", icon: CalendarCheck },
    { name: "สรุปผลรายได้", href: "/profile/result", icon: Wallet },
    { name: "ออกจากระบบ", icon: LogOut, action: handleLogout },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        setEmail(data.email ?? "");
        setFirstName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
        setImageUrl(data.imageUrl ?? null);
      } catch (err) {
        console.error("❌ fetchProfile error:", err);
      }
    };

    fetchProfile();
  }, []);

  const profile = {
    name: `${firstName} ${lastName}`,
    email: email,
    avatarUrl: imageUrl || "", // ถ้าไม่มี image ใช้ fallback
  };

  return (
    <div className="w-[300px] bg-[#333333] text-white h-full flex flex-col shadow-xl rounded overflow-hidden m-2">
      {/* ส่วนหัว: โปรไฟล์ */}
      <div className="p-4 flex flex-col items-center justify-center bg-[#444444] py-8">
        <Avatar className="h-24 w-24 mb-3 border-4 border-gray-600">
          {imageUrl ? (
            <AvatarImage src={imageUrl} alt={`${firstName} ${lastName}`} />
          ) : (
            <AvatarFallback className="bg-gray-500 text-3xl">
              {firstName?.[0] || "U"}
              {lastName?.[0] || "N"}
            </AvatarFallback>
          )}
        </Avatar>
        <p className="font-semibold text-lg">{profile.name}</p>
        <p className="text-sm text-gray-400">{profile.email}</p>
      </div>

      {/* ส่วนเมนูรายการ */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-0">
          {menuItems.map((item) => {
            const isActive = currentPathname === item.href;
            return (
              <li key={item.name}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 p-4 text-base transition-colors duration-200",
                      isActive
                        ? "bg-blue-600 text-white font-bold"
                        : "hover:bg-[#444444] text-gray-300"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  <button
                    onClick={item.action}
                    className="flex items-center space-x-3 p-4 w-full text-left text-base hover:bg-[#444444] text-gray-300"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
