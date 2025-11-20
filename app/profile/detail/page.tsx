"use client";

import React, { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import LabelAndInput from "@/components/form/LabelAndInputForm";
import Image from "next/image";
import AlertModal from "@/components/ui/modal";
import ConfirmModal from "@/components/ui/confirm";

export default function Detail() {
  const router = useRouter();
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [citizenId, setCitizenId] = useState<string>("");
  const [lineId, setLineId] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serverImageUrl, setServerImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [modalDescription, setModalDescription] = useState<string | undefined>(
    undefined
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleModalClose = () => {
    setModalOpen(false);
    if (modalType === "success") {
      router.replace("/");
    }
  };

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await fetch("/api/profile", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) return;
        const data = await res.json();

        setEmail(data.email ?? "");
        setPhone(data.phone ?? "");
        setFirstName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
        setCitizenId(data.citizenId ?? "");
        setLineId(data.lineId ?? "");
        setServerImageUrl(data.imageUrl ?? null);
      } catch (e) {
        console.error("fetchContact error:", e);
      }
    };

    fetchContact();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    } else {
      setImage(null);
      setImageFile(null);
    }
  };

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveClick = () => {
    if (!firstName) {
      setError("กรุณากรอกชื่อ");
      return;
    } else if (!lastName) {
      setError("กรุณากรอกนามสกุล");
      return;
    } else if (!email) {
      setError("กรุณากรอกอีเมล");
      return;
    } else if (!citizenId || citizenId.length !== 13) {
      setError("กรุณากรอกรหัสประจำตัวประชาชน 13 หลัก");
      return;
    } else if (!lineId) {
      setError("กรุณากรอก Line ID");
      return;
    } else if (!phone || phone.length !== 10) {
      setError("กรุณากรอกเบอร์โทรศัพท์ 10 หลัก");
      return;
    }
    setError(null);
    setConfirmOpen(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("citizenId", citizenId);
      formData.append("lineId", lineId);
      formData.append("phone", phone);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch("/api/profile", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.message ?? "บันทึกข้อมูลไม่สำเร็จ";
        setModalType("error");
        setModalTitle("เกิดข้อผิดพลาด");
        setModalDescription(msg);
        setModalOpen(true);
        return;
      }
      setModalType("success");
      setModalTitle("บันทึกข้อมูลเรียบร้อยแล้ว");
      setModalDescription("ข้อมูลโปรไฟล์ของคุณถูกบันทึกเรียบร้อยแล้ว");
      setModalOpen(true);
    } catch (e) {
      console.error("handleSave error:", e);
      setModalType("error");
      setModalTitle("เกิดข้อผิดพลาด");
      setModalDescription("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-10 lg:px-20 py-4 sm:py-5 bg-gray-50">
      <hr className="border-3 border-gray-600" />
      <div className="flex flex-col lg:flex-row bg-white shadow-sm overflow-hidden min-h-[80vh] lg:gap-x-8">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 p-4 sm:p-6 flex flex-col items-start min-h-[85vh]">
          <h1 className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6 text-gray-600">
            ข้อมูลส่วนตัว
          </h1>
          <Sidebar currentPathname={pathname} />
        </div>

        {/* Form Section */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-4 sm:p-6 lg:p-0">
          <div className="space-y-3 sm:space-y-4">
            <LabelAndInput
              title="อีเมล *"
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-gray-300 w-full text-gray-700"
              labelClassName="text-grey-500"
            />
            <LabelAndInput
              title="ชื่อ *"
              id="name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="border-gray-300 w-full text-gray-700"
              labelClassName="text-grey-500"
            />
            <LabelAndInput
              title="นามสกุล *"
              id="surname"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border-gray-300 w-full text-gray-700"
              labelClassName="text-grey-500"
            />
            <LabelAndInput
              title="เลขประจำตัวประชาชน"
              id="id"
              type="text"
              value={citizenId}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, "");
                setCitizenId(onlyNumbers);
              }}
              className="border-gray-300 w-full text-gray-700"
              labelClassName="text-grey-500"
              maxLength={13}
            />
            <LabelAndInput
              title="Line ID"
              id="lineid"
              type="text"
              value={lineId}
              onChange={(e) => setLineId(e.target.value)}
              className="border-gray-300 w-full text-gray-700"
              labelClassName="text-grey-500"
            />
            <LabelAndInput
              title="เบอร์โทรศัพท์"
              id="phonenumber"
              type="text"
              value={phone}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, "");
                setPhone(onlyNumbers);
              }}
              className="border-gray-300 w-full text-gray-700"
              labelClassName="text-grey-500"
              maxLength={10}
            />
          </div>

          <hr className="my-4 sm:my-6" />
          <div></div>

          {error && (
            <div className="text-red-600 text-sm sm:text-base md:col-span-2">
              {error}
            </div>
          )}

          <div className="flex justify-start">
            <Button
              className="w-full sm:w-auto text-sm sm:text-base"
              onClick={handleSaveClick}
              disabled={loading}
            >
              {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </Button>
          </div>
        </div>

        {/* Image Section */}
        <div className="w-full lg:w-1/3 p-4 sm:p-6 flex flex-col mt-8 sm:mt-12 lg:mt-20 items-center">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-700">
            รูปภาพ
          </h2>
          <div
            className="border border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100 
                w-32 h-32 sm:w-40 sm:h-40 cursor-pointer hover:bg-gray-200 transition"
            onClick={handleContainerClick}
          >
            {/* show preview only for newly selected local file; don't render server image */}
            {imageFile && image ? (
              <Image
                src={image}
                alt="Uploaded"
                className="object-cover w-full h-full"
                width={160}
                height={160}
              />
            ) : (
              <span className="text-gray-400 text-xs sm:text-sm text-center px-2">
                ยังไม่ได้เลือกรูปภาพ
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
        <AlertModal
          open={modalOpen}
          onClose={handleModalClose}
          type={modalType}
          title={modalTitle}
          description={modalDescription}
        />
        <ConfirmModal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleSave}
          title="ยืนยันการบันทึกข้อมูล"
          description="คุณต้องการบันทึกข้อมูลโปรไฟล์ใช่หรือไม่?"
        />
      </div>
    </div>
  );
}
