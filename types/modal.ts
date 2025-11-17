export interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  type: "success" | "error";
  title?: string;
  description?: string;
}
