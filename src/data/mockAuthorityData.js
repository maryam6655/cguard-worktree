// Simulated Backend API Response for Authority Dashboard
// Replace with real API later

export const authorityDashboardData = {
  lastUpdated: "2024-01-17T10:15:00Z",

  ucList: [
    "Kot Saleem",
    "Kot Khaira",
    "Marala",
    "Rasul",
    "Qadirabad",
    "Khanki",
    "Trimmu",
    "Panjnad"
  ],

  data: {
    "Kot Saleem": {
      thresholdLevel: 11.2,
      gaugeLevels: [
        { time: "00:00", level: 10.2 },
        { time: "04:00", level: 10.4 },
        { time: "08:00", level: 10.7 },
        { time: "12:00", level: 11.0 },
        { time: "16:00", level: 11.3 },
        { time: "20:00", level: 11.5 },
        { time: "24:00", level: 11.4 },
        { time: "28:00", level: 11.2 },
        { time: "32:00", level: 11.0 },
        { time: "36:00", level: 10.8 },
        { time: "40:00", level: 10.6 },
        { time: "44:00", level: 10.4 },
        { time: "48:00", level: 10.3 }
      ],
      discharge: [
        { time: "00:00", value: 5200 },
        { time: "12:00", value: 7100 },
        { time: "24:00", value: 8900 },
        { time: "36:00", value: 7600 },
        { time: "48:00", value: 5800 }
      ],
      riskProgression: [
        { hour: "h1", danger: 60, high: 25, critical: 15 },
        { hour: "h24", danger: 30, high: 35, critical: 35 },
        { hour: "h48", danger: 55, high: 30, critical: 15 }
      ]
    },

    "Kot Khaira": {
      thresholdLevel: 10.8,
      gaugeLevels: [
        { time: "00:00", level: 9.5 },
        { time: "12:00", level: 10.3 },
        { time: "24:00", level: 10.9 },
        { time: "36:00", level: 10.4 },
        { time: "48:00", level: 9.8 }
      ],
      discharge: [
        { time: "00:00", value: 4800 },
        { time: "24:00", value: 7300 },
        { time: "48:00", value: 5200 }
      ],
      riskProgression: [
        { hour: "h1", danger: 70, high: 20, critical: 10 },
        { hour: "h24", danger: 45, high: 35, critical: 20 },
        { hour: "h48", danger: 60, high: 25, critical: 15 }
      ]
    },

    "Marala": {
      thresholdLevel: 12.0,
      gaugeLevels: [
        { time: "00:00", level: 11.2 },
        { time: "24:00", level: 12.4 },
        { time: "48:00", level: 11.8 }
      ],
      discharge: [
        { time: "00:00", value: 9500 },
        { time: "24:00", value: 12000 },
        { time: "48:00", value: 10000 }
      ],
      riskProgression: [
        { hour: "h1", danger: 40, high: 35, critical: 25 },
        { hour: "h24", danger: 20, high: 30, critical: 50 },
        { hour: "h48", danger: 35, high: 40, critical: 25 }
      ]
    },

    "Rasul": {
      thresholdLevel: 10.5,
      gaugeLevels: [
        { time: "00:00", level: 9.8 },
        { time: "24:00", level: 10.7 },
        { time: "48:00", level: 10.1 }
      ],
      discharge: [
        { time: "00:00", value: 6100 },
        { time: "24:00", value: 8200 },
        { time: "48:00", value: 6400 }
      ],
      riskProgression: [
        { hour: "h1", danger: 50, high: 30, critical: 20 },
        { hour: "h24", danger: 35, high: 40, critical: 25 },
        { hour: "h48", danger: 55, high: 30, critical: 15 }
      ]
    },

    "Qadirabad": {
      thresholdLevel: 11.5,
      gaugeLevels: [
        { time: "00:00", level: 10.9 },
        { time: "24:00", level: 11.8 },
        { time: "48:00", level: 11.2 }
      ],
      discharge: [
        { time: "00:00", value: 7800 },
        { time: "24:00", value: 9900 },
        { time: "48:00", value: 8500 }
      ],
      riskProgression: [
        { hour: "h1", danger: 45, high: 35, critical: 20 },
        { hour: "h24", danger: 30, high: 40, critical: 30 },
        { hour: "h48", danger: 50, high: 35, critical: 15 }
      ]
    },

    "Khanki": {
      thresholdLevel: 10.7,
      gaugeLevels: [
        { time: "00:00", level: 10.1 },
        { time: "24:00", level: 10.9 },
        { time: "48:00", level: 10.3 }
      ],
      discharge: [
        { time: "00:00", value: 6500 },
        { time: "24:00", value: 8700 },
        { time: "48:00", value: 7200 }
      ],
      riskProgression: [
        { hour: "h1", danger: 55, high: 30, critical: 15 },
        { hour: "h24", danger: 40, high: 35, critical: 25 },
        { hour: "h48", danger: 60, high: 25, critical: 15 }
      ]
    },

    "Trimmu": {
      thresholdLevel: 11.8,
      gaugeLevels: [
        { time: "00:00", level: 11.0 },
        { time: "24:00", level: 12.2 },
        { time: "48:00", level: 11.5 }
      ],
      discharge: [
        { time: "00:00", value: 8800 },
        { time: "24:00", value: 11500 },
        { time: "48:00", value: 9200 }
      ],
      riskProgression: [
        { hour: "h1", danger: 35, high: 35, critical: 30 },
        { hour: "h24", danger: 20, high: 30, critical: 50 },
        { hour: "h48", danger: 40, high: 40, critical: 20 }
      ]
    },

    "Panjnad": {
      thresholdLevel: 12.5,
      gaugeLevels: [
        { time: "00:00", level: 12.0 },
        { time: "24:00", level: 13.2 },
        { time: "48:00", level: 12.6 }
      ],
      discharge: [
        { time: "00:00", value: 11000 },
        { time: "24:00", value: 14000 },
        { time: "48:00", value: 11800 }
      ],
      riskProgression: [
        { hour: "h1", danger: 30, high: 30, critical: 40 },
        { hour: "h24", danger: 15, high: 25, critical: 60 },
        { hour: "h48", danger: 35, high: 35, critical: 30 }
      ]
    }
  },

  summaryStats: {
    monitoredUCs: 156,
    criticalCount: 8,
    highCount: 23,
    moderateCount: 47
  }
};

// Legacy adapter for backward compatibility
export const mockAuthorityData = {
  unitCommands: authorityDashboardData.ucList.map((name, index) => ({
    id: index + 1,
    name: name
  })),
  gaugeLevelData: [],
  dischargeData: [],
  riskProgressionData: []
};

// Fetch function to simulate API call with UC-specific data
export const fetchAuthorityData = async (selectedUC, forecastPeriod, startDate, endDate) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Find the UC name from the ID
  const ucName = authorityDashboardData.ucList[selectedUC - 1];
  
  if (!ucName || !authorityDashboardData.data[ucName]) {
    return mockAuthorityData;
  }
  
  const ucData = authorityDashboardData.data[ucName];
  
  // Calculate date range string for display
  let dateRangeStr = '';
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const formatDate = (date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    };
    dateRangeStr = `${formatDate(start)} - ${formatDate(end)}, ${end.getFullYear()}`;
  } else {
    // Default date range from lastUpdated
    const lastUpdate = new Date(authorityDashboardData.lastUpdated);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    dateRangeStr = `${monthNames[lastUpdate.getMonth()]} ${lastUpdate.getDate() - 2} - ${monthNames[lastUpdate.getMonth()]} ${lastUpdate.getDate()}, ${lastUpdate.getFullYear()}`;
  }
  
  // Transform data to match the expected format
  return {
    unitCommands: mockAuthorityData.unitCommands,
    gaugeLevelData: ucData.gaugeLevels.map(item => ({
      timestamp: item.time,
      level: item.level,
      threshold: ucData.thresholdLevel
    })),
    dischargeData: ucData.discharge.map(item => ({
      timestamp: item.time,
      discharge: item.value,
      capacity: ucData.thresholdLevel * 1000 // Estimated capacity
    })),
    riskProgressionData: ucData.riskProgression.map(item => ({
      timestamp: item.hour,
      critical: item.critical || 0,
      high: item.high || 0,
      moderate: item.danger || 0,  // Map 'danger' to 'moderate'
      low: item.low || 0
    })),
    ucName: ucName,
    thresholdLevel: ucData.thresholdLevel,
    lastUpdated: authorityDashboardData.lastUpdated,
    dateRange: dateRangeStr
  };
};
