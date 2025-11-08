import { Button } from "@/components/ui/button";
import Link from "next/link";
import LabelAndInput from "@/components/form/LabelAndInputForm";

export default function Rent() {
  return (
    <div className="min-h-screen container mx-auto  px-4  py-5  space-y-5">
      {/* ส่วนหัว */}
      <h1 className="text-3xl pt-5 font-semibold">ปล่อยเช่าที่จอดรถ</h1>
      <h1 className="text-xl">
        กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการปล่อยเช่าที่จอดรถ
      </h1>

      {/* ฟอร์ม */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 mt-6">
        <LabelAndInput
          title="ชื่อ *"
          id="name"
          type="text"
          className="w-full"
        />
        <LabelAndInput
          title="นามสกุล *"
          id="surname"
          type="text"
          className="w-full"
        />

        <LabelAndInput
          title="อีเมล *"
          id="email"
          type="text"
          className="w-full"
        />
        <LabelAndInput
          title="รหัสประจำตัวประชาชน *"
          id="id"
          type="text"
          className="w-full"
        />

        <LabelAndInput
          title="Line ID *"
          id="lineid"
          type="text"
          className="w-full"
        />
        <LabelAndInput
          title="เบอร์โทรศัพท์ *"
          id="phonenumber"
          type="text"
          className="w-full"
        />

        {/* ปุ่มบันทึก (อยู่ใต้คอลัมน์ขวา) */}
        <div className="md:col-start-2 flex justify-end pt-4">
          <Button className="px-10 text-white bg-blue-600 hover:bg-blue-700">
            <Link href="/rentdetail">
              <div className="text-lg font-light">บันทึกข้อมูล</div>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
