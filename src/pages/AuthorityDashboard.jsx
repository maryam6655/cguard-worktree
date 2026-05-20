import React, { useState, useEffect } from 'react';
import TopNavbar from '../components/TopNavbar';
import Sidebar from '../components/Sidebar';
import GaugeChart from '../components/GaugeChart';
import DischargeChart from '../components/DischargeChart';
import RiskProgressionChart from '../components/RiskProgressionChart';
import '../styles/AuthorityDashboard.css';

// Station names mapped to UC names (matches your backend)
const UC_LIST = [
  { id: 1, name: "Marala",    station: "Marala"    },
  { id: 2, name: "Khanki",    station: "Khanki"    },
  { id: 3, name: "Qadirabad", station: "Qadirabad" },
  { id: 4, name: "Trimmu",    station: "Trimmu"    },
];

const AuthorityDashboard = ({ user, onLogout, onManageShelters }) => {
  const [selectedUC, setSelectedUC]         = useState('');
  const [forecastPeriod, setForecastPeriod] = useState('48');
  const [startDate, setStartDate]           = useState('');
  const [endDate, setEndDate]               = useState('');
  const [dashboardData, setDashboardData]   = useState(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');

  // Fetch real data from backend when UC or forecast period changes
  useEffect(() => {
    const loadData = async () => {
      if (!selectedUC) return;

      setLoading(true);
      setError('');

      try {
        const uc      = UC_LIST.find(u => u.id === parseInt(selectedUC));
        const station = uc ? uc.station : "Marala";
        const token   = localStorage.getItem("token");

        const response = await fetch(
          `https://ghaniasaghir-cguard-backend.hf.space/analytics/${station}?hours=${forecastPeriod}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const data = await response.json();

        // Transform backend response to match what the charts expect
        const transformed = {
          ucName:    station,
          dateRange: `Forecast: ${forecastPeriod}h`,
          gaugeLevelData: data.gauge_level.map(item => ({
            timestamp: item.time,
            level:     item.value,
            threshold: data.gauge_capacity_m,
          })),
          dischargeData: data.discharge.map(item => ({
            timestamp: item.time,
            discharge: item.value,
            capacity:  data.discharge_capacity,
          })),
          riskProgressionData: data.risk_progression.map(item => ({
            timestamp: item.time,
            critical:  item.critical,
            high:      item.high,
            moderate:  item.moderate,
            low:       item.low,
          })),
        };

        setDashboardData(transformed);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Could not load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedUC, forecastPeriod]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  const handleExportPDF = () => {
    if (!dashboardData) return;
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Flood Risk Report - ${dashboardData.ucName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #173b5f; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #173b5f; color: white; }
          .info { margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>C Guard - Flood Risk Report</h1>
        <div class="info"><strong>Station:</strong> ${dashboardData.ucName}</div>
        <div class="info"><strong>Forecast Period:</strong> ${forecastPeriod} hours</div>
        <div class="info"><strong>Generated:</strong> ${new Date().toLocaleString()}</div>

        <h2>Gauge Levels</h2>
        <table>
          <tr><th>Time</th><th>Level (m)</th></tr>
          ${dashboardData.gaugeLevelData?.map(g => `<tr><td>${g.timestamp}</td><td>${g.level}</td></tr>`).join('') || ''}
        </table>

        <h2>Discharge Data</h2>
        <table>
          <tr><th>Time</th><th>Discharge (m³/s)</th></tr>
          ${dashboardData.dischargeData?.map(d => `<tr><td>${d.timestamp}</td><td>${d.discharge}</td></tr>`).join('') || ''}
        </table>

        <script>
          window.onload = () => { window.print(); setTimeout(() => window.close(), 1000); };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleExportCSV = () => {
    if (!dashboardData) return;
    let csvContent = `C Guard - Flood Risk Data\nStation,${dashboardData.ucName}\nForecast,${forecastPeriod} hours\nGenerated,${new Date().toLocaleString()}\n\n`;
    csvContent += `Gauge Levels\nTime,Level (m)\n`;
    dashboardData.gaugeLevelData?.forEach(g => { csvContent += `${g.timestamp},${g.level}\n`; });
    csvContent += `\nDischarge Data\nTime,Discharge (m³/s)\n`;
    dashboardData.dischargeData?.forEach(d => { csvContent += `${d.timestamp},${d.discharge}\n`; });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `CGuard_${dashboardData.ucName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isUCSelected = selectedUC !== '';

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

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
              Loading dashboard data...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
              {error}
            </div>
          ) : !isUCSelected ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 40px',
              color: '#94A3B8',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              margin: '20px'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px', opacity: 0.5 }}>
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                Select a Union Council
              </h3>
              <p style={{ fontSize: '14px' }}>
                Please select a Union Council from the sidebar to view flood monitoring reports and analytics.
              </p>
            </div>
          ) : dashboardData ? (
            <div className="charts-grid">
              <GaugeChart
                data={dashboardData.gaugeLevelData}
                ucName={dashboardData.ucName}
                dateRange={dashboardData.dateRange}
              />
              <div className="charts-row">
                <DischargeChart
                  data={dashboardData.dischargeData}
                  ucName={dashboardData.ucName}
                  dateRange={dashboardData.dateRange}
                />
                <RiskProgressionChart
                  data={dashboardData.riskProgressionData}
                  ucName={dashboardData.ucName}
                  dateRange={dashboardData.dateRange}
                />
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
