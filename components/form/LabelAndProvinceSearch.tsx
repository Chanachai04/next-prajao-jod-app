"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { provinces, districts, subDistricts } from "@/lib/thaiData";
import { X } from "lucide-react";

interface LabelAndProvinceSearchProps {
  title: string;
  mode?: "province" | "district" | "subDistrict" | "all";
  value?: string | number | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
  const [query, setQuery] = useState(initialQuery ?? String(value ?? ""));
  const [dropdown, setDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prevValueRef = useRef<string>("");
  const prevInitialQueryRef = useRef<string>("");

  // กรอง options ตาม mode
  const getOptions = (): Option[] => {
    if (mode === "province") {
      return provinces.map((p) => ({ ...p, type: "province" as const }));
    } else if (mode === "district") {
      return districts.map((d) => ({ ...d, type: "district" as const }));
    } else if (mode === "subDistrict") {
      return subDistricts.map((s) => ({ ...s, type: "subDistrict" as const }));
    } else {
      return [
        ...provinces.map((p) => ({ ...p, type: "province" as const })),
        ...districts.map((d) => ({ ...d, type: "district" as const })),
        ...subDistricts.map((s) => ({ ...s, type: "subDistrict" as const })),
      ];
    }
  };

  const options = getOptions();

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

    // Create a synthetic event to match the expected onChange signature
    const syntheticEvent = {
      target: { value: option.name_th },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
  };

  // sync value from parent
  useEffect(() => {
    const valueStr = typeof value === "string" ? value : String(value ?? "");
    if (valueStr !== prevValueRef.current) {
      prevValueRef.current = valueStr;
      setTimeout(() => {
        setQuery(valueStr);
      }, 0);
    }
  }, [value]);

  // sync initialQuery from parent
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
    setDropdown(false);
    const syntheticEvent = {
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    if (mode === "province") return "พิมพ์ชื่อจังหวัด";
    if (mode === "district") return "พิมพ์ชื่อเขต/อำเภอ";
    if (mode === "subDistrict") return "พิมพ์ชื่อตำบล/แขวง";
    return "พิมพ์จังหวัดหรือบริเวณใกล้เคียง";
  };

  return (
    <div className={className ?? ""}>
      <Label htmlFor={id} className="text-lg">
        {title}
      </Label>
      <div ref={wrapperRef} className="relative mt-2">
        <Input
          type="text"
          id={id}
          value={query}
          placeholder={getPlaceholder()}
          onChange={(e) => {
            setQuery(e.target.value);
            setDropdown(true);
            // Also update parent if user is typing
            onChange(e);
          }}
          onFocus={() => setDropdown(true)}
          className="w-full"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {dropdown && filteredOptions.length > 0 && (
          <ul
            className="absolute left-0 top-full w-full max-h-72 overflow-auto rounded shadow-lg bg-white border z-1000 mt-1"
            style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
          >
            {filteredOptions.map((o) => (
              <li
                key={`${o.type}-${o.id}`}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onMouseDown={() => handleSelect(o)}
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
