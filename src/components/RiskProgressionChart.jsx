import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/AuthorityDashboard.css';

const RiskProgressionChart = ({ data, ucName, dateRange }) => {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Flood Risk Level Progression</h3>
        {ucName && dateRange && (
          <p className="chart-subtitle">{ucName} | {dateRange}</p>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#64748B"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#64748B"
            style={{ fontSize: '12px' }}
            label={{ value: 'Risk Distribution (%)', angle: -90, position: 'insideLeft', style: { fill: '#64748B' } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #E2E8F0',
              borderRadius: '4px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Area 
            type="monotone" 
            dataKey="critical" 
            stackId="1" 
            stroke="#DC2626" 
            fill="#DC2626" 
            name="Critical"
          />
          <Area 
            type="monotone" 
            dataKey="high" 
            stackId="1" 
            stroke="#FB923C" 
            fill="#FB923C" 
            name="High"
          />
          <Area 
            type="monotone" 
            dataKey="moderate" 
            stackId="1" 
            stroke="#FACC15" 
            fill="#FACC15" 
            name="Moderate"
          />
          <Area 
            type="monotone" 
            dataKey="low" 
            stackId="1" 
            stroke="#16A34A" 
            fill="#16A34A" 
            name="Low"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskProgressionChart;
