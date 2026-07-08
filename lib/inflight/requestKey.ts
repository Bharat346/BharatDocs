import crypto from 'crypto';
import { InflightRequestOptions } from './types';

/**
 * Generates a deterministic SHA-256 hash for a request to uniquely identify it.
 * Two identical requests will produce the exact same hash.
 */
export function generateRequestKey(options: InflightRequestOptions): string {
  if (options.customKey) {
    return options.customKey;
  }

  const parts = [];

  if (options.method) parts.push(`METHOD:${options.method.toUpperCase()}`);
  if (options.url) parts.push(`URL:${options.url}`);
  if (options.userId) parts.push(`USER:${options.userId}`);

  if (options.query) {
    const sortedQuery = Object.keys(options.query)
      .sort()
      .map((k) => `${k}=${options.query![k]}`)
      .join('&');
    if (sortedQuery) parts.push(`QUERY:${sortedQuery}`);
  }

  if (options.headers) {
    // Only hash specific relevant headers that might change the result to avoid cache busting on random headers (e.g., date, user-agent)
    const relevantHeaders = ['authorization', 'accept-language', 'x-custom-tenant'];
    const sortedHeaders = Object.keys(options.headers)
      .map(k => k.toLowerCase())
      .filter(k => relevantHeaders.includes(k))
      .sort()
      .map(k => `${k}=${options.headers![k]}`)
      .join('&');
    if (sortedHeaders) parts.push(`HEADERS:${sortedHeaders}`);
  }

  if (options.body) {
    const bodyStr = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    parts.push(`BODY:${bodyStr}`);
  }

  const rawKey = parts.join('|');
  
  if (!rawKey) {
    throw new Error('InflightRequestOptions must have at least one identifying property to generate a key.');
  }

  return crypto.createHash('sha256').update(rawKey).digest('hex');
}
