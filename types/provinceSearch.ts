// interface โครงสร้างข้อมูลสำหรับตัวเลือกสถานที่ (Province, District, Subdistrict)
export interface Option {
  id: number;
  name_th: string;
  name_en: string;
  type: "province" | "district" | "subDistrict";
}

// interface Props สำหรับ ProvinceSearch Component
export interface ProvinceSearchProps {
  onChange?: (
    provinceId: number | null,
    districtId: number | null,
    subDistrictId: number | null
  ) => void;
  onQueryChange?: (query: string) => void;
  initialQuery?: string;
  mode?: "province" | "district" | "subDistrict" | "all";
  hideLabel?: boolean;
}
