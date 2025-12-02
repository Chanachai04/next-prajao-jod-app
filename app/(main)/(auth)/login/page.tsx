"use client";

import LoginForm from "@/components/form/LoginForm";
import { Suspense } from "react";
import Loading from "./loading";

export default function Login() {
  return (
    // ใช้องค์ประกอบ Suspense สำหรับจัดการการโหลด
    <Suspense
      // กำหนดคอมโพเนนต์ที่ใช้แสดงผลระหว่างที่คอมโพเนนต์ลูกกำลังโหลด
      fallback={<Loading />}
    >
      {/* แสดงฟอร์มเข้าสู่ระบบจริง */}
      <LoginForm />
    </Suspense>
  );
}
