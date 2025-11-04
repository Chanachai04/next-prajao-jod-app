"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Login() {
  const [isShowPassword, setIsShowPassword] = useState(false);
  return (
    <div className="min-h-screen flex flex-col justify-center items-center  ">
      <div className="border rounded-2xl p-10 shadow-2xl  sm:w-[500px]  ">
        <p className="text-4xl">เข้าสู่ระบบ</p>
        <form action="">
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
          <div className="flex justify-end my-2">
            <Link
              href="/forgotpassword"
              className="hover:underline hover:text-blue-600"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>
          <Link href="/">
            <Button className="my-2 w-full text-lg py-6 cursor-pointer">
              เข้าสู่ระบบ
            </Button>
          </Link>
          <div className=" my-2">
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
