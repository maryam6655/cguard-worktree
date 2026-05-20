import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/MapSection.css';

// Mock API data - replace with real API calls later
const mockUCData = [
  { id: 1, name: 'UC Kot Khaira', riskPercentage: 27, lat: 32.15, lng: 74.25 },
  { id: 2, name: 'UC Annkar', riskPercentage: 35, lat: 32.12, lng: 74.45 },
  { id: 3, name: 'UC Hafizabad', riskPercentage: 32, lat: 32.05, lng: 74.35 },
  { id: 4, name: 'UC Kot Saleem', riskPercentage: 22, lat: 32.08, lng: 74.15 },
  { id: 5, name: 'UC Noor Pur', riskPercentage: 34, lat: 31.95, lng: 74.45 },
  { id: 6, name: 'UC Pindi Bhattian', riskPercentage: 75, lat: 31.85, lng: 74.30 }
];

// Custom hook for map controls
function MapController({ searchQuery, onMapReady, ucData }) {
  const map = useMap();
  
  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  useEffect(() => {
    if (searchQuery && map && ucData.length > 0) {
      // Search for UC by name
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

const MapSection = () => {
  const [basinData, setBasinData] = useState(null);
  const [riverData, setRiverData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [map, setMap] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const mapRef = useRef();

  // Load GeoJSON data
  useEffect(() => {
    // Use mock data for demo
    setBasinData(generateMockBasinData());
    setRiverData(generateMockRiverData());
  }, []);

  // Generate mock basin data with risk data
  const generateMockBasinData = () => ({
    type: 'FeatureCollection',
    features: mockUCData.map(uc => ({
      type: 'Feature',
      properties: { 
        name: uc.name, 
        risk_percentage: uc.riskPercentage,
        id: uc.id
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [uc.lng - 0.05, uc.lat - 0.05],
          [uc.lng + 0.05, uc.lat - 0.05],
          [uc.lng + 0.05, uc.lat + 0.05],
          [uc.lng - 0.05, uc.lat + 0.05],
          [uc.lng - 0.05, uc.lat - 0.05]
        ]]
      }
    }))
  });

  // Generate mock river data
  const generateMockRiverData = () => ({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Chenab River' },
        geometry: {
          type: 'LineString',
          coordinates: [[74.1, 31.8], [74.2, 31.9], [74.3, 32.0], [74.4, 32.1], [74.5, 32.2]]
        }
      }
    ]
  });

  // Risk level color mapping
  const getRiskColor = (percentage) => {
    if (percentage > 75) return '#dc2626'; // Critical - Red
    if (percentage >= 50) return '#ea580c'; // High - Orange
    if (percentage >= 25) return '#facc15'; // Moderate - Yellow
    return '#16a34a'; // Low - Green
  };

  // Risk level text color for better contrast
  const getRiskTextColor = (percentage) => {
    if (percentage > 75) return '#dc2626';
    if (percentage >= 50) return '#ea580c';
    if (percentage >= 25) return '#ca8a04';
    return '#16a34a';
  };

  // Basin style function
  const basinStyle = (feature) => ({
    fillColor: getRiskColor(feature.properties.risk_percentage),
    weight: 1,
    opacity: 0.8,
    color: 'white',
    dashArray: '',
    fillOpacity: 0.6
  });

  // River style with glow effect
  const riverStyle = {
    color: '#3b82f6',
    weight: 4,
    opacity: 0.9,
    dashArray: '',
    lineCap: 'round',
    lineJoin: 'round'
  };

  // Custom popup content for UC labels
  const onEachBasinFeature = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      const percentage = feature.properties.risk_percentage;
      const popupContent = `
        <div class="custom-popup">
          <span class="uc-name">${feature.properties.name}</span>
          <span class="uc-percentage" style="color: ${getRiskTextColor(percentage)}">${percentage}%</span>
        </div>
      `;
      
      // Create permanent tooltip (always visible)
      layer.bindTooltip(popupContent, {
        permanent: true,
        direction: 'center',
        className: 'custom-tooltip'
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
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
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      alert('Speech recognition not supported in this browser');
    }
  };

  const handleZoomIn = () => {
    if (map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.zoomOut();
    }
  };

  return (
    <section id="map" className="map-section-wrapper">
      <div className="map-section-header">
        <h2 className="section-title">Live Flood Risk Map</h2>
        <p className="section-subtitle">Interactive visualization of flood risk across Chenab River Basin</p>
      </div>

      <div className="map-page">
        <div className="map-container">
          <MapContainer
            center={[32.0, 74.3]}
            zoom={11}
            className="leaflet-map"
            ref={mapRef}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapController 
              searchQuery={searchQuery} 
              onMapReady={setMap}
              ucData={mockUCData}
            />
            
            {/* Basin boundaries with risk coloring */}
            {basinData && (
              <GeoJSON
                data={basinData}
                style={basinStyle}
                onEachFeature={onEachBasinFeature}
              />
            )}
            
            {/* Chenab River with glow effect */}
            {riverData && (
              <GeoJSON
                data={riverData}
                style={riverStyle}
              />
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

          {/* Map Guide Box */}
          <div className="map-guide">
            <h3>Map Guide</h3>
            <div className="guide-item">
              <div className="guide-line chenab-line"></div>
              <span>Chenab River</span>
            </div>
            <div className="guide-item">
              <div className="guide-square boundary-square"></div>
              <span>UC Boundaries</span>
            </div>
            <div className="guide-item">
              <span>% = Flood Risk</span>
            </div>
            <div className="risk-levels">
              <h4>FLOOD RISK LEVELS</h4>
              <div className="risk-item">
                <div className="risk-dot exc-high"></div>
                <span>EXC. HIGH</span>
                <span className="risk-percent">81–100%</span>
              </div>
              <div className="risk-item">
                <div className="risk-dot very-high"></div>
                <span>VERY HIGH</span>
                <span className="risk-percent">61–80%</span>
              </div>
              <div className="risk-item">
                <div className="risk-dot high"></div>
                <span>HIGH</span>
                <span className="risk-percent">41–60%</span>
              </div>
              <div className="risk-item">
                <div className="risk-dot medium"></div>
                <span>MEDIUM</span>
                <span className="risk-percent">21–40%</span>
              </div>
              <div className="risk-item">
                <div className="risk-dot low"></div>
                <span>LOW</span>
                <span className="risk-percent">0–20%</span>
              </div>
            </div>
          </div>

          {/* Basin Overview Box */}
          <div className="basin-overview">
            <h3>Basin Overview</h3>
            <p className="updated">Updated 3 min ago</p>
            
            <div className="stat-item">
              <div className="stat-icon monitored"></div>
              <div className="stat-content">
                <span className="stat-number">156</span>
                <span className="stat-label">UCs Monitored</span>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon critical"></div>
              <div className="stat-content">
                <span className="stat-number">8</span>
                <span className="stat-label">Critical Risk</span>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon high"></div>
              <div className="stat-content">
                <span className="stat-number">23</span>
                <span className="stat-label">High Risk</span>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon moderate"></div>
              <div className="stat-content">
                <span className="stat-number">47</span>
                <span className="stat-label">Moderate Risk</span>
              </div>
            </div>
          </div>

          {/* Custom Zoom Controls */}
          <div className="zoom-controls">
            <button onClick={handleZoomIn} className="zoom-btn" aria-label="Zoom in">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button onClick={handleZoomOut} className="zoom-btn" aria-label="Zoom out">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
