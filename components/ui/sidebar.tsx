"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User, History, ParkingCircle, LucideIcon, LogOut } from "lucide-react";

interface MenuItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  action?: () => void;
}

type ProfileState = {
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
};

const DEFAULT_PROFILE: ProfileState = {
  email: "",
  firstName: "",
  lastName: "",
  imageUrl: null,
};

const PROFILE_STORAGE_KEY = "profile.sidebar.snapshot";

function readProfileSnapshot(): ProfileState {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const stored = window.sessionStorage.getItem(PROFILE_STORAGE_KEY);
    if (!stored) return DEFAULT_PROFILE;
    const parsed = JSON.parse(stored) as Partial<ProfileState>;
    return {
      email: parsed.email ?? "",
      firstName: parsed.firstName ?? "",
      lastName: parsed.lastName ?? "",
      imageUrl: parsed.imageUrl ?? null,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export default function Sidebar({
  currentPathname,
}: {
  currentPathname: string;
}) {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileState>(DEFAULT_PROFILE);

  // โหลด snapshot หลัง hydration
  useEffect(() => {
    const snap = readProfileSnapshot();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile(snap);
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/logout", { method: "POST" });
    window.dispatchEvent(new Event("loginStatusChanged"));
    window.sessionStorage.removeItem(PROFILE_STORAGE_KEY);
    router.push("/");
  }, [router]);

  const syncProfile = useCallback((next: ProfileState) => {
    setProfile(next);

    if (typeof window === "undefined") return;

    try {
      window.sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();
      syncProfile({
        email: data.email ?? "",
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        imageUrl: data.imageUrl ?? null,
      });
    } catch (err) {
      console.error("fetchProfile error:", err);
    }
  }, [syncProfile]);

  useEffect(() => {
    let isMounted = true;

    const scheduleFetch = () => {
      Promise.resolve().then(() => {
        if (isMounted) {
          fetchProfile();
        }
      });
    };

    scheduleFetch();

    const handleLoginStatusChanged = () => {
      if (typeof window === "undefined") return;
      window.sessionStorage.removeItem(PROFILE_STORAGE_KEY);
      scheduleFetch();
    };

    window.addEventListener("loginStatusChanged", handleLoginStatusChanged);
    return () => {
      isMounted = false;
      window.removeEventListener(
        "loginStatusChanged",
        handleLoginStatusChanged
      );
    };
  }, [fetchProfile]);

  const menuItems: MenuItem[] = [
    { name: "ข้อมูลส่วนตัว", href: "/profile/detail", icon: User },
    { name: "ประวัติการจอง", href: "/profile/history", icon: History },
    { name: "ที่จอดรถของคุณ", href: "/profile/parking", icon: ParkingCircle },
    { name: "ออกจากระบบ", icon: LogOut, action: handleLogout },
  ];

  return (
    <div className="w-[300px] bg-[#333333] text-white h-[650px] flex flex-col shadow-xl rounded overflow-hidden m-2">
      {/* ส่วนหัว: โปรไฟล์ */}
      <div className="p-4 flex flex-col items-center justify-center bg-[#444444] py-8">
        <Avatar className="h-24 w-24 mb-3 border-4 border-gray-600">
          {profile.imageUrl ? (
            <AvatarImage
              src={profile.imageUrl}
              alt={`${profile.firstName} ${profile.lastName}`}
            />
          ) : (
            <AvatarFallback className="bg-gray-500 text-3xl">
              {profile.firstName?.[0] || "U"}
              {profile.lastName?.[0] || "N"}
            </AvatarFallback>
          )}
        </Avatar>
        <p className="font-semibold text-lg">
          {`${profile.firstName} ${profile.lastName}`.trim()}
        </p>
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
                      "flex items-center space-x-3 p-4 text-base transition-colors duration-200 ",
                      isActive
                        ? "bg-blue-600 text-white font-bold"
                        : "hover:bg-[#444444] text-gray-300 "
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  <button
                    onClick={item.action}
                    className="flex items-center space-x-3 p-4 w-full text-left text-base hover:bg-[#444444] text-gray-300 cursor-pointer"
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
