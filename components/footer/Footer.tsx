import Link from "next/link";
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebook, FaYoutube } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    // Container หลักของ Footer
    <div className="bg-[#44444E] p-4 ">
      <div className="container mx-auto text-white">
        {/* จัด Layout เป็น Grid สำหรับแสดง 4 คอลัมน์ (ปรับตามขนาดจอ) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* คอลัมน์ที่ 1: สอบถามและแนะนำ */}
          <div>
            <p className="font-semibold mb-2 text-sm sm:text-base lg:text-lg">
              สอบถามและแนะนำ
            </p>
            {/* อีเมลหลัก */}
            <p className="underline text-sm sm:text-base break-all">
              prajaojodza007@gmail.com
            </p>
            {/* LINE ID */}
            <p className="flex flex-wrap text-sm sm:text-base">
              หรือที่ LINE ID{" "}
              <span className="underline ml-1">@prajaojodza007</span>
            </p>
          </div>

          {/* คอลัมน์ที่ 2: ติดต่อฝ่ายลูกค้าสัมพันธ์ */}
          <div className="flex flex-col">
            <p className="font-semibold mb-2 text-sm sm:text-base lg:text-lg">
              ติดต่อฝ่ายลูกค้าสัมพันธ์
            </p>
            <p className="text-sm sm:text-base">บริษัท นินนินกลุ่ม จำกัด</p>
            {/* อีเมลลูกค้าสัมพันธ์ */}
            <p className="text-sm sm:text-base break-all">
              อีเมล : s6652410030@sau.ac.th
            </p>
            <p className="text-sm sm:text-base break-all">
              อีเมล : s6652410007@sau.ac.th
            </p>
            <p className="text-sm sm:text-base">โทร : 099-999-9999</p>
          </div>

          {/* คอลัมน์ที่ 3: ติดตามข่าวสาร (โซเชียลมีเดีย) */}
          <div>
            <p className="font-semibold mb-2 text-sm sm:text-base lg:text-lg">
              ติดตามข่าวสาร
            </p>
            {/* ไอคอนโซเชียลมีเดีย */}
            <div className="flex space-x-3 sm:space-x-4 mt-2">
              <FaFacebook className="cursor-pointer w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9" />
              <FaSquareXTwitter className="cursor-pointer w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9" />
              <AiFillInstagram className="cursor-pointer w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9" />
              <FaYoutube className="cursor-pointer w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9" />
            </div>
          </div>

          {/* คอลัมน์ที่ 4: เมนูลิงก์ */}
          <div>
            <p className="font-semibold mb-2 text-sm sm:text-base lg:text-lg">
              เมนู
            </p>
            {/* ลิงก์เมนู */}
            <Link href="/">
              <p className="hover:underline text-sm sm:text-base mb-1 cursor-pointer">
                เช่าสถานที่จอดรถ
              </p>
            </Link>
            <Link href="/">
              <p className="hover:underline text-sm sm:text-base mb-1">
                ปล่อยเช่าพื้นที่ของคุณ
              </p>
            </Link>
            <Link href="/privacy">
              <p className="hover:underline text-sm sm:text-base mb-1">
                Privacy Policy
              </p>
            </Link>
            <Link href="/terms">
              <p className="hover:underline text-sm sm:text-base mb-1">
                Terms of Service
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
