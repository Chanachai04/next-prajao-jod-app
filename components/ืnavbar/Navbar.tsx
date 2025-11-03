import { Car } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export default function Navbar() {
  return (
    <nav className="bg-[#44444E] max-w-full">
      <div className="py-2 sm:py-3 px-3 sm:px-6 mx-auto container">
        <div className="flex justify-between items-center gap-2">
          <div>
            <Link
              href="/"
              className="font-bold text-white text-center flex justify-start items-center"
            >
              <span className="text-sm  md:text-lg leading-tight">
                PRAJAO
                <br />
                JOD
              </span>
              <Car size={32} className="pl-1 sm:pl-2 sm:w-12 sm:h-12" />
            </Link>
          </div>
          <div className="text-white flex gap-2 sm:gap-4">
            <Link href="/">
              <Button
                variant={"outline"}
                className="cursor-pointer text-sm  px-2 sm:px-4 py-1 sm:py-2 h-8 sm:h-10 md:text-lg"
              >
                เข้าสู่ระบบ
              </Button>
            </Link>
            <Link href="/" className="hidden sm:block">
              <Button
                variant={"outline"}
                className="cursor-pointer text-sm  px-2 sm:px-4 py-1 sm:py-2 h-8 sm:h-10 md:text-lg"
              >
                ปล่อยเช่าที่จอดรถ
              </Button>
            </Link>
            <Link href="/" className="sm:hidden">
              <Button
                variant={"outline"}
                className="cursor-pointer text-sm px-2 py-1 h-8"
              >
                เช่าที่จอด
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
