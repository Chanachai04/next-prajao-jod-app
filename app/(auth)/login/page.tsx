import LoginForm from "@/components/login/LoginForm";
import { Suspense } from "react";

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div>กำลังโหลด...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
