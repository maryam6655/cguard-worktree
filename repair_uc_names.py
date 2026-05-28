import geopandas as gpd
import re

INPUT_FILE = r"public\geojson\chenab_ucs_with_river_distance.geojson"
OUTPUT_FILE = r"public\geojson\chenab_ucs_with_river_distance_FIXED.geojson"

gdf = gpd.read_file(INPUT_FILE)

def is_unknown(value):
    return bool(value and re.match(r"^Unknown_\d+$", str(value).strip(), re.I))

fixed_count = 0

for idx, row in gdf.iterrows():
    uc = row.get("UC")
    uc_name = row.get("UC_NAME")

    if is_unknown(uc) or is_unknown(uc_name):
        tehsil = row.get("TEHSIL")
        district = row.get("DISTRICT")

        if tehsil and district:
            replacement = f"{tehsil}, {district}"
        elif tehsil:
            replacement = tehsil
        elif district:
            replacement = district
        else:
            replacement = "Unnamed Area"

        gdf.at[idx, "UC"] = replacement
        gdf.at[idx, "UC_NAME"] = replacement
        gdf.at[idx, "New_Name"] = replacement

        fixed_count += 1
        print(f"Fixed {uc} -> {replacement}")

gdf.to_file(OUTPUT_FILE, driver="GeoJSON")

print(f"\nTotal fixed: {fixed_count}")
print(f"Saved file: {OUTPUT_FILE}")