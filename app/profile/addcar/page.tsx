"use client";
import React, { useState } from "react";
import Sidebar from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import LabelAndInput from "@/components/form/LabelAndInputForm";
import AlertModal from "@/components/ui/modal";
import { House, Tag, Car, Droplets } from "lucide-react";

export default function AddCar() {
  const pathname = usePathname();
  const [license, setLicense] = useState("");
  const [province, setProvince] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [modalDescription, setModalDescription] = useState<string | undefined>(
    undefined
  );

  const handleModalClose = () => setModalOpen(false);

  const handleSave = async () => {
    if (!license || !province || !brand || !model || !color) {
      setModalType("error");
      setModalTitle("ข้อมูลไม่ครบ");
      setModalDescription("กรุณากรอกข้อมูลรถให้ครบทุกช่อง");
      setModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/addcar", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          license_plate: license,
          province,
          brand,
          model,
          color,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.message ?? "บันทึกข้อมูลไม่สำเร็จ";
        setModalType("error");
        setModalTitle("เกิดข้อผิดพลาด");
        setModalDescription(msg);
        setModalOpen(true);
        return;
      }

      setModalType("success");
      setModalTitle("บันทึกข้อมูลเรียบร้อย");
      setModalDescription(data?.message ?? "ข้อมูลถูกบันทึกเรียบร้อยแล้ว");
      setModalOpen(true);
      // optionally clear form
      setLicense("");
      setProvince("");
      setBrand("");
      setModel("");
      setColor("");
    } catch (e) {
      console.error("Add car error:", e);
      setModalType("error");
      setModalTitle("เกิดข้อผิดพลาด");
      setModalDescription("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen px-4 md:px-10 lg:px-20 py-5 bg-gray-50">
      <hr className="border-3 border-gray-600" />

      {/* พื้นหลังขาว ไม่มีขอบโค้ง */}
      <div className="flex flex-col lg:flex-row bg-white shadow-sm overflow-hidden min-h-[80vh] lg:gap-x-8">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 p-6 flex flex-col items-start min-h-[85vh]">
          <h1 className="text-4xl md:text-5xl mb-6 text-gray-600">
            ข้อมูลรถของคุณ
          </h1>
          <Sidebar currentPathname={pathname} />
        </div>

        {/* Form Section */}
        <div className="w-full lg:w-1/2 flex flex-col py-25">
          <div className="space-y-4">
            <div className="flex justify-between items-center"></div>
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <LabelAndInput
                    title="เลขทะเบียนรถยนต์ *"
                    id="license"
                    type="text"
                    className="border-gray-300 w-full lg:w-[520px] text-gray-600"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                  />
                  <div className="whitespace-nowrap text-sm text-gray-500">
                    เช่น 1กข 8462
                  </div>
                </div>
                <LabelAndInput
                  title="จังหวัด *"
                  id="province"
                  type="text"
                  className="border-gray-300 w-full lg:w-[520px]"
                  leadingIcon={<House />}
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                />
                <LabelAndInput
                  title="ยี่ห้อ *"
                  id="brand"
                  type="text"
                  className="border-gray-300 w-full lg:w-[520px]"
                  leadingIcon={<Tag />}
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
                <LabelAndInput
                  title="โมเดล / รุ่น *"
                  id="model"
                  type="text"
                  className="border-gray-300 w-full lg:w-[520px]"
                  leadingIcon={<Car />}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
                <LabelAndInput
                  title="สี *"
                  id="color"
                  type="text"
                  className="border-gray-300 w-full lg:w-[520px]"
                  leadingIcon={<Droplets />}
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
            </div>
            <hr className="my-6" />
            <div className="flex justify-start">
              <Button
                className="w-full sm:w-auto"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <AlertModal
        open={modalOpen}
        onClose={handleModalClose}
        type={modalType}
        title={modalTitle}
        description={modalDescription}
      />
    </div>
  );
}
