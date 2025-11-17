"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Pen, Trash } from "lucide-react"; // เพิ่มการนำเข้าไอคอน
import Link from "next/link";
import { ParkingItem } from "@/types/parking";

export default function Parking() {
  const pathname = usePathname();
  const [data, setData] = useState<ParkingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ดึงข้อมูลจาก API
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

  // ฟังก์ชันลบข้อมูล (ไม่ลบไฟล์ภาพจาก storage)
  const handleDelete = async (rentId: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?")) {
      return;
    }

    try {
      setDeletingId(rentId);
      const response = await fetch(`/api/parking?rent_id=${rentId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "ไม่สามารถลบข้อมูลได้");
      }

      // ลบข้อมูลออกจาก state
      setData((prevData) => prevData.filter((item) => item.id !== rentId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-10 lg:px-20 py-5 bg-gray-50">
      <hr className="border-3 border-gray-600" />

      {/* พื้นหลังขาว ไม่มีขอบโค้ง */}
      <div className="flex flex-col lg:flex-row bg-white shadow-sm overflow-hidden min-h-[80vh]">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 max-w-[360px] p-6 flex flex-col items-start min-h-[85vh]">
          <h1 className="md:text-5xl mb-6 text-gray-600 whitespace-nowrap ">
            ที่จอดรถของฉัน
          </h1>
          <Sidebar currentPathname={pathname} />
        </div>

        {/* ไอคอนลูกศร ติดกับ Sidebar */}
        <div className="flex-1 w-full overflow-y-auto max-h-[80vh]">
          <div className=" px-4 lg:px-8">
            <table className="overflow-x-auto w-full border-collapse">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="text-gray-700 text-xl font-semibold border-b">
                  <th className="py-6 px-6 text-center min-w-[200px]">
                    รูปภาพ
                  </th>
                  <th className="py-6 px-6 text-center min-w-[300px]">
                    ชื่อสถานที่จอด
                  </th>
                  <th className="py-6 px-6 text-center min-w-[220px]">
                    ประเภทที่จอด
                  </th>
                  <th className="py-6 px-6 text-center min-w-[180px]">
                    จำนวนที่จอด
                  </th>
                  <th className="py-6 px-6 text-center min-w-[180px]">
                    การจัดการ {/* เพิ่มคอลัมน์การจัดการ */}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5} // เปลี่ยนจาก 4 เป็น 5 เนื่องจากเพิ่มคอลัมน์
                      className="text-center text-gray-400 py-20 text-lg"
                    >
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5} // เปลี่ยนจาก 4 เป็น 5 เนื่องจากเพิ่มคอลัมน์
                      className="text-center text-red-500 py-20 text-lg"
                    >
                      {error}
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5} // เปลี่ยนจาก 4 เป็น 5 เนื่องจากเพิ่มคอลัมน์
                      className="text-center text-gray-400 py-20 text-lg"
                    >
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 text-lg"
                    >
                      <td className="py-6 px-6 text-center">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="w-24 h-24 object-cover rounded-lg mx-auto"
                            unoptimized
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                            <span className="text-gray-400 text-xs">
                              ไม่มีรูป
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-6 px-6 text-center">{item.name}</td>
                      <td className="py-6 px-6 text-center">{item.type}</td>
                      <td className="py-6 px-6 text-center">
                        {item.total_slot}
                      </td>
                      {/* เพิ่มคอลัมน์ "การจัดการ" */}
                      <td className="py-6 px-6 text-center">
                        <div className="flex justify-center gap-4">
                          <Link
                            href={`/editrentdetail?rent_id=${item.id}`}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Pen size={20} />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
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
        </div>
      </div>
    </div>
  );
}
