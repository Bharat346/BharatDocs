import crypto from 'crypto';

/**
 * Generates a deterministic hash key for a given request to be used in coalescing.
 * It strictly orders object keys to ensure identical payloads produce the same hash.
 * 
 * @param {Object} options
 * @param {string} options.method - HTTP Method (e.g., 'GET')
 * @param {string} options.route - The requested route path (e.g., '/api/docs')
 * @param {Record<string, any>} [options.queryParams] - Query parameters
 * @param {any} [options.body] - Request body
 * @param {string} [options.tenantId] - Optional tenant/role identifier for security isolation
 * @param {string} [options.locale] - Optional language/locale
 * @returns {string} SHA-256 hex hash
 */
export function generateRequestKey(options) {
  const {
    method = 'GET',
    route = '',
    queryParams = {},
    body = null,
    tenantId = 'global',
    locale = 'en',
  } = options;

  // Recursively sort object keys to guarantee deterministic serialization
  const sortObject = (obj) => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(sortObject);
    }
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = sortObject(obj[key]);
        return result;
      }, {});
  };

  const canonicalPayload = {
    method: method.toUpperCase(),
    route,
    queryParams: sortObject(queryParams),
    body: sortObject(body),
    tenantId,
    locale,
  };

  const payloadString = JSON.stringify(canonicalPayload);

  return crypto.createHash('sha256').update(payloadString).digest('hex');
}
