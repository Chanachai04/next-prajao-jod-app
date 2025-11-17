"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { AlertModalProps } from "@/types/modal";

export default function AlertModal({
  open,
  onClose,
  type,
  title,
  description,
}: AlertModalProps) {
  const isSuccess = type === "success";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <div className="flex justify-center mb-3 ">
            {isSuccess ? (
              <CheckCircle className="w-12 h-12 text-green-500 " />
            ) : (
              <XCircle className="w-12 h-12 text-red-500 " />
            )}
          </div>
          <DialogTitle className="text-xl">
            {title ?? (isSuccess ? "บันทึกสำเร็จ" : "เกิดข้อผิดพลาด")}
          </DialogTitle>

          <p className="text-gray-500 mt-2">
            {description ??
              (isSuccess
                ? "ข้อมูลถูกบันทึกเรียบร้อยแล้ว"
                : "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่")}
          </p>

          <Button className="mt-6 w-full cursor-pointer" onClick={onClose}>
            ปิด
          </Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
