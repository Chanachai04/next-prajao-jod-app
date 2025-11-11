import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

function readJson(filePath) {
  const text = readFileSync(filePath, 'utf8');
  return { data: JSON.parse(text), indent: 2 }; // existing files use 2 spaces
}

function removeKeysFromArray(items, keysToRemove) {
  return items.map((item) => {
    const copy = { ...item };
    for (const key of keysToRemove) {
      if (key in copy) {
        delete copy[key];
      }
    }
    return copy;
  });
}

function writeJson(filePath, data, indent) {
  const text = JSON.stringify(data, null, indent) + '\n';
  writeFileSync(filePath, text, 'utf8');
}

function main() {
  const root = resolve(process.cwd(), 'lib', 'thai-data');

  // districts.json: remove province_id, created_at, updated_at, deleted_at
  const districtsPath = resolve(root, 'districts.json');
  const { data: districts, indent: districtsIndent } = readJson(districtsPath);
  const cleanedDistricts = removeKeysFromArray(districts, [
    'province_id',
    'created_at',
    'updated_at',
    'deleted_at',
  ]);
  writeJson(districtsPath, cleanedDistricts, districtsIndent);

  // provinces.json: remove geography_id, created_at, updated_at, deleted_at
  const provincesPath = resolve(root, 'provinces.json');
  const { data: provinces, indent: provincesIndent } = readJson(provincesPath);
  const cleanedProvinces = removeKeysFromArray(provinces, [
    'geography_id',
    'created_at',
    'updated_at',
    'deleted_at',
  ]);
  writeJson(provincesPath, cleanedProvinces, provincesIndent);

  // sub_districts.json: remove district_id, lat, long, created_at, updated_at, deleted_at
  const subDistrictsPath = resolve(root, 'sub_districts.json');
  const { data: subDistricts, indent: subDistrictsIndent } = readJson(subDistrictsPath);
  const cleanedSubDistricts = removeKeysFromArray(subDistricts, [
    'district_id',
    'lat',
    'long',
    'created_at',
    'updated_at',
    'deleted_at',
  ]);
  writeJson(subDistrictsPath, cleanedSubDistricts, subDistrictsIndent);
}

main();


