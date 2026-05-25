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

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://ghaniasaghir-cguard-backend.hf.space';

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

const normalizeAnalyticsSeries = (station, data) => {
  const dischargeData = Array.isArray(data?.discharge) ? data.discharge : [];

  return {
    station,
    color: STATION_META[station]?.color || '#2563EB',
    data: dischargeData.map((item, index) => ({
      time: item.time || `Point ${index + 1}`,
      value: Number(item.value || 0),
    })),
  };
};

const AuthorityDashboard = ({ user, onLogout, onManageShelters }) => {
  const [selectedUC, setSelectedUC] = useState('');
  const [forecastPeriod, setForecastPeriod] = useState('48');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [chartSeries, setChartSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');

      try {
        const token = getAuthToken();

        if (!token) {
          throw new Error('Authority token missing. Please login again.');
        }

        const targets = selectedStation === 'all' ? STATIONS : [selectedStation];

        const results = await Promise.all(
          targets.map(async (station) => {
            const response = await fetch(
              `${API_BASE_URL}/analytics/${station}?hours=${forecastPeriod}`,
              {
                method: 'GET',
                headers: {
                  Accept: 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!response.ok) {
              const errorData = await response.json().catch(() => null);
              throw new Error(
                errorData?.detail || `Failed loading analytics for ${station}. Status: ${response.status}`
              );
            }

            const data = await response.json();
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
  }, [selectedStation, forecastPeriod]);

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

  const overview = useMemo(() => {
    if (!chartSeries.length) return null;

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
          forecast_period: `${forecastPeriod}h`,
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
          <tr><th>Time</th><th>Discharge (m³/s)</th></tr>
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
        <div class="info"><strong>Forecast Period:</strong> ${forecastPeriod} hours</div>
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

    let csvContent = `C Guard - Discharge Data\nScope,${scopeLabel}\nForecast,${forecastPeriod} hours\nGenerated,${new Date().toLocaleString()}\n\n`;

    chartSeries.forEach((s) => {
      csvContent += `${s.station}\nTime,Discharge (m³/s)\n`;
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
          onForecastPeriodChange={setForecastPeriod}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
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
                <h2 className="ad-card-title">Discharge Trend</h2>
                <p className="ad-card-subtitle">
                  {selectedStation === 'all'
                    ? `Live discharge across ${STATIONS.length} monitored stations`
                    : `${selectedStation} station discharge`}
                  {' · '}Forecast {forecastPeriod}h
                </p>
              </div>
            </header>

            <div className="ad-chart-body">
              {loading ? (
                <div className="ad-chart-empty">Loading discharge data from backend...</div>
              ) : error ? (
                <div className="ad-chart-empty ad-chart-empty--error">{error}</div>
              ) : !mergedChartData.length ? (
                <div className="ad-chart-empty">No discharge data available.</div>
              ) : (
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
                        value: 'Discharge (m³/s)',
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
                        const d = new Date(value);
                        return Number.isNaN(d.getTime())
                          ? value
                          : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
                      }}
                      formatter={(value, name) => [`${formatDischarge(value)} m³/s`, name]}
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
              )}
            </div>
          </section>

          <section className="ad-card ad-overview-card">
            <header className="ad-overview-header">
              <div>
                <h2 className="ad-card-title">Discharge Overview</h2>
                <p className="ad-card-subtitle">
                  {selectedStation === 'all'
                    ? 'Live readings aggregated across all monitored stations'
                    : `Time-series summary for ${selectedStation}`}
                </p>
              </div>
            </header>

            {!overview ? (
              <div className="ad-chart-empty">No discharge data available.</div>
            ) : (
              <div className="ad-overview-grid">
                <OverviewStat
                  tone="blue"
                  icon={<Droplets size={20} strokeWidth={2.2} />}
                  label={overview.mode === 'all' ? 'Total Discharge (Live)' : 'Total Discharge'}
                  value={`${formatDischarge(overview.total)} m³/s`}
                  sub={
                    overview.mode === 'all'
                      ? `Across all ${overview.count} stations`
                      : `Sum across ${overview.count} readings`
                  }
                />

                <OverviewStat
                  tone="green"
                  icon={<TrendingUp size={20} strokeWidth={2.2} />}
                  label="Average Discharge"
                  value={`${formatDischarge(overview.avg)} m³/s`}
                  sub={
                    overview.mode === 'all'
                      ? `Across all ${overview.count} stations`
                      : 'Mean of forecast window'
                  }
                />

                <OverviewStat
                  tone="purple"
                  icon={<ArrowUpRight size={20} strokeWidth={2.2} />}
                  label="Maximum Discharge"
                  value={`${formatDischarge(overview.max)} m³/s`}
                  sub={overview.maxLabel}
                />

                <OverviewStat
                  tone="orange"
                  icon={<ArrowDownRight size={20} strokeWidth={2.2} />}
                  label="Minimum Discharge"
                  value={`${formatDischarge(overview.min)} m³/s`}
                  sub={overview.minLabel}
                />
              </div>
            )}
          </section>

          <p className="ad-footnote">
            All times are in local time zone. Discharge values are in m³/s.
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