"use client";

import RegisterForm from "@/components/form/RegisterForm";
import { Suspense } from "react";
import Loading from "./loading";

export default function Login() {
  return (
    <Suspense fallback={<Loading />}>
      <RegisterForm />
    </Suspense>
  );
}
