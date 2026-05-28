import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Building2, Waves, Droplets, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import TopNavbar from '../components/TopNavbar';
import Sidebar from '../components/Sidebar';
import '../styles/AuthorityDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UC_LIST = [
  { id: 1, name: "Marala", station: "Marala" },
  { id: 2, name: "Khanki", station: "Khanki" },
  { id: 3, name: "Qadirabad", station: "Qadirabad" },
  { id: 4, name: "Trimmu", station: "Trimmu" },
  { id: 5, name: "Panjnad", station: "Panjnad" },
];

const STATIONS = ['Khanki', 'Marala', 'Qadirabad', 'Trimmu', 'Panjnad'];

const STATION_META = {
  Khanki: { color: '#2563EB', subtitle: 'Chenab' },
  Marala: { color: '#10B981', subtitle: 'Chenab' },
  Qadirabad: { color: '#7C3AED', subtitle: 'Chenab' },
  Trimmu: { color: '#F97316', subtitle: 'Chenab' },
  Panjnad: { color: '#0EA5E9', subtitle: 'Chenab' },
};

const getAuthToken = () =>
  localStorage.getItem('token') ||
  localStorage.getItem('authToken') ||
  localStorage.getItem('access_token') ||
  '';

const formatDischarge = (value) => {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
};

const formatXAxisTick = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

// Forecast responses (GET /api/analytics/forecast) use:
//   { forecasts: [{ time/timestamp, predicted_discharge }, …] }
// Historical (/api/analytics/historical) responses use:
//   { success, mode, station, start_date, end_date, summary,
//     readings: [{ station, reading_time, discharge }, …] }
// The summary block — { total_discharge, average_discharge,
// maximum_discharge, minimum_discharge, total_records, stations } — is
// surfaced as-is so the overview cards can show the backend's authoritative
// numbers without recomputing.
const normalizeAnalyticsSeries = (station, data) => {
  const rawPoints = Array.isArray(data?.forecasts)
    ? data.forecasts
    : Array.isArray(data?.readings)
      ? data.readings
      : Array.isArray(data?.discharge)
        ? data.discharge
        : [];

  return {
    station,
    color: STATION_META[station]?.color || '#2563EB',
    data: rawPoints.map((item, index) => ({
      // Historical readings carry `reading_time` ISO timestamps; forecasts
      // use `time`. Both flow through here so the chart axis stays correct.
      time:
        item.reading_time ??
        item.time ??
        item.timestamp ??
        item.datetime ??
        item.date ??
        `Point ${index + 1}`,
      // Historical readings carry `discharge`; forecasts carry
      // `predicted_discharge`. Check both in the order the backend prefers
      // for the active mode.
      value: Number(
        item.discharge ?? item.value ?? item.predicted_discharge ?? 0
      ),
    })),
    summary: data?.summary ?? null,
  };
};

const AuthorityDashboard = ({ user, onLogout, onManageShelters }) => {
  const [selectedUC, setSelectedUC] = useState('');
  const [forecastPeriod, setForecastPeriod] = useState('48');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // Only one mode is ever active. Picking a forecast horizon → 'forecast',
  // picking a custom date → 'historical'. Default is forecast / 48h on load.
  const [activeMode, setActiveMode] = useState('forecast');
  const [chartSeries, setChartSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Today as YYYY-MM-DD (local time), used to default and clamp historical
  // dates so the backend never receives a query for a future date with no
  // recorded readings.
  const todayIso = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const clampToToday = (value) => {
    if (!value) return value;
    const today = todayIso();
    return value > today ? today : value;
  };

  // Selecting 24/48/72h → forecast mode, clear any custom dates.
  const handleForecastPeriodChange = (value) => {
    setForecastPeriod(value);
    setStartDate('');
    setEndDate('');
    setActiveMode('forecast');
  };

  // Editing either date → historical mode, clear the forecast radio selection.
  // Sidebar auto-fills the end date to start + 1 month when end is empty —
  // we clamp it back to today so the requested range never extends past
  // dates the backend actually has data for.
  const handleStartDateChange = (value) => {
    const clamped = clampToToday(value);
    setStartDate(clamped);
    if (clamped) {
      setForecastPeriod('');
      setActiveMode('historical');
    }
  };

  const handleEndDateChange = (value) => {
    const clamped = clampToToday(value);
    setEndDate(clamped);
    if (clamped) {
      setForecastPeriod('');
      setActiveMode('historical');
    }
  };

  const selectedStation = useMemo(() => {
    if (!selectedUC) return 'all';
    const uc = UC_LIST.find((u) => u.id === parseInt(selectedUC, 10));
    return uc ? uc.station : 'all';
  }, [selectedUC]);

  const handleSelectStation = (stationId) => {
    if (stationId === 'all') {
      setSelectedUC('');
      return;
    }

    const uc = UC_LIST.find((u) => u.station === stationId);
    if (uc) setSelectedUC(String(uc.id));
  };

  useEffect(() => {
    // In historical mode, only fetch once both endpoints of the range exist.
    if (activeMode === 'historical' && (!startDate || !endDate)) {
      setChartSeries([]);
      setError('');
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');

      try {
        const token = getAuthToken();

        if (!token) {
          throw new Error('Authority token missing. Please login again.');
        }

        const targets = selectedStation === 'all' ? STATIONS : [selectedStation];

        // Forecast mode → /api/analytics/forecast?horizon=<24h|48h|72h>&station=<name>
        // returning { forecasts: [{ time, predicted_discharge }, …] }.
        // Historical mode → /api/analytics/historical?start_date&end_date&station=<name>
        // (symmetric to the forecast route — the `/api/` prefix matters,
        // the station is a query param not a path segment). Returns
        // { success, mode, station, start_date, end_date, summary, readings }.
        const buildUrl = (station) =>
          activeMode === 'forecast'
            ? `${API_BASE_URL}/api/analytics/forecast?horizon=${forecastPeriod}h&station=${encodeURIComponent(station)}`
            : `${API_BASE_URL}/api/analytics/historical?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}&station=${encodeURIComponent(station)}&limit=500`;

        const results = await Promise.all(
          targets.map(async (station) => {
            const url = buildUrl(station);
            console.log(`[AuthorityDashboard] ${activeMode} fetch:`, url);

            const response = await fetch(url, {
              method: 'GET',
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => null);
              throw new Error(
                errorData?.detail || `Failed loading ${activeMode} data for ${station}. Status: ${response.status}`
              );
            }

            const data = await response.json();
            console.log(`[AuthorityDashboard] ${activeMode} response for ${station}:`, data);
            return normalizeAnalyticsSeries(station, data);
          })
        );

        setChartSeries(results);
      } catch (err) {
        console.error('Authority dashboard analytics error:', err);
        setError(err.message || 'Failed to load analytics data.');
        setChartSeries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedStation, activeMode, forecastPeriod, startDate, endDate]);

  // True when the active mode is historical and the backend returned
  // an empty slice (no readings AND zero total_records) for every station —
  // i.e. the selected date has no recorded data yet. Used to render an
  // honest empty-state instead of stale or zero-filled values.
  const isHistoricalEmpty = useMemo(() => {
    if (activeMode !== 'historical') return false;
    if (!chartSeries.length) return false;
    return chartSeries.every((s) => {
      const records = Number(s.summary?.total_records ?? 0);
      const points = Array.isArray(s.data) ? s.data.length : 0;
      return records === 0 && points === 0;
    });
  }, [activeMode, chartSeries]);

  const mergedChartData = useMemo(() => {
    if (!chartSeries.length) return [];

    const bestIndex = chartSeries.reduce(
      (best, s, i) => (s.data.length > chartSeries[best].data.length ? i : best),
      0
    );

    const timeline = chartSeries[bestIndex].data.map((p) => p.time);

    return timeline.map((time, idx) => {
      const row = { time };

      chartSeries.forEach((s) => {
        const point = s.data[idx];
        if (point) row[s.station] = point.value;
      });

      return row;
    });
  }, [chartSeries]);

  // True when at least one station has >1 data point — i.e. a real
  // multi-hour series the time-axis chart can connect into curves. When
  // the backend returns one predicted_discharge per station per horizon,
  // this is false and we fall back to a station-X-axis chart.
  const hasMultiPointSeries = useMemo(
    () => chartSeries.some((s) => Array.isArray(s.data) && s.data.length > 1),
    [chartSeries]
  );

  // One row per station — used when data is sparse (single point per
  // station). Renders a smooth curve across stations with station-colored
  // dots, instead of leaving 5 dots stacked on one time tick.
  const forecastChartData = useMemo(() => {
    if (!chartSeries.length) return [];
    return chartSeries.map((s) => {
      const point = s.data[0] ?? {};
      return {
        station: s.station,
        predicted_discharge: Number.isFinite(Number(point.value)) ? Number(point.value) : 0,
        readingTime: point.time && !/^Point\s/.test(String(point.time)) ? point.time : null,
        color: s.color,
      };
    });
  }, [chartSeries]);

  const overview = useMemo(() => {
    if (!chartSeries.length) return null;

    // Historical mode: every series carries a backend `summary` block. Use it
    // directly so the cards reflect the authoritative numbers the backend
    // computed over the user-selected date range, not a chart-side re-roll.
    const seriesWithSummary = chartSeries.filter((s) => s.summary);
    const useBackendSummary =
      seriesWithSummary.length > 0 && seriesWithSummary.length === chartSeries.length;

    if (useBackendSummary) {
      if (selectedStation === 'all') {
        const summaries = chartSeries.map((s) => ({ station: s.station, sm: s.summary }));

        const total = summaries.reduce(
          (sum, { sm }) => sum + Number(sm.total_discharge ?? 0),
          0
        );
        const avgValues = summaries
          .map(({ sm }) => Number(sm.average_discharge ?? 0))
          .filter(Number.isFinite);
        const avg = avgValues.length ? avgValues.reduce((a, b) => a + b, 0) / avgValues.length : 0;

        const maxRow = summaries.reduce(
          (best, { station, sm }) => {
            const v = Number(sm.maximum_discharge ?? -Infinity);
            return v > best.value ? { station, value: v } : best;
          },
          { station: summaries[0].station, value: Number(summaries[0].sm.maximum_discharge ?? 0) }
        );
        const minRow = summaries.reduce(
          (best, { station, sm }) => {
            const v = Number(sm.minimum_discharge ?? Infinity);
            return v < best.value ? { station, value: v } : best;
          },
          { station: summaries[0].station, value: Number(summaries[0].sm.minimum_discharge ?? 0) }
        );

        const totalRecords = summaries.reduce(
          (sum, { sm }) => sum + Number(sm.total_records ?? 0),
          0
        );

        return {
          mode: 'all',
          count: totalRecords || summaries.length,
          total,
          avg,
          max: Number.isFinite(maxRow.value) ? maxRow.value : 0,
          min: Number.isFinite(minRow.value) ? minRow.value : 0,
          maxLabel: maxRow.station,
          minLabel: minRow.station,
        };
      }

      const sm = chartSeries[0].summary;
      return {
        mode: 'single',
        station: chartSeries[0].station,
        count: Number(sm.total_records ?? 0),
        total: Number(sm.total_discharge ?? 0),
        avg: Number(sm.average_discharge ?? 0),
        max: Number(sm.maximum_discharge ?? 0),
        min: Number(sm.minimum_discharge ?? 0),
        maxLabel: 'Peak reading',
        minLabel: 'Lowest reading',
      };
    }

    // Forecast mode (no backend summary): existing chart-data-derived metrics.
    if (selectedStation === 'all') {
      const latestPerStation = chartSeries
        .map((s) => ({ station: s.station, value: s.data.at(-1)?.value }))
        .filter((row) => Number.isFinite(row.value));

      if (!latestPerStation.length) return null;

      const total = latestPerStation.reduce((sum, r) => sum + r.value, 0);
      const avg = total / latestPerStation.length;
      const maxRow = latestPerStation.reduce((m, r) => (r.value > m.value ? r : m));
      const minRow = latestPerStation.reduce((m, r) => (r.value < m.value ? r : m));

      return {
        mode: 'all',
        count: latestPerStation.length,
        total,
        avg,
        max: maxRow.value,
        min: minRow.value,
        maxLabel: maxRow.station,
        minLabel: minRow.station,
      };
    }

    const values = chartSeries[0]?.data.map((p) => p.value).filter(Number.isFinite) ?? [];

    if (!values.length) return null;

    const total = values.reduce((a, b) => a + b, 0);

    return {
      mode: 'single',
      station: chartSeries[0].station,
      count: values.length,
      total,
      avg: total / values.length,
      max: Math.max(...values),
      min: Math.min(...values),
      maxLabel: 'Peak reading',
      minLabel: 'Lowest reading',
    };
  }, [chartSeries, selectedStation]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  const scopeLabel = selectedStation === 'all' ? 'All Stations' : selectedStation;

  // Short human label for the current selection — used in PDF/CSV report
  // headers and the export-history record so they correctly describe whether
  // the export is forecast or historical data.
  const periodLabel =
    activeMode === 'forecast'
      ? `Forecast · next ${forecastPeriod || '—'}h`
      : startDate && endDate
        ? `Recent Recorded · ${startDate} to ${endDate}`
        : 'Recent Recorded · (range not set)';

  const saveExportHistory = async (reportType) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      await fetch(`${API_BASE_URL}/export-reports/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          station: scopeLabel,
          forecast_period: periodLabel,
          report_type: reportType,
        }),
      });
    } catch (error) {
      console.error('Export history save failed:', error);
    }
  };

  const handleExportPDF = async () => {
    if (!chartSeries.length) return;

    await saveExportHistory('PDF');

    const printWindow = window.open('', '_blank');

    const tablesHtml = chartSeries
      .map(
        (s) => `
        <h2 style="color:${s.color}">${s.station} Discharge</h2>
        <table>
          <tr><th>Time</th><th>Discharge (Cusec)</th></tr>
          ${s.data
            .map((d) => `<tr><td>${d.time}</td><td>${formatDischarge(d.value)}</td></tr>`)
            .join('')}
        </table>`
      )
      .join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Discharge Report - ${scopeLabel}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #173b5f; }
          h2 { margin-top: 24px; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #173b5f; color: white; }
          .info { margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>C Guard - Discharge Report</h1>
        <div class="info"><strong>Scope:</strong> ${scopeLabel}</div>
        <div class="info"><strong>Data Window:</strong> ${periodLabel}</div>
        <div class="info"><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
        ${tablesHtml}
        <script>
          window.onload = () => { window.print(); setTimeout(() => window.close(), 1000); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleExportCSV = async () => {
    if (!chartSeries.length) return;

    await saveExportHistory('CSV');

    let csvContent = `C Guard - Discharge Data\nScope,${scopeLabel}\nData Window,${periodLabel}\nGenerated,${new Date().toLocaleString()}\n\n`;

    chartSeries.forEach((s) => {
      csvContent += `${s.station}\nTime,Discharge (Cusec)\n`;
      s.data.forEach((d) => {
        csvContent += `${d.time},${d.value}\n`;
      });
      csvContent += '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute(
      'download',
      `CGuard_${scopeLabel.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    );

    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-container">
      <TopNavbar user={user} onLogout={handleLogout} />

      <div className="dashboard-content">
        <Sidebar
          unitCommands={UC_LIST}
          selectedUC={selectedUC}
          onUCChange={setSelectedUC}
          forecastPeriod={forecastPeriod}
          onForecastPeriodChange={handleForecastPeriodChange}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onManageShelters={onManageShelters}
          activePage="dashboard"
        />

        <main className="main-area">
          <div className="main-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 className="main-title">Analytics Dashboard</h1>
                <p className="main-subtitle">Chenab River Flood Monitoring & Forecast Analysis</p>
              </div>

              <div className="export-buttons">
                <button className="export-btn" onClick={handleExportPDF}>
                  <svg className="export-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Export PDF
                </button>

                <button className="export-btn" onClick={handleExportCSV}>
                  <svg className="export-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          <section className="ad-card ad-stations-card">
            <h2 className="ad-card-title">Select Station</h2>

            <div className="ad-stations-grid">
              <StationCard
                stationId="all"
                label="All Stations"
                sub="Overview"
                icon={<Building2 size={20} strokeWidth={2.2} />}
                accent="#2447B8"
                active={selectedStation === 'all'}
                onClick={() => handleSelectStation('all')}
              />

              {STATIONS.map((station) => (
                <StationCard
                  key={station}
                  stationId={station}
                  label={station}
                  sub={STATION_META[station].subtitle}
                  icon={<Waves size={20} strokeWidth={2.2} />}
                  accent={STATION_META[station].color}
                  active={selectedStation === station}
                  onClick={() => handleSelectStation(station)}
                />
              ))}
            </div>
          </section>

          <section className="ad-card ad-chart-card">
            <header className="ad-chart-header">
              <div>
                <h2 className="ad-card-title">
                  {activeMode === 'forecast' ? 'Forecast Discharge Comparison' : 'Latest Recorded Discharge Trend'}
                </h2>
                <p className="ad-card-subtitle">
                  {selectedStation === 'all'
                    ? `${activeMode === 'forecast' ? 'Predicted' : 'Recorded'} discharge across ${STATIONS.length} monitored stations`
                    : `${selectedStation} station discharge`}
                  {' · '}
                  {activeMode === 'forecast'
                    ? `Predicted at ${forecastPeriod || '—'}h horizon from latest available reading`
                    : startDate && endDate
                        ? `${startDate} to ${endDate}`
                      : 'Pick a From and To date to load recent recorded data'}
                </p>
              </div>
            </header>

            <div className="ad-chart-body">
              {loading ? (
                <div className="ad-chart-empty">Loading discharge data from backend...</div>
              ) : error ? (
                <div className="ad-chart-empty ad-chart-empty--error">{error}</div>
              ) : isHistoricalEmpty || !mergedChartData.length ? (
                <div className="ad-chart-empty">
                  {activeMode === 'historical'
                    ? 'No recorded readings available for this selected date.'
                    : 'No discharge data available.'}
                </div>
              ) : hasMultiPointSeries ? (
                // Reference design: multi-line smooth time-series. Used when the
                // backend returns a real multi-hour series per station.
                <ResponsiveContainer width="100%" height={380}>
                  <LineChart data={mergedChartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />

                    <XAxis
                      dataKey="time"
                      tickFormatter={formatXAxisTick}
                      stroke="#64748B"
                      tick={{ fontSize: 12 }}
                    />

                    <YAxis
                      stroke="#64748B"
                      tick={{ fontSize: 12 }}
                      label={{
                        value: 'Discharge (Cusec)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fill: '#64748B', fontSize: 12 },
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 10,
                        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)',
                        fontSize: 12,
                      }}
                      labelFormatter={(value) => {
                        // Only date-parse strings that actually look like an
                        // ISO date (YYYY-MM-DD…). Time-only strings like
                        // "06:00" pass through unchanged — prevents
                        // `new Date("06:00")` from producing a bogus
                        // "Jan 1, 2001" tooltip header.
                        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value)) {
                          return value;
                        }
                        const d = new Date(value);
                        return Number.isNaN(d.getTime())
                          ? value
                          : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
                      }}
                      formatter={(value, name) => [`${formatDischarge(value)} Cusec`, name]}
                    />

                    <Legend
                      verticalAlign="bottom"
                      height={32}
                      iconType="circle"
                      wrapperStyle={{ fontSize: 12, color: '#475569' }}
                    />

                    {chartSeries.map((s) => (
                      <Line
                        key={s.station}
                        type="monotone"
                        dataKey={s.station}
                        name={s.station}
                        stroke={s.color}
                        strokeWidth={2.2}
                        dot={{ r: 2.5, strokeWidth: 0, fill: s.color }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                // Sparse-data fallback: backend returned one point per station.
                // Render a single smooth curve across stations with station-
                // colored dots and a multi-color legend at the bottom.
                <ResponsiveContainer width="100%" height={380}>
                  <LineChart
                    data={forecastChartData}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />

                    <XAxis
                      dataKey="station"
                      stroke="#64748B"
                      tick={{ fontSize: 12 }}
                      padding={{ left: 24, right: 24 }}
                    />

                    <YAxis
                      stroke="#64748B"
                      tick={{ fontSize: 12 }}
                      label={{
                        value: 'Discharge (Cusec)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fill: '#64748B', fontSize: 12 },
                      }}
                    />

                    <Tooltip
                      cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const row = payload[0].payload;
                        return (
                          <div
                            style={{
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              borderRadius: 10,
                              boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)',
                              padding: '10px 12px',
                              fontSize: 12,
                              color: '#1F2937',
                              minWidth: 180,
                            }}
                          >
                            <div style={{ fontWeight: 700, color: row.color, marginBottom: 4 }}>
                              {row.station}
                            </div>
                            {activeMode === 'forecast' && (
                              <div style={{ color: '#64748B' }}>
                                Horizon: <strong style={{ color: '#1F2937' }}>{forecastPeriod || '—'}h</strong>
                              </div>
                            )}
                            <div style={{ color: '#64748B' }}>
                              {activeMode === 'forecast' ? 'Predicted' : 'Reading'}:{' '}
                              <strong style={{ color: '#1F2937' }}>{formatDischarge(row.predicted_discharge)} Cusec</strong>
                            </div>
                            {row.readingTime && (
                              <div style={{ color: '#64748B', marginTop: 2 }}>
                                Reading time: <strong style={{ color: '#1F2937' }}>{row.readingTime}</strong>
                              </div>
                            )}
                          </div>
                        );
                      }}
                    />

                    <Legend
                      verticalAlign="bottom"
                      height={32}
                      iconType="circle"
                      wrapperStyle={{ fontSize: 12, color: '#475569' }}
                      payload={forecastChartData.map((entry) => ({
                        value: entry.station,
                        color: entry.color,
                        type: 'circle',
                        id: entry.station,
                      }))}
                    />

                    <Line
                      type="monotone"
                      dataKey="predicted_discharge"
                      name="Predicted Discharge"
                      stroke="#2447B8"
                      strokeWidth={2.2}
                      legendType="none"
                      isAnimationActive={false}
                      dot={({ cx, cy, payload }) => (
                        <circle
                          key={payload.station}
                          cx={cx}
                          cy={cy}
                          r={5}
                          fill={payload.color}
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        />
                      )}
                      activeDot={({ cx, cy, payload }) => (
                        <circle
                          key={`${payload.station}-active`}
                          cx={cx}
                          cy={cy}
                          r={7}
                          fill={payload.color}
                          stroke="#FFFFFF"
                          strokeWidth={2.5}
                        />
                      )}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section className="ad-card ad-overview-card">
            <header className="ad-overview-header">
              <div>
                <h2 className="ad-card-title">Discharge Overview</h2>
                <p className="ad-card-subtitle">
                  {activeMode === 'forecast'
                    ? `Forecast summary for next ${forecastPeriod || '—'}h${selectedStation === 'all' ? ` · all ${STATIONS.length} stations` : ` · ${selectedStation}`}`
                    : startDate && endDate
                      ? `Recent Recorded summary for ${startDate} to ${endDate}${selectedStation === 'all' ? ` · all ${STATIONS.length} stations` : ` · ${selectedStation}`}`
                      : 'Recent Recorded summary — pick a From and To date'}
                </p>
              </div>
            </header>

            {loading ? (
              <div className="ad-chart-empty">
                {activeMode === 'forecast'
                  ? 'Loading forecast summary...'
                  : 'Loading recent recorded summary...'}
              </div>
            ) : error ? (
              <div className="ad-chart-empty ad-chart-empty--error">{error}</div>
            ) : isHistoricalEmpty || !overview ? (
              <div className="ad-chart-empty">
                {activeMode === 'historical'
                  ? 'No recorded readings available for this selected date.'
                  : 'No discharge data available.'}
              </div>
            ) : (
              <div className="ad-overview-grid">
                <OverviewStat
                  tone="blue"
                  icon={<Droplets size={20} strokeWidth={2.2} />}
                  label={
                    activeMode === 'forecast'
                      ? overview.mode === 'all'
                        ? 'Total Forecast Discharge'
                        : 'Total Forecast Discharge'
                      : overview.mode === 'all'
                        ? 'Total Recorded Discharge'
                        : 'Total Recorded Discharge'
                  }
                  value={`${formatDischarge(overview.total)} Cusec`}
                  sub={
                    overview.mode === 'all'
                      ? activeMode === 'forecast'
                        ? `Predicted across all ${overview.count} stations`
                        : `Recorded across all ${overview.count} stations`
                      : activeMode === 'forecast'
                        ? `Sum across ${overview.count} forecast points`
                        : `Sum across ${overview.count} recorded points`
                  }
                />

                <OverviewStat
                  tone="green"
                  icon={<TrendingUp size={20} strokeWidth={2.2} />}
                  label="Average Discharge"
                  value={`${formatDischarge(overview.avg)} Cusec`}
                  sub={
                    overview.mode === 'all'
                      ? activeMode === 'forecast'
                        ? `Predicted across all ${overview.count} stations`
                        : `Recorded across all ${overview.count} stations`
                      : activeMode === 'forecast'
                        ? 'Mean of forecast window'
                        : 'Mean of recent recorded range'
                  }
                />

                <OverviewStat
                  tone="purple"
                  icon={<ArrowUpRight size={20} strokeWidth={2.2} />}
                  label={activeMode === 'forecast' ? 'Maximum Forecast Discharge' : 'Maximum Recorded Discharge'}
                  value={`${formatDischarge(overview.max)} Cusec`}
                  sub={overview.maxLabel}
                />

                <OverviewStat
                  tone="orange"
                  icon={<ArrowDownRight size={20} strokeWidth={2.2} />}
                  label={activeMode === 'forecast' ? 'Minimum Forecast Discharge' : 'Minimum Recorded Discharge'}
                  value={`${formatDischarge(overview.min)} Cusec`}
                  sub={overview.minLabel}
                />
              </div>
            )}
          </section>

          <p className="ad-footnote">
            All times are in local time zone. Discharge values are in Cusec.
          </p>
        </main>
      </div>
    </div>
  );
};

function StationCard({ label, sub, icon, accent, active, onClick }) {
  return (
    <button
      type="button"
      className={`ad-station-card${active ? ' ad-station-card--active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span
        className="ad-station-icon"
        style={
          active
            ? { background: accent, color: '#ffffff' }
            : { background: `${accent}1A`, color: accent }
        }
      >
        {icon}
      </span>

      <span className="ad-station-text">
        <span className="ad-station-label">{label}</span>
        <span className="ad-station-sub">{sub}</span>
      </span>
    </button>
  );
}

function OverviewStat({ tone, icon, label, value, sub }) {
  return (
    <div className={`ad-overview-stat ad-overview-stat--${tone}`}>
      <span className="ad-overview-icon" aria-hidden="true">
        {icon}
      </span>

      <div className="ad-overview-text">
        <span className="ad-overview-label">{label}</span>
        <span className="ad-overview-value">{value}</span>
        {sub && <span className="ad-overview-sub">{sub}</span>}
      </div>
    </div>
  );
}

export default AuthorityDashboard;