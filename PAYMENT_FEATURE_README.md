# คู่มือฟีเจอร์ชำระเงินและอัพโหลด Slip

## สิ่งที่เพิ่มเข้ามา

### 1. Payment Modal Component (`components/ui/payment-modal.tsx`)

- Modal สำหรับแสดง QR Code ชำระเงิน
- ฟังก์ชันอัพโหลดสลิปการโอนเงิน
- แสดง preview รูปภาพที่เลือก
- Validation:
  - ตรวจสอบว่าเป็นไฟล์รูปภาพเท่านั้น
  - ขนาดไฟล์ไม่เกิน 5MB
  - บังคับให้ต้องอัพโหลดรูปก่อนยืนยันการชำระเงิน

### 2. แก้ไขหน้า Payment (`app/(main)/payment/[id]/page.tsx`)

#### เพิ่ม State ใหม่:

- `isPaymentModalOpen`: ควบคุมการเปิด/ปิด Payment Modal
- `rentHistoryId`: เก็บ ID ของการจองหลังจากสร้างเสร็จ

#### แก้ไขฟังก์ชัน:

- `handlePayment` → `handleCreateBooking`: สร้างการจองและเปิด Payment Modal
- `handleSlipUpload`: จัดการการอัพโหลด slip และบันทึกข้อมูลการชำระเงิน

#### Flow การทำงาน:

1. User กรอกข้อมูลและกดปุ่ม "ชำระเงิน"
2. แสดง Confirm Modal เพื่อยืนยัน
3. เมื่อยืนยัน → สร้างการจองใน `rent_history` และได้ `rentHistoryId`
4. เปิด Payment Modal แสดง QR Code
5. User อัพโหลดสลิปการโอนเงิน
6. ระบบอัพโหลดรูปไปยัง Supabase Storage (`slip_bk/{user_id}/{timestamp}.ext`)
7. บันทึกข้อมูลลงตาราง `rent_payment`
8. แสดง Success Modal และ redirect ไปหน้าแรก

### 3. แก้ไข API Route (`app/api/payment/route.ts`)

- เพิ่มการ return `rentHistoryId` หลังจากสร้างการจองสำเร็จ
- ใช้ `.select("id").single()` เพื่อดึง ID ที่สร้างขึ้น

## การตั้งค่า Supabase

### 1. สร้าง Storage Bucket

```
Bucket name: slip_bk
Public: Yes
```

### 2. สร้างตาราง rent_payment

```sql
CREATE TABLE rent_payment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rent_history_id UUID NOT NULL REFERENCES rent_history(id),
  user_id UUID NOT NULL REFERENCES users(id),
  slip_image_url TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL
);
```

### 3. ตั้งค่า Policies

ดูรายละเอียดใน `SUPABASE_SETUP.md`

## โครงสร้างการเก็บไฟล์

```
slip_bk/
├── {user_id_1}/
│   ├── 1701234567890.jpg
│   ├── 1701234568901.png
│   └── ...
├── {user_id_2}/
│   ├── 1701234569012.jpg
│   └── ...
└── ...
```

## การใช้งาน

1. User เลือกที่จอดและกรอกข้อมูล
2. กดปุ่ม "ชำระเงิน"
3. ยืนยันการจอง
4. สแกน QR Code และโอนเงิน
5. อัพโหลดสลิปการโอนเงิน
6. ยืนยันการชำระเงิน
7. เสร็จสิ้น!

## Validation

- ต้องกรอกข้อมูลผู้จองครบถ้วน
- เลขบัตรประชาชน 13 หลัก
- เบอร์โทรศัพท์ 10 หลัก
- ต้องอัพโหลดรูปภาพเท่านั้น
- ขนาดไฟล์ไม่เกิน 5MB
- ต้องอัพโหลดสลิปก่อนยืนยันการชำระเงิน

## หมายเหตุ

- QR Code ปัจจุบันใช้ placeholder (`/placeholder.png`) สามารถแก้ไขเป็น QR Code จริงได้
- ระบบจะสร้างโฟลเดอร์ตาม user_id อัตโนมัติ
- ชื่อไฟล์ใช้ timestamp เพื่อป้องกันการซ้ำกัน
- รองรับไฟล์รูปภาพทุกประเภท (jpg, png, gif, etc.)
