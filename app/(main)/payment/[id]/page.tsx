"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import LabelAndInputForm from "@/components/form/LabelAndInputForm";
import { Button } from "@/components/ui/button";
import AlertModal from "@/components/ui/modal";
import PaymentModal from "@/components/ui/payment-modal";
import Loading from "../loading";
import { PaymentData } from "@/types/payment";
import { supabase } from "@/lib/supabaseClient";

export default function Page() {
  const { id } = useParams(); // ID ของที่จอดรถ (Rent ID)
  const searchParams = useSearchParams();
  const router = useRouter();

  // สถานะควบคุม Modal และกระบวนการ
  const [isOpen, setIsOpen] = useState(false); // Alert Modal (สำเร็จ)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // Payment Modal
  const [isLoading, setIsLoading] = useState(true); // สถานะโหลดข้อมูล API
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null); // ข้อมูลที่จอดรถและผู้ใช้
  const [isProcessing, setIsProcessing] = useState(false); // สถานะกำลังประมวลผลการชำระเงิน
  const [rentHistoryId, setRentHistoryId] = useState<string | null>(null); // เก็บ rent_history_id หลังจากสร้างการจอง

  // สถานะสำหรับฟอร์มข้อมูลผู้จอง
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [citizenId, setCitizenId] = useState("");
  const [phone, setPhone] = useState("");
  const [lineId, setLineId] = useState("");
  const [isUserDataExisting, setIsUserDataExisting] = useState(false); // แฟล็กตรวจสอบว่ามีข้อมูลผู้ใช้เดิมอยู่แล้วหรือไม่

  // รายละเอียดการจองจาก URL params
  const [dateIn, setDateIn] = useState<Date | null>(null);
  const [dateOut, setDateOut] = useState<Date | null>(null);
  const [timeIn, setTimeIn] = useState<string>("");
  const [timeOut, setTimeOut] = useState<string>("");
  const [mode, setMode] = useState<"hourly" | "daily" | "monthly">("hourly");
  const [monthDuration, setMonthDuration] = useState<number>(3); // 3, 6, 12 เดือน

  const [error, setError] = useState<string | null>(null);

  const FALLBACK_IMAGE = "/image.jpg";

  const userId = searchParams.get("userId"); // User ID จาก URL

  // ดึงข้อมูลการจองจาก URL params
  useEffect(() => {
    if (!searchParams) return;

    const dateInParam = searchParams.get("dateIn");
    const dateOutParam = searchParams.get("dateOut");
    const timeInParam = searchParams.get("timeIn");
    const timeOutParam = searchParams.get("timeOut");
    const modeParam = searchParams.get("mode");
    const monthDurationParam = searchParams.get("monthDuration");

    // ตั้งค่า Date/Time
    if (dateInParam) {
      const d = new Date(dateInParam);
      if (!isNaN(d.getTime())) setDateIn(d);
    }
    if (dateOutParam) {
      const d = new Date(dateOutParam);
      if (!isNaN(d.getTime())) setDateOut(d);
    }
    if (timeInParam) setTimeIn(timeInParam);
    if (timeOutParam) setTimeOut(timeOutParam);

    // ตั้งค่าโหมดและระยะเวลา (สำหรับ Monthly)
    if (modeParam === "monthly") {
      setMode("monthly");
      if (monthDurationParam) {
        const duration = parseInt(monthDurationParam);
        if (!isNaN(duration) && duration > 0) {
          setMonthDuration(duration);
        }
      }
    } else if (modeParam === "daily") {
      setMode("daily");
    } else if (modeParam === "hourly") {
      setMode("hourly");
    }
  }, [searchParams]);

  // ดึงข้อมูลที่จอดรถและข้อมูลผู้ใช้จาก API
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !userId) return;

      try {
        setIsLoading(true);
        const res = await fetch(`/api/payment?rentId=${id}&userId=${userId}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch data");

        const data: PaymentData = await res.json();
        setPaymentData(data);
        console.log(data);

        // นำข้อมูลผู้ใช้เดิมมาใส่ในฟอร์ม (ถ้ามี)
        if (data.user) {
          setFirstName(data.user.first_name || "");
          setLastName(data.user.last_name || "");
          setCitizenId(data.user.citizen_id || "");
          setPhone(data.user.phone || "");
          setLineId(data.user.line_id || "");

          // ตรวจสอบว่าข้อมูลพื้นฐานจำเป็นครบถ้วนหรือไม่
          const hasCompleteData =
            data.user.first_name &&
            data.user.last_name &&
            data.user.citizen_id &&
            data.user.phone;
          setIsUserDataExisting(!!hasCompleteData); // ตั้งค่าเพื่อ Disabled ฟอร์ม
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, userId]);

  // คำนวณราคาและระยะเวลาสำหรับการชำระเงิน
  const calculatePayment = () => {
    if (!paymentData) {
      return {
        pricePerUnit: 0,
        duration: 0,
        total: 0,
        unit: "",
        deposit: 0,
      };
    }

    const { price } = paymentData;
    let pricePerUnit = 0;
    let duration = 0;
    let unit = "";

    // กำหนดราคาต่อหน่วยและคำนวณระยะเวลาตามโหมด
    if (mode === "monthly") {
      pricePerUnit = price.price_per_month || 0;
      duration = monthDuration; // ระยะเวลาเป็นเดือน
      unit = "เดือน";
    } else if (mode === "daily") {
      pricePerUnit = price.price_per_day || 0;
      if (dateIn && dateOut) {
        // คำนวณจำนวนวัน
        const days = Math.ceil(
          (dateOut.getTime() - dateIn.getTime()) / (1000 * 60 * 60 * 24)
        );
        duration = Math.max(1, days);
      } else {
        duration = 1;
      }
      unit = "วัน";
    } else if (mode === "hourly") {
      pricePerUnit = price.price_per_hour || 0;
      if (dateIn && dateOut && timeIn && timeOut) {
        // คำนวณจำนวนชั่วโมง
        const [inHour, inMin] = timeIn.split(":").map(Number);
        const [outHour, outMin] = timeOut.split(":").map(Number);

        const startTime = new Date(dateIn);
        startTime.setHours(inHour, inMin, 0, 0);

        const endTime = new Date(dateOut);
        endTime.setHours(outHour, outMin, 0, 0);

        const hours = Math.ceil(
          (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
        );
        duration = Math.max(1, hours);
      } else {
        duration = 1;
      }
      unit = "ชั่วโมง";
    }

    const deposit = price.deposit || 0;
    // ราคารวม = (ราคาต่อหน่วย * ระยะเวลา) + เงินประกัน
    const total = pricePerUnit * duration + deposit;

    return { pricePerUnit, duration, total, unit, deposit };
  };

  const payment = calculatePayment(); // เรียกใช้ฟังก์ชันคำนวณ

  // จัดรูปแบบวันที่ (วัน เดือน ค.ศ.)
  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // จัดรูปแบบเวลา
  const formatTime = (time: string) => {
    if (!time) return "-";
    return `${time} น.`;
  };

  // แสดงประเภทการจอง (Label)
  const getModeLabel = () => {
    switch (mode) {
      case "monthly":
        return "รายเดือน";
      case "daily":
        return "รายวัน";
      case "hourly":
        return "รายชั่วโมง";
      default:
        return "-";
    }
  };

  // สร้างรายละเอียดการจองตามโหมด (JSX)
  const renderBookingDetails = () => {
    if (mode === "hourly") {
      return (
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between ">
            <p className="text-gray-600 ">วัน-เวลาเข้าจอด</p>
            <p className="font-medium">
              {formatDate(dateIn)}, {formatTime(timeIn)}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">วัน-เวลานำรถออก</p>
            <p className="font-medium">
              {formatDate(dateOut)}, {formatTime(timeOut)}
            </p>
          </div>
          <div className="flex justify-between ">
            <p className="text-gray-600">ระยะเวลาจอด</p>
            <p className="font-medium">
              {payment.duration} {payment.unit}
            </p>
          </div>
        </div>
      );
    } else if (mode === "monthly") {
      return (
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <p className="text-gray-600">วันที่เข้าจอด</p>
            <p className="font-medium">{formatDate(dateIn)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">ระยะเวลาจอด</p>
            <p className="font-medium">
              {payment.duration} {payment.unit}
            </p>
          </div>
        </div>
      );
    } else if (mode === "daily") {
      return (
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <p className="text-gray-600">วันที่เข้าจอด</p>
            <p className="font-medium">{formatDate(dateIn)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">วันที่นำรถออก</p>
            <p className="font-medium">{formatDate(dateOut)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">ระยะเวลาจอด</p>
            <p className="font-medium">
              {payment.duration} {payment.unit}
            </p>
          </div>
        </div>
      );
    }
  };

  // จัดการการเปิด Payment Modal และสร้างการจอง
  const handleOpenPaymentModal = async () => {
    if (!userId) {
      setError("กรุณาเข้าสู่ระบบก่อนทำการชำระเงิน");
      return;
    }

    // Client-side validation: ตรวจสอบความครบถ้วนของข้อมูล
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !citizenId.trim() ||
      !phone.trim()
    ) {
      setError("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    // Client-side validation: ตรวจสอบเลขบัตรประชาชน
    if (citizenId.length !== 13 || !/^\d+$/.test(citizenId)) {
      setError("กรุณากรอกเลขบัตรประชาชน 13 หลักให้ถูกต้อง");
      return;
    }

    // Client-side validation: ตรวจสอบเบอร์โทรศัพท์
    if (phone.length !== 10 || !/^0\d{9}$/.test(phone)) {
      setError("กรุณากรอกเบอร์โทรศัพท์ 10 หลักให้ถูกต้อง");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const res = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          rentId: id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          citizenId: citizenId.trim(),
          phone: phone.trim(),
          lineId: lineId.trim() || null,

          // ส่งรายละเอียดการจอง/ราคาที่คำนวณแล้วไป Server
          totalPrice: payment.total,
          duration: payment.duration,
          mode: mode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "เกิดข้อผิดพลาดในการสร้างการจอง");
      }

      // เก็บ rent_history_id เพื่อใช้ในการอัพโหลด slip
      setRentHistoryId(data.rentHistoryId);

      // เปิด Payment Modal
      setIsPaymentModalOpen(true);
    } catch (error) {
      console.error("Error creating booking:", error);
      setError(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการสร้างการจอง"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // จัดการการอัพโหลด slip และบันทึกข้อมูลการชำระเงิน
  const handleSlipUpload = async (file: File) => {
    if (!userId || !rentHistoryId) {
      throw new Error("ข้อมูลไม่ครบถ้วน");
    }

    try {
      // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
      const timestamp = Date.now();
      const fileExt = file.name.split(".").pop();
      const fileName = `${timestamp}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // อัพโหลดไฟล์ไปยัง Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("slip_bk")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`ไม่สามารถอัพโหลดไฟล์ได้: ${uploadError.message}`);
      }

      // ดึง public URL ของไฟล์ที่อัพโหลด
      const { data: urlData } = supabase.storage
        .from("slip_bk")
        .getPublicUrl(filePath);

      const slipImageUrl = urlData.publicUrl;

      // บันทึกข้อมูลการชำระเงินลงตาราง rent_payments
      const { error: insertError } = await supabase
        .from("rent_payments")
        .insert({
          rent_history_id: rentHistoryId,
          user_id: userId,
          slip_image_url: slipImageUrl,
          amount: payment.total,
          payment_date: new Date().toISOString(),
        });

      if (insertError) {
        throw new Error(
          `ไม่สามารถบันทึกข้อมูลการชำระเงินได้: ${insertError.message}`
        );
      }

      // แสดง Modal สำเร็จและเปลี่ยนเส้นทาง
      setIsPaymentModalOpen(false);
      setIsOpen(true);

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error uploading slip:", error);
      throw error;
    }
  };

  if (isLoading) return <Loading />;

  if (!paymentData) {
    return (
      <div className="container mx-auto min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">ไม่พบข้อมูลที่จอดรถ</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen py-4 px-4 sm:px-6 md:py-10">
      {/* Breadcrumb - (ถูกซ่อนในโค้ดต้นฉบับ) */}

      <div className="flex flex-col lg:flex-row justify-between gap-6 lg:gap-10">
        {/* ซ้าย - สรุปการจอง (Order Summary) */}
        <div className="w-full lg:w-1/3">
          {/* ข้อมูลที่จอด */}
          <div className="border border-gray-300 rounded-2xl p-3 sm:p-4 shadow hover:shadow-lg">
            <div className="flex gap-3 sm:gap-4">
              <Image
                src={paymentData.image || FALLBACK_IMAGE}
                width={100}
                height={100}
                alt={paymentData.rentDetail.name}
                className="rounded-2xl w-20 h-20 sm:w-[100px] sm:h-[100px] object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base sm:text-lg truncate">
                  {paymentData.rentDetail.name}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                  {paymentData.rentDetail.subdistrict}
                  {paymentData.rentDetail.subdistrict && ", "}
                  {paymentData.rentDetail.district}
                  {paymentData.rentDetail.district && ", "}
                  {paymentData.rentDetail.province}
                </p>
                {/* แสดงประเภทการจองปัจจุบัน */}
                <span className="inline-block py-1 px-2 sm:px-3 bg-blue-400 text-white rounded-lg text-xs mt-2">
                  {getModeLabel()}
                </span>
              </div>
            </div>

            {/* รายละเอียดการจอง (วัน/เวลา/ระยะเวลา) */}
            {renderBookingDetails()}

            {/* เกี่ยวกับราคา */}
            <div className="mt-3 sm:mt-4 border-t pt-3 sm:pt-4">
              <p className="text-sm sm:text-base font-semibold mb-2">
                เกี่ยวกับราคา
              </p>
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <p className="text-gray-600">ประกันสัญญา</p>
                  <p className="font-medium">
                    ฿ {payment.deposit.toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">ราคาค่าจอด</p>
                  <p className="font-medium">
                    ฿ {payment.pricePerUnit.toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">ระยะเวลาจอด</p>
                  <p className="font-medium">× {payment.duration}</p>
                </div>
              </div>
            </div>

            <hr className="border-t border-gray-300 my-3 sm:my-4" />

            {/* ราคารวมสุดท้าย */}
            <div className="flex justify-between items-center">
              <p className="font-semibold text-base sm:text-lg">ราคารวม</p>
              <p className="font-bold text-lg sm:text-xl text-blue-600">
                ฿ {payment.total.toLocaleString()}
              </p>
            </div>
            {/* หมายเหตุ */}
            <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-3 sm:mt-4 leading-relaxed">
              *ชำระเงินประกันก็ต่อเมื่อได้รับการยืนยันการเข้าจอดจากเจ้าของพื้นที่แล้ว
              เมื่อสิ้นสุดสัญญาผู้เช่าจะได้รับเงินประกันคืน
            </p>
          </div>
        </div>

        {/* ขวา - ข้อมูลผู้จอง (Booking User Information) */}
        <div className="w-full lg:w-2/3">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 sm:mb-6">
            ข้อมูลผู้จอง
          </h2>

          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <LabelAndInputForm
                title="ชื่อ *"
                id="first_name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isUserDataExisting}
                placeholder="กรอกชื่อ"
              />
              <LabelAndInputForm
                title="นามสกุล *"
                id="last_name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isUserDataExisting}
                placeholder="กรอกนามสกุล"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <LabelAndInputForm
                title="รหัสประจำตัวประชาชน *"
                id="citizen_id"
                value={citizenId}
                onChange={(e) => {
                  // กรองให้เหลือเฉพาะตัวเลข และจำกัดความยาว 13 หลัก
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 13) {
                    setCitizenId(value);
                  }
                }}
                disabled={isUserDataExisting}
                placeholder="1234567890123"
                type="text"
              />
              <LabelAndInputForm
                title="เบอร์ติดต่อ *"
                id="phone"
                value={phone}
                onChange={(e) => {
                  // กรองให้เหลือเฉพาะตัวเลข และจำกัดความยาว 10 หลัก
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    setPhone(value);
                  }
                }}
                disabled={isUserDataExisting}
                placeholder="0812345678"
                type="text"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <LabelAndInputForm
                title="Line ID"
                id="line_id"
                value={lineId}
                onChange={(e) => setLineId(e.target.value)}
                disabled={isUserDataExisting}
                placeholder="กรอก Line ID (ถ้ามี)"
              />
              <div></div>
            </div>
          </div>

          {/* แสดงข้อผิดพลาดของฟอร์ม */}
          {error && (
            <div className="text-red-600 my-2 text-xs sm:text-sm">{error}</div>
          )}
          {/* แจ้งเตือนเมื่อข้อมูลผู้ใช้มีอยู่แล้ว */}
          {isUserDataExisting && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-700">
                ℹ️ ข้อมูลของคุณถูกบันทึกไว้แล้ว สามารถแก้ไขได้ในหน้าโปรไฟล์
              </p>
            </div>
          )}

          {/* ปุ่มชำระเงิน */}
          <div className="flex justify-end mt-6 sm:mt-8">
            <Button
              className="cursor-pointer w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg"
              onClick={handleOpenPaymentModal}
              disabled={isProcessing}
            >
              {isProcessing ? "กำลังดำเนินการ..." : "ชำระเงิน"}
            </Button>
          </div>

          {/* Payment Modal (สำหรับชำระเงินและอัพโหลด slip) */}
          <PaymentModal
            open={isPaymentModalOpen}
            onClose={() => !isProcessing && setIsPaymentModalOpen(false)}
            onConfirm={handleSlipUpload}
            amount={payment.total}
          />

          {/* Alert Modal (ชำระเงินสำเร็จ) */}
          <AlertModal
            open={isOpen}
            onClose={() => setIsOpen(false)}
            type="success"
            title="ชำระเรียบร้อย"
            description="ขอบคุณที่ใช้บริการ ข้อมูลของคุณถูกส่งไปยังเจ้าของพื้นที่แล้ว"
          />
        </div>
      </div>
    </div>
  );
}
