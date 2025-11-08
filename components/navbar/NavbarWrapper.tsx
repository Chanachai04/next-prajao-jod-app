"use client";

import { useSyncExternalStore } from "react";
import Navbar from "./Navbar";

// สร้าง store สำหรับ login state
function getSnapshot() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("isLogin") === "true";
}

function subscribe(callback: () => void) {
  const handleStorageChange = () => callback();
  const handleLoginEvent = () => callback();

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("loginStatusChanged", handleLoginEvent);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("loginStatusChanged", handleLoginEvent);
  };
}

export default function NavbarWrapper() {
  // ใช้ useSyncExternalStore แทน useState + useEffect
  const isLoggedIn = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => false // server snapshot
  );

  return <Navbar isLoggedIn={isLoggedIn} />;
}
