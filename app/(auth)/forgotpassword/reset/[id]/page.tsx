"use client";

import bcrypt from "bcryptjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Label } from "@radix-ui/react-label";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import AlertModal from "@/components/ui/modal";

export default function ResetPassword() {
  const router = useRouter();
  const { id } = useParams();

  const [isShowPassword, setIsShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const { error: supabaseError } = await supabase
        .from("users")
        .update({ password: hashedPassword })
        .eq("id", id);

      if (supabaseError) {
        console.error(supabaseError);
        setModalType("error");
      } else {
        setModalType("success");
      }

      setModalOpen(true); // เปิด modal ไม่ว่าจะ success หรือ error
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
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
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setIsShowPassword(!isShowPassword)}
              >
                {isShowPassword ? (
                  <EyeOff className="w-6 h-6" />
                ) : (
                  <Eye className="w-6 h-6" />
                )}
              </button>
            </div>
            {error && <div className="text-red-600 my-2 text-sm">{error}</div>}
          </div>

          <Button
            type="submit"
            className="w-full rounded-lg font-medium text-white"
          >
            {loading ? "กำลังรีเซ็ต..." : "รีเซ็ตรหัสผ่าน"}
          </Button>
        </form>

        <AlertModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            if (modalType === "success") router.push("/login"); // redirect หลังปิด modal
          }}
          type={modalType}
          title={
            modalType === "success"
              ? "รีเซ็ตรหัสผ่านสำเร็จ"
              : "รีเซ็ตรหัสผ่านไม่สำเร็จ"
          }
          description={
            modalType === "success"
              ? "รหัสผ่านถูกรีเซ็ตเรียบร้อยแล้ว"
              : "ไม่สามารถรีเซ็ตรหัสผ่านได้ กรุณาลองใหม่"
          }
        />
      </div>
    </div>
  );
}
