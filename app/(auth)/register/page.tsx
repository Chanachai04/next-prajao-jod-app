"use client";

import RegisterForm from "@/components/register/RegisterForm";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (token) {
      // ถ้ามี token → redirect ไปหน้า home
      router.replace("/");
    } else {
      setTimeout(() => setTokenChecked(true), 0);
    }
  }, [router]);

  if (!tokenChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>กำลังโหลด...</div>
      </div>
    );
  }

  return <RegisterForm />;
}
