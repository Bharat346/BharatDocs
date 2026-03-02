// components/admin/StatsCards.tsx
"use client";

import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  Security,
  Warning,
  People,
  Block,
  TrendingUp,
  AccessTime,
  DataUsage,
  Public,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useThemeContext } from "@/components/ThemeProvider";

const StatsCard = ({ title, value, change, icon, color, darkColor, theme }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card
      sx={{
        height: "100%",
        background:
          theme === "dark"
            ? "var(--color-bg-secondary)"
            : "var(--color-bg-secondary)",
        border: `1px solid ${
          theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"
        }`,
        position: "relative",
        overflow: "hidden",
        boxShadow: "none",
        borderRadius: 4,
        "&:hover": {
          transform: "translateY(-2px)",
          transition: "all 0.3s ease",
          borderColor: theme === "dark" ? darkColor : color,
        },
      }}
    >
      <CardContent sx={{ position: "relative", zIndex: 2, p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box className="flex-1">
            <Typography
              color="text.secondary"
              variant="body2"
              noWrap
              sx={{
                mb: 1,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontSize: "0.75rem",
              }}
            >
              {title}
            </Typography>

            <Typography
              noWrap
              sx={{
                fontWeight: 800,
                fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
                color: theme === "dark" ? "white" : "neutral.900",
                lineHeight: 1,
              }}
            >
              {typeof value === "number" ? value.toLocaleString() : value}
            </Typography>

            {change !== undefined && (
              <Box display="flex" alignItems="center" mt={1.5}>
                <TrendingUp
                  sx={{
                    fontSize: 16,
                    mr: 0.5,
                    color: change >= 0 ? "#10b981" : "#ef4444",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: change >= 0 ? "#10b981" : "#ef4444",
                    fontWeight: 700,
                  }}
                >
                  {change >= 0 ? "+" : ""}
                  {change}%
                </Typography>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                theme === "dark"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(0, 0, 0, 0.03)",
              color: theme === "dark" ? darkColor : color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

export const StatsCards = ({ stats }) => {
  const { theme } = useThemeContext();

  const cards = [
    {
      title: "Security Events",
      value: stats.totalSecurityEvents,
      icon: <Security sx={{ color: "#3b82f6" }} />,
      color: "#3b82f6",
      darkColor: "#60a5fa",
    },
    {
      title: "Critical Threats",
      value: stats.criticalEvents,
      icon: <Warning sx={{ color: "#ef4444" }} />,
      color: "#ef4444",
      darkColor: "#f87171",
    },
    {
      title: "Unique IPs",
      value: stats.uniqueIPs,
      icon: <Public sx={{ color: "#10b981" }} />,
      color: "#10b981",
      darkColor: "#34d399",
    },
    {
      title: "Today's Events",
      value: stats.todayEvents,
      icon: <AccessTime sx={{ color: "#f59e0b" }} />,
      color: "#f59e0b",
      darkColor: "#fbbf24",
    },
    {
      title: "Blocked IPs",
      value: stats.blockedIPs,
      icon: <Block sx={{ color: "#8b5cf6" }} />,
      color: "#8b5cf6",
      darkColor: "#a78bfa",
    },
    {
      title: "Total Visitors",
      value: stats.totalVisitors,
      icon: <People sx={{ color: "#ec4899" }} />,
      color: "#ec4899",
      darkColor: "#f472b6",
    },
    {
      title: "Access Logs",
      value: stats.totalAccessLogs,
      icon: <DataUsage sx={{ color: "#06b6d4" }} />,
      color: "#06b6d4",
      darkColor: "#22d3ee",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gap: 2,
        mb: 4,
      }}
    >
      {cards.map((card) => (
        <StatsCard key={card.title} {...card} theme={theme} />
      ))}
    </Box>
  );
};
