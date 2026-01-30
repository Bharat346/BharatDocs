// firewallNode.js - Enhanced version
import { db } from "@/lib/db/index";
import { accessLogs, securityEvents, rateLimits, fingerprints } from "@/lib/db/schema";
import { eq, and, gt, desc } from "drizzle-orm";

/**
 * Enhanced Node.js firewall engine for logging and DB integration
 */
export class FirewallEngine {
  constructor(rules = []) {
    this.rules = rules;
    this.blockedIPs = new Map();
    this.suspiciousIPs = new Map();
    this.rateLimitCache = new Map();
    this.geoIPCache = new Map();
  }

  async evaluate(reqInfo) {
    const result = { 
      block: false, 
      reason: null, 
      rule: null, 
      rulesChecked: 0,
      score: 0,
      warnings: [],
      requestId: this.generateRequestId()
    };

    // Pre-check: Rate limiting
    const rateLimitResult = await this.checkRateLimit(reqInfo);
    if (rateLimitResult.blocked) {
      result.block = true;
      result.reason = rateLimitResult.reason;
      result.score += 80;
      return result;
    }

    // Pre-check: Suspicious IP
    const suspiciousIP = this.suspiciousIPs.get(reqInfo.ip);
    if (suspiciousIP && suspiciousIP.count > 5) {
      result.warnings.push('ip_flagged_suspicious');
      result.score += 30;
    }

    // Rule evaluation
    for (const rule of this.rules) {
      result.rulesChecked++;
      if (!rule.enabled) continue;

      try {
        if (rule.condition(reqInfo)) {
          const ruleScore = this.getRuleScore(rule.severity);
          result.score += ruleScore;
          
          if (rule.action === "block") {
            result.block = true;
            result.reason = rule.description;
            result.rule = rule;
            
            this.blockedIPs.set(reqInfo.ip, {
              reason: rule.name,
              expiry: Date.now() + (rule.blockDuration || 60 * 60 * 1000), // Configurable
              count: (this.blockedIPs.get(reqInfo.ip)?.count || 0) + 1
            });

            // Enhanced logging
            await db.insert(securityEvents)
              .values({
                event: rule.id,
                severity: rule.severity,
                ipAddress: reqInfo.ip,
                userAgent: reqInfo.userAgent || 'unknown',
                path: reqInfo.path || '/',
                method: reqInfo.method || 'GET',
                details: JSON.stringify({ 
                  query: reqInfo.query || {},
                  headers: reqInfo.headers || {},
                  referer: reqInfo.referer,
                  score: result.score,
                  requestId: result.requestId,
                  rule: rule.name
                }),
                createdAt: new Date(),
              })
              .catch(err => console.error('Failed to log security event:', err));
            
            // Update fingerprint if available
            if (reqInfo.fingerprint) {
              await this.updateFingerprint(reqInfo.fingerprint, {
                isSuspicious: true,
                lastEvent: rule.id,
                blockCount: { $inc: 1 }
              }).catch(err => console.error('Failed to update fingerprint:', err));
            }
            
            break;
            
          } else if (rule.action === "warn") {
            result.warnings.push(rule.name);
            const prev = this.suspiciousIPs.get(reqInfo.ip) || {
              count: 0,
              reasons: [],
              lastSeen: null
            };
            this.suspiciousIPs.set(reqInfo.ip, {
              count: prev.count + 1,
              reasons: [...prev.reasons, rule.name],
              lastSeen: new Date(),
            });
            
            // Log warning
            await db.insert(securityEvents)
              .values({
                event: rule.id,
                severity: 'warn',
                ipAddress: reqInfo.ip,
                userAgent: reqInfo.userAgent || 'unknown',
                path: reqInfo.path || '/',
                method: reqInfo.method || 'GET',
                details: JSON.stringify({ 
                  query: reqInfo.query || {},
                  warning: rule.description,
                  score: result.score
                }),
                createdAt: new Date(),
              })
              .catch(err => console.error('Failed to log warning:', err));
          }
        }
      } catch (err) {
        console.error(`[Firewall Error] ${rule.name}:`, err);
        result.warnings.push('rule_evaluation_error');
      }
    }

    // Post-check: Score-based blocking
    if (!result.block && result.score >= 70) {
      result.block = true;
      result.reason = 'cumulative_security_score_exceeded';
      
      await db.insert(securityEvents)
        .values({
          event: 'score_based_block',
          severity: 'high',
          ipAddress: reqInfo.ip,
          userAgent: reqInfo.userAgent || 'unknown',
          path: reqInfo.path || '/',
          method: reqInfo.method || 'GET',
          details: JSON.stringify({ 
            score: result.score,
            warnings: result.warnings,
            requestId: result.requestId
          }),
          createdAt: new Date(),
        })
        .catch(err => console.error('Failed to log score block:', err));
    }

    // Always log access for non-blocked users
    if (!result.block) {
      await db.insert(accessLogs)
        .values({
          username: reqInfo.username || null,
          fingerprintId: reqInfo.fingerprintId || null,
          accessedAt: new Date(),
          ipAddress: reqInfo.ip,
          userAgent: reqInfo.userAgent || 'unknown',
          path: reqInfo.path || '/',
          method: reqInfo.method || 'GET',
          statusCode: 200,
          isSuspicious: this.suspiciousIPs.has(reqInfo.ip) || result.score > 30,
          securityScore: result.score,
          warnings: result.warnings.length > 0 ? JSON.stringify(result.warnings) : null,
          country: reqInfo.geo?.country || null,
          city: reqInfo.geo?.city || null,
          isp: reqInfo.geo?.isp || null,
          isTor: reqInfo.geo?.isTor || false,
          isVpn: reqInfo.geo?.isVpn || false,
          isProxy: reqInfo.geo?.isProxy || false,
          isDatacenter: reqInfo.geo?.isDatacenter || false,
          requestId: result.requestId,
        })
        .catch(err => console.error('Failed to log access:', err));
    }

    // Update rate limit counters
    await this.updateRateLimit(reqInfo).catch(err => 
      console.error('Failed to update rate limit:', err)
    );

    return result;
  }

  async checkRateLimit(reqInfo) {
    const now = Date.now();
    const ipKey = `ip:${reqInfo.ip}`;
    const fingerprintKey = reqInfo.fingerprint ? `fp:${reqInfo.fingerprint}` : null;
    const endpointKey = `ep:${reqInfo.ip}:${reqInfo.path}`;
    
    // Check IP rate limit
    const ipLimit = await this.getRateLimit(ipKey);
    if (ipLimit && ipLimit.count > 100 && now - ipLimit.firstRequest < 15 * 60 * 1000) {
      return { blocked: true, reason: 'ip_rate_limit_exceeded' };
    }
    
    // Check fingerprint rate limit
    if (fingerprintKey) {
      const fpLimit = await this.getRateLimit(fingerprintKey);
      if (fpLimit && fpLimit.count > 200 && now - fpLimit.firstRequest < 60 * 60 * 1000) {
        return { blocked: true, reason: 'fingerprint_rate_limit_exceeded' };
      }
    }
    
    // Check endpoint rate limit
    const epLimit = await this.getRateLimit(endpointKey);
    if (epLimit && epLimit.count > 50 && now - epLimit.firstRequest < 5 * 60 * 1000) {
      return { blocked: true, reason: 'endpoint_rate_limit_exceeded' };
    }
    
    return { blocked: false };
  }

  async getRateLimit(key) {
    // Check cache first
    if (this.rateLimitCache.has(key)) {
      return this.rateLimitCache.get(key);
    }
    
    // Check database
    try {
      const limit = await db.select()
        .from(rateLimits)
        .where(eq(rateLimits.key, key))
        .limit(1);
      
      if (limit.length > 0) {
        this.rateLimitCache.set(key, limit[0]);
        return limit[0];
      }
    } catch (err) {
      console.error('Failed to get rate limit:', err);
    }
    
    return null;
  }

  async updateRateLimit(reqInfo) {
    const now = new Date();
    const ipKey = `ip:${reqInfo.ip}`;
    const fingerprintKey = reqInfo.fingerprint ? `fp:${reqInfo.fingerprint}` : null;
    const endpointKey = `ep:${reqInfo.ip}:${reqInfo.path}`;
    
    const updateKey = async (key) => {
      try {
        const existing = await db.select()
          .from(rateLimits)
          .where(eq(rateLimits.key, key))
          .limit(1);
        
        if (existing.length > 0) {
          await db.update(rateLimits)
            .set({
              count: existing[0].count + 1,
              lastRequest: now
            })
            .where(eq(rateLimits.key, key));
        } else {
          await db.insert(rateLimits)
            .values({
              key,
              count: 1,
              firstRequest: now,
              lastRequest: now
            });
        }
        
        // Update cache
        this.rateLimitCache.delete(key);
      } catch (err) {
        console.error('Failed to update rate limit:', err);
      }
    };
    
    await updateKey(ipKey);
    if (fingerprintKey) await updateKey(fingerprintKey);
    await updateKey(endpointKey);
  }

  async updateFingerprint(fingerprintHash, data) {
    try {
      const existing = await db.select()
        .from(fingerprints)
        .where(eq(fingerprints.fingerprint, fingerprintHash))
        .limit(1);
      
      if (existing.length > 0) {
        await db.update(fingerprints)
          .set({
            ...data,
            lastSeen: new Date(),
            updatedAt: new Date()
          })
          .where(eq(fingerprints.id, existing[0].id));
      } else {
        await db.insert(fingerprints)
          .values({
            fingerprint: fingerprintHash,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            isSuspicious: data.isSuspicious || false,
            isBot: data.isBot || false,
            lastSeen: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
      }
    } catch (err) {
      console.error('Failed to update fingerprint:', err);
    }
  }

  getRuleScore(severity) {
    const scores = {
      critical: 80,
      high: 60,
      medium: 40,
      low: 20,
      info: 10
    };
    return scores[severity] || 30;
  }

  generateRequestId() {
    return 'node_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  // Cleanup expired blocks
  cleanup() {
    const now = Date.now();
    for (const [ip, data] of this.blockedIPs.entries()) {
      if (data.expiry < now) {
        this.blockedIPs.delete(ip);
      }
    }
    
    // Clean cache older than 1 hour
    for (const [key, data] of this.rateLimitCache.entries()) {
      if (now - data.lastRequest > 60 * 60 * 1000) {
        this.rateLimitCache.delete(key);
      }
    }
  }
}

// Enhanced default rules for Node.js
export const defaultRules = [
  {
    id: "block-xss",
    name: "XSS Attempt",
    description: "Blocks XSS patterns",
    enabled: true,
    severity: "high",
    condition: (req) => {
      const xssPatterns = [
        /<script/i,
        /javascript:/i,
        /onload=/i,
        /onerror=/i,
        /onclick=/i,
        /onmouseover=/i,
        /onkeypress=/i,
        /alert\(/i,
        /confirm\(/i,
        /prompt\(/i,
        /document\.cookie/i,
        /window\.location/i,
        /document\.location/i,
        /eval\(/i,
        /setTimeout\(/i,
        /setInterval\(/i,
        /Function\(/i,
        /<iframe/i,
        /<embed/i,
        /<object/i,
        /<applet/i,
        /<svg/i,
        /<math/i,
        /<link/i,
        /<meta/i,
        /<style/i,
      ];
      const checkString = (str) => typeof str === 'string' && xssPatterns.some(p => p.test(str));
      
      return (
        Object.values(req.query || {}).some(checkString) ||
        checkString(req.path || "") ||
        checkString(req.body || "") ||
        (req.headers && Object.values(req.headers).some(checkString))
      );
    },
    action: "block",
    blockDuration: 60 * 60 * 1000, // 1 hour
  },
  {
    id: "block-cli",
    name: "CLI/Bot Tool Detection",
    description: "Blocks curl/wget and other CLI/bot tools",
    enabled: true,
    severity: "medium",
    condition: (req) => {
      const cliPatterns = [
        /curl/i,
        /wget/i,
        /python/i,
        /perl/i,
        /ruby/i,
        /java/i,
        /php/i,
        /golang/i,
        /node/i,
        /postman/i,
        /insomnia/i,
        /httpclient/i,
        /libwww/i,
        /lynx/i,
        /links/i,
        /httrack/i,
        /nikto/i,
        /nmap/i,
        /sqlmap/i,
        /headless/i,
        /phantom/i,
        /puppeteer/i,
        /selenium/i,
      ];
      return cliPatterns.some(p => p.test(req.userAgent || ""));
    },
    action: "block",
    blockDuration: 30 * 60 * 1000, // 30 minutes
  },
  {
    id: "block-sql-injection",
    name: "SQL Injection Attempt",
    description: "Blocks SQL injection patterns",
    enabled: true,
    severity: "critical",
    condition: (req) => {
      const sqlPatterns = [
        /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
        /union.*select/i,
        /select.*from/i,
        /insert.*into/i,
        /delete.*from/i,
        /update.*set/i,
        /drop.*table/i,
        /truncate.*table/i,
        /create.*table/i,
        /alter.*table/i,
        /exec(\s|\+)+(s|x)p\w+/i,
        /(\s|%20)or(\s|%20)/i,
        /(\s|%20)and(\s|%20)/i,
        /1=1/i,
        /1=2/i,
      ];
      const checkString = (str) => typeof str === 'string' && sqlPatterns.some(p => p.test(str));
      
      return (
        Object.values(req.query || {}).some(checkString) ||
        checkString(req.path || "") ||
        checkString(req.body || "")
      );
    },
    action: "block",
    blockDuration: 24 * 60 * 60 * 1000, // 24 hours
  },
  {
    id: "block-path-traversal",
    name: "Path Traversal Attempt",
    description: "Blocks path traversal attacks",
    enabled: true,
    severity: "high",
    condition: (req) => {
      const pathPatterns = [
        /\.\.\//,
        /\.\.\\/,
        /\/etc\/passwd/i,
        /\/etc\/shadow/i,
        /\/proc\/self/i,
        /C:\\windows\\system32/i,
        /\/windows\/system32/i,
        /\/bin\/sh/i,
        /\/bin\/bash/i,
      ];
      return pathPatterns.some(p => p.test(req.path || ""));
    },
    action: "block",
    blockDuration: 60 * 60 * 1000,
  },
  {
    id: "block-command-injection",
    name: "Command Injection Attempt",
    description: "Blocks command injection attacks",
    enabled: true,
    severity: "critical",
    condition: (req) => {
      const cmdPatterns = [
        /;\s*\w+/,
        /\|\s*\w+/,
        /&\s*\w+/,
        /\$\s*\(/,
        /`.*`/,
        /\$(?:\w+|\{.*\})/,
        /runtime\.exec/i,
        /process\.exec/i,
        /system\(/i,
        /exec\(/i,
        /popen\(/i,
        /shell_exec\(/i,
      ];
      const checkString = (str) => typeof str === 'string' && cmdPatterns.some(p => p.test(str));
      
      return (
        Object.values(req.query || {}).some(checkString) ||
        checkString(req.body || "")
      );
    },
    action: "block",
    blockDuration: 24 * 60 * 60 * 1000,
  },
  {
    id: "block-sensitive-paths",
    name: "Sensitive Path Access",
    description: "Monitors access to sensitive paths",
    enabled: true,
    severity: "medium",
    condition: (req) => {
      const sensitivePaths = [
        /\/admin/i,
        /\/wp-admin/i,
        /\/wp-login/i,
        /\/phpmyadmin/i,
        /\/mysql/i,
        /\/config/i,
        /\/\.env/i,
        /\/\.git/i,
        /\/backup/i,
        /\/dump/i,
      ];
      return sensitivePaths.some(p => p.test(req.path || ""));
    },
    action: "warn",
  },
  {
    id: "detect-rapid-requests",
    name: "Rapid Request Detection",
    description: "Detects rapid consecutive requests",
    enabled: true,
    severity: "medium",
    condition: (req) => {
      // This would require tracking request timestamps per IP
      // Implementation depends on your architecture
      return false;
    },
    action: "warn",
  },
  {
    id: "detect-suspicious-headers",
    name: "Suspicious Headers Detection",
    description: "Detects suspicious or missing headers",
    enabled: true,
    severity: "low",
    condition: (req) => {
      const headers = req.headers || {};
      const requiredHeaders = ['user-agent', 'accept'];
      const missingHeaders = requiredHeaders.filter(h => !headers[h]);
      
      // Check for spoofed headers
      const spoofedHeaders = ['x-forwarded-host', 'x-original-url', 'x-rewrite-url'];
      const hasSpoofed = spoofedHeaders.some(h => headers[h]);
      
      return missingHeaders.length > 0 || hasSpoofed;
    },
    action: "warn",
  },
  {
    id: "block-file-inclusion",
    name: "File Inclusion Attempt",
    description: "Blocks local/remote file inclusion attacks",
    enabled: true,
    severity: "high",
    condition: (req) => {
      const filePatterns = [
        /include\(/i,
        /require\(/i,
        /require_once\(/i,
        /include_once\(/i,
        /file_get_contents\(/i,
        /fopen\(/i,
        /readfile\(/i,
      ];
      const checkString = (str) => typeof str === 'string' && filePatterns.some(p => p.test(str));
      
      return (
        Object.values(req.query || {}).some(checkString) ||
        checkString(req.body || "")
      );
    },
    action: "block",
    blockDuration: 60 * 60 * 1000,
  },
  {
    id: "block-xxe",
    name: "XXE Attack Attempt",
    description: "Blocks XML External Entity attacks",
    enabled: true,
    severity: "critical",
    condition: (req) => {
      const xxePatterns = [
        /<!DOCTYPE/i,
        /<!ENTITY/i,
        /SYSTEM/i,
        /PUBLIC/i,
        /%[^;]+;/,
        /\[CDATA\[/i,
      ];
      const checkString = (str) => typeof str === 'string' && xxePatterns.some(p => p.test(str));
      
      return (
        Object.values(req.query || {}).some(checkString) ||
        checkString(req.body || "") ||
        (req.headers?.['content-type']?.includes('xml') && checkString(req.body || ""))
      );
    },
    action: "block",
    blockDuration: 24 * 60 * 60 * 1000,
  },
];

// Export helper functions
export function createFirewallEngine(rules = defaultRules) {
  return new FirewallEngine(rules);
}

export async function logSecurityEvent(event, severity, details) {
  try {
    await db.insert(securityEvents)
      .values({
        event,
        severity,
        details: JSON.stringify(details),
        createdAt: new Date(),
      });
  } catch (err) {
    console.error('Failed to log security event:', err);
  }
}