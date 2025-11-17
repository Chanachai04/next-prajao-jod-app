"use client";

import LoginForm from "@/components/login/LoginForm";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (token) {
      // ถ้ามี token → redirect ไปหน้า home
      router.replace("/");
    } else {
      setTimeout(() => setLoading(false), 0);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>กำลังโหลด...</div>
      </div>
    );
  }

  return <LoginForm />;
}
