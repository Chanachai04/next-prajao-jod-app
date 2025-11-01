import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForRent() {
  return (
    <>
      {/* --ส่วนหัว */}
      <div className="min-h-screen px-4 md:px-10 lg:px-20 py-10 container mx-auto">
        <h1 className="text-2xl pt-10">ปล่อยเช่าที่จอดรถ</h1>
        <p className="py-2">
          กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการปล่อยเช่าที่จอดรถ
        </p>

        {/* --ส่วนfield */}
        <div className="flex flex-col space-y-6">
          <div className="flex gap-30">
            <Field>
              <FieldLabel htmlFor="name">ชื่อ *</FieldLabel>
              <Input id="name" placeholder="" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="surname">นามสกุล *</FieldLabel>
              <Input id="surname" placeholder="" required />
            </Field>
          </div>
          <div className="flex gap-30">
            <Field>
              <FieldLabel htmlFor="email">อีเมล *</FieldLabel>
              <Input id="email" placeholder="" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="name">รหัสประจำตัวประชาชน *</FieldLabel>
              <Input id="id" placeholder="" required />
            </Field>
          </div>
          <div className="flex gap-30">
            <Field>
              <FieldLabel htmlFor="email">Line ID *</FieldLabel>
              <Input id="lineid" placeholder="" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="name">เบอร์โทรติดต่อ *</FieldLabel>
              <Input id="phonenumber" placeholder="" required />
            </Field>
          </div>
        </div>
        {/* --ปุ่มบันทึก */}
        <div className="pt-7 flex justify-end">
          <Button className="w-full md:w-auto md:px-30">
            <div className="text-lg">บันทึกข้อมูล</div>
          </Button>
        </div>
      </div>
    </>
  );
}
