// app/admin/logs/page.jsx
'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Container,
  Typography,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
} from '@mui/material';
import {
  Refresh,
  Download,
  Settings,
  Security,
  Timeline,
  People,
  Block,
  DataUsage,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatsCards } from '@/components/admin/StatsCards';
import {
  HourlyChart,
  SeverityPieChart,
  TopIPsChart,
  TrendChart,
} from '@/components/admin/Charts';
import { IPManagement } from '@/components/admin/IPManagement';
import { LogsTable } from '@/components/admin/LogsTable';


const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && (
      <Box sx={{ pt: 3 }}>
        {children}
      </Box>
    )}
  </div>
);

const fetchLogs = async (timeRange = '7d') => {
  const res = await fetch(`/api/admin/logs?timeRange=${timeRange}`);
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
};

const postAction = async (action, data) => {
  const res = await fetch('/api/admin/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, data }),
  });
  if (!res.ok) throw new Error('Failed to perform action');
  return res.json();
};

export default function AdminLogsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('7d');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-logs', timeRange],
    queryFn: () => fetchLogs(timeRange),
    refetchInterval: 60000, // Auto-refresh every 60 seconds
  });

  const mutation = useMutation({
    mutationFn: ({ action, data }) =>
      postAction(action, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
    },
  });

  const handleBlockIP = async (ip, duration, reason) => {
    await mutation.mutateAsync({
      action: 'blockIP',
      data: { ip, duration, reason },
    });
    setSnackbar({
      open: true,
      message: `Successfully blocked ${ip}`,
      severity: 'success',
    });
  };

  const handleUnblockIP = async (ip) => {
    await mutation.mutateAsync({
      action: 'unblockIP',
      data: { ip },
    });
    setSnackbar({
      open: true,
      message: `Successfully unblocked ${ip}`,
      severity: 'success',
    });
  };

  const handleClearLogs = async (type, days) => {
    await mutation.mutateAsync({
      action: 'clearLogs',
      data: { type, days },
    });
    setSnackbar({
      open: true,
      message: `Cleared logs older than ${days} days`,
      severity: 'success',
    });
  };

  const handleExport = () => {
    // Export functionality
    console.log('Exporting data...');
  };

  const tabs = [
    { label: 'Overview', icon: <DataUsage /> },
    { label: 'Security Events', icon: <Security /> },
    { label: 'Access Logs', icon: <Timeline /> },
    { label: 'Visitors', icon: <People /> },
    { label: 'IP Management', icon: <Block /> },
    { label: 'Charts', icon: <Timeline /> },
  ];

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 3,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading Security Dashboard...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Initializing real-time monitoring systems
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Failed to load security data: {error.message}
        </Alert>
      </Container>
    );
  }

  const {
    securityEvents = [],
    accessLogs = [],
    visitors = [],
    rateLimits = [],
    stats = {},
    hourlyStats = [],
    topIPs = [],
    summary = {},
  } = data?.data || {};

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            sx={{
              p: 3,
              mb: 3,
              background: theme =>
                `linear-gradient(135deg, ${theme.palette.primary.dark}20 0%, transparent 100%)`,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  Security Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Real-time monitoring, threat detection, and IP management
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <Tooltip title="Refresh Data">
                  <IconButton onClick={() => refetch()} color="primary">
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export Data">
                  <IconButton onClick={handleExport} color="primary">
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box display="flex" gap={1}>
              {['1d', '7d', '30d'].map(range => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </Box>
          </Paper>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatsCards stats={{ ...stats, ...summary }} />
        </motion.div>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={tab.label}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Box display="grid" gridTemplateColumns={{ md: '1fr 1fr' }} gap={3}>
            <HourlyChart data={hourlyStats} />
            <SeverityPieChart events={securityEvents} />
            <TopIPsChart data={topIPs} />
            <TrendChart hourlyData={hourlyStats} />
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <LogsTable
            title="Security Events"
            logs={securityEvents}
            type="security"
            columns={[
              { key: 'createdAt', label: 'Time' },
              { key: 'event', label: 'Event' },
              { key: 'severity', label: 'Severity' },
              { key: 'ipAddress', label: 'IP Address' },
              { key: 'path', label: 'Path' },
              { key: 'method', label: 'Method' },
            ]}
            severityFilter
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <LogsTable
            title="Access Logs"
            logs={accessLogs}
            type="access"
            columns={[
              { key: 'accessedAt', label: 'Time' },
              { key: 'ipAddress', label: 'IP Address' },
              { key: 'path', label: 'Path' },
              { key: 'method', label: 'Method' },
              { key: 'statusCode', label: 'Status' },
              { key: 'country', label: 'Country' },
            ]}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <LogsTable
            title="Visitors"
            logs={visitors}
            type="visitors"
            columns={[
              { key: 'username', label: 'Username' },
              { key: 'lastSeen', label: 'Last Seen' },
              { key: 'firstSeen', label: 'First Seen' },
              { key: 'userAgent', label: 'User Agent' },
            ]}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <IPManagement
            blockedIPs={rateLimits}
            topIPs={topIPs}
            onBlockIP={handleBlockIP}
            onUnblockIP={handleUnblockIP}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          <Box display="grid" gridTemplateColumns={{ md: '1fr 1fr' }} gap={3}>
            <Box>
              <HourlyChart data={hourlyStats} />
            </Box>
            <Box>
              <SeverityPieChart events={securityEvents} />
            </Box>
            <Box gridColumn={{ md: 'span 2' }}>
              <TrendChart hourlyData={hourlyStats} />
            </Box>
          </Box>
        </TabPanel>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}