import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import LabelAndInput from "@/components/form/LabelAndInputForm";

export default function Rent() {
  return (
    <>
      {/* --ส่วนหัว */}
      <div className="min-h-screen px-4 md:px-10 lg:px-20 py-5">
        <h1 className="text-3xl pt-10">ปล่อยเช่าที่จอดรถ</h1>
        <p className="py-2">
          กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการปล่อยเช่าที่จอดรถ
        </p>

        {/* --ส่วนfield */}
        <div className="flex flex-col space-y-6">
          <div className="flex gap-30">
            <LabelAndInput
              title="ชื่อ *"
              id="name"
              type="text"
              placeholder=""
              leadingIcon={""}
              trailingIcon={""}
              className="resize-none border-gray-300 w-full"
            />
            <LabelAndInput
              title="นามสกุล *"
              id="surname"
              type="text"
              placeholder=""
              leadingIcon={""}
              trailingIcon={""}
              className="resize-none border-gray-300 w-full"
            />
          </div>
          <div className="flex gap-30">
            <LabelAndInput
              title="อีเมล *"
              id="email"
              type="text"
              placeholder=""
              leadingIcon={""}
              trailingIcon={""}
              className="resize-none border-gray-300 w-full"
            />
            <LabelAndInput
              title="รหัสประจำตัวประชาชน *"
              id="id"
              type="text"
              placeholder=""
              leadingIcon={""}
              trailingIcon={""}
              className="resize-none border-gray-300 w-full"
            />
          </div>
          <div className="flex gap-30">
            <LabelAndInput
              title="Line ID *"
              id="lineid"
              type="text"
              placeholder=""
              leadingIcon={""}
              trailingIcon={""}
              className="resize-none border-gray-300 w-full"
            />
            <LabelAndInput
              title="เบอร์โทรศัพท์ *"
              id="phonenumber"
              type="text"
              placeholder=""
              leadingIcon={""}
              trailingIcon={""}
              className="resize-none border-gray-300 w-full"
            />
          </div>
        </div>
        {/* --ปุ่มบันทึก */}
        <div className="pt-7 flex justify-end">
          <Button className="w-full md:w-auto md:px-30">
            <Link href="/forrentdetail">
              <div className="text-lg font-light">บันทึกข้อมูล</div>
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
