import MapPicker from "@/components/map/MapPicker";

export default function page() {
  return (
    <div className="min-h-screen">
      <div className="flex">
        <MapPicker height="100vh" />
        <div className="w-xl bg-[#EBEBEB] p-4">
          <h1 className="text-4xl">กรุงเทพมหานคร</h1>
          <p className="text-lg mt-2">ค้นหาที่จอดรถในบริเวณ</p>
        </div>
      </div>
    </div>
  );
}
