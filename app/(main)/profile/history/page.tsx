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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // ฟังก์ชันเลือก/ยกเลิกเลือกรายการ
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ฟังก์ชันเลือก/ยกเลิกเลือกทั้งหมด
  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map((item) => String(item.id)));
    }
  };

  // ฟังก์ชันลบหลายรายการ
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    if (
      !confirm(
        `คุณแน่ใจหรือไม่ว่าต้องการลบประวัติ ${selectedIds.length} รายการ?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    const errors: string[] = [];

    try {
      // ลบทีละรายการ
      for (const historyId of selectedIds) {
        try {
          const response = await fetch(`/api/history?id=${historyId}`, {
            method: "DELETE",
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            errors.push(`${historyId}: ${result.error || "ไม่สามารถลบได้"}`);
          }
        } catch (err) {
          errors.push(
            `${historyId}: ${err instanceof Error ? err.message : "เกิดข้อผิดพลาด"}`
          );
        }
      }

      // อัปเดต state โดยลบรายการที่ลบสำเร็จ
      setData((prevData) =>
        prevData.filter((item) => !selectedIds.includes(String(item.id)) || errors.some(e => e.startsWith(String(item.id))))
      );

      // แสดงผลลัพธ์
      if (errors.length === 0) {
        alert(`ลบประวัติสำเร็จ ${selectedIds.length} รายการ`);
      } else {
        alert(
          `ลบสำเร็จ ${selectedIds.length - errors.length} รายการ\nไม่สำเร็จ ${errors.length} รายการ:\n${errors.join("\n")}`
        );
      }

      setSelectedIds([]);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setIsDeleting(false);
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
    <div className="min-h-screen px-4 sm:px-6 md:px-10 lg:px-20 py-4 sm:py-5 bg-gray-50">
      <hr className="border-3 border-gray-600" />

      {/* พื้นหลังขาว ไม่มีขอบโค้ง */}
      <div className="flex flex-col lg:flex-row bg-white shadow-sm overflow-hidden min-h-[80vh]">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 max-w-[360px] p-4 sm:p-6 flex flex-col items-start min-h-[85vh]">
          <h1 className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6 text-gray-600">
            ประวัติการจอง
          </h1>
          <Sidebar currentPathname={pathname} />
        </div>

        {/* Content - Table Section */}
        <div className="flex-1 w-full overflow-y-auto max-h-[80vh]">
          {/* Desktop Table View */}
          <div className="hidden md:block px-4 lg:px-8">
            {/* ปุ่มลบที่เลือก */}
            {selectedIds.length > 0 && (
              <div className="sticky top-0 bg-blue-50 border-b border-blue-200 px-4 py-3 flex items-center justify-between z-20">
                <span className="text-sm font-medium text-blue-700">
                  เลือกแล้ว {selectedIds.length} รายการ
                </span>
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isDeleting ? "กำลังลบ..." : "ลบที่เลือก"}
                </button>
              </div>
            )}
            
            <table className="overflow-x-auto w-full border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-gray-700 text-lg sm:text-xl font-semibold border-b">
                  <th className="py-4 sm:py-6 px-4 sm:px-6 text-center min-w-[80px]">
                    <input
                      type="checkbox"
                      checked={data.length > 0 && selectedIds.length === data.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 sm:py-6 px-4 sm:px-6 text-center min-w-[200px]">
                    รูปภาพ
                  </th>
                  <th className="py-4 sm:py-6 px-4 sm:px-6 text-center min-w-[300px]">
                    ชื่อสถานที่จอด
                  </th>
                  <th className="py-4 sm:py-6 px-4 sm:px-6 text-center min-w-[220px]">
                    จำนวนวันที่จอด
                  </th>
                  <th className="py-4 sm:py-6 px-4 sm:px-6 text-center min-w-[180px]">
                    ราคา
                  </th>
                  <th className="py-4 sm:py-6 px-4 sm:px-6 text-center min-w-[150px]">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center text-gray-400 py-20 text-sm sm:text-base lg:text-lg"
                    >
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center text-red-500 py-20 text-sm sm:text-base lg:text-lg"
                    >
                      เกิดข้อผิดพลาด: {error}
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center text-gray-400 py-20 text-sm sm:text-base lg:text-lg"
                    >
                      ไม่มีประวัติการจอง
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-gray-50 text-sm sm:text-base lg:text-lg"
                    >
                      <td className="py-4 sm:py-6 px-4 sm:px-6 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(String(item.id))}
                          onChange={() => toggleSelect(String(item.id))}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 sm:py-6 px-4 sm:px-6 text-center">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg mx-auto"
                          />
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                            <Image
                              src={"/placeholder.png"}
                              alt={"ไม่มีรูปภาพ"}
                              width={80}
                              height={80}
                              className="w-20 h-20 object-cover rounded-lg shrink-0"
                              unoptimized
                            />
                          </div>
                        )}
                      </td>
                      <td className="py-4 sm:py-6 px-4 sm:px-6 text-center">
                        {item.name}
                      </td>
                      <td className="py-4 sm:py-6 px-4 sm:px-6 text-center">
                        {getParkingTypeText(item.parkingType, item.parkingTime)}
                      </td>
                      <td className="py-4 sm:py-6 px-4 sm:px-6 text-center">
                        {formatPrice(item.totalPrice)}
                      </td>
                      <td className="py-4 sm:py-6 px-4 sm:px-6 text-center">
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

          {/* Mobile Card View */}
          <div className="md:hidden px-4 space-y-4 py-4">
            {/* ปุ่มลบที่เลือก - Mobile */}
            {selectedIds.length > 0 && (
              <div className="sticky top-0 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between z-20">
                <span className="text-sm font-medium text-blue-700">
                  เลือกแล้ว {selectedIds.length} รายการ
                </span>
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isDeleting ? "กำลังลบ..." : "ลบ"}
                </button>
              </div>
            )}
            
            {loading ? (
              <div className="text-center text-gray-400 py-20 text-sm sm:text-base lg:text-lg">
                กำลังโหลดข้อมูล...
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-20 text-sm sm:text-base lg:text-lg">
                เกิดข้อผิดพลาด: {error}
              </div>
            ) : data.length === 0 ? (
              <div className="text-center text-gray-400 py-20 text-sm sm:text-base lg:text-lg">
                ไม่มีประวัติการจอง
              </div>
            ) : (
              data.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(String(item.id))}
                        onChange={() => toggleSelect(String(item.id))}
                        className="w-4 h-4 cursor-pointer shrink-0"
                      />
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-lg shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                          <Image
                            src={"/placeholder.png"}
                            alt={"ไม่มีรูปภาพ"}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-lg shrink-0"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-800 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {getParkingTypeText(
                            item.parkingType,
                            item.parkingTime
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-xs text-gray-500">ราคา:</span>
                        <span className="text-sm font-medium text-gray-700 ml-1">
                          {formatPrice(item.totalPrice)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === String(item.id)}
                        className={`text-red-500 hover:text-red-700 ${
                          deletingId === String(item.id)
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
