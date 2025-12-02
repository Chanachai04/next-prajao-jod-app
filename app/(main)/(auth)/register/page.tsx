"use client";

import RegisterForm from "@/components/form/RegisterForm";
import { Suspense } from "react";
import Loading from "./loading";

export default function Login() {
  return (
    // ใช้องค์ประกอบ Suspense สำหรับจัดการสถานะการโหลดของคอมโพเนนต์ลูก
    <Suspense
      // fallback: กำหนดคอมโพเนนต์ที่ใช้แสดงผลระหว่างที่คอมโพเนนต์ลูกกำลังโหลด
      fallback={<Loading />}
    >
      {/* แสดงฟอร์มสมัครสมาชิกจริง เมื่อโหลดเสร็จแล้วจะมาแทนที่ Loading */}
      <RegisterForm />
    </Suspense>
  );
}
