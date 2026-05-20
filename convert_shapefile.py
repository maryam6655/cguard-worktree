import geopandas as gpd
import json

# Read the Union Council shapefile
gdf = gpd.read_file(r'W:\University\C-Guard\public\geojson\adminbdy-shapefile\Adminbdy Shapefile\Union_Council.shp')

# Convert to WGS84 (EPSG:4326) for web mapping
gdf = gdf.to_crs(epsg=4326)

# Save as GeoJSON
output_path = r'W:\University\C-Guard\public\geojson\union_councils.geojson'
gdf.to_file(output_path, driver='GeoJSON')

print(f"Successfully converted to {output_path}")
print(f"Total features: {len(gdf)}")
print(f"Columns: {list(gdf.columns)}")
