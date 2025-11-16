"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import LabelAndInputForm from "@/components/form/LabelAndInputForm";
import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/ui/confirm";
import AlertModal from "@/components/ui/modal";
import Loading from "../loading";

type PaymentData = {
  rentDetail: {
    id: string;
    name: string;
    district: string;
    subdistrict: string;
    province: string;
  };
  price: {
    price_per_hour: number | null;
    price_per_day: number | null;
    price_per_month: number | null;
    deposit: number | null;
  };
  image: string | null;
  user: {
    first_name: string;
    last_name: string;
    citizen_id: string;
    phone: string;
    line_id: string | null;
  } | null;
};

export default function Page() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [citizenId, setCitizenId] = useState("");
  const [phone, setPhone] = useState("");
  const [lineId, setLineId] = useState("");
  const [isUserDataExisting, setIsUserDataExisting] = useState(false);

  // Booking details from URL params
  const [dateIn, setDateIn] = useState<Date | null>(null);
  const [dateOut, setDateOut] = useState<Date | null>(null);
  const [timeIn, setTimeIn] = useState<string>("");
  const [timeOut, setTimeOut] = useState<string>("");
  const [mode, setMode] = useState<"hourly" | "daily" | "monthly">("hourly");
  const [monthDuration, setMonthDuration] = useState<number>(3); // 3, 6, 12 เดือน

  const FALLBACK_IMAGE = "/image.jpg";

  const userId = searchParams.get("userId");

  // ดึงข้อมูลจาก URL params
  useEffect(() => {
    if (!searchParams) return;

    const dateInParam = searchParams.get("dateIn");
    const dateOutParam = searchParams.get("dateOut");
    const timeInParam = searchParams.get("timeIn");
    const timeOutParam = searchParams.get("timeOut");
    const modeParam = searchParams.get("mode");
    const monthDurationParam = searchParams.get("monthDuration");

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

    if (modeParam === "monthly") {
      setMode("monthly");
      // อ่านจำนวนเดือนจาก URL
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

  // ดึงข้อมูลจาก API
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
        if (data.user) {
          setFirstName(data.user.first_name || "");
          setLastName(data.user.last_name || "");
          setCitizenId(data.user.citizen_id || "");
          setPhone(data.user.phone || "");
          setLineId(data.user.line_id || "");

          const hasCompleteData =
            data.user.first_name &&
            data.user.last_name &&
            data.user.citizen_id &&
            data.user.phone;
          setIsUserDataExisting(!!hasCompleteData);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        alert("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, userId]);

  // คำนวณราคาและระยะเวลา
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

    if (mode === "monthly") {
      pricePerUnit = price.price_per_month || 0;
      duration = monthDuration;
      unit = "เดือน";
    } else if (mode === "daily") {
      pricePerUnit = price.price_per_day || 0;
      if (dateIn && dateOut) {
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
        // รวมวันที่กับเวลา
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
    const total = pricePerUnit * duration + deposit;

    return { pricePerUnit, duration, total, unit, deposit };
  };

  const payment = calculatePayment();

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

  // แสดงประเภทการจอง
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

  // สร้างรายละเอียดการจอง
  const renderBookingDetails = () => {
    if (mode === "hourly") {
      return (
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <p className="text-gray-600">วัน-เวลาเข้าจอด</p>
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
          <div className="flex justify-between">
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
          <div>
            <p className="text-gray-600">วันที่เข้าจอด</p>
            <p className="font-medium">{formatDate(dateIn)}</p>
          </div>
          <div>
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
          <div>
            <p className="text-gray-600">วันที่เข้าจอด</p>
            <p className="font-medium">{formatDate(dateIn)}</p>
          </div>
          <div>
            <p className="text-gray-600">วันที่นำรถออก</p>
            <p className="font-medium">{formatDate(dateOut)}</p>
          </div>
          <div>
            <p className="text-gray-600">ระยะเวลาจอด</p>
            <p className="font-medium">
              {payment.duration} {payment.unit}
            </p>
          </div>
        </div>
      );
    }
  };

  // จัดการการชำระเงิน
  const handlePayment = async () => {
    if (!userId) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการชำระเงิน");
      return;
    }

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !citizenId.trim() ||
      !phone.trim()
    ) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      setIsConfirm(false);
      return;
    }

    if (citizenId.length !== 13 || !/^\d+$/.test(citizenId)) {
      alert("กรุณากรอกเลขบัตรประชาชน 13 หลักให้ถูกต้อง");
      setIsConfirm(false);
      return;
    }

    if (phone.length !== 10 || !/^0\d{9}$/.test(phone)) {
      alert("กรุณากรอกเบอร์โทรศัพท์ 10 หลักให้ถูกต้อง");
      setIsConfirm(false);
      return;
    }

    try {
      setIsProcessing(true);

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

          // [เพิ่มส่วนนี้]
          totalPrice: payment.total,
          duration: payment.duration,
          mode: mode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "เกิดข้อผิดพลาดในการชำระเงิน");
      }

      setIsConfirm(false);
      setIsOpen(true);

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error processing payment:", error);
      setIsConfirm(false);
      alert(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการชำระเงิน"
      );
    } finally {
      setIsProcessing(false);
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
    <div className="container mx-auto min-h-screen py-4 md:py-10">
      {/* Breadcrumb */}

      <div className="flex flex-col lg:flex-row justify-between gap-6 lg:gap-10">
        {/* ซ้าย - สรุปการจอง */}
        <div className="w-full lg:w-1/3">
          {/* ข้อมูลที่จอด */}
          <div className="border border-gray-300 rounded-2xl p-4 shadow hover:shadow-lg">
            <div className="flex">
              <Image
                src={paymentData.image || FALLBACK_IMAGE}
                width={100}
                height={100}
                alt={paymentData.rentDetail.name}
                className="rounded-2xl w-[100px] h-[100px] object-cover shrink-0"
              />
              <div className="ml-4 flex-1 min-w-0">
                <p className="font-semibold text-lg truncate">
                  {paymentData.rentDetail.name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {paymentData.rentDetail.subdistrict}
                  {paymentData.rentDetail.subdistrict && ", "}
                  {paymentData.rentDetail.district}
                  {paymentData.rentDetail.district && ", "}
                  {paymentData.rentDetail.province}
                </p>
                <span className="inline-block py-1 px-3 bg-blue-400 text-white rounded-lg text-xs mt-2">
                  {getModeLabel()}
                </span>
              </div>
            </div>

            {/* รายละเอียดการจอง */}
            {renderBookingDetails()}

            {/* เกี่ยวกับราคา */}
            <div className="mt-4 border-t pt-4">
              <p className="text-base font-semibold mb-2">เกี่ยวกับราคา</p>
              <div className="space-y-1 text-sm">
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

            <hr className="border-t border-gray-300 my-4" />

            <div className="flex justify-between items-center">
              <p className="font-semibold text-lg">ราคารวม</p>
              <p className="font-bold text-xl text-blue-600">
                ฿ {payment.total.toLocaleString()}
              </p>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4 leading-relaxed">
              *ชำระเงินประกันก็ต่อเมื่อได้รับการยืนยันการเข้าจอดจากเจ้าของพื้นที่แล้ว
              เมื่อสิ้นสุดสัญญาผู้เช่าจะได้รับเงินประกันคืน
            </p>
          </div>
        </div>

        {/* ขวา - ข้อมูลผู้จอง */}
        <div className="w-full lg:w-2/3">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            ข้อมูลผู้จอง
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabelAndInputForm
                title="รหัสประจำตัวประชาชน *"
                id="citizen_id"
                value={citizenId}
                onChange={(e) => {
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {isUserDataExisting && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                ℹ️ ข้อมูลของคุณถูกบันทึกไว้แล้ว ไม่สามารถแก้ไขได้
              </p>
            </div>
          )}

          <div className="flex justify-end mt-8">
            <Button
              className="cursor-pointer px-12 py-6 text-lg"
              onClick={() => {
                if (
                  !firstName.trim() ||
                  !lastName.trim() ||
                  !citizenId.trim() ||
                  !phone.trim()
                ) {
                  alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
                  return;
                }
                if (citizenId.length !== 13) {
                  alert("กรุณากรอกเลขบัตรประชาชน 13 หลัก");
                  return;
                }
                if (phone.length !== 10) {
                  alert("กรุณากรอกเบอร์โทรศัพท์ 10 หลัก");
                  return;
                }
                setIsConfirm(true);
              }}
              disabled={isProcessing}
            >
              {isProcessing ? "กำลังดำเนินการ..." : "ชำระเงิน"}
            </Button>
          </div>

          <ConfirmModal
            open={isConfirm}
            onClose={() => !isProcessing && setIsConfirm(false)}
            onConfirm={handlePayment}
          />
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
