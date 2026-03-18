import crypto from "crypto";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const ITERATIONS = 100000;
const DIGEST = "sha512";

/**
 * Hash a password using PBKDF2.
 * @param {string} password
 * @returns {string} The format is salt:hash
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a hash.
 * @param {string} password
 * @param {string} storedHash The format is salt:hash
 * @returns {boolean}
 */
export function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(":");
  const testHash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");
  return hash === testHash;
}
