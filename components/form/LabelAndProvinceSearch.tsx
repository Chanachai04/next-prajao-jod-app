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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
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
    setHighlightedIndex(-1);

    const syntheticEvent = {
      target: { value: option.name_th },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
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
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery("");
    setDropdown(false);
    setHighlightedIndex(-1);
    const syntheticEvent = {
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    if (mode === "province") return "พิมพ์ชื่อจังหวัด";
    if (mode === "district") return "พิมพ์ชื่อเขต/อำเภอ";
    if (mode === "subDistrict") return "พิมพ์ชื่อแขวง/ตำบล";
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
            onChange(e);
          }}
          onFocus={() => setDropdown(true)}
          onKeyDown={handleKeyDown}
          className="w-full"
          autoComplete="off"
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
