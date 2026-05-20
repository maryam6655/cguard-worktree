import React from 'react';
import '../styles/AuthorityDashboard.css';

const Sidebar = ({ 
  unitCommands, 
  selectedUC, 
  onUCChange, 
  forecastPeriod, 
  onForecastPeriodChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onManageShelters,
  activePage = 'dashboard'
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">Dashboard</h3>
      </div>
      
      <div className="sidebar-section">
        <label className="sidebar-label">Select Union Council</label>
        <select 
          className="sidebar-select" 
          value={selectedUC} 
          onChange={(e) => onUCChange(e.target.value)}
        >
          <option value="">Choose UC...</option>
          {unitCommands.map(uc => (
            <option key={uc.id} value={uc.id}>
              {uc.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sidebar-section">
        <label className="sidebar-label">Forecast Period</label>
        <div className="radio-group">
          <label className="radio-label">
            <input 
              type="radio" 
              name="forecast" 
              value="24"
              checked={forecastPeriod === '24'}
              onChange={(e) => onForecastPeriodChange(e.target.value)}
            />
            <span>24 Hours</span>
          </label>
          <label className="radio-label">
            <input 
              type="radio" 
              name="forecast" 
              value="48"
              checked={forecastPeriod === '48'}
              onChange={(e) => onForecastPeriodChange(e.target.value)}
            />
            <span>48 Hours</span>
          </label>
          <label className="radio-label">
            <input 
              type="radio" 
              name="forecast" 
              value="72"
              checked={forecastPeriod === '72'}
              onChange={(e) => onForecastPeriodChange(e.target.value)}
            />
            <span>72 Hours</span>
          </label>
        </div>
      </div>

      <div className="sidebar-section">
        <label className="sidebar-label">Date Range</label>
        <div className="date-inputs">
          <input 
            type="date" 
            className="date-input"
            value={startDate}
            onChange={(e) => {
              onStartDateChange(e.target.value);
              // Auto-set end date if empty
              if (!endDate && e.target.value) {
                const nextMonth = new Date(e.target.value);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                onEndDateChange(nextMonth.toISOString().split('T')[0]);
              }
            }}
            placeholder="Start Date"
          />
          <span className="date-separator">to</span>
          <input 
            type="date" 
            className="date-input"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={startDate}
            placeholder="End Date"
          />
        </div>
        {startDate && endDate && (
          <div style={{ 
            fontSize: '11px', 
            color: '#64748B', 
            marginTop: '8px',
            padding: '6px 8px',
            backgroundColor: '#F1F5F9',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            {(() => {
              const start = new Date(startDate);
              const end = new Date(endDate);
              const diffTime = Math.abs(end - start);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return `${diffDays} day${diffDays !== 1 ? 's' : ''} selected`;
            })()}
          </div>
        )}
      </div>

      <div className="sidebar-section sidebar-action-section">
        <button
          type="button"
          className={`sidebar-action-btn ${activePage === 'shelter-management' ? 'is-active' : ''}`}
          onClick={onManageShelters}
        >
          Manage Shelters
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
