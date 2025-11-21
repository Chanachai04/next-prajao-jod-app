export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-sm leading-relaxed">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">
          นโยบายความเป็นส่วนตัว (Privacy Policy)
        </h1>

        <p className="text-gray-700 mb-4">
          เอกสารฉบับนี้อธิบายการเก็บ รวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณ
          เมื่อคุณใช้งานเว็บไซต์หรือบริการของเรา (“เรา” หรือ “ผู้ให้บริการ”)
          โปรดอ่านอย่างละเอียดเพื่อทำความเข้าใจว่าข้อมูลของคุณจะถูกจัดการอย่างไร
        </p>

        {/* SECTION 1 */}
        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-900">
          1. ข้อมูลที่เราเก็บ
        </h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>ข้อมูลส่วนบุคคล เช่น ชื่อ, อีเมล, เบอร์โทรศัพท์</li>
          <li>ข้อมูลการใช้งาน เช่น การจองที่จอดรถ, ประวัติการชำระเงิน</li>
          <li>ข้อมูลอุปกรณ์ เช่น IP address, เบราว์เซอร์, ระบบปฏิบัติการ</li>
        </ul>

        {/* SECTION 2 */}
        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-900">
          2. วิธีการเก็บและใช้งานข้อมูล
        </h2>
        <p className="text-gray-700 mb-4">เราใช้ข้อมูลของคุณเพื่อ:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>ให้บริการระบบจองที่จอดรถและบริการอื่น ๆ ของเว็บไซต์</li>
          <li>ปรับปรุงคุณภาพและประสบการณ์การใช้งานของผู้ใช้</li>
          <li>ติดต่อแจ้งข่าวสาร โปรโมชั่น หรือประกาศสำคัญ</li>
          <li>ป้องกันและตรวจสอบกิจกรรมที่ผิดปกติหรือผิดกฎหมาย</li>
        </ul>

        {/* SECTION 3 */}
        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-900">
          3. การเปิดเผยข้อมูล
        </h2>
        <p className="text-gray-700 mb-4">
          เราจะไม่ขายหรือแลกเปลี่ยนข้อมูลส่วนบุคคลของคุณกับบุคคลที่สามโดยไม่ได้รับความยินยอม
          ข้อมูลอาจถูกเปิดเผยเฉพาะในกรณีต่อไปนี้:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>เพื่อให้บริการจองและชำระเงินกับเจ้าของพื้นที่จอดรถ</li>
          <li>ตามที่กฎหมายกำหนดหรือคำสั่งศาล</li>
          <li>
            เพื่อปกป้องสิทธิ์ ความปลอดภัย หรือทรัพย์สินของเว็บไซต์หรือผู้ใช้
          </li>
        </ul>

        {/* SECTION 4 */}
        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-900">
          4. การรักษาความปลอดภัย
        </h2>
        <p className="text-gray-700 mb-4">
          เราใช้มาตรการรักษาความปลอดภัยมาตรฐานอุตสาหกรรมเพื่อป้องกันการเข้าถึง
          การเปิดเผย หรือการแก้ไขข้อมูลโดยไม่ได้รับอนุญาต
        </p>

        {/* SECTION 5 */}
        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-900">
          5. สิทธิของผู้ใช้งาน
        </h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>สามารถเข้าถึงและขอสำเนาข้อมูลส่วนตัวของคุณได้</li>
          <li>สามารถแก้ไขหรือลบข้อมูลส่วนตัวได้ตามที่กฎหมายอนุญาต</li>
          <li>สามารถปฏิเสธการใช้ข้อมูลเพื่อการตลาดหรือการสื่อสารได้</li>
        </ul>

        {/* SECTION 6 */}
        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-900">
          6. การเก็บข้อมูล
        </h2>
        <p className="text-gray-700 mb-4">
          ข้อมูลส่วนบุคคลจะถูกเก็บไว้นานเท่าที่จำเป็นสำหรับวัตถุประสงค์การให้บริการ
          การปฏิบัติตามข้อกฎหมาย และการรักษาสิทธิ์ทางกฎหมายของเรา
        </p>

        {/* SECTION 7 */}
        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-900">
          7. การเปลี่ยนแปลงนโยบาย
        </h2>
        <p className="text-gray-700 mb-4">
          เราสงวนสิทธิ์ในการปรับปรุงหรือแก้ไขนโยบายความเป็นส่วนตัวนี้
          การเปลี่ยนแปลงจะมีผลทันทีหลังประกาศในหน้าเว็บไซต์
          การใช้งานต่อถือว่าคุณยอมรับนโยบายใหม่โดยปริยาย
        </p>

        <div className="mt-12 text-right text-sm text-gray-500">
          อัปเดตล่าสุด: 17 พฤศจิกายน 2025
        </div>
      </div>
    </div>
  );
}
