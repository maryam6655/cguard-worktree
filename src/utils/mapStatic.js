// Shared cache for the static map GeoJSON layers used by both MapPage.jsx
// and FloodMap.jsx.
//
// Why a module-level cache?
//   • The four GeoJSON files (UC polygons, basin outline, Chenab river,
//     gauges) are large and never change at runtime.
//   • A module-level cache means each file is downloaded ONCE per browser
//     session, no matter which map page mounts first or how many times the
//     user navigates between them.
//   • React 18 StrictMode's intentional double-invoke in dev cannot cause
//     duplicate downloads — both mounts await the same in-flight promise.
//   • Each file owns its own cache entry, so a failure on one (e.g. a 404
//     on the gauges file) does not poison the others.
//   • On failure, the rejected entry is evicted so the next mount can retry.
//
// This cache is for STATIC geometry only. Live flood/risk data is fetched
// separately on each page with cache: 'no-store' and its own short refresh
// interval — those values must never be served from this cache.

const cache = new Map();

const fetchOnce = (path) => {
  let entry = cache.get(path);
  if (!entry) {
    entry = fetch(path)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load ${path} (HTTP ${res.status})`);
        }
        return res.json();
      })
      .catch((error) => {
        // Evict so a subsequent mount can retry instead of being stuck on
        // a permanently-rejected promise.
        cache.delete(path);
        throw error;
      });
    cache.set(path, entry);
  }
  return entry;
};

export const STATIC_MAP_PATHS = {
  basin: '/geojson/chenab_basin.geojson',
  uc: '/geojson/chenab_ucs_with_river_distance_FIXED.geojson',
  river: '/geojson/chenab_river.geojson',
  gauges: '/geojson/chenab_guages.geojson',
};

export const loadBasinGeoJSON = () => fetchOnce(STATIC_MAP_PATHS.basin);
export const loadUcGeoJSON = () => fetchOnce(STATIC_MAP_PATHS.uc);
export const loadRiverGeoJSON = () => fetchOnce(STATIC_MAP_PATHS.river);
export const loadGaugeGeoJSON = () => fetchOnce(STATIC_MAP_PATHS.gauges);
