import Link from "next/link";
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebook, FaYoutube } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <div className="bg-[#44444E] p-4 sm:p-6 md:p-10 ">
      <div className="container mx-auto text-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div className="text-sm md:text-lg">
            <p className="font-semibold mb-2">สอบถามและแนะนำ</p>
            <p className="underline text-sm md:text-base break-all">
              prajaojodza007@gmail.com
            </p>
            <p className="flex flex-wrap text-sm md:text-base">
              หรือที่ LINE ID{" "}
              <span className="underline ml-1 ">@prajaojodza007</span>
            </p>
          </div>
          <div className="flex flex-col text-sm md:text-base">
            <p className="font-semibold mb-2">ติดต่อฝ่ายลูกค้าสัมพันธ์</p>
            <p className="text-sm md:text-base">บริษัท นินนินกลุ่ม จำกัด</p>
            <p className="text-sm md:text-base break-all">
              อีเมล : s6652410030@sau.ac.th
            </p>
            <p className="text-sm md:text-base break-all">
              อีเมล : s6652410007@sau.ac.th
            </p>
            <p className="text-sm md:text-base">โทร : 099-999-9999</p>
          </div>
          <div className="text-sm md:text-base">
            <p className="font-semibold mb-2">ติดตามข่าวสาร</p>
            <div className="flex space-x-3 sm:space-x-4 mt-2">
              <FaFacebook size={24} className="cursor-pointer sm:w-9 sm:h-9" />
              <FaSquareXTwitter
                size={27}
                className="cursor-pointer sm:w-9 sm:h-9"
              />
              <AiFillInstagram
                size={30}
                className="cursor-pointer sm:w-9 sm:h-9"
              />
              <FaYoutube size={30} className="cursor-pointer sm:w-9 sm:h-9" />
            </div>
          </div>
          <div className="text-sm md:text-base">
            <p className="font-semibold mb-2">เมนู</p>
            <Link href="/">
              <p className="hover:underline text-sm md:text-base mb-1 cursor-pointer">
                เช่าสถานที่จอดรถ
              </p>
            </Link>
            <Link href="/">
              <p className="hover:underline text-sm md:text-base mb-1">
                ปล่อยเช่าพื้นที่ของคุณ
              </p>
            </Link>
            <Link href="/">
              <p className="hover:underline text-sm md:text-base mb-1">
                Privacy Policy
              </p>
            </Link>
            <Link href="/terms">
              <p className="hover:underline text-sm md:text-base mb-1">
                Terms of Service
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
