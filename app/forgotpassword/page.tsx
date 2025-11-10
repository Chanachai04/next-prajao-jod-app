"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@radix-ui/react-label";
import { Mail } from "lucide-react";
export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      alert("กรุณากรอกอีเมล");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("email", email)
        .single();

      if (!data) {
        alert("ไม่พบอีเมลนี้ในระบบ");
      }
      if (error) {
        console.error(error);
        return;
      } else {
        router.push("/forgotpassword/resetpassword/" + data.id);
        setEmail("");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-1">ลืมรหัสผ่าน</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                className="pl-10 pr-10 w-full text-sm md:text-lg h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className={`w-full rounded-lg font-medium text-white mt-2 cursor-pointer`}
          >
            ถัดไป
          </Button>
        </form>
      </div>
    </div>
  );
}
