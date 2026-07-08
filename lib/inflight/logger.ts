export const logger = {
  info: (msg: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production' || process.env.INFLIGHT_DEBUG === 'true') {
      console.log(`[InFlight INFO] ${msg}`, meta || '');
    }
  },
  warn: (msg: string, meta?: any) => {
    console.warn(`[InFlight WARN] ${msg}`, meta || '');
  },
  error: (msg: string, err?: any) => {
    console.error(`[InFlight ERROR] ${msg}`, err || '');
  }
};
