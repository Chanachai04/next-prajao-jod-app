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
  href?: string; // href เป็น optional เพราะ logout ไม่มี link
  icon: LucideIcon;
  action?: () => void; // ฟังก์ชันสำหรับ logout
}

export default function Sidebar({
  currentPathname,
}: {
  currentPathname: string;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    // แจ้ง component อื่นว่ามีการ logout (ถ้ามี)
    window.dispatchEvent(new Event("loginStatusChanged"));
    router.push("/login"); // redirect ไปหน้า login
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

  const profile = {
    name: "chanachai benmat",
    email: "nexus87th@gmail.com",
    avatarUrl: "",
  };

  return (
    <div className="w-[300px] bg-[#333333] text-white h-full flex flex-col shadow-xl rounded overflow-hidden m-2">
      {/* ส่วนหัว: โปรไฟล์ */}
      <div className="p-4 flex flex-col items-center justify-center bg-[#444444] py-8">
        <Avatar className="h-24 w-24 mb-3 border-4 border-gray-600">
          <AvatarImage src={profile.avatarUrl} alt={profile.name} />
          <AvatarFallback className="bg-gray-500 text-3xl">CB</AvatarFallback>
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
