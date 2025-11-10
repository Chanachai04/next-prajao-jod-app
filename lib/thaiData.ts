import provincesJson from "./thai-data/provinces.json";
import districtsJson from "./thai-data/districts.json";
import subDistrictsJson from "./thai-data/sub_districts.json";

// ประกาศ array ตามจริง
export const provinces = provincesJson; // จังหวัด
export const districts = districtsJson; // อำเภอ/เขต
export const subDistricts = subDistrictsJson; // ตำบล/แขวง

// หาอำเภอตามจังหวัด
export function getDistrictsByProvince(provinceId: number) {
  return districts.filter((d) => d.province_id === provinceId);
}

// หาตำบลตามอำเภอ
export function getSubDistrictsByDistrict(districtId: number) {
  return subDistricts.filter((s) => s.district_id === districtId);
}
