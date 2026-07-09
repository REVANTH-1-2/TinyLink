import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import Card from './Card';

interface ClickData {
  clickTimestamp: string;
  country: string;
  browser: string;
  operatingSystem: string;
  deviceType: string;
  referrer: string;
}

interface DashboardChartsProps {
  clicks: ClickData[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ clicks }) => {
  // 1. Process click trends over the last 7 days
  const clicksOverTime = useMemo(() => {
    const datesMap: { [key: string]: number } = {};
    
    // Seed last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      datesMap[label] = 0;
    }

    clicks.forEach((click) => {
      const date = new Date(click.clickTimestamp);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (datesMap[label] !== undefined) {
        datesMap[label]++;
      }
    });

    return Object.keys(datesMap).map((key) => ({
      date: key,
      Clicks: datesMap[key],
    }));
  }, [clicks]);

  // Helper to group by property and sort
  const getGroupedData = (property: keyof ClickData, limit = 5) => {
    const counts: { [key: string]: number } = {};
    clicks.forEach((click) => {
      const val = click[property] || 'Unknown';
      counts[val] = (counts[val] || 0) + 1;
    });

    return Object.keys(counts)
      .map((key) => ({ name: key, value: counts[key] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  };

  const devicesData = useMemo(() => getGroupedData('deviceType'), [clicks]);
  const browsersData = useMemo(() => getGroupedData('browser'), [clicks]);
  const countriesData = useMemo(() => getGroupedData('country'), [clicks]);
  const referrersData = useMemo(() => getGroupedData('referrer'), [clicks]);

  // Chart Styling Palette
  const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      
      {/* 1. Click Trend (Full Width) */}
      <Card>
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
            Click Performance
          </h3>
          <p className="text-xs text-slate-500">
            Clicks recorded over the past 7 days
          </p>
        </div>
        <div className="h-72 w-full">
          {clicks.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400 dark:text-slate-500">
              No click history found. Share your links to track metrics!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={clicksOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} style={{ fontSize: '11px', fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                  }} 
                />
                <Area type="monotone" dataKey="Clicks" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* 2. Breakdown Section Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Device Types Pie Chart */}
        <Card>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-4">
            Device Distribution
          </h4>
          <div className="h-60 w-full flex items-center justify-center">
            {devicesData.length === 0 ? (
              <span className="text-xs text-slate-400">No device records</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={devicesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {devicesData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} clicks`, 'Count']} />
                  <Legend verticalAlign="bottom" height={36} style={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Referrer Distribution Bar Chart */}
        <Card>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-4">
            Top Referrers
          </h4>
          <div className="h-60 w-full">
            {referrersData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">No referrer records</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={referrersData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: '#94a3b8' }} />
                  <YAxis dataKey="name" type="category" width={80} tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: '#94a3b8' }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Country Distribution */}
        <Card>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-4">
            Top Countries
          </h4>
          <div className="h-60 w-full">
            {countriesData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">No location records</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countriesData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: '#94a3b8' }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: '#94a3b8' }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Browsers Pie Chart */}
        <Card>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-4">
            Web Browsers
          </h4>
          <div className="h-60 w-full flex items-center justify-center">
            {browsersData.length === 0 ? (
              <span className="text-xs text-slate-400">No browser records</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={browsersData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {browsersData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} clicks`, 'Count']} />
                  <Legend verticalAlign="bottom" height={36} style={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        
      </div>
    </div>
  );
};

export default DashboardCharts;
