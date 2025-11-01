import { Car } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export default function Navbar() {
  return (
    <nav className="bg-[#44444E] ">
      <div className="py-3 px-6 container  mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <Link
              href="/"
              className="font-bold text-white text-center flex justify-start"
            >
              PRAJAO
              <br />
              JOD
              <Car size={50} className="pl-2" />
            </Link>
          </div>
          <div className="text-white">
            <Link href="/">
              <Button variant={"outline"} className="cursor-pointer">
                เข้าสู่ระบบ
              </Button>
            </Link>
            <Link href="/">
              <Button variant={"outline"} className="ml-4 cursor-pointer">
                เปล่อยเช่าที่จอดรถ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
