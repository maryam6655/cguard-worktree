import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPinned,
  ShieldCheck,
  Waves,
  TriangleAlert,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Plus,
  Minus,
  Navigation,
  Users,
  BarChart3,
  Flame,
  CalendarDays,
  Info,
  X,
} from 'lucide-react';
import '../styles/MapPage.css';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://ghaniasaghir-cguard-backend.hf.space';

// Name matching is the fallback path; punctuation is stripped to absorb
// differences like "Chak No. 760" vs "Chak No 760".
const normalizeName = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '');

// Pull the UC identifier out of a GeoJSON feature's properties. Tries every
// reasonable field the source data might use; returns null if none exist.
const getGeoUcId = (properties) => {
  return (
    properties?.UC_ID ||
    properties?.uc_id ||
    properties?.UC_CODE ||
    properties?.uc_code ||
    properties?.id ||
    null
  );
};

// Canonicalize UC IDs so "600", "UC-600", "uc-600" all collapse to "UC-600".
const normalizeUcId = (value) => {
  if (value == null) return '';
  const text = String(value).trim().toUpperCase();
  if (!text) return '';
  if (text.startsWith('UC-')) return text;
  if (/^\d+$/.test(text)) return `UC-${text}`;
  return text;
};

// Custom hook for map controls
function MapController({ searchQuery, onMapReady, ucData, ucGeoJson }) {
  const map = useMap();
  const didFitRef = useRef(false);

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  // Once the Chenab UC layer is loaded, frame the map on its actual bounds
  // (not the hardcoded static center/zoom that could land on a wider view).
  // Runs once; user pans/zooms are not overridden afterwards.
  useEffect(() => {
    if (didFitRef.current) return;
    if (!map || !ucGeoJson?.features?.length) return;

    const bounds = L.geoJSON(ucGeoJson).getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30] });
      didFitRef.current = true;
    }
  }, [map, ucGeoJson]);

  useEffect(() => {
    if (!searchQuery || !map || !ucGeoJson?.features?.length) return;

    const query = normalizeName(searchQuery);
    const foundFeature = ucGeoJson.features.find(feature => {
      const props = feature.properties || {};
      const name = normalizeName(props.UC_NAME || props.UC || props.name);
      const district = normalizeName(props.DISTRICT || props.DISTRICT_NAME);
      return name.includes(query) || district.includes(query);
    });

    if (foundFeature) {
      const layer = L.geoJSON(foundFeature);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [60, 60] });
      }
    }
  }, [searchQuery, map, ucGeoJson]);

  return null;
}

const MapPage = () => {
  const [basinData, setBasinData] = useState(null);
  const [ucData, setUcData] = useState(null);
  const [riverData, setRiverData] = useState(null);
  const [gaugeData, setGaugeData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [map, setMap] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(true);
  const [basemapType, setBasemapType] = useState('streets');
  const [apiUCData, setApiUCData] = useState([]); // ← REAL data from backend
  const [basinStats, setBasinStats] = useState({
    total: 0,
    low: 0,
    medium: 0,
    high: 0,
    veryHigh: 0,
    excHigh: 0,
    lastUpdated: null
  });
  const [showBasinSummary, setShowBasinSummary] = useState(false);
  const mapRef = useRef();

  // ESC closes the basin summary modal.
  useEffect(() => {
    if (!showBasinSummary) return;
    const onKey = (event) => {
      if (event.key === 'Escape') setShowBasinSummary(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showBasinSummary]);

  const clampRisk = (value) => Math.max(0, Math.min(100, Math.round(value)));

  const handleSearch = (event) => {
    event.preventDefault();
  };
  // ─────────────────────────────────────────────
  // FETCH LIVE MAP RISK + BASIN OVERVIEW FROM BACKEND
  // These calls must appear in DevTools → Network → Fetch/XHR.
  // ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchBackendMapData = async () => {
      try {
        const [mapRiskRes, overviewRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/map-risk`, { cache: 'no-store' }),
          fetch(`${API_BASE_URL}/api/basin-overview`, { cache: 'no-store' }),
        ]);

        if (!mapRiskRes.ok) {
          throw new Error(`/api/map-risk failed with status ${mapRiskRes.status}`);
        }

        if (!overviewRes.ok) {
          throw new Error(`/api/basin-overview failed with status ${overviewRes.status}`);
        }

        const mapRiskData = await mapRiskRes.json();
        const overviewData = await overviewRes.json();

        console.log('✅ /api/map-risk response:', mapRiskData);
        console.log('✅ /api/basin-overview response:', overviewData);

        if (cancelled) return;

        const mapRiskList = Array.isArray(mapRiskData)
          ? mapRiskData
          : Array.isArray(mapRiskData?.ucs)
            ? mapRiskData.ucs
            : Array.isArray(mapRiskData?.union_councils)
              ? mapRiskData.union_councils
              : [];

        setApiUCData(mapRiskList);

        if (overviewData?.success) {
          const counts = overviewData.counts || {};
          const summary = overviewData.summary || {};

          setBasinStats((prev) => ({
            ...prev,
            total: overviewData.ucs_monitored || overviewData.total_ucs || overviewData.total || prev.total || 0,
            low: counts.LOW ?? summary.low ?? overviewData.low ?? 0,
            medium: counts.MEDIUM ?? summary.medium ?? overviewData.medium ?? 0,
            high: counts.HIGH ?? summary.high ?? overviewData.high ?? 0,
            veryHigh: counts.VERY_HIGH ?? summary.very_high ?? overviewData.very_high ?? overviewData.veryHigh ?? 0,
            excHigh:
              counts.EXCEPTIONALLY_HIGH ??
              summary.exceptionally_high ??
              overviewData.exceptionally_high ??
              overviewData.exc_high ??
              overviewData.excHigh ??
              0,
            lastUpdated: overviewData.last_updated ? new Date(overviewData.last_updated) : new Date(),
          }));
        }
      } catch (error) {
        console.error('❌ Map backend integration error:', error);
        if (!cancelled) {
          setApiUCData([]);
        }
      }
    };

    fetchBackendMapData();

    // Refresh every minute so map/summary stay live without manual reload.
    const intervalId = window.setInterval(fetchBackendMapData, 60000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  // Load GeoJSON data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [basinRes, ucRes, riverRes, gaugeRes] = await Promise.all([
          fetch('/geojson/chenab_basin.geojson'),
          fetch('/geojson/chenab_ucs_with_river_distance.geojson'),
          fetch('/geojson/chenab_river.geojson'),
          fetch('/geojson/chenab_guages.geojson')
        ]);
        
        setBasinData(await basinRes.json());
        const ucGeoJSON = await ucRes.json();

        const totalUcCount = ucGeoJSON?.features?.length ?? 0;
        setBasinStats(prev => ({ ...prev, total: totalUcCount }));

        // Merge backend risk data into GeoJSON features using a stable
        // identifier first, with a name-based match as a safe fallback.
        // Features without a backend record default to Low risk (yellow) so
        // the map stays color-coded even when the API hasn't delivered data.
        ucGeoJSON.features = (ucGeoJSON.features ?? []).map(feature => {
          const props = feature.properties || {};
          const geoIdKey = normalizeUcId(getGeoUcId(props));
          const geoName = normalizeName(props.UC_NAME || props.UC || props.name);

          // 1) ID match first — stable across name spelling differences.
          let matchedUC = null;
          if (geoIdKey) {
            matchedUC = apiUCData.find((uc) => {
              const backendId = normalizeUcId(uc.uc_id ?? uc.id);
              return backendId && backendId === geoIdKey;
            }) || null;
          }

          // 2) Fallback: name match (only if ID lookup found nothing).
          if (!matchedUC && geoName) {
            matchedUC = apiUCData.find((uc) => {
              const backendName = normalizeName(
                uc.uc_name || uc.name || uc.tooltip?.title
              );
              if (!backendName) return false;
              return (
                backendName === geoName ||
                backendName.includes(geoName) ||
                geoName.includes(backendName)
              );
            }) || null;
          }

          const mergedRisk = matchedUC
            ? {
                backend_id: matchedUC.uc_id ?? matchedUC.id ?? null,
                backend_station: matchedUC.station ?? null,
                risk_percentage: matchedUC.risk_percentage ?? 10,
                risk_level: matchedUC.risk_level || 'Low',
                risk_color: matchedUC.risk_color || getRiskColor(matchedUC.risk_percentage ?? 10),
                distance_km:
                  matchedUC.distance_km ??
                  props.Distance_to_River_km ??
                  null,
                last_updated: matchedUC.last_updated || null,
                backend_tooltip: matchedUC.tooltip || null,
              }
            : {
                // No backend match — render Low so the polygon still gets
                // a color rather than going grey/"no data".
                backend_id: null,
                backend_station: null,
                risk_percentage: 10,
                risk_level: 'Low',
                risk_color: '#EAB308',
                distance_km: props.Distance_to_River_km ?? null,
                last_updated: null,
                backend_tooltip: null,
              };

          return {
            ...feature,
            properties: { ...props, ...mergedRisk },
          };
        });

        // Basin Overview counts come from /api/basin-overview (see useEffect
        // above). Frontend never invents risk values.

        setUcData(ucGeoJSON);
        setRiverData(await riverRes.json());
        setGaugeData(await gaugeRes.json());
        setLoading(false);
      } catch (error) {
        console.error('Error loading GeoJSON data:', error);
        setBasinData(generateMockBasinData());
        setRiverData(generateMockRiverData());
        setLoading(false);
      }
    };

    loadData();
  }, [apiUCData]); // re-run when real API data arrives

  const generateMockBasinData = () => ({
    type: 'FeatureCollection',
    features: apiUCData.length > 0
      ? apiUCData.map(uc => ({
          type: 'Feature',
          properties: { name: uc.name, risk_percentage: uc.risk_percentage, id: uc.id },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [74.3 - 0.05, 32.0 - 0.05],
              [74.3 + 0.05, 32.0 - 0.05],
              [74.3 + 0.05, 32.0 + 0.05],
              [74.3 - 0.05, 32.0 + 0.05],
              [74.3 - 0.05, 32.0 - 0.05]
            ]]
          }
        }))
      : []
  });

  const generateMockRiverData = () => ({
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: { name: 'Chenab River' },
      geometry: {
        type: 'LineString',
        coordinates: [[74.1, 31.8], [74.2, 31.9], [74.3, 32.0], [74.4, 32.1], [74.5, 32.2]]
      }
    }]
  });

  const getRiskColor = (percentage) => {
    if (percentage == null || Number.isNaN(Number(percentage))) return '#D1D5DB';
    if (percentage >= 81) return '#7F1D1D';
    if (percentage >= 61) return '#9333EA';
    if (percentage >= 41) return '#EF4444';
    if (percentage >= 21) return '#F97316';
    return '#EAB308';
  };

  const hasRiskValue = (percentage) =>
    percentage != null && Number.isFinite(Number(percentage));

  const getRiskTextColor = (percentage) => {
    if (percentage >= 81) return '#7F1D1D';
    if (percentage >= 61) return '#9333EA';
    if (percentage >= 41) return '#EF4444';
    if (percentage >= 21) return '#F97316';
    return '#EAB308';
  };

  const ucStyle = (feature) => {
    const props = feature.properties || {};
    const pct = props.risk_percentage;
    const hasRisk = hasRiskValue(pct);
    // Prefer the backend-provided color (so its palette stays authoritative);
    // fall back to our local percentage→color mapping if it's missing.
    const fillColor = props.risk_color || (hasRisk ? getRiskColor(pct) : '#D1D5DB');
    return {
      fillColor,
      fillOpacity: hasRisk ? 0.36 : 0.06,
      color: '#CBD5E1',
      weight: 0.6,
      opacity: 0.85,
      dashArray: '',
    };
  };

  const basinStyle = {
    fillColor: 'transparent',
    weight: 3,
    opacity: 0.8,
    color: '#3b82f6',
    dashArray: '5, 5',
    fillOpacity: 0
  };

  const riverStyle = {
    color: '#3b82f6',
    weight: 4,
    opacity: 0.9,
    dashArray: '',
    lineCap: 'round',
    lineJoin: 'round'
  };

  // Light HTML escape so unexpected backend strings can't inject markup
  // into the tooltip.
  const escapeHtml = (value) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const onEachUCFeature = (feature, layer) => {
    const props = feature.properties || {};
    const percentage = props.risk_percentage;
    const hasRisk = hasRiskValue(percentage);
    const pctText = hasRisk ? `${Math.round(Number(percentage))}%` : '—';
    const pctColor = hasRisk
      ? (props.risk_color || getRiskTextColor(percentage))
      : '#64748B';

    const ucName = props.UC_NAME || props.UC || props.name || 'Union Council';
    const district = props.DISTRICT || props.DISTRICT_NAME || '';
    const riskLevel = props.risk_level || (hasRisk ? '' : 'No data');
    const station = props.backend_station;
    const distance =
      props.distance_km != null
        ? Number(props.distance_km).toFixed(1)
        : props.Distance_to_River_km != null
          ? Number(props.Distance_to_River_km).toFixed(1)
          : null;

    // Build the rows defensively — missing fields are simply skipped instead
    // of rendering "undefined".
    const rows = [];
    if (district) {
      rows.push(`<div class="uc-tooltip-row"><span>District</span><strong>${escapeHtml(district)}</strong></div>`);
    }
    if (riskLevel) {
      rows.push(`<div class="uc-tooltip-row"><span>Risk Level</span><strong style="color:${pctColor}">${escapeHtml(riskLevel)}</strong></div>`);
    }
    if (station) {
      rows.push(`<div class="uc-tooltip-row"><span>Source Station</span><strong>${escapeHtml(station)}</strong></div>`);
    }
    if (distance != null) {
      rows.push(`<div class="uc-tooltip-row"><span>From River</span><strong>${distance} km</strong></div>`);
    }

    const popupContent = `
      <div class="custom-popup">
        <div class="uc-tooltip-head">
          <span class="uc-name">${escapeHtml(ucName)}</span>
          <span class="uc-percentage" style="color:${pctColor}">${pctText}</span>
        </div>
        ${rows.length ? `<div class="uc-tooltip-body">${rows.join('')}</div>` : ''}
      </div>
    `;

    layer.bindTooltip(popupContent, {
      permanent: false,
      direction: 'top',
      className: 'custom-tooltip',
      sticky: true,
    });

    // Subtle hover — opacity only, no stroke/weight changes.
    layer.on('mouseover', function () {
      this.setStyle({ fillOpacity: 0.5 });
    });
    layer.on('mouseout', function () {
      this.setStyle({ fillOpacity: hasRisk ? 0.36 : 0.06 });
    });
    layer.on('click', function () {
      layer.openTooltip();
    });
  };

  // Helper function to format time difference
  const getTimeAgo = (date) => {
    if (!date) return 'Just now';
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000); // difference in seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min${Math.floor(diff / 60) !== 1 ? 's' : ''} ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) !== 1 ? 's' : ''} ago`;
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) !== 1 ? 's' : ''} ago`;
  };

  const handleMicrophoneClick = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend  = () => setIsListening(false);
      recognition.start();
    } else {
      alert('Speech recognition not supported in this browser');
    }
  };

  const handleZoomIn  = () => { if (map) map.zoomIn();  };
  const handleZoomOut = () => { if (map) map.zoomOut(); };

  return (
    <div className="map-page">
      <div className="map-container">
        <MapContainer
          center={[32.0, 74.3]}
          zoom={11}
          className="leaflet-map"
          ref={mapRef}
          zoomControl={false}
        >
          {basemapType === 'streets' ? (
            <TileLayer
              key="streets"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          ) : (
            <TileLayer
              key="satellite"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}
          
          <MapController
            searchQuery={searchQuery}
            onMapReady={setMap}
            ucData={apiUCData}
            ucGeoJson={ucData}
          />
          
          {ucData && (
            <GeoJSON
              key={`uc-risk-layer-${apiUCData.length}-${basinStats.lastUpdated ? basinStats.lastUpdated.getTime() : 0}`}
              data={ucData}
              style={ucStyle}
              onEachFeature={onEachUCFeature}
              eventHandlers={{
                add: (event) => {
                  // Pull the UC polygon layer above the tile basemap so the
                  // flood-risk fills aren't muted by the OSM raster underneath.
                  const layer = event.target;
                  if (layer && typeof layer.bringToFront === 'function') {
                    layer.bringToFront();
                  }
                },
              }}
            />
          )}
          {basinData && (
            <GeoJSON data={basinData} style={basinStyle} />
          )}
          {riverData && (
            <GeoJSON data={riverData} style={riverStyle} />
          )}
        </MapContainer>

        {/* Search Bar */}
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search UC or District"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <div
              className={`mic-icon ${isListening ? 'listening' : ''}`}
              onClick={handleMicrophoneClick}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z" fill="currentColor"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </form>
        </div>

        {/* Map Guide Card */}
        <div className="map-guide">
          <div className="card-header">
            <h3>Map Legend</h3>
            <div className="header-line"></div>
          </div>
          <div className="guide-section">
            <div className="guide-item">
              <div className="guide-line chenab-line"></div>
              <span>Chenab River</span>
            </div>
            <div className="guide-item">
              <div className="guide-square boundary-square"></div>
              <span>UC Boundaries</span>
            </div>
            <div className="guide-item info-text">
              <span>% = Flood Risk Level</span>
            </div>
          </div>
          
          <div className="risk-levels">
            <h4>FLOOD RISK LEVELS</h4>
            <div className="risk-list">
              <div className="risk-item">
                <div className="risk-dot exc-high"></div>
                <span className="risk-label">EXC. HIGH</span>
                <span className="risk-percent">81–100%</span>
              </div>
              <div className="risk-item">
                <div className="risk-dot very-high"></div>
                <span className="risk-label">VERY HIGH</span>
                <span className="risk-percent">61–80%</span>
              </div>
              <div className="risk-item">
                <div className="risk-dot high"></div>
                <span className="risk-label">HIGH</span>
                <span className="risk-percent">41–60%</span>
              </div>
              <div className="risk-item">
                <div className="risk-dot medium"></div>
                <span className="risk-label">MEDIUM</span>
                <span className="risk-percent">21–40%</span>
              </div>
              <div className="risk-item">
                <div className="risk-dot low"></div>
                <span className="risk-label">LOW</span>
                <span className="risk-percent">0–20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Basin Overview Card */}
        <div className="basin-overview">
          <div className="overview-header">
            <h3 className="overview-title">Basin Overview</h3>
            <div className="live-badge">
              <span className="live-dot"></span>
              <span>LIVE</span>
            </div>
          </div>
          <p className="overview-timestamp">Updated {getTimeAgo(basinStats.lastUpdated)}</p>
          
          <div className="overview-rows">
            {/* UCs Monitored */}
            <div className="overview-row">
              <div className="icon-box uc-monitored">
                <MapPinned size={16} />
              </div>
              <span className="row-label">UCs Monitored</span>
              <span className="row-value blue">{basinStats.total || 0}</span>
            </div>
            
            {/* LOW Risk */}
            <div className="overview-row">
              <div className="icon-box low-risk">
                <ShieldCheck size={16} />
              </div>
              <span className="row-label">LOW Risk</span>
              <span className="row-value yellow">{basinStats.low || 0}</span>
            </div>
            
            {/* MEDIUM Risk */}
            <div className="overview-row">
              <div className="icon-box medium-risk">
                <Waves size={16} />
              </div>
              <span className="row-label">MEDIUM Risk</span>
              <span className="row-value orange">{basinStats.medium || 0}</span>
            </div>
            
            {/* HIGH Risk */}
            <div className="overview-row">
              <div className="icon-box high-risk">
                <TriangleAlert size={16} />
              </div>
              <span className="row-label">HIGH Risk</span>
              <span className="row-value red">{basinStats.high || 0}</span>
            </div>
            
            {/* VERY HIGH Risk */}
            <div className="overview-row">
              <div className="icon-box very-high-risk">
                <TrendingUp size={16} />
              </div>
              <span className="row-label">VERY HIGH Risk</span>
              <span className="row-value purple">{basinStats.veryHigh || 0}</span>
            </div>
            
            {/* EXC. HIGH Risk */}
            <div className="overview-row">
              <div className="icon-box exc-high-risk">
                <ShieldAlert size={16} />
              </div>
              <span className="row-label">EXC. HIGH Risk</span>
              <span className="row-value maroon">{basinStats.excHigh || 0}</span>
            </div>
          </div>
          
          <button
            type="button"
            className="analytics-button"
            onClick={() => setShowBasinSummary(true)}
          >
            View Basin Summary <ArrowRight size={14} />
          </button>
        </div>

        {/* Custom Zoom Controls */}
        <div className="zoom-controls">
          <div className="zoom-group">
            <button onClick={handleZoomIn} className="zoom-btn zoom-btn-in" aria-label="Zoom in" title="Zoom in">
              <Plus size={18} strokeWidth={2.5} />
            </button>
            <span className="zoom-divider" aria-hidden="true" />
            <button onClick={handleZoomOut} className="zoom-btn zoom-btn-out" aria-label="Zoom out" title="Zoom out">
              <Minus size={18} strokeWidth={2.5} />
            </button>
          </div>
          <button className="locate-btn" aria-label="Locate me" title="Locate me">
            <Navigation size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Basemap Toggle */}
        <div className="basemap-toggle">
          <span className="toggle-label">Map</span>
          <button
            onClick={() => setBasemapType(basemapType === 'streets' ? 'satellite' : 'streets')}
            className={`toggle-switch ${basemapType === 'satellite' ? 'active' : ''}`}
            aria-label="Toggle basemap"
          >
            <div className="toggle-slider"></div>
          </button>
          <span className="toggle-label">Satellite</span>
        </div>

        {showBasinSummary && (
          <BasinSummaryModal
            stats={basinStats}
            lastUpdatedLabel={getTimeAgo(basinStats.lastUpdated)}
            onClose={() => setShowBasinSummary(false)}
          />
        )}
      </div>
    </div>
  );
};

function BasinSummaryModal({ stats, lastUpdatedLabel, onClose }) {
  const total = stats.total || 0;
  const pct = (value) => {
    if (!total || !value) return '0.0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  // Pick the highest-risk bucket that actually has UCs in it.
  const HIGHEST_TIERS = [
    { key: 'excHigh',  label: 'EXC. HIGH',  color: '#7F1D1D' },
    { key: 'veryHigh', label: 'VERY HIGH',  color: '#9333EA' },
    { key: 'high',     label: 'HIGH',       color: '#EF4444' },
    { key: 'medium',   label: 'MEDIUM',     color: '#F97316' },
    { key: 'low',      label: 'LOW',        color: '#EAB308' },
  ];
  const highest = HIGHEST_TIERS.find((tier) => (stats[tier.key] || 0) > 0) ?? null;

  const summaryNote =
    highest?.key === 'excHigh'
      ? 'Some UCs are in Extremely High Risk'
      : highest?.key === 'veryHigh'
        ? 'Some UCs are in Very High Risk'
        : highest?.key === 'high'
          ? 'Some UCs are in High Risk'
          : highest?.key === 'medium'
            ? 'Some UCs are in Medium Risk'
            : highest?.key === 'low'
              ? 'All monitored UCs are in Low Risk'
              : 'No risk data yet';

  return (
    <div
      className="basin-summary-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="basin-summary-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="basin-summary-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="basin-summary-header">
          <span className="basin-summary-icon" aria-hidden="true">
            <BarChart3 size={20} strokeWidth={2.2} />
          </span>
          <div className="basin-summary-titles">
            <h2 id="basin-summary-title" className="basin-summary-title">
              Chenab Basin Summary
            </h2>
            <p className="basin-summary-subtitle">
              Overview of flood risk across all monitored UCs in the Chenab River Basin.
            </p>
          </div>
          <button
            type="button"
            className="basin-summary-close"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={18} strokeWidth={2.4} />
          </button>
        </header>

        <div className="basin-summary-grid">
          <BasinStatCard
            tone="blue"
            icon={<Users size={18} strokeWidth={2.2} />}
            value={total}
            label="Total UCs Monitored"
          />
          <BasinStatCard
            tone="yellow"
            icon={<ShieldCheck size={18} strokeWidth={2.2} />}
            value={stats.low || 0}
            label="LOW Risk"
            sub={`(${pct(stats.low)})`}
          />
          <BasinStatCard
            tone="orange"
            icon={<Waves size={18} strokeWidth={2.2} />}
            value={stats.medium || 0}
            label="MEDIUM Risk"
            sub={`(${pct(stats.medium)})`}
          />
          <BasinStatCard
            tone="red"
            icon={<TriangleAlert size={18} strokeWidth={2.2} />}
            value={stats.high || 0}
            label="HIGH Risk"
            sub={`(${pct(stats.high)})`}
          />
          <BasinStatCard
            tone="purple"
            icon={<TrendingUp size={18} strokeWidth={2.2} />}
            value={stats.veryHigh || 0}
            label="VERY HIGH Risk"
            sub={`(${pct(stats.veryHigh)})`}
          />
          <BasinStatCard
            tone="maroon"
            icon={<ShieldAlert size={18} strokeWidth={2.2} />}
            value={stats.excHigh || 0}
            label="EXC. HIGH Risk"
            sub={`(${pct(stats.excHigh)})`}
          />
        </div>

        <div className="basin-summary-meta">
          <div className="basin-summary-meta-card">
            <span className="basin-summary-meta-icon basin-summary-meta-icon--fire" aria-hidden="true">
              <Flame size={16} strokeWidth={2.2} />
            </span>
            <div className="basin-summary-meta-text">
              <span className="basin-summary-meta-label">Highest Current Risk</span>
              <strong
                className="basin-summary-meta-value"
                style={highest ? { color: highest.color } : undefined}
              >
                {highest?.label ?? '—'}
              </strong>
              <span className="basin-summary-meta-sub">{summaryNote}</span>
            </div>
          </div>
          <div className="basin-summary-meta-card">
            <span className="basin-summary-meta-icon basin-summary-meta-icon--cal" aria-hidden="true">
              <CalendarDays size={16} strokeWidth={2.2} />
            </span>
            <div className="basin-summary-meta-text">
              <span className="basin-summary-meta-label">Last Updated</span>
              <strong className="basin-summary-meta-value basin-summary-meta-value--plain">
                {stats.lastUpdated
                  ? stats.lastUpdated.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  : '—'}
              </strong>
              <span className="basin-summary-meta-sub">{lastUpdatedLabel}</span>
            </div>
          </div>
        </div>

        <div className="basin-summary-note">
          <span className="basin-summary-note-icon" aria-hidden="true">
            <Info size={14} strokeWidth={2.2} />
          </span>
          <p>
            This summary represents UC-level flood risk distribution across the Chenab Basin.
            Click on any UC on the map to view more details.
          </p>
        </div>
      </div>
    </div>
  );
}

function BasinStatCard({ tone, icon, value, label, sub }) {
  return (
    <div className={`basin-stat-card basin-stat-card--${tone}`}>
      <span className="basin-stat-icon" aria-hidden="true">{icon}</span>
      <div className="basin-stat-body">
        <span className="basin-stat-value">{value}</span>
        <span className="basin-stat-label">{label}</span>
        {sub && <span className="basin-stat-sub">{sub}</span>}
      </div>
    </div>
  );
}

export default MapPage;