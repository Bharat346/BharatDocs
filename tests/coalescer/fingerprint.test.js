import { generateRequestKey } from '../../lib/coalescer/fingerprint.js';

describe('Request Coalescer - Fingerprint Generator', () => {
  it('should generate identical hashes for identical inputs', () => {
    const req1 = { method: 'GET', route: '/api/docs', tenantId: '123' };
    const req2 = { method: 'GET', route: '/api/docs', tenantId: '123' };

    expect(generateRequestKey(req1)).toBe(generateRequestKey(req2));
  });

  it('should sort object keys to guarantee determinism', () => {
    const req1 = {
      route: '/api/docs',
      queryParams: { a: 1, b: 2, c: { d: 3, e: 4 } }
    };
    const req2 = {
      route: '/api/docs',
      queryParams: { b: 2, a: 1, c: { e: 4, d: 3 } }
    };

    expect(generateRequestKey(req1)).toBe(generateRequestKey(req2));
  });

  it('should differentiate between different methods', () => {
    const req1 = { method: 'GET', route: '/api/docs' };
    const req2 = { method: 'POST', route: '/api/docs' };

    expect(generateRequestKey(req1)).not.toBe(generateRequestKey(req2));
  });

  it('should handle null body gracefully', () => {
    const req1 = { method: 'GET', route: '/api/docs', body: null };
    const req2 = { method: 'GET', route: '/api/docs' };

    // They will hash identically because body defaults to null in the function
    expect(generateRequestKey(req1)).toBe(generateRequestKey(req2));
  });
});
