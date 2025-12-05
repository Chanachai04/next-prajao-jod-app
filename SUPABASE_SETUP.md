# การตั้งค่า Supabase สำหรับระบบชำระเงิน

## 1. สร้าง Storage Bucket

ไปที่ Supabase Dashboard > Storage และสร้าง bucket ใหม่:

- **Bucket name**: `slip_bk`
- **Public bucket**: เปิดใช้งาน (เพื่อให้สามารถเข้าถึง URL ของรูปภาพได้)

## 2. ตั้งค่า Storage Policies

ไปที่ Storage > slip_bk > Policies และสร้าง policies ดังนี้:

### Policy 1: อนุญาตให้ user อัพโหลดไฟล์ในโฟลเดอร์ของตัวเอง

```sql
CREATE POLICY "Users can upload to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'slip_bk' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 2: อนุญาตให้ทุกคนอ่านไฟล์ (เพราะเป็น public bucket)

```sql
CREATE POLICY "Anyone can view slip images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'slip_bk');
```

### Policy 3: อนุญาตให้ user ลบไฟล์ในโฟลเดอร์ของตัวเอง (optional)

```sql
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'slip_bk' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## 3. สร้างตาราง rent_payment

ไปที่ SQL Editor และรันคำสั่งนี้:

```sql
CREATE TABLE IF NOT EXISTS rent_payment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rent_history_id UUID NOT NULL REFERENCES rent_history(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slip_image_url TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Indexes
  CONSTRAINT rent_payment_rent_history_id_fkey FOREIGN KEY (rent_history_id) REFERENCES rent_history(id),
  CONSTRAINT rent_payment_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

-- สร้าง index เพื่อเพิ่มประสิทธิภาพการค้นหา
CREATE INDEX IF NOT EXISTS idx_rent_payment_rent_history_id ON rent_payment(rent_history_id);
CREATE INDEX IF NOT EXISTS idx_rent_payment_user_id ON rent_payment(user_id);
CREATE INDEX IF NOT EXISTS idx_rent_payment_payment_date ON rent_payment(payment_date);
```

## 4. ตั้งค่า RLS Policies สำหรับตาราง rent_payment

```sql
-- เปิดใช้งาน RLS
ALTER TABLE rent_payment ENABLE ROW LEVEL SECURITY;

-- Policy 1: User สามารถดูข้อมูลการชำระเงินของตัวเองได้
CREATE POLICY "Users can view their own payments"
ON rent_payment
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: User สามารถสร้างข้อมูลการชำระเงินของตัวเองได้
CREATE POLICY "Users can create their own payments"
ON rent_payment
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy 3: Admin หรือเจ้าของที่จอดสามารถดูข้อมูลการชำระเงินทั้งหมดได้ (optional)
-- ปรับแต่งตามความต้องการของระบบ
```

## 5. ตรวจสอบการตั้งค่า

1. ตรวจสอบว่า bucket `slip_bk` ถูกสร้างและเป็น public
2. ตรวจสอบว่า policies ถูกสร้างครบถ้วน
3. ทดสอบการอัพโหลดไฟล์จากหน้าเว็บ
4. ตรวจสอบว่าข้อมูลถูกบันทึกลงตาราง `rent_payment` ถูกต้อง

## หมายเหตุ

- ระบบจะสร้างโฟลเดอร์ตาม `user_id` อัตโนมัติเมื่อมีการอัพโหลดไฟล์ครั้งแรก
- ชื่อไฟล์จะเป็น timestamp เพื่อป้องกันการซ้ำกัน
- ขนาดไฟล์สูงสุดที่อนุญาตคือ 5MB (สามารถปรับได้ใน component)
