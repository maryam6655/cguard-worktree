import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import '../styles/AuthorityDashboard.css';

const DischargeChart = ({ data, ucName, dateRange }) => {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">River Discharge (Q) Analysis</h3>
        {ucName && dateRange && (
          <p className="chart-subtitle">{ucName} | {dateRange}</p>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#64748B"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#64748B"
            style={{ fontSize: '12px' }}
            label={{ value: 'Discharge (m³/s)', angle: -90, position: 'insideLeft', style: { fill: '#64748B' } }}
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
          <ReferenceLine 
            y={300} 
            stroke="#DC2626" 
            strokeDasharray="5 5" 
            label={{ value: 'Capacity', position: 'right', fill: '#DC2626', fontSize: 12 }}
          />
          <Line 
            type="monotone" 
            dataKey="discharge" 
            stroke="#16A34A" 
            strokeWidth={2}
            name="Discharge"
            dot={{ fill: '#16A34A', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DischargeChart;
