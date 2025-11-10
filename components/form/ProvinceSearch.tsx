"use client";

import { useState, useEffect, useRef } from "react";
import { provinces, districts, subDistricts } from "@/lib/thaiData";
import { Input } from "../ui/input";
import { MapPin, X } from "lucide-react";
import { Label } from "../ui/label";

interface Option {
  id: number;
  name_th: string;
  name_en: string;
  type: "province" | "district" | "subDistrict";
  province_id?: number;
  district_id?: number;
}

interface ProvinceSearchProps {
  onChange?: (
    provinceId: number | null,
    districtId: number | null,
    subDistrictId: number | null
  ) => void;
}

export default function ProvinceSearch({ onChange }: ProvinceSearchProps) {
  const [query, setQuery] = useState("");
  const [dropdown, setDropdown] = useState(false);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    null
  );
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(
    null
  );
  const [selectedSubDistrictId, setSelectedSubDistrictId] = useState<
    number | null
  >(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // รวม options
  const options: Option[] = [
    ...provinces.map((p) => ({ ...p, type: "province" as const })),
    ...districts.map((d) => ({ ...d, type: "district" as const })),
    ...subDistricts.map((s) => ({ ...s, type: "subDistrict" as const })),
  ];

  // กรองตาม query
  const filteredOptions =
    query === ""
      ? []
      : options.filter(
          (o) =>
            o.name_th.toLowerCase().includes(query.toLowerCase()) ||
            o.name_en.toLowerCase().includes(query.toLowerCase())
        );

  // เลือก option
  const handleSelect = (option: Option) => {
    setQuery(option.name_th);
    setDropdown(false);

    if (option.type === "province") {
      setSelectedProvinceId(option.id);
      setSelectedDistrictId(null);
      setSelectedSubDistrictId(null);
    } else if (option.type === "district") {
      setSelectedProvinceId(option.province_id || null);
      setSelectedDistrictId(option.id);
      setSelectedSubDistrictId(null);
    } else if (option.type === "subDistrict") {
      const sub = subDistricts.find((s) => s.id === option.id);
      const district = districts.find((d) => d.id === sub?.district_id);
      setSelectedDistrictId(district?.id || null);
      setSelectedProvinceId(district?.province_id || null);
      setSelectedSubDistrictId(option.id);
    }
  };

  // call onChange เมื่อ selection เปลี่ยน
  useEffect(() => {
    if (onChange)
      onChange(selectedProvinceId, selectedDistrictId, selectedSubDistrictId);
  }, [selectedProvinceId, selectedDistrictId, selectedSubDistrictId]);

  // click นอก dropdown ปิด dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery("");
    setSelectedProvinceId(null);
    setSelectedDistrictId(null);
    setSelectedSubDistrictId(null);
    if (onChange) onChange(null, null, null);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Label htmlFor="search" className="text-lg">
        สถานที่
      </Label>
      <div className="relative mt-2">
        <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
        <Input
          type="text"
          value={query}
          placeholder="พิมพ์จังหวัดหรือบริเวณใกล้เคียง"
          onChange={(e) => {
            setQuery(e.target.value);
            setDropdown(true);
          }}
          onFocus={() => setDropdown(true)}
          className="pl-10 pr-10 w-full text-sm md:text-lg h-10"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {dropdown && filteredOptions.length > 0 && (
          <ul
            className="absolute left-0 top-full w-full max-h-72 overflow-auto rounded shadow-lg bg-white border z-1000"
            style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
          >
            {filteredOptions.map((o) => (
              <li
                key={`${o.type}-${o.id}`}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onMouseDown={() => handleSelect(o)} // ใช้ onMouseDown เพื่อไม่ให้ blur input ก่อนเลือก
              >
                {o.name_th} ({o.name_en})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
