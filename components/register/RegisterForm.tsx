"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LockKeyhole, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AlertModal from "@/components/ui/modal";
export default function RegisterForm() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ตรวจความถูกต้องก่อน submit
    if (!phone) {
      setError("กรุณากรอกหมายเลขโทรศัพท์");
      return;
    }
    if (phone.length !== 10) {
      setError("กรุณากรอกหมายเลขโทรศัพท์ 10 หลัก");
      return;
    }
    if (!email) {
      setError("กรุณากรอกอีเมล");
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, phone }),
      });

      if (res.ok) {
        router.refresh();
        window.dispatchEvent(new Event("loginStatusChanged"));
        setModalType("success");
      } else {
        setModalType("error");
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
    <div className="min-h-screen flex flex-col justify-center items-center ">
      <div className="border rounded-2xl p-10 shadow-2xl sm:w-[500px] ">
        <p className="text-4xl">สมัครสมาชิกใหม่</p>
        <form onSubmit={handleRegister}>
          <div className="my-2">
            <Label htmlFor="phone" className="text-lg">
              หมายเลขโทรศัพท์
            </Label>
            <div className="relative mt-2">
              <Phone className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
              <Input
                id="phone"
                type="tel"
                placeholder="กรอกหมายเลขโทรศัพท์ของคุณ"
                className="pl-10 pr-10 w-full text-sm md:text-lg h-10"
                value={phone}
                onChange={(e) => {
                  // รับเฉพาะตัวเลข
                  const onlyNumbers = e.target.value.replace(/\D/g, "");
                  setPhone(onlyNumbers);
                }}
                maxLength={10}
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
                className="pl-10 pr-10 w-full text-sm md:text-lg h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                className="pl-10 pr-10 w-full text-sm md:text-lg h-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <Checkbox
              id="terms"
              className="mr-2 h-4 w-4 border-black"
              required
            />
            <Label htmlFor="terms" className="text-lg">
              ฉันยอมรับ{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                ข้อตกลงและเงื่อนไข
              </Link>
              .
            </Label>
          </div>
          {error && <div className="text-red-600 my-2 text-sm">{error}</div>}
          <Button
            className="my-2 w-full text-lg py-5 cursor-pointer"
            disabled={loading}
          >
            {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
          </Button>
        </form>
      </div>
      <AlertModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          if (modalType === "success") {
            const redirectPath = searchParams.get("redirect") || "/";
            router.push(decodeURIComponent(redirectPath));
          } // redirect หลังปิด modal
        }}
        type={modalType}
        title={
          modalType === "success"
            ? "สมัครสมาชิกสําเร็จ"
            : "สมัครสมาชิกไม่สําเร็จ"
        }
      />
    </div>
  );
}
