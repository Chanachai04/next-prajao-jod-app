import Link from "next/link";
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebook, FaYoutube } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
export default function Footer() {
  return (
    <div className="bg-[#44444E] p-10 ">
      <div className="container mx-auto text-white">
        <div className="grid grid-cols-4">
          <div>
            <p>สอบถามและแนะนำ</p>
            <p className="underline">prajaojodza007@gmail.com</p>
            <p className="flex">
              หรือที่ LINE ID <span className="underline">@prajaojodza007</span>
            </p>
          </div>
          <div className="flex flex-col min-w-[300px] ">
            <p>ติดต่อฝ่ายลูกค้าสัมพันธ์</p>
            <p>บริษัท นินนินกลุ่ม จำกัด</p>
            <p>อีเมล : prajaojodza007@gmail.com</p>
            <p>โทร : 099-999-9999</p>
          </div>
          <div>
            <p>ติดตามข่าวสาร</p>
            <div className="flex space-x-4 mt-2">
              <FaFacebook size={24} className="cursor-pointer" />
              <FaSquareXTwitter size={24} className="cursor-pointer" />
              <AiFillInstagram size={24} className="cursor-pointer" />
              <FaYoutube size={24} className="cursor-pointer" />
            </div>
          </div>
          <div>
            <p>เมนู</p>
            <Link href="/">
              <p className="hover:underline">เช่าสถานที่จอดรถ</p>
            </Link>
            <Link href="/">
              <p className="hover:underline">ปล่อยเช่าพื้นที่ของคุณ</p>
            </Link>
            <Link href="/">
              <p className="hover:underline">Privacy Policy</p>
            </Link>
            <Link href="/">
              <p className="hover:underline">Terms of Service</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
