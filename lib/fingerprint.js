import FingerprintJS from '@fingerprintjs/fingerprintjs';

let cachedVisitorId = null;

export async function getFingerprint() {
  if (cachedVisitorId) return cachedVisitorId;

  const fp = await FingerprintJS.load();
  const result = await fp.get();

  cachedVisitorId = result.visitorId;
  return cachedVisitorId;
}
