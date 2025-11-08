import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

export default function ParkingCard({ onClick }: { onClick: () => void }) {
  return (
    <>
      <Card
        className="mt-4 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={onClick}
      >
        <CardHeader>
          <div className="flex">
            <Image
              src="/image.jpg"
              alt="รูปที่จอดรถ"
              width={145}
              height={120}
              className="rounded-xl  mr-2"
            />
            <div>
              <CardTitle className="text-xl">ABC</CardTitle>
              <CardDescription className="p-1 rounded-md text-white bg-blue-600">
                รายวัน/ชม
              </CardDescription>
            </div>
          </div>
          <div className="flex  justify-between items-center">
            <p>฿ 1,000/เดือน</p>
            <Button className="ml-2">จองทันที</Button>
          </div>
        </CardHeader>
      </Card>
    </>
  );
}
