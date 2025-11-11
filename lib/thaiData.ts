import provincesJson from "./thai-data/provinces.json";
import districtsJson from "./thai-data/districts.json";
import subDistrictsJson from "./thai-data/sub_districts.json";

// ประกาศ array ตามจริง
export const provinces = provincesJson; // จังหวัด
export const districts = districtsJson; // อำเภอ/เขต
export const subDistricts = subDistrictsJson; // ตำบล/แขวง
// ความสัมพันธ์ province_id / district_id ถูกลบออกจากข้อมูลต้นทาง
// หากต้องการใช้งานความสัมพันธ์ กรุณาเตรียม mapping แยกต่างหาก
