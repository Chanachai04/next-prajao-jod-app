"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "./button";
import { X, Upload } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (file: File) => Promise<void>;
  amount: number;
  qrCodeUrl?: string;
}

export default function PaymentModal({
  open,
  onClose,
  onConfirm,
  amount,
  qrCodeUrl = "/placeholder.png", // QR code placeholder
}: PaymentModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("กรุณาอัพโหลดสลิปการโอนเงิน");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      await onConfirm(selectedFile);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอัพโหลด"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">ชำระเงิน</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">ยอดชำระ</p>
            <p className="text-3xl font-bold text-blue-600">
              ฿ {amount.toLocaleString()}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-600 mb-3">
              สแกน QR Code เพื่อชำระเงิน
            </p>
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <Image
                src={qrCodeUrl}
                alt="QR Code"
                width={200}
                height={200}
                className="w-48 h-48 object-contain"
              />
            </div>
          </div>

          {/* Upload Slip */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              อัพโหลดสลิปการโอนเงิน *
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="slip-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="slip-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {previewUrl ? (
                  <div className="relative">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={200}
                      height={200}
                      className="max-h-48 object-contain rounded"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      คลิกเพื่อเปลี่ยนรูป
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      คลิกเพื่ออัพโหลดสลิป
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      รองรับไฟล์ JPG, PNG (ไม่เกิน 5MB)
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t">
          <Button
            onClick={handleClose}
            disabled={isUploading}
            variant="outline"
            className="flex-1"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUploading || !selectedFile}
            className="flex-1"
          >
            {isUploading ? "กำลังอัพโหลด..." : "ยืนยันการชำระเงิน"}
          </Button>
        </div>
      </div>
    </div>
  );
}
