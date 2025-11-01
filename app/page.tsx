import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="flex">
        <div>
          <Image
            src="/park.png"
            alt="Park Image"
            width={410}
            height={500}
            className="mt-10"
          />
        </div>
        <div>
          <div>
            <Button>รายชั่วโมง</Button>
            <Button variant={"link"} className="text-black">
              รายวัน
            </Button>
            <Button variant={"link"} className="text-black">
              รายเดือน
            </Button>
          </div>
          <form action=""></form>
        </div>
      </div>
    </div>
  );
}
