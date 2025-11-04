"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Register() {
  const [isShowPassword, setIsShowPassword] = useState(false);
  return (
    <div className="min-h-screen flex flex-col justify-center items-center ">
      <div className="border rounded-2xl p-10 shadow-2xl sm:w-[500px] ">
        <p className="text-4xl">สมัครสมาชิกใหม่</p>
        <form action="">
          <div className="my-2">
            <Label htmlFor="phone" className="text-lg">
              หมายเลขโทรศัพท์
            </Label>
            <div className="relative mt-2">
              <Mail className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
              <Input
                id="phone"
                type="tel"
                placeholder="กรอกหมายเลขโทรศัพท์ของคุณ"
                className="pl-10 pr-10 w-full text-sm md:text-lg h-12"
              />
            </div>
          </div>
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
                className="pl-10 pr-10 w-full text-sm md:text-lg h-12"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="password" className="text-lg">
              รหัสผ่าน
            </Label>
            <div className="relative mt-2">
              <LockKeyhole className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
              <Input
                id="password"
                type={isShowPassword ? "text" : "password"}
                placeholder="กรอกรหัสผ่านของคุณ"
                className="pl-10 pr-10 w-full text-sm md:text-lg h-12"
              />
              <button
                type="button"
                className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setIsShowPassword(!isShowPassword)}
              >
                {isShowPassword ? (
                  <EyeOff className="w-6 h-6" />
                ) : (
                  <Eye className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center mt-4">
            <Checkbox id="terms" className="mr-2 h-5 w-5 border-black" />
            <Label htmlFor="terms" className="text-lg">
              ฉันยอมรับ{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                ข้อตกลงและเงื่อนไข
              </Link>
              .
            </Label>
          </div>
          <Link href="/">
            <Button className="my-4 w-full text-lg py-6 cursor-pointer">
              สมัครสมาชิก
            </Button>
          </Link>
        </form>
      </div>
    </div>
  );
}
