import Image from "next/image";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, MapPin, X } from "lucide-react";

interface DetailPanelProps {
  images: string[];
  currentIndex: number;
  selectedOptionDetail: string;
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
  onSelectImage: (index: number) => void;
  onSelectOption: (option: string) => void;
}

export default function DetailPanel({
  images,
  currentIndex,
  selectedOptionDetail,
  onClose,
  onNavigate,
  onSelectImage,
  onSelectOption,
}: DetailPanelProps) {
  const priceOptions = [
    { key: "hourly", label: "รายชั่วโมง" },
    { key: "daily", label: "รายวัน" },
    { key: "monthly", label: "รายเดือน" },
  ];

  return (
    <div className="w-sm bg-white ">
      {/* Image Gallery */}
      <div className="relative">
        <Image
          src={images[currentIndex]}
          alt="รูปที่จอดรถ"
          width={800}
          height={250}
          className="w-full h-[250px] object-cover"
        />
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-6 left-2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          onClick={() => onNavigate("prev")}
          className="cursor-pointer absolute top-1/2 left-2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onNavigate("next")}
          className="cursor-pointer absolute top-1/2 right-2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="bg-[#F9F3F3] h-[130px] flex justify-center items-center space-x-2  overflow-x-auto">
        {images.map((img, index) => (
          <Image
            key={index}
            src={img}
            alt={`thumbnail-${index}`}
            width={80}
            height={100}
            className={`h-16 object-cover cursor-pointer border-2 transition-all ${
              index === currentIndex
                ? "border-blue-500 scale-105"
                : "border-transparent hover:border-gray-300"
            }`}
            onClick={() => onSelectImage(index)}
          />
        ))}
      </div>

      {/* Details */}
      <div className="px-4 max-h-[500px] overflow-y-auto pb-8">
        <p className="text-xl mt-4 font-semibold">ABC</p>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-600" />
          <p className="text-gray-700">ซอย ปลูกจิต ลุมพินี</p>
        </div>
        <hr className="border border-[#7C7C7C] my-4" />

        <div>
          <p className="text-xl mb-2 font-semibold">ข้อมูลราคา</p>
          <div className="flex flex-wrap gap-2 md:gap-4">
            {priceOptions.map(({ key, label }) => (
              <Button
                key={key}
                onClick={() => onSelectOption(key)}
                variant={selectedOptionDetail === key ? "default" : "link"}
                className={`${
                  selectedOptionDetail === key ? "text-white" : "text-black"
                } text-sm md:text-lg transition-all h-8 cursor-pointer`}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="text-center">
            <div className="flex justify-between my-4 text-lg">
              <p>ราคาค่าจอด</p>
              <p className="font-bold text-blue-600">฿ 100</p>
            </div>
            <Button
              type="button"
              className="w-full md:w-1/2 mt-10 cursor-pointer hover:scale-105 transition-transform"
            >
              จองทันที
            </Button>
          </div>

          {["จุดสังเกตุ", "ประเภทที่จอด", "สิ่งอำนวยความสะดวก"].map(
            (title, i) => (
              <div key={i}>
                <hr className="border border-[#7C7C7C] my-4" />
                <p className="font-medium">{title}</p>
                <p className="text-sm text-[#7C7C7C] mt-1">
                  {i === 0
                    ? "ซอย ปลูกจิต ลุมพินี"
                    : i === 1
                    ? "Building"
                    : "CCTV"}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
