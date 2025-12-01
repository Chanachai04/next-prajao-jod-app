"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Pen, Trash } from "lucide-react";
import Link from "next/link";
import { ParkingItem } from "@/types/parking";
import ConfirmModal from "@/components/ui/confirm";
import AlertModal from "@/components/ui/modal";

export default function Parking() {
  //State
  const pathname = usePathname();
  const [data, setData] = useState<ParkingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalType, setAlertModalType] = useState<"success" | "error">(
    "success"
  );
  const [alertModalTitle, setAlertModalTitle] = useState("");
  const [alertModalDescription, setAlertModalDescription] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "single" | "bulk";
    id?: string;
  } | null>(null);

  //ฟังก์ชันดึงข้อมูลจากapi
  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/parking");

        if (!response.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลได้");
        }

        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || "เกิดข้อผิดพลาด");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchParkingData();
  }, []);

  //เปิดmodalยืนยันสำหรับลบข้อมูลแถวเดียว
  const openDeleteConfirm = (rentId: string) => {
    setDeleteTarget({ type: "single", id: rentId });
    setConfirmModalOpen(true);
  };

  //ฟังก์ชันลบข้อมูล
  const handleDelete = async (rentId: string) => {
    try {
      setDeletingId(rentId);
      const response = await fetch(`/api/parking?rent_id=${rentId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "ไม่สามารถลบข้อมูลได้");
      }

      //ลบข้อมูลออกจาก State
      setData((prevData) => prevData.filter((item) => item.id !== rentId));
      setAlertModalType("success");
      setAlertModalTitle("ลบข้อมูลสำเร็จ");
      setAlertModalDescription("ข้อมูลถูกลบเรียบร้อยแล้ว");
      setAlertModalOpen(true);
    } catch (err) {
      setAlertModalType("error");
      setAlertModalTitle("เกิดข้อผิดพลาด");
      setAlertModalDescription(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบข้อมูล"
      );
      setAlertModalOpen(true);
    } finally {
      setDeletingId(null);
    }
  };

  // ฟังก์ชันเลือก/ยกเลิกเลือกรายการ (checkboxของแต่ละแถว)
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ฟังก์ชันเลือก/ยกเลิกเลือกทั้งหมด (checkboxเลือกหลายรายการ)
  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map((item) => item.id));
    }
  };

  //เปิดmodalยืนยันสำหรับลบข้อมูลหลายแถว
  const openBulkDeleteConfirm = () => {
    if (selectedIds.length === 0) return;
    setDeleteTarget({ type: "bulk" });
    setConfirmModalOpen(true);
  };

  //ฟังก์ชันลบหลายรายการ
  const handleBulkDelete = async () => {
    setIsDeleting(true);
    const errors: string[] = [];

    try {
      // ลบทีละรายการ
      for (const rentId of selectedIds) {
        try {
          const response = await fetch(`/api/parking?rent_id=${rentId}`, {
            method: "DELETE",
          });

          const result = await response.json();

          if (!response.ok) {
            errors.push(`${rentId}: ${result.error || "ไม่สามารถลบได้"}`);
          }
        } catch (err) {
          errors.push(
            `${rentId}: ${
              err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
            }`
          );
        }
      }

      setData((prevData) =>
        prevData.filter(
          (item) =>
            !selectedIds.includes(item.id) ||
            errors.some((e) => e.startsWith(item.id))
        )
      );

      // แสดงผลลัพธ์
      if (errors.length === 0) {
        setAlertModalType("success");
        setAlertModalTitle("ลบข้อมูลสำเร็จ");
        setAlertModalDescription(`ลบข้อมูลสำเร็จ ${selectedIds.length} รายการ`);
        setAlertModalOpen(true);
      } else {
        setAlertModalType("error");
        setAlertModalTitle("ลบข้อมูลบางส่วนไม่สำเร็จ");
        setAlertModalDescription(
          `ลบสำเร็จ ${selectedIds.length - errors.length} รายการ\nไม่สำเร็จ ${
            errors.length
          } รายการ`
        );
        setAlertModalOpen(true);
      }

      setSelectedIds([]);
    } catch (err) {
      setAlertModalType("error");
      setAlertModalTitle("เกิดข้อผิดพลาด");
      setAlertModalDescription("เกิดข้อผิดพลาดในการลบข้อมูล");
      setAlertModalOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  // ยืนยันการลบ
  const confirmDelete = async () => {
    setConfirmModalOpen(false);

    if (deleteTarget?.type === "single" && deleteTarget.id) {
      await handleDelete(deleteTarget.id);
    } else if (deleteTarget?.type === "bulk") {
      await handleBulkDelete();
    }

    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-10 lg:px-20 py-4 sm:py-5 bg-gray-50">
      <hr className="border-3 border-gray-600" />
      <div className="flex flex-col lg:flex-row bg-white shadow-sm overflow-hidden min-h-[80vh]">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 max-w-[360px] p-4 sm:p-6 flex flex-col items-start min-h-[85vh]">
          <h1 className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6 text-gray-600 whitespace-nowrap">
            ที่จอดรถของฉัน
          </h1>
          <Sidebar currentPathname={pathname} />
        </div>

        <div className="flex-1 w-full overflow-y-auto max-h-[80vh]">
          <div className="hidden md:block px-4 lg:px-8">
            {/* เลือกลบหลายรายการ */}
            {selectedIds.length > 0 && (
              <div className="sticky top-0 bg-blue-50 border-b border-blue-200 px-4 py-3 flex items-center justify-between z-20">
                <span className="text-sm font-medium text-blue-700">
                  เลือกแล้ว {selectedIds.length} รายการ
                </span>
                <button
                  onClick={openBulkDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isDeleting ? "กำลังลบ..." : "ลบที่เลือก"}
                </button>
              </div>
            )}
            {/* tableแสดงข้อมูลจากsupabase */}
            <table className="overflow-x-auto w-full border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-gray-700 text-lg sm:text-xl font-semibold border-b">
                  <th className="py-4 sm:py-6 px-4 sm:px-6 text-center min-w-[80px]">
                    <input
                      type="checkbox"
                      checked={
                        data.length > 0 && selectedIds.length === data.length
                      }
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
                    ประเภทที่จอด
                  </th>
                  <th className="py-4 sm:py-6 px-4 sm:px-6 text-center min-w-[180px]">
                    จำนวนที่จอด
                  </th>
                  <th className="py-4 sm:py-6 px-4 sm:px-6 text-center min-w-[180px]">
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
                      {error}
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center text-gray-400 py-20 text-sm sm:text-base lg:text-lg"
                    >
                      ไม่มีข้อมูล
                    </td>
                    {/* mapข้อมูลtableจากsupabase */}
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 text-sm sm:text-base lg:text-lg"
                    >
                      <td className="py-4 sm:py-6 px-4 sm:px-6 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 sm:py-6 px-4 sm:px-6 text-center">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg mx-auto"
                            unoptimized
                          />
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                            <span className="text-gray-400 text-xs">
                              ไม่มีรูป
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 sm:py-6 px-4 sm:px-6 text-center">
                        {item.name}
                      </td>
                      <td className="py-4 sm:py-6 px-4 sm:px-6 text-center">
                        {item.type}
                      </td>
                      <td className="py-4 sm:py-6 px-4 sm:px-6 text-center">
                        {item.total_slot}
                      </td>
                      <td className="py-4 sm:py-6 px-4 sm:px-6 text-center">
                        <div className="flex justify-center gap-4">
                          <Link
                            href={`/editrentdetail?rent_id=${item.id}`}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Pen size={20} />
                          </Link>
                          <button
                            onClick={() => openDeleteConfirm(item.id)}
                            disabled={deletingId === item.id}
                            className={`text-red-500 hover:text-red-700 ${
                              deletingId === item.id
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            <Trash size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden px-4 space-y-4 py-4">
            {selectedIds.length > 0 && (
              <div className="sticky top-0 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between z-20">
                <span className="text-sm font-medium text-blue-700">
                  เลือกแล้ว {selectedIds.length} รายการ
                </span>
                {/* ปุ่มลบหลายรายการ */}
                <button
                  onClick={openBulkDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isDeleting ? "กำลังลบ..." : "ลบ"}
                </button>
              </div>
            )}
            {loading ? (
              <div className="text-center text-gray-400 py-20 text-sm sm:text-base ">
                กำลังโหลดข้อมูล...
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-20 text-sm sm:text-base">
                {error}
              </div>
            ) : data.length === 0 ? (
              <div className="text-center text-gray-400 py-20 text-sm sm:text-base">
                ไม่มีข้อมูล
              </div>
            ) : (
              data.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4 h-4 cursor-pointer shrink-0"
                      />
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-lg shrink-0"
                          unoptimized
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
                        <h3 className="text-sm font-semibold text-gray-800 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-xs text-gray-500">
                          จำนวนที่จอด:
                        </span>
                        <span className="text-sm font-medium text-gray-700 ml-1">
                          {item.total_slot}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <Link
                          href={`/editrentdetail?rent_id=${item.id}`}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Pen size={18} />
                        </Link>
                        {/* ปุ่มลบรายการเดียว */}
                        <button
                          onClick={() => openDeleteConfirm(item.id)}
                          disabled={deletingId === item.id}
                          className={`text-red-500 hover:text-red-700 ${
                            deletingId === item.id
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Modal ยืนยันการลบหลายรายการ/รายการเดียว */}
      <ConfirmModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title={
          deleteTarget?.type === "bulk"
            ? "ยืนยันการลบหลายรายการ"
            : "ยืนยันการลบ"
        }
        description={
          deleteTarget?.type === "bulk"
            ? `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล ${selectedIds.length} รายการ?`
            : "คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?"
        }
      />

      {/* Modal แจ้งเตือนการลบสำเร็จ */}
      <AlertModal
        open={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        type={alertModalType}
        title={alertModalTitle}
        description={alertModalDescription}
      />
    </div>
  );
}
