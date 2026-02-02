import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET;

export function signSession(session) {
    const hmac = crypto.createHmac("sha256", SECRET);
    hmac.update(JSON.stringify(session));
    return hmac.digest("hex");
}

export function createSession() {
    const id = crypto.randomUUID();
    const issuedAt = Date.now().toString();
    const payload = `${id}.${issuedAt}`;
    const signature = signSession(payload);
    return `${payload}.${signature}`;
}

export function verifySession(token) {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [id, issuedAt, signature] = parts;
    const expectedSignature = signSession(`${id}.${issuedAt}`);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}