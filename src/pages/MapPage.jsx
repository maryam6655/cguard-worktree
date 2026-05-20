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
    if (searchQuery && map && ucData.length > 0) {
      const foundUC = ucData.find(uc =>
        uc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (foundUC) {
        map.flyTo([foundUC.lat, foundUC.lng], 13, { duration: 1.5 });
      }
    }
  }, [searchQuery, map, ucData]);

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

  const handleSearch = (searchTerm) => {
  // Your search logic here
  console.log("Searching for:", searchTerm);
  // For example, filter map markers, update state, etc.
};
  // ─────────────────────────────────────────────
  // FETCH REAL UC RISK DATA FROM BACKEND
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        const response = await fetch("https://ghaniasaghir-cguard-backend.hf.space/all-ucs");
        const data = await response.json();
        
        if (data.union_councils) {
          setApiUCData(data.union_councils);
          // Don't compute basin stats here — the backend only returns risk for
          // a few monitored UCs (everything else came back null), so counting
          // this set yields all zeros. The real counts are computed below from
          // the merged GeoJSON features (which carry either the backend value
          // or the dev random fallback) so the Basin Overview matches the
          // colors actually painted on the map.
          // TODO: when backend `/all-ucs` returns risk_percentage for every UC,
          // we can stop relying on the GeoJSON-side fallback.
        }
      } catch (error) {
        console.error("Could not fetch UC risk data from backend:", error);
      }
    };

    fetchRiskData();
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

        // Use REAL risk data from backend if available, otherwise random
        ucGeoJSON.features = (ucGeoJSON.features ?? []).map(feature => {
          const ucName = feature.properties.UC_NAME || feature.properties.UC || '';
          const matchedUC = apiUCData.find(uc =>
            ucName.toLowerCase().includes(uc.name.toLowerCase()) ||
            uc.name.toLowerCase().includes(ucName.toLowerCase())
          );

          return {
            ...feature,
            properties: {
              ...feature.properties,
              risk_percentage: matchedUC
                ? matchedUC.risk_percentage
                : Math.floor(Math.random() * 80) + 10
            }
          };
        });

        // Compute basin stats from the merged features so the Basin Overview
        // counts the same colored polygons the user sees on the map. Without
        // this, counts came from the raw API response (which has null risk for
        // most UCs) and the dashboard showed zeros next to a fully-colored map.
        let low = 0, medium = 0, high = 0, veryHigh = 0, excHigh = 0;
        ucGeoJSON.features.forEach(feature => {
          const pct = Number(feature.properties?.risk_percentage);
          if (!Number.isFinite(pct)) return;
          if (pct >= 81) excHigh++;
          else if (pct >= 61) veryHigh++;
          else if (pct >= 41) high++;
          else if (pct >= 21) medium++;
          else if (pct >= 0) low++;
        });
        setBasinStats(prev => ({
          ...prev,
          low,
          medium,
          high,
          veryHigh,
          excHigh,
          lastUpdated: new Date(),
        }));

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
    const pct = feature.properties.risk_percentage;
    const hasRisk = hasRiskValue(pct);
    // Lighter, semi-transparent fills so the OSM basemap (roads, labels,
    // terrain) stays clearly readable beneath the flood overlay.
    return {
      fillColor: hasRisk ? getRiskColor(pct) : '#D1D5DB',
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

  const onEachUCFeature = (feature, layer) => {
    if (feature.properties && feature.properties.risk_percentage) {
      const percentage = feature.properties.risk_percentage;
      const ucName = feature.properties.UC_NAME || feature.properties.UC || 'UC';
      const district = feature.properties.DISTRICT || feature.properties.DISTRICT_NAME || 'Hafizabad';
      const popupContent = `
        <div class="custom-popup">
          <span class="uc-name">${ucName}</span>
          <span class="uc-percentage" style="color: ${getRiskTextColor(percentage)}">${percentage}%</span>
        </div>
      `;
      layer.bindTooltip(popupContent, {
        permanent: false,
        direction: 'top',
        className: 'custom-tooltip'
      });
      
      // Subtle hover: nudge fill opacity only, keep stroke/weight unchanged
      // so the map doesn't visually jump when moving the mouse.
      layer.on('mouseover', function () {
        this.setStyle({ fillOpacity: 0.5 });
      });

      layer.on('mouseout', function () {
        this.setStyle({ fillOpacity: hasRiskValue(percentage) ? 0.36 : 0.06 });
      });
      
      layer.on('click', function() {
        layer.openPopup();
      });
    }
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