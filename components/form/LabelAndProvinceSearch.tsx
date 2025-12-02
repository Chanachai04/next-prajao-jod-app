"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { provinces, districts, subDistricts } from "@/lib/thaiData";
import { X } from "lucide-react";

interface LabelAndProvinceSearchProps {
  title: string;
  mode?: "province" | "district" | "subDistrict" | "all"; // โหมดการค้นหา (ประเภทข้อมูลที่อนุญาต)
  value?: string | number | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // Handler เมื่อค่า Input เปลี่ยน (ใช้สำหรับส่งค่าออก)
  initialQuery?: string | null;
  className?: string;
  id?: string;
  placeholder?: string;
}

interface Option {
  id: number;
  name_th: string;
  name_en: string;
  type: "province" | "district" | "subDistrict";
}

export default function LabelAndProvinceSearch({
  title,
  mode = "all",
  value,
  onChange,
  initialQuery,
  className,
  id,
  placeholder,
}: LabelAndProvinceSearchProps) {
  const [query, setQuery] = useState(initialQuery ?? String(value ?? "")); // ข้อความที่ผู้ใช้พิมพ์
  const [dropdown, setDropdown] = useState(false); // สถานะเปิด/ปิด Dropdown
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // Index ของรายการที่ถูก Highlight
  const wrapperRef = useRef<HTMLDivElement>(null); // Ref สำหรับตรวจจับการคลิกนอกคอมโพเนนต์
  const listRef = useRef<HTMLUListElement>(null); // Ref สำหรับรายการ Dropdown เพื่อใช้ Scroll
  const prevValueRef = useRef<string>(""); // Ref เพื่อติดตามค่า value ล่าสุดจาก Parent
  const prevInitialQueryRef = useRef<string>(""); // Ref เพื่อติดตามค่า initialQuery ล่าสุดจาก Parent

  // กรอง options ตาม mode ที่กำหนด
  const getOptions = (): Option[] => {
    if (mode === "province") {
      return provinces.map((p) => ({ ...p, type: "province" as const }));
    } else if (mode === "district") {
      return districts.map((d) => ({ ...d, type: "district" as const }));
    } else if (mode === "subDistrict") {
      return subDistricts.map((s) => ({ ...s, type: "subDistrict" as const }));
    } else {
      // โหมด 'all': รวมทุกประเภท (จังหวัด, เขต/อำเภอ, แขวง/ตำบล)
      return [
        ...provinces.map((p) => ({ ...p, type: "province" as const })),
        ...districts.map((d) => ({ ...d, type: "district" as const })),
        ...subDistricts.map((s) => ({ ...s, type: "subDistrict" as const })),
      ];
    }
  };

  const options = getOptions();

  // กรองรายการตามข้อความที่พิมพ์ (case-insensitive search ทั้งชื่อไทยและอังกฤษ)
  const filteredOptions =
    query === ""
      ? []
      : options.filter(
          (o) =>
            o.name_th.toLowerCase().includes(query.toLowerCase()) ||
            o.name_en.toLowerCase().includes(query.toLowerCase())
        );

  // ฟังก์ชันจัดการเมื่อเลือก option จาก Dropdown
  const handleSelect = (option: Option) => {
    setQuery(option.name_th); // ตั้งค่าช่องค้นหาเป็นชื่อสถานที่
    setDropdown(false);
    setHighlightedIndex(-1);

    // สร้าง Synthetic Event เพื่อเรียก onChange Prop ของ Parent
    const syntheticEvent = {
      target: { value: option.name_th },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
  };

  // จัดการ Keyboard Navigation (ลูกศรขึ้น/ลง, Enter, Escape)
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
          handleSelect(filteredOptions[highlightedIndex]); // เลือกรายการที่ Highlight
        }
        break;
      case "Escape":
        e.preventDefault();
        setDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Effect สำหรับ Scroll ไปยังรายการที่ถูก Highlight
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

  // Effect สำหรับ Reset highlighted index เมื่อรายการที่ถูกกรองเปลี่ยน
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHighlightedIndex(-1);
  }, [query]);

  // Effect สำหรับ Sync ค่า 'value' จาก Parent (กรณีที่ Parent เปลี่ยนค่าภายนอก)
  useEffect(() => {
    const valueStr = typeof value === "string" ? value : String(value ?? "");
    if (valueStr !== prevValueRef.current) {
      prevValueRef.current = valueStr;
      setTimeout(() => {
        setQuery(valueStr);
      }, 0);
    }
  }, [value]);

  // Effect สำหรับ Sync ค่า 'initialQuery' จาก Parent (ใช้ครั้งแรก)
  useEffect(() => {
    const initialQueryStr =
      typeof initialQuery === "string"
        ? initialQuery
        : String(initialQuery ?? "");
    if (initialQueryStr !== prevInitialQueryRef.current) {
      prevInitialQueryRef.current = initialQueryStr;
      setTimeout(() => {
        setQuery(initialQueryStr);
      }, 0);
    }
  }, [initialQuery]);

  // Effect สำหรับตรวจจับการคลิกนอก Dropdown เพื่อปิด Dropdown
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

  // ฟังก์ชันล้างช่องค้นหา (Clear Button)
  const handleClear = () => {
    setQuery("");
    setDropdown(false);
    setHighlightedIndex(-1);
    // เรียก onChange เพื่อแจ้ง Parent ว่าค่าถูกล้างแล้ว
    const syntheticEvent = {
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  // กำหนด Placeholder ตามโหมดที่เลือก
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    if (mode === "province") return "พิมพ์ชื่อจังหวัด";
    if (mode === "district") return "พิมพ์ชื่อเขต/อำเภอ";
    if (mode === "subDistrict") return "พิมพ์ชื่อแขวง/ตำบล";
    return "พิมพ์จังหวัดหรือบริเวณใกล้เคียง";
  };

  return (
    <div className={className ?? ""}>
      {/* Label */}
      <Label htmlFor={id} className="text-lg">
        {title}
      </Label>
      <div ref={wrapperRef} className="relative mt-2">
        {/* Input Field */}
        <Input
          type="text"
          id={id}
          value={query}
          placeholder={getPlaceholder()}
          onChange={(e) => {
            setQuery(e.target.value);
            setDropdown(true); // เปิด Dropdown เมื่อพิมพ์
            onChange(e); // ส่งค่าที่พิมพ์ปัจจุบันไปยัง Parent
          }}
          onFocus={() => setDropdown(true)} // เปิด Dropdown เมื่อ Focus
          onKeyDown={handleKeyDown} // จัดการ Keyboard Navigation
          className="w-full"
          autoComplete="off"
        />

        {/* ปุ่มล้าง (Clear Button) - แสดงเมื่อมีข้อความในช่อง */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Dropdown List (รายการที่ถูกกรอง) */}
        {dropdown && filteredOptions.length > 0 && (
          <ul
            ref={listRef}
            className="absolute left-0 top-full w-full max-h-72 overflow-auto rounded shadow-lg bg-white border z-1000 mt-1"
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
                onMouseDown={() => handleSelect(o)} // ใช้ onMouseDown เพื่อให้ทำงานก่อน onBlur ของ Input
                onMouseEnter={() => setHighlightedIndex(index)} // Highlight เมื่อ Hover
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
