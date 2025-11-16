"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "กรุณายืนยัน",
  description = "คุณต้องการดำเนินการใช่หรือไม่?",
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <div className="flex justify-center mb-3">
            <CheckCircle className="w-12 h-12 text-yellow-500" />
          </div>
          <DialogTitle className="text-xl">{title}</DialogTitle>

          <p className="text-gray-500 mt-2">{description}</p>

          <div className="mt-6 flex gap-4">
            <Button
              className="w-1/2 cursor-pointer"
              variant="outline"
              onClick={onClose}
            >
              ยกเลิก
            </Button>
            <Button
              className="w-1/2"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              ยืนยัน
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
