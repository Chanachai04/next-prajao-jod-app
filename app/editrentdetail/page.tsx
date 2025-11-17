import EditRentDetail from "@/components/editrentdetail/EditRentDetail";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>กำลังโหลด...</div>}>
      <EditRentDetail />
    </Suspense>
  );
}
