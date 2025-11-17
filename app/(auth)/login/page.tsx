"use client";

import LoginForm from "@/components/form/LoginForm";
import { Suspense } from "react";
import Loading from "./loading";

export default function Login() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginForm />
    </Suspense>
  );
}
