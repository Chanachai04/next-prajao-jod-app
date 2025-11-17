import { LucideIcon } from "lucide-react";

export interface MenuItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  action?: () => void;
}
export type ProfileState = {
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
};
