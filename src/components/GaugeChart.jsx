import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import '../styles/AuthorityDashboard.css';

const GaugeChart = ({ data, ucName, dateRange }) => {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Gauge Level Analysis</h3>
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
            label={{ value: 'Level (m)', angle: -90, position: 'insideLeft', style: { fill: '#64748B' } }}
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
            y={4.0} 
            stroke="#DC2626" 
            strokeDasharray="5 5" 
            label={{ value: 'Threshold', position: 'right', fill: '#DC2626', fontSize: 12 }}
          />
          <Line 
            type="monotone" 
            dataKey="level" 
            stroke="#2563EB" 
            strokeWidth={2}
            name="Gauge Level"
            dot={{ fill: '#2563EB', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GaugeChart;
