"use client";

import { useState, useEffect, useRef } from "react";
import { provinces, districts, subDistricts } from "@/lib/thaiData";
import { Input } from "../ui/input";
import { MapPin, X } from "lucide-react";
import { Label } from "../ui/label";
import { Option, ProvinceSearchProps } from "@/types/provinceSearch";

export default function ProvinceSearch({
  onChange,
  onQueryChange,
  initialQuery,
  hideLabel = false,
}: ProvinceSearchProps) {
  const [query, setQuery] = useState(() => initialQuery ?? "");
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const isUserTypingRef = useRef(false);

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
    setHighlightedIndex(-1);

    if (option.type === "province") {
      setSelectedProvinceId(option.id);
      setSelectedDistrictId(null);
      setSelectedSubDistrictId(null);
    } else if (option.type === "district") {
      setSelectedDistrictId(option.id);
      setSelectedSubDistrictId(null);
      setSelectedProvinceId(null);
    } else if (option.type === "subDistrict") {
      setSelectedSubDistrictId(option.id);
      setSelectedDistrictId(null);
      setSelectedProvinceId(null);
    }
  };

  // จัดการ keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdown || filteredOptions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredOptions.length
        ) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // scroll to highlighted item
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex]);

  // reset highlighted index เมื่อ filtered options เปลี่ยน
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHighlightedIndex(-1);
  }, [query]);

  // sync initialQuery from parent
  useEffect(() => {
    // ถ้า user กำลังพิมพ์ ไม่ต้อง sync
    if (isUserTypingRef.current) return;

    if (typeof initialQuery === "string" && initialQuery !== query) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(initialQuery);
    }
  }, [initialQuery, query]);

  // call onChange เมื่อ selection เปลี่ยน
  useEffect(() => {
    if (onChange)
      onChange(selectedProvinceId, selectedDistrictId, selectedSubDistrictId);
  }, [selectedProvinceId, selectedDistrictId, selectedSubDistrictId, onChange]);

  // click นอก dropdown ปิด dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setDropdown(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    isUserTypingRef.current = true;
    setQuery("");
    setSelectedProvinceId(null);
    setSelectedDistrictId(null);
    setSelectedSubDistrictId(null);
    setHighlightedIndex(-1);
    if (onChange) onChange(null, null, null);
    setTimeout(() => {
      isUserTypingRef.current = false;
    }, 100);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {!hideLabel && (
        <Label htmlFor="search" className="text-sm sm:text-base lg:text-lg">
          สถานที่
        </Label>
      )}
      <div className={`relative ${!hideLabel ? "mt-2" : ""}`}>
        <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
        <Input
          type="text"
          value={query}
          placeholder="พิมพ์จังหวัดหรือบริเวณใกล้เคียง"
          onChange={(e) => {
            isUserTypingRef.current = true;
            const newValue = e.target.value;
            setQuery(newValue);
            setDropdown(true);
            // เรียก callback เพื่อ update parent
            if (onQueryChange) {
              onQueryChange(newValue);
            }
          }}
          onFocus={() => setDropdown(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // หน่วงเวลาเล็กน้อยก่อน reset flag
            setTimeout(() => {
              isUserTypingRef.current = false;
            }, 100);
          }}
          className="pl-10 pr-10 w-full text-sm md:text-lg h-10 bg-white"
          autoComplete="off"
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
            ref={listRef}
            className="absolute left-0 top-full w-full max-h-72 overflow-auto rounded shadow-lg bg-white border z-1000"
            style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
          >
            {filteredOptions.map((o, index) => (
              <li
                key={`${o.type}-${o.id}`}
                className={`p-2 cursor-pointer ${
                  index === highlightedIndex
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
                onMouseDown={() => handleSelect(o)}
                onMouseEnter={() => setHighlightedIndex(index)}
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
