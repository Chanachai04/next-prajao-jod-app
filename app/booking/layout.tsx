import type { Metadata } from "next";
import Navbar from "@/components/navbar/Navbar";

export const metadata: Metadata = {
  title: "จองที่จอดรถ - Prajao Jod",
  description: "ค้นหาและจองที่จอดรถในพื้นที่ที่คุณต้องการ",
};

export default function BookingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
