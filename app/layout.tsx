import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import NavbarWrapper from "@/components/navbar/NavbarWrapper";

const prompt = Prompt({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Prajao Jod",
  description:
    "Prajao Jod ช่วยคุณค้นหาที่จอดรถรายเดือน ที่จอดรถรายวัน ที่จอดรถรายชั่วโมง ที่คุณต้องการหรือย่านที่คุณสนใจได้ง่ายๆ รายละเอียดของลานจอดรถ และแนะนำที่จอดดีๆ ราคาที่ถูกสำหรับคุณ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${prompt.className} antialiased bg-[#F4F4F4]`}>
        <NavbarWrapper />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
