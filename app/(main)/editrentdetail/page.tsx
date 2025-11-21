import EditRentDetail from "@/components/editrentdetail/EditRentDetail";
import { Suspense } from "react";
import Loading from "./loading";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <EditRentDetail />
    </Suspense>
  );
}
