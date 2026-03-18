// app/admin/logs/page.jsx
"use client";

import { useState, useEffect } from "react";
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
  alpha,
} from "@mui/material";
import {
  Refresh,
  Download,
  Settings,
  Security,
  Timeline,
  People,
  Block,
  DataUsage,
  Logout,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StatsCards } from "@/components/admin/StatsCards";
import {
  HourlyChart,
  SeverityPieChart,
  TopIPsChart,
  TrendChart,
} from "@/components/admin/Charts";
import { IPManagement } from "@/components/admin/IPManagement";
import { LogsTable } from "@/components/admin/LogsTable";

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const fetchLogs = async (timeRange = "7d") => {
  const res = await fetch(`/api/admin/logs?timeRange=${timeRange}`);
  if (!res.ok) throw new Error("Failed to fetch logs");
  return res.json();
};

const postAction = async (action, data) => {
  const res = await fetch("/api/admin/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, data }),
  });
  if (!res.ok) throw new Error("Failed to perform action");
  return res.json();
};

export default function AdminLogsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState("7d");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [theme, setTheme] = useState("light");

  const queryClient = useQueryClient();

  // Detect theme from localStorage or system preference
  useEffect(() => {
    // Check localStorage for theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-logs", timeRange],
    queryFn: () => fetchLogs(timeRange),
    refetchInterval: 60000, // Auto-refresh every 60 seconds
  });

  const mutation = useMutation({
    mutationFn: ({ action, data }) => postAction(action, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
    },
  });

  const handleBlockIP = async (ip, duration, reason) => {
    await mutation.mutateAsync({
      action: "blockIP",
      data: { ip, duration, reason },
    });
    setSnackbar({
      open: true,
      message: `Successfully blocked ${ip}`,
      severity: "success",
    });
  };

  const handleUnblockIP = async (ip) => {
    await mutation.mutateAsync({
      action: "unblockIP",
      data: { ip },
    });
    setSnackbar({
      open: true,
      message: `Successfully unblocked ${ip}`,
      severity: "success",
    });
  };

  const handleClearLogs = async (type, days) => {
    await mutation.mutateAsync({
      action: "clearLogs",
      data: { type, days },
    });
    setSnackbar({
      open: true,
      message: `Cleared logs older than ${days} days`,
      severity: "success",
    });
  };

  const handleExport = () => {
    // Export functionality
    console.log("Exporting data...");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const tabs = [
    { label: "Overview", icon: <DataUsage /> },
    { label: "Security Events", icon: <Security /> },
    { label: "Access Logs", icon: <Timeline /> },
    { label: "Visitors", icon: <People /> },
    { label: "IP Management", icon: <Block /> },
    { label: "Charts", icon: <Timeline /> },
  ];

  // Theme-based styles
  const themeStyles = {
    light: {
      background: "none",
      bgColor: "background.default",
      paperBg: "#ffffff",
      textPrimary: "text.primary",
      textSecondary: "text.secondary",
      buttonVariant: "contained",
      tabIndicator: "primary",
    },
    dark: {
      background: "none",
      bgColor: "#0a0a0a",
      paperBg: "#111111",
      textPrimary: "#ffffff",
      textSecondary: "rgba(255, 255, 255, 0.7)",
      buttonVariant: "outlined",
      tabIndicator: "secondary",
    },
  };

  const currentTheme = themeStyles[theme];

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 3,
          bgcolor: currentTheme.bgColor,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color={currentTheme.textSecondary}>
          Loading Security Dashboard...
        </Typography>
        <Typography variant="body2" color={currentTheme.textSecondary}>
          Initializing real-time monitoring systems
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, bgcolor: currentTheme.bgColor }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => refetch()}
              sx={{
                color: theme === "dark" ? "#fff" : "inherit",
                borderColor:
                  theme === "dark" ? "rgba(255, 255, 255, 0.3)" : "inherit",
              }}
            >
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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: currentTheme.bgColor,
        color: currentTheme.textPrimary,
      }}
    >
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
              background: "none",
              backgroundColor: currentTheme.paperBg,
              border:
                theme === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid rgba(0, 0, 0, 0.05)",
              boxShadow: "none",
              borderRadius: 4,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Box>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  gutterBottom
                  color={currentTheme.textPrimary}
                  sx={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}
                >
                  Security Dashboard
                </Typography>
                <Typography variant="body1" color={currentTheme.textSecondary}>
                  Real-time monitoring, threat detection, and IP management
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <Tooltip title="Refresh Data">
                  <IconButton
                    onClick={() => refetch()}
                    sx={{
                      color: theme === "dark" ? "#90caf9" : "primary.main",
                      "&:hover": {
                        backgroundColor:
                          theme === "dark"
                            ? "rgba(144, 202, 249, 0.1)"
                            : "rgba(25, 118, 210, 0.1)",
                      },
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export Data">
                  <IconButton
                    onClick={handleExport}
                    sx={{
                      color: theme === "dark" ? "#90caf9" : "primary.main",
                      "&:hover": {
                        backgroundColor:
                          theme === "dark"
                            ? "rgba(144, 202, 249, 0.1)"
                            : "rgba(25, 118, 210, 0.1)",
                      },
                    }}
                  >
                    <Download />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Logout">
                  <IconButton
                    onClick={handleLogout}
                    sx={{
                      color: theme === "dark" ? "#f44336" : "error.main",
                      "&:hover": {
                        backgroundColor:
                          theme === "dark"
                            ? "rgba(244, 67, 54, 0.1)"
                            : "rgba(211, 47, 47, 0.1)",
                      },
                    }}
                  >
                    <Logout />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box display="flex" gap={1}>
              {["1d", "7d", "30d"].map((range) => (
                <Button
                  key={range}
                  variant={
                    timeRange === range
                      ? "contained"
                      : currentTheme.buttonVariant
                  }
                  size="small"
                  onClick={() => setTimeRange(range)}
                  sx={{
                    ...(theme === "dark" &&
                      timeRange !== range && {
                        color: "rgba(255, 255, 255, 0.7)",
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        "&:hover": {
                          borderColor: "rgba(255, 255, 255, 0.5)",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                        },
                      }),
                  }}
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
          <StatsCards stats={{ ...stats, ...summary }} theme={theme} />
        </motion.div>

        {/* Tabs */}
        <Paper
          sx={{
            mb: 3,
            backgroundColor: currentTheme.paperBg,
            border:
              theme === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                minHeight: 64,
                color: currentTheme.textSecondary,
                "&.Mui-selected": {
                  color: theme === "dark" ? "#90caf9" : "primary.main",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: theme === "dark" ? "#90caf9" : "primary.main",
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={tab.label}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{
                  "& .MuiSvgIcon-root": {
                    color:
                      activeTab === index
                        ? theme === "dark"
                          ? "#90caf9"
                          : "primary.main"
                        : currentTheme.textSecondary,
                  },
                }}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Box display="grid" gridTemplateColumns={{ md: "1fr 1fr" }} gap={3}>
            <HourlyChart data={hourlyStats} theme={theme} />
            <SeverityPieChart events={securityEvents} theme={theme} />
            <TopIPsChart data={topIPs} theme={theme} />
            <TrendChart hourlyData={hourlyStats} theme={theme} />
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <LogsTable
            title="Security Events"
            logs={securityEvents}
            type="security"
            columns={[
              { key: "createdAt", label: "Time" },
              { key: "event", label: "Event" },
              { key: "severity", label: "Severity" },
              { key: "ipAddress", label: "IP Address" },
              { key: "path", label: "Path" },
              { key: "method", label: "Method" },
            ]}
            severityFilter
            theme={theme}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <LogsTable
            title="Access Logs"
            logs={accessLogs}
            type="access"
            columns={[
              { key: "accessedAt", label: "Time" },
              { key: "ipAddress", label: "IP Address" },
              { key: "path", label: "Path" },
              { key: "method", label: "Method" },
              { key: "statusCode", label: "Status" },
              { key: "country", label: "Country" },
            ]}
            theme={theme}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <LogsTable
            title="Visitors"
            logs={visitors}
            type="visitors"
            columns={[
              { key: "username", label: "Username" },
              { key: "lastSeen", label: "Last Seen" },
              { key: "firstSeen", label: "First Seen" },
              { key: "userAgent", label: "User Agent" },
            ]}
            theme={theme}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <IPManagement
            blockedIPs={rateLimits}
            topIPs={topIPs}
            onBlockIP={handleBlockIP}
            onUnblockIP={handleUnblockIP}
            theme={theme}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          <Box display="grid" gridTemplateColumns={{ md: "1fr 1fr" }} gap={3}>
            <Box>
              <HourlyChart data={hourlyStats} theme={theme} />
            </Box>
            <Box>
              <SeverityPieChart events={securityEvents} theme={theme} />
            </Box>
            <Box gridColumn={{ md: "span 2" }}>
              <TrendChart hourlyData={hourlyStats} theme={theme} />
            </Box>
          </Box>
        </TabPanel>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
            color: theme === "dark" ? "#fff" : "inherit",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
