// components/admin/LogsTable.jsx
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Tooltip,
} from '@mui/material';
import {
  Search,
  FilterList,
  Warning,
  CheckCircle,
  Cancel,
  Security,
  Public,
  CalendarToday,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

export const LogsTable = ({
  title,
  logs,
  type,
  columns,
  severityFilter = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = Object.values(log).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (severityFilter && selectedSeverity !== 'all') {
      return matchesSearch && log.severity === selectedSeverity;
    }
    
    return matchesSearch;
  });

  const paginatedLogs = filteredLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const severityColors = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'primary',
    info: 'default',
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <Cancel fontSize="small" />;
      case 'high':
        return <Warning fontSize="small" />;
      case 'medium':
        return <Warning fontSize="small" />;
      default:
        return <CheckCircle fontSize="small" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={600}>
              {title} ({filteredLogs.length})
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                size="small"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              {severityFilter && (
                <Box display="flex" gap={0.5}>
                  {['all', 'critical', 'high', 'medium', 'low', 'info'].map(severity => (
                    <Chip
                      key={severity}
                      label={severity}
                      size="small"
                      color={selectedSeverity === severity ? severityColors[severity] : 'default'}
                      variant={selectedSeverity === severity ? 'filled' : 'outlined'}
                      onClick={() => setSelectedSeverity(severity)}
                      icon={severity !== 'all' ? getSeverityIcon(severity) : undefined}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  {columns.map(column => (
                    <TableCell key={column.key} sx={{ fontWeight: 600 }}>
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {paginatedLogs.map((log, index) => (
                    <motion.tr
                      key={log.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: 'var(--mui-palette-action-hover)' }}
                    >
                      {columns.map(column => (
                        <TableCell key={column.key}>
                          {column.render 
                            ? column.render(log[column.key], log)
                            : column.key === 'severity'
                            ? (
                              <Chip
                                label={log[column.key]}
                                size="small"
                                color={severityColors[log[column.key]]}
                                icon={getSeverityIcon(log[column.key])}
                              />
                            )
                            : column.key === 'createdAt' || column.key === 'accessedAt' || column.key === 'lastSeen'
                            ? new Date(log[column.key]).toLocaleString()
                            : column.key === 'ipAddress'
                            ? (
                              <Box display="flex" alignItems="center" gap={1}>
                                <Public fontSize="small" />
                                <Typography variant="body2" fontFamily="monospace">
                                  {log[column.key]}
                                </Typography>
                              </Box>
                            )
                            : column.key === 'userAgent'
                            ? (
                              <Tooltip title={log[column.key]}>
                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                  {log[column.key]}
                                </Typography>
                              </Tooltip>
                            )
                            : String(log[column.key] || '')
                          }
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {paginatedLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                      <Box textAlign="center">
                        <Search sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography color="text.secondary">
                          No {title.toLowerCase()} found
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredLogs.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};