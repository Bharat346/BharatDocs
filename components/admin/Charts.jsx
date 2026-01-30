// components/admin/Charts.tsx
'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';

const ChartContainer = ({ title, children, height = 300 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          {title}
        </Typography>
        <Box sx={{ height, mt: 2 }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

export const HourlyChart = ({ data }) => {
  const formattedData = Array.from({ length: 24 }, (_, i) => {
    const hourData = data.find(d => d.hour === i);
    return {
      hour: `${i}:00`,
      events: hourData?.count || 0,
    };
  });

  return (
    <ChartContainer title="Events by Hour">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--mui-palette-divider)" />
          <XAxis 
            dataKey="hour" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              background: 'var(--mui-palette-background-paper)',
              border: '1px solid var(--mui-palette-divider)',
              borderRadius: 8,
            }}
          />
          <Bar 
            dataKey="events" 
            fill="var(--mui-palette-primary-main)" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export const SeverityPieChart = ({ events }) => {
  const severityCounts = events.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(severityCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const COLORS = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#f59e0b',
    low: '#3b82f6',
    info: '#6b7280',
  };

  return (
    <ChartContainer title="Events by Severity">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name.toLowerCase()] || '#6b7280'} 
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              background: 'var(--mui-palette-background-paper)',
              border: '1px solid var(--mui-palette-divider)',
              borderRadius: 8,
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export const TopIPsChart = ({ data }) => {
  const formattedData = data.map(ip => ({
    ...ip,
    shortIP: ip.ipAddress.length > 15 
      ? `${ip.ipAddress.substring(0, 12)}...`
      : ip.ipAddress,
  }));

  return (
    <ChartContainer title="Top IPs by Events">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={formattedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--mui-palette-divider)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis 
            type="category" 
            dataKey="shortIP" 
            tick={{ fontSize: 12 }}
            width={100}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'var(--mui-palette-background-paper)',
              border: '1px solid var(--mui-palette-divider)',
              borderRadius: 8,
            }}
            formatter={(value, name, props) => [
              value,
              props.payload.ipAddress,
            ]}
          />
          <Bar 
            dataKey="count" 
            fill="var(--mui-palette-secondary-main)" 
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export const TrendChart = ({ hourlyData }) => {
  const formattedData = Array.from({ length: 24 }, (_, i) => {
    const hourData = hourlyData.find(d => d.hour === i);
    return {
      hour: `${i}:00`,
      events: hourData?.count || 0,
      cumulative: hourlyData
        .filter(d => d.hour <= i)
        .reduce((sum, d) => sum + d.count, 0),
    };
  });

  return (
    <ChartContainer title="Event Trends">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--mui-palette-divider)" />
          <XAxis 
            dataKey="hour" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              background: 'var(--mui-palette-background-paper)',
              border: '1px solid var(--mui-palette-divider)',
              borderRadius: 8,
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="events"
            stroke="var(--mui-palette-primary-main)"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulative"
            stroke="var(--mui-palette-secondary-main)"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};