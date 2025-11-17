"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { HistoryItem } from "@/types/history";
import { Trash } from "lucide-react";

export default function History() {
  const pathname = usePathname();
  const [data, setData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    // ฟังก์ชันดึงข้อมูลจาก API
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/history");

        if (!response.ok) {
          if (response.status === 401) {
            setError("กรุณาเข้าสู่ระบบ");
            return;
          }
          throw new Error("Failed to fetch history data");
        }

        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล"
        );
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // ฟังก์ชันลบข้อมูลประวัติ
  const handleDelete = async (historyId: HistoryItem["id"]) => {
    const idParam = String(historyId);

    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการจองนี้?")) {
      return;
    }

    try {
      setDeletingId(idParam);
      const response = await fetch(`/api/history?id=${idParam}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "ไม่สามารถลบประวัติได้");
      }

      setData((prev) => prev.filter((item) => String(item.id) !== idParam));
    } catch (err) {
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setDeletingId(null);
    }
  };

  // ฟังก์ชันแปลง parkingType เป็นภาษาไทย
  const getParkingTypeText = (type: string | null, time: number | null) => {
    if (!type || time === null) return "-";

    const typeMap: { [key: string]: string } = {
      hour: "ชั่วโมง",
      day: "วัน",
      month: "เดือน",
    };

    return `${time} ${typeMap[type] || type}`;
  };

  // ฟังก์ชันจัดรูปแบบราคา
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price);
  };

  return (
    <div className="min-h-screen px-4 md:px-10 lg:px-20 py-5 bg-gray-50">
      <hr className="border-3 border-gray-600" />

      {/* พื้นหลังขาว ไม่มีขอบโค้ง */}
      <div className="flex flex-col lg:flex-row bg-white shadow-sm overflow-hidden min-h-[80vh]">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 p-6 flex flex-col items-start min-h-[85vh]">
          <h1 className="text-4xl md:text-5xl mb-6 text-gray-600">
            ประวัติการจอง
          </h1>
          <Sidebar currentPathname={pathname} />
        </div>

        {/* Content - Table Section */}
        <div className="pt-10 pr-50 overflow-y-auto max-h-[80vh] w-full lg:w-2/3 ">
          <div className="overflow-x-auto flex justify-center">
            {""}
            {/* จัดตารางให้กลาง */}
            <table className="w-full max-w-[1200px] mx-auto border-collapse">
              {""}
              {/* ใช้ max-w เพื่อกำหนดความกว้างของตาราง */}
              <thead>
                <tr className="text-gray-700 text-xl font-semibold border-b ">
                  <th className="py-6 px-6 text-center min-w-[200px]">
                    รูปภาพ
                  </th>
                  <th className="py-6 px-6 text-center min-w-[300px]">
                    ชื่อสถานที่จอด
                  </th>
                  <th className="py-6 px-6 text-center min-w-[220px]">
                    จำนวนวันที่จอด
                  </th>
                  <th className="py-6 px-6 text-center min-w-[180px]">ราคา</th>
                  <th className="py-6 px-6 text-center min-w-[150px]">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-gray-400 py-20 text-lg"
                    >
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-red-500 py-20 text-lg"
                    >
                      เกิดข้อผิดพลาด: {error}
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-gray-400 py-20 text-lg"
                    >
                      ไม่มีประวัติการจอง
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-gray-50 text-lg"
                    >
                      <td className="py-6 px-6 text-center">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="w-24 h-24 object-cover rounded-lg mx-auto"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                            <span className="text-gray-400 text-sm">
                              ไม่มีรูป
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-6 px-6 text-center">{item.name}</td>
                      <td className="py-6 px-6 text-center">
                        {getParkingTypeText(item.parkingType, item.parkingTime)}
                      </td>
                      <td className="py-6 px-6 text-center">
                        {formatPrice(item.totalPrice)}
                      </td>
                      <td className="py-6 px-6 text-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === String(item.id)}
                          className={`text-red-500 hover:text-red-700 ${
                            deletingId === String(item.id)
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                        >
                          <Trash size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
