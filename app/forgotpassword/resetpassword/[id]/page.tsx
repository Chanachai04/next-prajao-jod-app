"use client";
import bcrypt from "bcryptjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Label } from "@radix-ui/react-label";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
export default function ResetPassword() {
  const router = useRouter();
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const { id } = useParams();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      alert("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    try {
      const saltRounds = 10; // เลือกระดับความปลอดภัยของ salt
      // hash รหัสผ่านก่อนเก็บ
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const { error } = await supabase
        .from("users")
        .update({
          password: hashedPassword,
        })
        .eq("id", id);

      if (error) {
        console.error(error);
        alert("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน");
      } else {
        alert("รีเซ็ตรหัสผ่านสำเร็จ!");
        router.push("/login");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-1">รีเซ็ตรหัสผ่าน</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                className="pl-10 pr-10 w-full text-sm md:text-lg h-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
          <Button
            type="submit"
            className={`w-full rounded-lg font-medium text-white`}
          >
            ยืนยัน
          </Button>
        </form>
      </div>
    </div>
  );
}
