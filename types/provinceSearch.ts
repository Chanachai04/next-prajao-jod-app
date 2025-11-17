export interface Option {
  id: number;
  name_th: string;
  name_en: string;
  type: "province" | "district" | "subDistrict";
}

export interface ProvinceSearchProps {
  onChange?: (
    provinceId: number | null,
    districtId: number | null,
    subDistrictId: number | null
  ) => void;
  initialQuery?: string;
}
