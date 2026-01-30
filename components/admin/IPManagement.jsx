// components/admin/IPManagement.jsx
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Block,
  CheckCircle,
  Delete,
  Refresh,
  Search,
  Public,
  Warning,
  Add,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

export const IPManagement = ({
  blockedIPs,
  topIPs,
  onBlockIP,
  onUnblockIP,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedIP, setSelectedIP] = useState('');
  const [blockDuration, setBlockDuration] = useState(24);
  const [blockReason, setBlockReason] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const filteredBlockedIPs = blockedIPs.filter(ip =>
    ip.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBlockIP = async () => {
    try {
      await onBlockIP(selectedIP, blockDuration, blockReason);
      setSnackbar({
        open: true,
        message: `Successfully blocked ${selectedIP}`,
        severity: 'success',
      });
      setBlockDialogOpen(false);
      setSelectedIP('');
      setBlockReason('');
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to block IP: ${error}`,
        severity: 'error',
      });
    }
  };

  const handleUnblockIP = async (ip) => {
    try {
      await onUnblockIP(ip);
      setSnackbar({
        open: true,
        message: `Successfully unblocked ${ip}`,
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to unblock IP: ${error}`,
        severity: 'error',
      });
    }
  };

  const openBlockDialog = (ip) => {
    setSelectedIP(ip);
    setBlockDialogOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600}>
                IP Management
              </Typography>
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  placeholder="Search IPs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => openBlockDialog('')}
                >
                  Block IP
                </Button>
              </Box>
            </Box>

            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Currently Blocked IPs ({filteredBlockedIPs.length})
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>IP Address</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Blocked At</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {filteredBlockedIPs.map((ip) => (
                      <motion.tr
                        key={ip.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Public fontSize="small" />
                            <Typography variant="body2" fontFamily="monospace">
                              {ip.key}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={ip.type}
                            size="small"
                            color="secondary"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(ip.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(ip.expiresAt).toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleUnblockIP(ip.key)}
                          >
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {filteredBlockedIPs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Box textAlign="center">
                          <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                          <Typography color="text.secondary">
                            No IPs are currently blocked
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle1" fontWeight={600} mt={3} mb={2}>
              Top IPs by Activity
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>IP Address</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell align="right">Event Count</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topIPs.map((ip) => (
                    <TableRow key={ip.ipAddress}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Public fontSize="small" />
                          <Typography variant="body2" fontFamily="monospace">
                            {ip.ipAddress}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {ip.country || 'Unknown'}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={ip.count}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {ip.isSuspicious ? (
                          <Chip
                            label="Suspicious"
                            size="small"
                            color="warning"
                            icon={<Warning />}
                          />
                        ) : (
                          <Chip
                            label="Normal"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => openBlockDialog(ip.ipAddress)}
                        >
                          <Block fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Block color="error" />
            Block IP Address
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="IP Address"
              value={selectedIP}
              onChange={(e) => setSelectedIP(e.target.value)}
              placeholder="e.g., 192.168.1.1"
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Block Duration</InputLabel>
              <Select
                value={blockDuration}
                onChange={(e) => setBlockDuration(Number(e.target.value))}
                label="Block Duration"
              >
                <MenuItem value={1}>1 hour</MenuItem>
                <MenuItem value={6}>6 hours</MenuItem>
                <MenuItem value={24}>24 hours</MenuItem>
                <MenuItem value={168}>7 days</MenuItem>
                <MenuItem value={720}>30 days</MenuItem>
                <MenuItem value={8760}>Permanent (1 year)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Reason"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Enter reason for blocking..."
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleBlockIP}
            disabled={!selectedIP}
            startIcon={<Block />}
          >
            Block IP
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
};