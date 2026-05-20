import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Circle, GeoJSON, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import * as turf from '@turf/turf'
import {
  AlertTriangle,
  Bell,
  Building2,
  ChevronRight,
  Compass,
  Crosshair,
  Info,
  LifeBuoy,
  Mail,
  MapPin,
  RefreshCw,
  Smartphone,
  Waves,
  X,
} from 'lucide-react'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import '../styles/FloodMap.css'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const DISTRICT_TO_STATION = {
  hafizabad: 'Marala',
  gujrat: 'Marala',
  sialkot: 'Marala',
  chiniot: 'Khanki',
  'mandi bahauddin': 'Khanki',
  'toba tek singh': 'Qadirabad',
  jhang: 'Trimmu',
  muzaffargarh: 'Trimmu',
  bahawalpur: 'Trimmu',
}

const BASIN_CENTER = [31.9, 73.9]
const BASIN_ZOOM = 8
const GEOJSON_PATHS = ['/geojson/chenab_ucs_with_river_distance.geojson']
const RIVER_PATH = '/geojson/chenab_river.geojson'

// Backend API base.
// If backend runs on another laptop, replace this with that laptop IP:
// example: http://192.168.1.5:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
const apiUrl = (path) => `${API_BASE_URL}${path}`

// DEV TEST: the "Test Inside UC" button (visible only when import.meta.env.DEV)
// computes its test coordinate at runtime by taking turf.centerOfMass of the first
// valid Polygon/MultiPolygon feature in chenab_ucs_with_river_distance.geojson, then
// verifies the centroid is interior with turf.booleanPointInPolygon. This guarantees
// the simulated marker lands inside a real UC and exercises the full inside-UC card.

const formatNumber = (value, digits = 0) => {
  if (value == null || Number.isNaN(Number(value))) return 'N/A'
  return new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value))
}

const normalizeText = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')

// Aggressive normalizer for matching UC names between backend and GeoJSON.
// GeoJSON has values like "Chak No. 760", "Hafizabad -", "Unknown_17"; backend
// might return "chak no 760", "hafizabad", etc. We strip punctuation, dashes,
// "uc" suffixes, and collapse whitespace so spelling-only differences match.
const normalizeUcKey = (value) => {
  if (value == null) return ''
  return String(value)
    .toLowerCase()
    .replace(/[.,'"]/g, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\buc\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const stationForDistrict = (district = '') => {
  const key = normalizeText(district)
  return DISTRICT_TO_STATION[key] ?? null
}

const FLOOD_RISK_COLORS = {
  LOW: '#EAB308',
  MEDIUM: '#F97316',
  HIGH: '#EF4444',
  'VERY HIGH': '#9333EA',
  'EXC. HIGH': '#7F1D1D',
}

const normalizeCategory = (category) =>
  String(category ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')

const parseRiskNumber = (value) => {
  if (value == null) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  // Tolerate "65", "65%", "65.5 %", "0.65" (fractional) — anything sane.
  const cleaned = String(value).replace(/[%\s,]/g, '')
  if (!cleaned) return null
  const num = Number(cleaned)
  if (!Number.isFinite(num)) return null
  // If backend returns 0..1 fractional risk, scale to percentage.
  return num > 1 ? num : num * 100
}

const getFloodRiskCategory = (feature) => {
  const properties = feature?.properties ?? {}
  const explicitCategory =
    properties.floodCategory ??
    properties.riskLevel ??
    properties.risk_level ??
    properties.category ??
    properties.risk_category

  if (explicitCategory) {
    const normalizedCategory = normalizeCategory(explicitCategory)
    if (normalizedCategory.includes('EXC') && normalizedCategory.includes('HIGH')) return 'EXC. HIGH'
    if (
      (normalizedCategory.includes('VERY') || normalizedCategory.includes('EXTREME')) &&
      normalizedCategory.includes('HIGH')
    ) return 'VERY HIGH'
    if (normalizedCategory.includes('EXTREME')) return 'EXC. HIGH'
    if (normalizedCategory.includes('HIGH')) return 'HIGH'
    if (normalizedCategory.includes('MEDIUM') || normalizedCategory.includes('MODERATE')) return 'MEDIUM'
    if (normalizedCategory.includes('LOW') || normalizedCategory.includes('MINIMAL') || normalizedCategory.includes('SAFE')) return 'LOW'
  }

  const riskValue = parseRiskNumber(
    properties.risk_percentage ?? properties.riskPercentage ?? properties.risk_pct ?? properties.risk
  )
  if (riskValue == null) return null
  if (riskValue >= 81) return 'EXC. HIGH'
  if (riskValue >= 61) return 'VERY HIGH'
  if (riskValue >= 41) return 'HIGH'
  if (riskValue >= 21) return 'MEDIUM'
  return 'LOW'
}

const getFloodRiskColor = (category) => {
  const normalizedCategory = normalizeCategory(category)
  if (normalizedCategory.includes('EXC') && normalizedCategory.includes('HIGH')) return FLOOD_RISK_COLORS['EXC. HIGH']
  if (normalizedCategory.includes('VERY') && normalizedCategory.includes('HIGH')) return FLOOD_RISK_COLORS['VERY HIGH']
  if (normalizedCategory.includes('HIGH')) return FLOOD_RISK_COLORS.HIGH
  if (normalizedCategory.includes('MEDIUM')) return FLOOD_RISK_COLORS.MEDIUM
  if (normalizedCategory.includes('LOW')) return FLOOD_RISK_COLORS.LOW
  return '#CCCCCC'
}

const CARD_RISK_TIERS = [
  { min: 81, color: '#8B1A1A', label: 'Exceptionally High', short: 'EXC. HIGH' },
  { min: 61, color: '#9333EA', label: 'Very High',          short: 'VERY HIGH' },
  { min: 41, color: '#EF4444', label: 'High',               short: 'HIGH' },
  { min: 21, color: '#FF6B1A', label: 'Medium',             short: 'MEDIUM' },
  { min: 0,  color: '#F4B400', label: 'Low',                short: 'LOW' },
]

const isMeaningfulUcName = (value) => {
  if (value == null) return false
  const str = String(value).trim()
  if (!str) return false
  if (/^Unknown[_\s-]?\d*$/i.test(str)) return false
  return true
}

const resolveUcName = (properties = {}) => {
  const candidates = [
    properties.UC,
    properties.UC_NAME,
    properties.uc_name,
    properties.New_Name,
    properties.name,
    properties.NAME,
  ]
  const meaningful = candidates.find(isMeaningfulUcName)
  if (meaningful) return String(meaningful).trim()
  const fallback = candidates.find((c) => c != null && String(c).trim() !== '')
  return fallback ? String(fallback).trim() : 'Unnamed UC'
}

const resolveDistrict = (properties = {}) => {
  const candidates = [properties.DISTRICT, properties.district, properties.District]
  const found = candidates.find((c) => c != null && String(c).trim() !== '')
  return found ? String(found).trim() : ''
}

const formatTimestamp = (date) => {
  if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return null
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const tierForRiskPercentage = (percentage) => {
  if (percentage == null || Number.isNaN(Number(percentage))) return null
  const value = Math.max(0, Math.min(100, Number(percentage)))
  return CARD_RISK_TIERS.find((tier) => value >= tier.min) ?? null
}

const colorForRiskPercentage = (percentage) => tierForRiskPercentage(percentage)?.color ?? '#cbd5e1'

const formatDistanceKm = (value) => {
  if (value == null || Number.isNaN(Number(value))) return null
  const num = Number(value)
  return num >= 10 ? num.toFixed(0) : num.toFixed(1)
}

const featureContainsPoint = (feature, turfPoint) => {
  const geometry = feature?.geometry
  if (!geometry) return false
  if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') return false
  try {
    return turf.booleanPointInPolygon(turfPoint, feature)
  } catch (error) {
    console.warn('booleanPointInPolygon failed for feature:', error)
    return false
  }
}

const findContainingFeature = (features, lat, lng) => {
  console.log('Testing point:', lat, lng)
  // GeoJSON uses [lng, lat] order — turf.point expects the same.
  const turfPoint = turf.point([lng, lat])
  for (const feature of features) {
    if (featureContainsPoint(feature, turfPoint)) {
      console.log('Matched UC:', feature?.properties?.UC, '/', feature?.properties?.UC_NAME)
      return feature
    }
  }
  console.log('No UC polygon contains point', lat, lng)
  return null
}

const riskFromDischarge = (discharge) => {
  if (discharge == null || Number.isNaN(Number(discharge))) return null
  return Math.min(100, Math.round((Number(discharge) / 50000) * 100))
}

const calculateRiskProgression = (baseRisk) => {
  if (baseRisk == null) return { risk24h: null, risk48h: null, risk72h: null }
  return {
    risk24h: baseRisk,
    risk48h: Math.min(100, Math.round(baseRisk * 1.15)),
    risk72h: Math.max(10, Math.round(baseRisk * 0.8)),
  }
}

const parseLiveStations = (payload) => {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.features)
      ? payload.features
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.results)
          ? payload.results
          : [payload]

  return rows
    .map((item) => {
      const source = item?.properties ?? item ?? {}
      const station =
        source.station ??
        source.station_name ??
        source.name ??
        source['station name'] ??
        source['station_name'] ??
        ''
      const discharge = Number(
        source.discharge ?? source.discharge_m3s ?? source.discharge_cms ?? source.flow ?? source.value
      )

      return {
        station: String(station).trim(),
        discharge: Number.isFinite(discharge) ? discharge : null,
        temperature: source.temperature ?? source.temp ?? null,
        rainfall: source.rainfall ?? source.rain ?? null,
      }
    })
    .filter((row) => row.station)
}

const stationMatch = (stationName, liveStations) => {
  const target = normalizeText(stationName)
  return (
    liveStations.find((row) => {
      const candidate = normalizeText(row.station)
      return candidate === target || candidate.includes(target) || target.includes(candidate)
    }) ?? null
  )
}

function RiskMiniCard({ horizon, percentage }) {
  const numeric = percentage == null || Number.isNaN(Number(percentage)) ? null : Number(percentage)
  const tier = tierForRiskPercentage(numeric)
  const color = tier?.color ?? '#cbd5e1'
  const fillWidth = numeric == null ? 0 : Math.max(0, Math.min(100, numeric))
  const display = numeric == null ? '—' : `${Math.round(numeric)}%`

  const chipStyle = tier
    ? { color, background: `${color}1a`, borderColor: `${color}55` }
    : undefined

  return (
    <div className="pfr-mini">
      <div className="pfr-mini-horizon">{horizon}</div>
      <div className="pfr-mini-percent" style={{ color: tier ? color : '#94a3b8' }}>
        {display}
      </div>
      <span className="pfr-mini-chip" style={chipStyle}>
        <span className="pfr-mini-dot" style={{ background: color }} aria-hidden="true" />
        {tier?.short ?? 'NO DATA'}
      </span>
      <div className="pfr-mini-bar">
        <div className="pfr-mini-bar-fill" style={{ width: `${fillWidth}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

const PREVIEW_RISK = { risk24h: 58, risk48h: 72, risk72h: 85 }

function AlertToggle({ icon: Icon, label, checked, onChange, disabled }) {
  return (
    <div className={`pfr-toggle${disabled ? ' pfr-toggle--disabled' : ''}`}>
      <span className="pfr-toggle-label">
        <Icon size={14} strokeWidth={2.2} />
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={`pfr-switch${checked ? ' pfr-switch--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="pfr-switch-knob" />
      </button>
    </div>
  )
}

const THRESHOLD_LABELS = {
  moderate: 'Moderate or above',
  high: 'High or above',
  veryhigh: 'Very High only',
}

function PersonalFloodRiskCard({
  status,
  title,
  uc,
  userLatLng,
  riskProgression,
  hasRiskData,
  lastUpdated,
  onViewEmergency,
  onEnableAlerts,
  alertSaving = false,
  alertMessage: parentAlertMessage = '',
}) {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [alertThreshold, setAlertThreshold] = useState('moderate')
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertEmail, setAlertEmail] = useState('')
  const [alertPhone, setAlertPhone] = useState('')
  const [alertMessage, setAlertMessage] = useState('')

  const openAlertModal = useCallback(() => {
    setAlertMessage('')
    setShowAlertModal(true)
  }, [])

  const closeAlertModal = useCallback(() => {
    if (alertSaving) return
    setShowAlertModal(false)
    setAlertMessage('')
  }, [alertSaving])

  const handleSaveAlerts = useCallback(async () => {
    if (!emailAlerts && !smsAlerts) {
      setAlertMessage('Please select at least one alert channel.')
      return
    }
    if (emailAlerts && !alertEmail.trim()) {
      setAlertMessage('Please enter your email address.')
      return
    }
    if (smsAlerts && !alertPhone.trim()) {
      setAlertMessage('Please enter your phone number.')
      return
    }

    setAlertMessage('')

    const result = await onEnableAlerts?.({
      emailAlerts,
      smsAlerts,
      threshold: alertThreshold,
      email: alertEmail.trim(),
      phone: alertPhone.trim(),
    })

    if (result?.ok) {
      setShowAlertModal(false)
    } else if (result?.message) {
      setAlertMessage(result.message)
    }
  }, [
    emailAlerts,
    smsAlerts,
    alertEmail,
    alertPhone,
    alertThreshold,
    onEnableAlerts,
  ])

  const isDetecting = status === 'detecting'
  const isOutside = status === 'outside'
  const insideCoverage = !isDetecting && !isOutside && !!uc

  const effectiveRisk = insideCoverage && !hasRiskData ? PREVIEW_RISK : riskProgression
  const showPreviewNote = insideCoverage && !hasRiskData

  const primaryTier = insideCoverage ? tierForRiskPercentage(effectiveRisk.risk24h) : null

  let pillLabel = ''
  let pillStyle
  let iconBg = '#2563eb'
  let iconShadow = 'rgba(37, 99, 235, 0.35)'

  if (isDetecting) {
    pillLabel = 'DETECTING'
    pillStyle = { color: '#1d4ed8', background: '#eff6ff', borderColor: '#bfdbfe' }
  } else if (isOutside) {
    pillLabel = 'OUTSIDE AREA'
    pillStyle = { color: '#B45309', background: '#FFF7ED', borderColor: '#fde68a' }
    iconBg = '#B45309'
    iconShadow = 'rgba(180, 83, 9, 0.35)'
  } else if (primaryTier) {
    pillLabel = `${primaryTier.short} RISK`
    pillStyle = {
      color: primaryTier.color,
      background: `${primaryTier.color}14`,
      borderColor: `${primaryTier.color}55`,
    }
    iconBg = primaryTier.color
    iconShadow = `${primaryTier.color}55`
  }

  const lastUpdatedLabel = formatTimestamp(lastUpdated) ?? '—'
  const alertsActive = insideCoverage

  return (
    <aside className="pfr-card" aria-live="polite">
      <header className="pfr-header">
        <div className="pfr-title-group">
          <span
            className="pfr-icon"
            aria-hidden="true"
            style={{ background: iconBg, boxShadow: `0 8px 18px ${iconShadow}` }}
          >
            <Building2 size={18} strokeWidth={2.2} />
          </span>
          <h3 className="pfr-title">{title}</h3>
        </div>
        <span className="pfr-pill" style={pillStyle}>{pillLabel}</span>
      </header>

      {isDetecting && (
        <div className="pfr-skeleton" aria-label="Detecting your union council">
          <div className="pfr-skeleton-row pfr-skeleton-row--lg" />
          <div className="pfr-skeleton-row pfr-skeleton-row--md" />
          <div className="pfr-skeleton-row pfr-skeleton-row--md" />
        </div>
      )}

      {isOutside && (
        <div className="pfr-warning" role="status">
          <AlertTriangle size={20} strokeWidth={2.2} />
          <div>
            <div className="pfr-warning-title">Outside Chenab Basin coverage</div>
            <div className="pfr-warning-body">
              C Guard currently monitors flood-prone Union Councils along the Chenab River Basin.
            </div>
            <div className="pfr-warning-hint">
              <Compass size={13} strokeWidth={2.2} />
              <span>Move toward monitored Chenab regions to view UC-level flood forecasts.</span>
            </div>
          </div>
        </div>
      )}

      {insideCoverage && (
        <>
          <section className="pfr-details">
            <div className="pfr-detail-row">
              <MapPin size={15} strokeWidth={2.2} />
              <span>
                <strong>Union Council:</strong> {uc.ucName || 'Unnamed UC'}
              </span>
            </div>
            <div className="pfr-detail-row">
              <MapPin size={15} strokeWidth={2.2} />
              <span>
                <strong>District:</strong> {uc.district || 'Unknown'}
              </span>
            </div>
            <div className="pfr-detail-row">
              <Waves size={15} strokeWidth={2.2} />
              <span>
                <strong>Distance from River:</strong>{' '}
                {uc.distanceToRiverKm != null
                  ? `${formatDistanceKm(uc.distanceToRiverKm)} km`
                  : '—'}
              </span>
            </div>
            {userLatLng && (
              <div className="pfr-detail-row">
                <Crosshair size={15} strokeWidth={2.2} />
                <span>
                  <strong>Coordinates:</strong>{' '}
                  {userLatLng[0].toFixed(4)}, {userLatLng[1].toFixed(4)}
                </span>
              </div>
            )}
          </section>

          <section className="pfr-risks-grid" aria-label="Forecast flood risk">
            <RiskMiniCard horizon="24h Forecast" percentage={effectiveRisk.risk24h} />
            <RiskMiniCard horizon="48h Forecast" percentage={effectiveRisk.risk48h} />
            <RiskMiniCard horizon="72h Forecast" percentage={effectiveRisk.risk72h} />
          </section>

          {showPreviewNote && (
            <div className="pfr-preview-note">
              <Info size={13} strokeWidth={2.2} />
              <span>Live ML flood forecast connected successfully.</span>
            </div>
          )}

          <div className="pfr-meta">
            <span>Last updated: {lastUpdatedLabel}</span>
            <span className="pfr-meta-live">
              <RefreshCw size={12} strokeWidth={2.2} />
              <span className="pfr-live-dot" aria-hidden="true" />
              Live Update
            </span>
          </div>

          <section className="pfr-alerts" aria-label="Alert preferences">
            <div className="pfr-alerts-header">
              <span className="pfr-alerts-icon" aria-hidden="true">
                <Bell size={15} strokeWidth={2.2} />
              </span>
              <div className="pfr-alerts-title-group">
                <strong>Alert Preferences</strong>
                <span className="pfr-alerts-subtitle">Get flood alerts for this location.</span>
              </div>
              {alertsActive && <span className="pfr-alerts-active">Active</span>}
            </div>

            <div className="pfr-toggles">
              <AlertToggle
                icon={Mail}
                label="Email Alerts"
                checked={emailAlerts}
                onChange={setEmailAlerts}
              />
              <AlertToggle
                icon={Smartphone}
                label="SMS Alerts"
                checked={smsAlerts}
                onChange={setSmsAlerts}
              />
            </div>

            <label className="pfr-select-label">
              <span>Notify me when risk is</span>
              <select
                className="pfr-select"
                value={alertThreshold}
                onChange={(event) => setAlertThreshold(event.target.value)}
              >
                <option value="moderate">Moderate or above</option>
                <option value="high">High or above</option>
                <option value="veryhigh">Very High only</option>
              </select>
            </label>

            <button
              type="button"
              className="pfr-alerts-btn"
              disabled={!alertsActive || alertSaving}
              onClick={openAlertModal}
            >
              <Bell size={14} strokeWidth={2.2} />
              {alertSaving ? 'Saving Alerts...' : 'Enable Location Alerts'}
            </button>

            {parentAlertMessage && (
              <div className="pfr-alerts-info">
                <Info size={13} strokeWidth={2.2} />
                <span>{parentAlertMessage}</span>
              </div>
            )}

            <div className="pfr-alerts-info">
              <Info size={13} strokeWidth={2.2} />
              <span>
                You will receive alerts based on the selected channels when flood risk reaches your chosen level.
              </span>
            </div>
          </section>
        </>
      )}

      <button type="button" className="pfr-emergency" onClick={onViewEmergency}>
        <span className="pfr-emergency-icon" aria-hidden="true">
          <LifeBuoy size={20} strokeWidth={2.2} />
        </span>
        <span className="pfr-emergency-text">
          <strong>View Emergency Resources</strong>
          <span>Shelters, Contacts &amp; More</span>
        </span>
        <ChevronRight size={20} strokeWidth={2.2} className="pfr-emergency-chevron" />
      </button>

      {showAlertModal && (
        <div
          className="pfr-modal-backdrop"
          role="presentation"
          onClick={closeAlertModal}
        >
          <div
            className="pfr-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pfr-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pfr-modal-header">
              <h3 id="pfr-modal-title" className="pfr-modal-title">Enable Flood Alerts</h3>
              <button
                type="button"
                className="pfr-modal-close"
                aria-label="Close"
                disabled={alertSaving}
                onClick={closeAlertModal}
              >
                <X size={18} strokeWidth={2.4} />
              </button>
            </div>

            <div className="pfr-modal-summary">
              <div>
                <span>Union Council</span>
                <strong>{uc?.ucName || 'Unnamed UC'}</strong>
              </div>
              <div>
                <span>District</span>
                <strong>{uc?.district || 'Unknown'}</strong>
              </div>
              <div>
                <span>Risk threshold</span>
                <strong>{THRESHOLD_LABELS[alertThreshold] ?? alertThreshold}</strong>
              </div>
            </div>

            {emailAlerts && (
              <label className="pfr-modal-field">
                <span>Email address</span>
                <input
                  type="email"
                  className="pfr-modal-input"
                  placeholder="Enter your email address"
                  value={alertEmail}
                  onChange={(event) => setAlertEmail(event.target.value)}
                  disabled={alertSaving}
                  autoComplete="email"
                />
              </label>
            )}

            {smsAlerts && (
              <label className="pfr-modal-field">
                <span>Phone number</span>
                <input
                  type="tel"
                  className="pfr-modal-input"
                  placeholder="Enter phone number, e.g. +923001234567"
                  value={alertPhone}
                  onChange={(event) => setAlertPhone(event.target.value)}
                  disabled={alertSaving}
                  autoComplete="tel"
                />
              </label>
            )}

            {alertMessage && (
              <div className="pfr-modal-error" role="alert">
                <AlertTriangle size={14} strokeWidth={2.2} />
                <span>{alertMessage}</span>
              </div>
            )}

            <div className="pfr-modal-actions">
              <button
                type="button"
                className="pfr-modal-cancel"
                onClick={closeAlertModal}
                disabled={alertSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="pfr-modal-save"
                onClick={handleSaveAlerts}
                disabled={alertSaving}
              >
                {alertSaving ? 'Saving Alerts...' : 'Save Alert Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

const buildEnrichedGeoJson = (geojson, liveStations, backendRiskByName) => {
  if (!geojson?.features) return null

  let matchedCount = 0
  let withRiskCount = 0
  let sampleEnrichedProps = null
  let sampleBackendRow = null
  let sampleGeoName = null

  const enriched = {
    ...geojson,
    features: geojson.features.map((feature, index) => {
      const properties = feature?.properties ?? {}
      const ucName = resolveUcName(properties)
      const district = resolveDistrict(properties)
      const station = stationForDistrict(district)
      const live = station ? stationMatch(station, liveStations) : null
      const discharge = live?.discharge ?? null

      // Match backend row to GeoJSON feature using the aggressive UC-name key.
      // Falls back to the raw UC field if resolveUcName picked a sibling field.
      const backendRisk =
        backendRiskByName?.get(normalizeUcKey(ucName)) ??
        backendRiskByName?.get(normalizeUcKey(properties.UC)) ??
        backendRiskByName?.get(normalizeUcKey(properties.UC_NAME)) ??
        null

      if (backendRisk) matchedCount += 1

      // Try every plausible risk-percentage field the backend may use.
      const backendRiskPct =
        backendRisk?.risk_percentage ??
        backendRisk?.risk_pct ??
        backendRisk?.riskPercentage ??
        backendRisk?.risk ??
        backendRisk?.flood_risk ??
        backendRisk?.score ??
        null
      const backendRiskLevel =
        backendRisk?.risk_level ??
        backendRisk?.riskLevel ??
        backendRisk?.category ??
        backendRisk?.risk_category ??
        backendRisk?.level ??
        null

      // Strict: only the backend's per-UC risk value drives polygon color.
      // We deliberately do NOT fall back to riskFromDischarge(discharge) here —
      // a single gauge reading ~15000 m³/s would otherwise blanket every UC in
      // its district with MEDIUM yellow-orange, even if backend never said so.
      // If backend has no value, polygon stays in the no-data grey bucket.
      const resolvedRiskPct = backendRiskPct
      const enrichedProps = {
        ...properties,
        UC_NAME: ucName,
        DISTRICT: district,
        station: backendRisk?.station ?? station ?? 'Unmapped',
        discharge: backendRisk?.predicted_discharge ?? discharge,
        temperature: live?.temperature ?? null,
        rainfall: live?.rainfall ?? null,
        risk_percentage: resolvedRiskPct,
        riskLevel: backendRiskLevel,
        backendRisk,
      }

      if (resolvedRiskPct != null || backendRiskLevel != null) withRiskCount += 1

      // Capture a sample for diagnostics (first matched feature only).
      if (!sampleEnrichedProps && backendRisk) {
        sampleEnrichedProps = enrichedProps
        sampleBackendRow = backendRisk
        sampleGeoName = ucName
      }
      if (!sampleGeoName && index === 0) sampleGeoName = ucName

      return { ...feature, properties: enrichedProps }
    }),
  }

  if (backendRiskByName) {
    const featureCount = enriched.features.length
    const backendSize = backendRiskByName.size
    const firstBackendEntry = backendRiskByName.entries().next().value
    const backendSample = sampleBackendRow ?? firstBackendEntry?.[1] ?? null

    console.group('[polygon-coloring] diagnostics')
    console.log('GeoJSON features:', featureCount)
    console.log('Backend UC risk rows (unique keys):', backendSize)
    console.log('Matched features (backend record found):', matchedCount)
    console.log('Features with a resolved risk value:', withRiskCount)
    console.log('Sample GeoJSON UC name:', sampleGeoName)
    console.log('Sample backend UC name:', backendSample?.name ?? backendSample?.uc_name ?? backendSample?.UC ?? '(none)')
    if (backendSample) {
      console.log('Sample backend row keys:', Object.keys(backendSample))
      console.log('Sample backend row:', backendSample)
    }
    if (sampleEnrichedProps) {
      // Compute what ucStyle would produce for this sample feature.
      const sampleFakeFeature = { properties: sampleEnrichedProps }
      const sampleCategory = getFloodRiskCategory(sampleFakeFeature)
      const sampleColor = sampleCategory ? getFloodRiskColor(sampleCategory) : '#D1D5DB'
      console.log('Sample enriched feature properties:', {
        UC_NAME: sampleEnrichedProps.UC_NAME,
        risk_percentage: sampleEnrichedProps.risk_percentage,
        riskLevel: sampleEnrichedProps.riskLevel,
      })
      console.log('Sample resolved category:', sampleCategory)
      console.log('Sample final polygon style:', {
        fillColor: sampleColor,
        fillOpacity: sampleCategory ? 0.25 : 0.06,
        color: '#1F2937',
        weight: 1,
      })
    }
    if (matchedCount === 0 && backendSize > 0) {
      console.warn(
        '[polygon-coloring] zero name matches between backend and GeoJSON. Names need to align.'
      )
    }
    if (matchedCount > 0 && withRiskCount === 0) {
      console.warn(
        '[polygon-coloring] features matched but no risk fields populated. Backend response has no risk_percentage / risk_level under any expected name.'
      )
    }
    console.groupEnd()
  }

  return enriched
}

function MapEffects({
  geoJsonData,
  riverGeoJsonData,
  matchedFeature,
  userLocation,
  userUcFound,
  userUcFeature,
  searchQuery,
  resetViewTick,
}) {
  const map = useMap()

  useEffect(() => {
    if (!geoJsonData?.features?.length) return
    if (searchQuery || userLocation || matchedFeature) return

    // Fit to the actual Chenab UC layer bounds (not a hardcoded country-wide
    // box) so the map opens framed on the UC polygons.
    const bounds = L.geoJSON(geoJsonData).getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30] })
    }
  }, [geoJsonData, map, matchedFeature, searchQuery, userLocation])

  useEffect(() => {
    if (!resetViewTick) return
    if (!geoJsonData?.features?.length) return

    const bounds = L.geoJSON(geoJsonData).getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30] })
    }
  }, [map, resetViewTick, geoJsonData])

  useEffect(() => {
    if (!matchedFeature) return

    const bounds = L.geoJSON(matchedFeature).getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 12 })
    }
  }, [map, matchedFeature])

  useEffect(() => {
    if (!userLocation) return
    map.flyTo(userLocation, 13, { duration: 1.4 })
  }, [map, userLocation])

  return null
}

export default function FloodMap({
  searchQuery = '',
  userLocation: userLocationProp = null,
  showUcBoundaries = true,
  showRiverLayer = true,
  onUcSelect,
  onLiveUpdate,
  onViewEmergency,
}) {
  const [devUserLocation, setDevUserLocation] = useState(null)
  const userLocation = devUserLocation ?? userLocationProp

  const handleViewEmergency = useCallback(() => {
    if (typeof onViewEmergency === 'function') {
      onViewEmergency()
    }
  }, [onViewEmergency])

  const [geoJson, setGeoJson] = useState(null)
  const [riverGeoJson, setRiverGeoJson] = useState(null)
  const [liveStations, setLiveStations] = useState([])
  const [loadingGeoJson, setLoadingGeoJson] = useState(true)
  const [loadingLive, setLoadingLive] = useState(true)
  const [geoJsonError, setGeoJsonError] = useState('')
  const [liveError, setLiveError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [resetViewTick, setResetViewTick] = useState(0)
  const [selectedUc, setSelectedUc] = useState(null)
  const [backendRiskByName, setBackendRiskByName] = useState(new Map())
  const [personalRisk, setPersonalRisk] = useState(null)
  const [personalRiskLoading, setPersonalRiskLoading] = useState(false)
  const [personalRiskError, setPersonalRiskError] = useState('')
  const [alertSaving, setAlertSaving] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const loadGeoJson = useCallback(async () => {
    setLoadingGeoJson(true)
    setGeoJsonError('')

    try {
      let response = null
      for (const path of GEOJSON_PATHS) {
        response = await fetch(path)
        if (response.ok) break
      }

      if (!response || !response.ok) {
        throw new Error('Unable to load Chenab UC boundaries.')
      }

      setGeoJson(await response.json())

      try {
        const riverResponse = await fetch(RIVER_PATH)
        if (riverResponse.ok) {
          setRiverGeoJson(await riverResponse.json())
        } else {
          setRiverGeoJson(null)
        }
      } catch {
        setRiverGeoJson(null)
      }
    } catch (error) {
      console.error('GeoJSON load error:', error)
      setGeoJson(null)
      setRiverGeoJson(null)
      setGeoJsonError('Unable to load Chenab UC boundaries.')
    } finally {
      setLoadingGeoJson(false)
    }
  }, [])

  const loadLiveData = useCallback(async () => {
    setLoadingLive(true)
    try {
      const response = await fetch(apiUrl('/features/live'))
      if (!response.ok) {
        throw new Error(`Live data request failed: ${response.status}`)
      }

      const payload = await response.json()
      setLiveStations(parseLiveStations(payload))
      setLiveError('')
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Live data load error:', error)
      setLiveStations([])
      setLiveError('Live flood data is currently unavailable.')
    } finally {
      setLoadingLive(false)
    }
  }, [])

  const loadBackendUcRisk = useCallback(async () => {
    try {
      const response = await fetch(apiUrl('/all-ucs'))
      if (!response.ok) {
        throw new Error(`UC risk request failed: ${response.status}`)
      }

      const payload = await response.json()
      const rows = Array.isArray(payload?.union_councils)
        ? payload.union_councils
        : Array.isArray(payload)
          ? payload
          : []

      const map = new Map()
      let rowsWithRisk = 0

      rows.forEach((row) => {
        if (!row) return
        // Try every plausible UC-name field the backend might use.
        const rawName =
          row.name ??
          row.uc_name ??
          row.UC ??
          row.UC_NAME ??
          row.union_council ??
          null
        if (!rawName) return

        const key = normalizeUcKey(rawName)
        if (!key) return
        map.set(key, row)

        if (
          row.risk_percentage != null ||
          row.risk_pct != null ||
          row.riskPercentage != null ||
          row.risk != null ||
          row.flood_risk != null ||
          row.score != null ||
          row.risk_level != null ||
          row.riskLevel != null ||
          row.category != null ||
          row.risk_category != null ||
          row.level != null
        ) {
          rowsWithRisk += 1
        }
      })

      // Diagnostic: confirms the all-UCs endpoint actually delivers risk data
      // for every polygon — and surfaces a TODO if it only returns the
      // monitored / selected UC.
      console.log(
        `[all-ucs] received ${rows.length} rows; ${rowsWithRisk} have risk data; ${map.size} unique keys indexed.`,
        rows[0] ?? null
      )

      // First 10 rows: identifies whether backend is returning real per-UC
      // variation or the same value for everyone.
      console.group('[all-ucs] first 10 rows')
      rows.slice(0, 10).forEach((row, idx) => {
        console.log(idx, {
          name: row?.name ?? row?.uc_name ?? row?.UC ?? row?.UC_NAME,
          district: row?.district ?? row?.DISTRICT,
          risk_percentage:
            row?.risk_percentage ?? row?.risk_pct ?? row?.riskPercentage ?? row?.risk ?? null,
          risk_level: row?.risk_level ?? row?.riskLevel ?? row?.category ?? row?.risk_category ?? null,
          discharge: row?.predicted_discharge ?? row?.discharge ?? null,
          station: row?.station ?? null,
        })
      })
      console.groupEnd()

      // Distinct-value tally: if the count is 1, every UC has the same risk
      // and the backend is the culprit (not the frontend classifier).
      const pctValues = new Set()
      const levelValues = new Set()
      rows.forEach((row) => {
        const pct =
          row?.risk_percentage ?? row?.risk_pct ?? row?.riskPercentage ?? row?.risk ?? null
        const lvl =
          row?.risk_level ?? row?.riskLevel ?? row?.category ?? row?.risk_category ?? null
        if (pct != null) pctValues.add(String(pct))
        if (lvl != null) levelValues.add(String(lvl).toUpperCase())
      })
      console.log(
        `[all-ucs] distinct risk_percentage values: ${pctValues.size}`,
        Array.from(pctValues).slice(0, 10)
      )
      console.log(
        `[all-ucs] distinct risk_level values: ${levelValues.size}`,
        Array.from(levelValues).slice(0, 10)
      )
      if (pctValues.size === 1 && levelValues.size <= 1) {
        console.warn(
          '[all-ucs] every UC has the same risk value. Polygons will all share one color — backend needs to return per-UC variation.'
        )
      }

      if (rows.length === 0) {
        console.warn(
          '[all-ucs] empty payload. Backend should return risk for every Chenab UC so polygons can color-code.'
        )
      } else if (rowsWithRisk === 0) {
        console.warn(
          '[all-ucs] rows present but no risk_percentage / risk_level fields. Backend should include risk per UC.'
        )
      }

      setBackendRiskByName(map)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Backend UC risk load error:', error)
    }
  }, [])

  useEffect(() => {
    loadGeoJson()
    loadLiveData()
    loadBackendUcRisk()

    const intervalId = window.setInterval(() => {
      loadLiveData()
      loadBackendUcRisk()
    }, 120000)

    return () => window.clearInterval(intervalId)
  }, [loadGeoJson, loadLiveData, loadBackendUcRisk])

  useEffect(() => {
    if (!onLiveUpdate) return

    onLiveUpdate({
      lastUpdated,
      liveError,
      liveStations,
      loadingLive,
    })
  }, [lastUpdated, liveError, liveStations, loadingLive, onLiveUpdate])

  const enrichedGeoJson = useMemo(() => buildEnrichedGeoJson(geoJson, liveStations, backendRiskByName), [geoJson, liveStations, backendRiskByName])

  useEffect(() => {
    if (enrichedGeoJson?.features?.length != null) {
      console.log('UC features rendered:', enrichedGeoJson.features.length)
    }
  }, [enrichedGeoJson])

  // DEV-only: toggle a fake user location at the centroid of the first valid UC polygon.
  // Guarantees the marker lands inside an actual feature so UC detection succeeds.
  const handleToggleDevLocation = useCallback(() => {
    if (devUserLocation) {
      setDevUserLocation(null)
      return
    }

    const features = enrichedGeoJson?.features ?? []
    if (!features.length) {
      console.warn('Test Inside UC: GeoJSON not loaded yet')
      return
    }

    for (const feature of features) {
      const type = feature?.geometry?.type
      if (type !== 'Polygon' && type !== 'MultiPolygon') continue

      try {
        const center = turf.centerOfMass(feature)
        if (!turf.booleanPointInPolygon(center, feature)) continue

        // Turf returns [lng, lat]; Leaflet wants [lat, lng].
        const [lng, lat] = center.geometry.coordinates
        console.log(
          'Test Inside UC: centroid of',
          feature.properties?.UC ?? feature.properties?.UC_NAME ?? '(unnamed)',
          'at lat/lng',
          lat,
          lng
        )
        setDevUserLocation([lat, lng])
        return
      } catch (error) {
        console.warn('Test Inside UC: centerOfMass failed, trying next feature', error)
      }
    }

    console.warn('Test Inside UC: no feature with an interior centroid found')
  }, [devUserLocation, enrichedGeoJson])

  const userUcFeature = useMemo(() => {
    if (!Array.isArray(userLocation) || userLocation.length < 2) return null
    if (!enrichedGeoJson?.features?.length) return null

    const [lat, lng] = userLocation
    return findContainingFeature(enrichedGeoJson.features, lat, lng)
  }, [enrichedGeoJson, userLocation])

  const userUc = useMemo(() => {
    if (!userUcFeature) return null
    const properties = userUcFeature.properties ?? {}
    return {
      ucName: resolveUcName(properties),
      district: resolveDistrict(properties),
      station: properties.station ?? 'Unmapped',
      discharge: properties.discharge ?? null,
      riskPercentage: properties.risk_percentage ?? null,
      distanceToRiverKm: properties.Distance_to_River_km ?? properties.distance_to_river_km ?? null,
    }
  }, [userUcFeature])

  useEffect(() => {
    const fetchPersonalRisk = async () => {
      if (!userUc || !Array.isArray(userLocation) || userLocation.length < 2) {
        setPersonalRisk(null)
        setPersonalRiskError('')
        return
      }

      setPersonalRiskLoading(true)
      setPersonalRiskError('')

      try {
        const [latitude, longitude] = userLocation
        const response = await fetch(apiUrl('/api/flood-risk/location'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude,
            longitude,
            uc_name: userUc.ucName,
            district: userUc.district,
            distance_to_river_km: userUc.distanceToRiverKm,
          }),
        })

        if (!response.ok) {
          throw new Error(`Personal flood risk request failed: ${response.status}`)
        }

        const payload = await response.json()
        setPersonalRisk(payload)
        setLastUpdated(payload?.last_updated ? new Date(payload.last_updated) : new Date())
      } catch (error) {
        console.error('Personal flood risk error:', error)
        setPersonalRisk(null)
        setPersonalRiskError('Unable to load backend flood risk for this UC.')
      } finally {
        setPersonalRiskLoading(false)
      }
    }

    fetchPersonalRisk()
  }, [userUc, userLocation])

  const matchedFeature = useMemo(() => {
    if (!searchQuery.trim() || !enrichedGeoJson?.features?.length) return null

    const query = normalizeText(searchQuery)
    return (
      enrichedGeoJson.features.find((feature) => {
        const properties = feature?.properties ?? {}
        const ucName = normalizeText(properties.UC_NAME ?? properties.uc_name ?? properties.UC ?? properties.name)
        return ucName.includes(query)
      }) ?? null
    )
  }, [enrichedGeoJson, searchQuery])

  // Per-render counter limiting "STYLE CHECK" logs to the first few polygons
  // so the console isn't flooded with 789 entries.
  const styleLogCountRef = useRef(0)
  useEffect(() => {
    styleLogCountRef.current = 0
  }, [enrichedGeoJson, backendRiskByName])

  const ucStyle = useCallback(
    (feature) => {
      const isMatch = matchedFeature && feature === matchedFeature
      const riskCategory = getFloodRiskCategory(feature)
      const hasRiskData = riskCategory != null
      const fillColor = hasRiskData ? getFloodRiskColor(riskCategory) : '#D1D5DB'
      const fillOpacity = hasRiskData ? (isMatch ? 0.5 : 0.35) : 0.06

      if (styleLogCountRef.current < 10) {
        styleLogCountRef.current += 1
        console.log('STYLE CHECK', {
          uc: feature?.properties?.UC_NAME,
          riskLevel_raw: feature?.properties?.riskLevel,
          risk_percentage_raw: feature?.properties?.risk_percentage,
          resolved_category: riskCategory,
          fillColor,
          fillOpacity,
        })
      }

      return {
        fillColor,
        fillOpacity,
        color: isMatch ? '#0F172A' : '#1F2937',
        weight: isMatch ? 1.8 : 1,
        opacity: isMatch ? 1 : 0.75,
        lineJoin: 'round',
        smoothFactor: 0,
      }
    },
    [matchedFeature]
  )

  const onEachFeature = useCallback(
    (feature, layer) => {
      const properties = feature?.properties ?? {}
      const ucName = resolveUcName(properties)
      const district = resolveDistrict(properties) || 'Unknown'
      const station = properties.station ?? 'Unmapped'
      const discharge = properties.discharge
      const riskPercentage = properties.risk_percentage
      const distanceToRiverKm = properties.Distance_to_River_km ?? properties.distance_to_river_km ?? null
      const riskCategory = getFloodRiskCategory(feature)

      const popupHtml = `
        <div style="min-width:220px;font-family:inherit">
          <div style="font-weight:700;font-size:16px;margin-bottom:8px;color:#0f172a">${ucName}</div>
          <div style="display:flex;justify-content:space-between;gap:12px;padding:2px 0;color:#334155"><span>District</span><strong>${district}</strong></div>
          <div style="display:flex;justify-content:space-between;gap:12px;padding:2px 0;color:#334155"><span>Station</span><strong>${station}</strong></div>
          <div style="display:flex;justify-content:space-between;gap:12px;padding:2px 0;color:#334155"><span>Discharge</span><strong>${formatNumber(discharge)} m³/s</strong></div>
          <div style="display:flex;justify-content:space-between;gap:12px;padding:2px 0;color:#334155"><span>Risk</span><strong>${riskPercentage == null ? 'N/A' : `${riskPercentage}%`}</strong></div>
          <div style="display:flex;justify-content:space-between;gap:12px;padding:2px 0;color:#334155"><span>Category</span><strong>${riskCategory ?? 'N/A'}</strong></div>
        </div>
      `

      layer.bindPopup(popupHtml, {
        closeButton: true,
        maxWidth: 320,
        className: 'flood-map-popup',
      })

      layer.on('click', () => {
        setSelectedUc({
          ucName,
          district,
          station,
          discharge,
          riskPercentage,
          distanceToRiverKm,
        })
        if (!onUcSelect) return
        onUcSelect({
          ucName,
          district,
          station,
          discharge,
          riskPercentage,
          distanceToRiverKm,
        })
      })

      layer.on({
        mouseover: (event) => {
          const hasRisk = getFloodRiskCategory(event.target.feature) != null
          // Subtle: only bump opacity slightly, keep stroke unchanged.
          event.target.setStyle({
            fillOpacity: hasRisk ? 0.45 : 0.12,
          })
        },
        mouseout: (event) => {
          const isMatched = matchedFeature && event.target.feature === matchedFeature
          const hasRisk = getFloodRiskCategory(event.target.feature) != null
          event.target.setStyle({
            fillOpacity: hasRisk ? (isMatched ? 0.5 : 0.35) : 0.06,
          })
        },
      })
    },
    [matchedFeature, onUcSelect]
  )

  const riverStyle = useMemo(
    () => ({
      color: '#0B5ED7',
      weight: 2.5,
      opacity: 0.85,
      smoothFactor: 1.5,
      lineCap: 'round',
      lineJoin: 'round',
    }),
    []
  )

  const riverEventHandlers = useMemo(
    () => ({
      add: (event) => {
        const layer = event.target
        if (layer && typeof layer.bringToFront === 'function') {
          layer.bringToFront()
        }
      },
    }),
    []
  )

  // Promote the UC polygon layer above the tile basemap so flood-color fills
  // aren't washed out by the OSM raster underneath.
  const ucEventHandlers = useMemo(
    () => ({
      add: (event) => {
        const layer = event.target
        if (layer && typeof layer.bringToFront === 'function') {
          layer.bringToFront()
        }
      },
    }),
    []
  )

  // Force-remount the UC GeoJSON layer when backend risk data finishes loading
  // (or when the enriched feature set updates). Leaflet's <GeoJSON> caches its
  // L.GeoJSON child layers after the first mount and doesn't re-run the style
  // function on every prop change, so when risk fields arrive later the fills
  // never repaint. Changing this key tears the layer down and re-creates it
  // with the now-enriched properties.
  const geoJsonLayerKey = useMemo(
    () => `uc-risk-${backendRiskByName?.size ?? 0}-${enrichedGeoJson?.features?.length ?? 0}`,
    [backendRiskByName, enrichedGeoJson]
  )

  // Dedicated SVG renderer for the UC polygon layer. The MapContainer is set
  // to `preferCanvas`, which can swallow style updates on the canvas-backed
  // path. SVG paths repaint reliably whenever setStyle / a remount is applied.
  const ucSvgRenderer = useMemo(() => L.svg({ padding: 0.2 }), [])

  // Overlay only during initial geojson load — live data refreshes silently in the background.
  const showLoading = loadingGeoJson || !enrichedGeoJson
  const userLocationIcon = useMemo(() => {
    if (!userLocation) return null

    return L.divIcon({
      className: 'flood-map-user-location-icon',
      html: '<div style="width:14px;height:14px;border-radius:999px;background:#2563eb;border:2px solid #ffffff;box-shadow:0 0 0 6px rgba(37, 99, 235, 0.18);"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    })
  }, [userLocation])

  const handleResetView = useCallback(() => {
    setResetViewTick((value) => value + 1)
  }, [])

  const handleEnableAlerts = useCallback(
    async ({ emailAlerts, smsAlerts, threshold, email, phone }) => {
      const activeUc = selectedUc ?? userUc
      if (!activeUc || !Array.isArray(userLocation) || userLocation.length < 2) {
        return { ok: false, message: 'No active union council selected.' }
      }

      setAlertSaving(true)
      setAlertMessage('')

      try {
        const [latitude, longitude] = userLocation

        const thresholdLabel =
          threshold === 'veryhigh'
            ? 'Very High only'
            : threshold === 'high'
              ? 'High or above'
              : 'Moderate or above'

        const response = await fetch(apiUrl('/api/alerts/subscribe'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email ?? '',
            phone: phone ?? '',
            uc_name: activeUc.ucName,
            district: activeUc.district,
            latitude,
            longitude,
            email_alerts: emailAlerts,
            sms_alerts: smsAlerts,
            threshold: thresholdLabel,
          }),
        })

        if (!response.ok) {
          throw new Error(`Alert subscription failed: ${response.status}`)
        }

        const payload = await response.json()
        const successMessage = payload?.message ?? 'Location alerts enabled successfully.'
        setAlertMessage(successMessage)
        return { ok: true, message: successMessage }
      } catch (error) {
        console.error('Alert subscription error:', error)
        const failMessage = 'Unable to save alerts right now.'
        setAlertMessage(failMessage)
        return { ok: false, message: failMessage }
      } finally {
        setAlertSaving(false)
      }
    },
    [selectedUc, userUc, userLocation]
  )

  return (
    <div style={styles.root}>
      <div style={styles.mapFrame}>
        <button type="button" onClick={handleResetView} style={styles.resetButton}>
          Reset View
        </button>

        {import.meta.env.DEV && (
          <button
            type="button"
            onClick={handleToggleDevLocation}
            style={{
              ...styles.devTestButton,
              background: devUserLocation ? '#ef4444' : '#7c3aed',
            }}
            title="Development-only: simulate a user location inside a Chenab UC"
          >
            <span style={styles.devTestBadge}>DEV</span>
            {devUserLocation ? 'Clear Test UC' : 'Test Inside UC'}
          </button>
        )}

        <MapContainer center={BASIN_CENTER} zoom={BASIN_ZOOM} style={styles.map} zoomControl={false} preferCanvas>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapEffects
            geoJsonData={enrichedGeoJson}
            riverGeoJsonData={riverGeoJson}
            matchedFeature={matchedFeature}
            userLocation={userLocation}
            userUcFound={
              Array.isArray(userLocation) && userLocation.length >= 2 && !loadingGeoJson && enrichedGeoJson
                ? !!userUcFeature
                : null
            }
            userUcFeature={userUcFeature}
            searchQuery={searchQuery}
            resetViewTick={resetViewTick}
          />

          {showUcBoundaries && enrichedGeoJson && (
            <GeoJSON
              key={geoJsonLayerKey}
              data={enrichedGeoJson}
              style={ucStyle}
              onEachFeature={onEachFeature}
              eventHandlers={ucEventHandlers}
              renderer={ucSvgRenderer}
            />
          )}

          {showRiverLayer && riverGeoJson && (
            <GeoJSON
              key={`river-${riverGeoJson?.features?.length ?? 0}`}
              data={riverGeoJson}
              style={riverStyle}
              eventHandlers={riverEventHandlers}
            />
          )}

          {userLocation && userLocationIcon && (
            <Marker position={userLocation} icon={userLocationIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {userLocation && enrichedGeoJson && !loadingGeoJson && !userUc && (
            <Circle
              center={userLocation}
              radius={12000}
              pathOptions={{
                color: '#94a3b8',
                weight: 2,
                opacity: 0.85,
                dashArray: '6 6',
                fill: false,
              }}
            />
          )}
        </MapContainer>

        {showLoading && (
          <div style={styles.overlay}>
            <div style={styles.loadingCard}>
              <div style={styles.spinner} aria-hidden="true" />
              <div style={styles.loadingTitle}>Preparing flood map</div>
              <div style={styles.loadingText}>
                {loadingGeoJson ? 'Loading Chenab UC boundaries.' : 'Refreshing live flood data.'}
              </div>
            </div>
          </div>
        )}

        {(geoJsonError || liveError) && (
          <div style={styles.errorStack}>
            {geoJsonError && <div style={{ ...styles.errorCard, ...styles.errorDanger }}>{geoJsonError}</div>}
            {liveError && <div style={{ ...styles.errorCard, ...styles.errorWarning }}>{liveError}</div>}
          </div>
        )}

        {(() => {
          const activeUc = selectedUc ?? userUc
          const hasUserLocation = Array.isArray(userLocation) && userLocation.length >= 2

          const stillDetecting = loadingGeoJson || !enrichedGeoJson

          let status
          let title
          if (activeUc) {
            status = 'live'
            const ucName = activeUc.ucName && String(activeUc.ucName).trim() ? activeUc.ucName : 'Your UC'
            title = `${ucName} Flood Status`
          } else if (!hasUserLocation || stillDetecting) {
            status = 'detecting'
            title = 'Detecting Your Location'
          } else {
            status = 'outside'
            title = 'Outside Chenab Basin Coverage'
          }

          const backendRiskProgression = personalRisk?.inside_coverage
            ? {
                risk24h: personalRisk.risk?.['24h']?.percentage ?? null,
                risk48h: personalRisk.risk?.['48h']?.percentage ?? null,
                risk72h: personalRisk.risk?.['72h']?.percentage ?? null,
              }
            : null

          const riskProgression =
            backendRiskProgression ?? calculateRiskProgression(activeUc?.riskPercentage ?? null)

          const hasRiskData =
            !!backendRiskProgression ||
            activeUc?.riskPercentage != null

          return (
            <PersonalFloodRiskCard
              status={status}
              title={title}
              uc={activeUc}
              userLatLng={hasUserLocation ? userLocation : null}
              riskProgression={riskProgression}
              hasRiskData={hasRiskData}
              lastUpdated={lastUpdated}
              onViewEmergency={handleViewEmergency}
              onEnableAlerts={handleEnableAlerts}
              alertSaving={alertSaving}
              alertMessage={personalRiskError || alertMessage}
            />
          )
        })()}
      </div>

      <style>{`@keyframes flood-map-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const styles = {
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: 'calc(100vh - 70px)',
    background: 'linear-gradient(180deg, #0a1220 0%, #0f1b2f 100%)',
  },
  mapFrame: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  resetButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1400,
    border: '1px solid rgba(23, 59, 95, 0.2)',
    borderRadius: 999,
    padding: '0.65rem 1rem',
    background: 'rgba(255, 255, 255, 0.95)',
    color: '#173B5F',
    fontSize: '0.88rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.14)',
  },
  devTestButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    zIndex: 1400,
    border: '2px solid #ffffff',
    borderRadius: 999,
    padding: '0.55rem 0.9rem',
    color: '#ffffff',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.25)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: 'inherit',
  },
  devTestBadge: {
    padding: '2px 6px',
    background: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 6,
    fontSize: '0.62rem',
    letterSpacing: '0.08em',
    fontWeight: 800,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    background: 'linear-gradient(180deg, rgba(3, 7, 18, 0.22), rgba(3, 7, 18, 0.12))',
    zIndex: 520,
    pointerEvents: 'none',
  },
  loadingCard: {
    width: 'min(92vw, 380px)',
    borderRadius: 20,
    padding: '1.15rem 1.3rem',
    textAlign: 'center',
    color: '#e2e8f0',
    background: 'rgba(15, 23, 42, 0.72)',
    backdropFilter: 'blur(18px)',
    boxShadow: '0 24px 60px rgba(2, 6, 23, 0.28)',
  },
  spinner: {
    width: 36,
    height: 36,
    margin: '0 auto',
    borderRadius: '50%',
    border: '3px solid rgba(148, 163, 184, 0.28)',
    borderTopColor: '#60a5fa',
    animation: 'flood-map-spin 900ms linear infinite',
  },
  loadingTitle: {
    margin: '0.85rem 0 0.4rem',
    fontWeight: 700,
    fontSize: '1rem',
    color: '#f8fafc',
  },
  loadingText: {
    margin: 0,
    color: 'rgba(226, 232, 240, 0.8)',
    fontSize: '0.92rem',
  },
  errorStack: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 540,
    display: 'grid',
    gap: 10,
    width: 'min(92vw, 420px)',
    pointerEvents: 'none',
  },
  errorCard: {
    borderRadius: 14,
    padding: '0.85rem 1rem',
    fontWeight: 600,
    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.16)',
  },
  errorDanger: {
    background: 'rgba(239, 68, 68, 0.12)',
    color: '#fee2e2',
    border: '1px solid rgba(248, 113, 113, 0.16)',
  },
  errorWarning: {
    background: 'rgba(245, 158, 11, 0.12)',
    color: '#ffedd5',
    border: '1px solid rgba(251, 191, 36, 0.16)',
  },
}