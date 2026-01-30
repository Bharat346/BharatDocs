// firewallEdge.js - Enhanced version
import { NextResponse } from "next/server";

/**
 * Enhanced Edge-safe firewall middleware
 * Blocks requests based on multiple security layers
 */
export function firewallMiddleware(request) {
  const url = new URL(request.url);
  const path = url.pathname.toLowerCase();
  const query = Object.fromEntries(url.searchParams.entries());
  const ip = request.headers.get("x-forwarded-for") || "";
  const userAgent = request.headers.get("user-agent") || "";
  const referer = request.headers.get("referer") || "";
  const accept = request.headers.get("accept") || "";
  const contentType = request.headers.get("content-type") || "";
  const method = request.method;
  
  // Enhanced security patterns database
  const SECURITY_PATTERNS = {
    // XSS patterns (enhanced)
    xss: [
      /<script/i,
      /javascript:/i,
      /onload=/i,
      /onerror=/i,
      /onclick=/i,
      /onmouseover=/i,
      /onkeypress=/i,
      /onfocus=/i,
      /onblur=/i,
      /onchange=/i,
      /onsubmit=/i,
      /onreset=/i,
      /onselect=/i,
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
      /<img[^>]*src=x/i,
      /<a[^>]*href=javascript:/i,
    ],
    
    // SQL Injection patterns (enhanced)
    sql: [
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
      /(\s|%20)not(\s|%20)/i,
      /(\s|%20)like(\s|%20)/i,
      /(\s|%20)between(\s|%20)/i,
      /1=1/i,
      /1=2/i,
      /\'\'\'/i,
      /\/\*.*\*\//i,
    ],
    
    // Path traversal patterns
    path: [
      /\.\.\//,
      /\.\.\\/,
      /\/etc\/passwd/i,
      /\/etc\/shadow/i,
      /\/proc\/self/i,
      /C:\\windows\\system32/i,
      /\/windows\/system32/i,
      /\/bin\/sh/i,
      /\/bin\/bash/i,
      /\/etc\/hosts/i,
      /\/var\/log/i,
      /\.\.%2f/i,
      /\.\.%5c/i,
      /%2e%2e%2f/i,
      /%2e%2e%5c/i,
    ],
    
    // Command injection patterns
    command: [
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
      /passthru\(/i,
      /proc_open\(/i,
    ],
    
    // File inclusion patterns
    file: [
      /include\(/i,
      /require\(/i,
      /require_once\(/i,
      /include_once\(/i,
      /file_get_contents\(/i,
      /fopen\(/i,
      /readfile\(/i,
      /file_put_contents\(/i,
      /copy\(/i,
      /rename\(/i,
      /unlink\(/i,
    ],
    
    // XXE patterns
    xxe: [
      /<!DOCTYPE/i,
      /<!ENTITY/i,
      /SYSTEM/i,
      /PUBLIC/i,
      /%[^;]+;/,
      /\[CDATA\[/i,
      /<!ELEMENT/i,
      /<!ATTLIST/i,
    ],
    
    // CLI/Bot patterns (enhanced)
    cli: [
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
      /elinks/i,
      /httrack/i,
      /nikto/i,
      /nmap/i,
      /sqlmap/i,
      /metasploit/i,
      /burpsuite/i,
      /zap/i,
      /w3af/i,
      /arachni/i,
      /skipfish/i,
      /wfuzz/i,
      /dirb/i,
      /gobuster/i,
      /ffuf/i,
      /headless/i,
      /phantom/i,
      /puppeteer/i,
      /selenium/i,
      /playwright/i,
      /zombie/i,
      /casper/i,
      /webkit/i,
      /blink/i,
      /gecko/i,
      /trident/i,
      /msie/i,
      /edg/i,
      /chrome/i,
      /firefox/i,
      /safari/i,
      /opera/i,
      /brave/i,
      /vivaldi/i,
    ],
    
    // Suspicious file extensions
    extensions: [
      /\.(php|asp|aspx|jsp|pl|py|cgi|sh|bat|exe|dll|so|bin|jar|war|ear|rar|zip|tar|gz|7z)$/i,
      /\.(bak|old|backup|swp|swo|tmp|temp)$/i,
      /\.(sql|db|mdb|mdf|ndf|ldf|frm|myd|myi|ibd)$/i,
      /\.(env|config|conf|ini|yml|yaml|xml|json)$/i,
      /\.(git|svn|hg|bzr|cvs)$/i,
      /\.(htaccess|htpasswd|passwd|shadow)$/i,
      /\.(ds_store|thumb|db|db3|sqlite|sqlite3)$/i,
    ],
    
    // Sensitive paths
    sensitive: [
      /\/admin/i,
      /\/login/i,
      /\/register/i,
      /\/reset/i,
      /\/forgot/i,
      /\/signin/i,
      /\/signup/i,
      /\/dashboard/i,
      /\/controlpanel/i,
      /\/cpanel/i,
      /\/wp-admin/i,
      /\/wp-login/i,
      /\/administrator/i,
      /\/phpmyadmin/i,
      /\/mysql/i,
      /\/sql/i,
      /\/db/i,
      /\/database/i,
      /\/backup/i,
      /\/dump/i,
      /\/export/i,
      /\/import/i,
      /\/config/i,
      /\/configuration/i,
      /\/setup/i,
      /\/install/i,
      /\/upgrade/i,
      /\/maint/i,
      /\/maintenance/i,
      /\/test/i,
      /\/debug/i,
      /\/api\/v1/i,
      /\/api\/v2/i,
      /\/graphql/i,
      /\/graphiql/i,
      /\/swagger/i,
      /\/openapi/i,
      /\/redoc/i,
      /\/docs/i,
      /\/documentation/i,
    ],
    
    // Malicious headers
    headers: [
      /x-forwarded-host/i,
      /x-original-url/i,
      /x-rewrite-url/i,
      /x-real-ip/i,
      /x-client-ip/i,
      /cf-connecting-ip/i,
      /true-client-ip/i,
    ],
  };
  
  // Security scoring system
  let securityScore = 0;
  const MAX_SCORE = 100;
  let reasons = [];
  
  // Helper function to check patterns
  const checkPatterns = (value, patternType) => {
    if (typeof value !== 'string') return false;
    return SECURITY_PATTERNS[patternType].some(pattern => pattern.test(value));
  };
  
  // Layer 1: Request method validation
  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(method)) {
    securityScore += 30;
    reasons.push('invalid_method');
  }
  
  // Layer 2: Path validation
  if (path.length > 1000) {
    securityScore += 20;
    reasons.push('path_too_long');
  }
  
  if (checkPatterns(path, 'extensions')) {
    securityScore += 40;
    reasons.push('suspicious_extension');
  }
  
  if (checkPatterns(path, 'sensitive')) {
    securityScore += 25;
    reasons.push('sensitive_path');
  }
  
  if (checkPatterns(path, 'xss')) {
    securityScore += 50;
    reasons.push('xss_in_path');
  }
  
  if (checkPatterns(path, 'sql')) {
    securityScore += 60;
    reasons.push('sql_injection_in_path');
  }
  
  if (checkPatterns(path, 'path')) {
    securityScore += 70;
    reasons.push('path_traversal');
  }
  
  // Layer 3: Query parameter validation
  Object.entries(query).forEach(([key, value]) => {
    if (checkPatterns(value, 'xss')) {
      securityScore += 45;
      reasons.push('xss_in_query');
    }
    if (checkPatterns(value, 'sql')) {
      securityScore += 55;
      reasons.push('sql_injection_in_query');
    }
    if (checkPatterns(value, 'command')) {
      securityScore += 65;
      reasons.push('command_injection');
    }
    if (checkPatterns(value, 'file')) {
      securityScore += 50;
      reasons.push('file_inclusion');
    }
    if (checkPatterns(value, 'xxe')) {
      securityScore += 60;
      reasons.push('xxe_attempt');
    }
  });
  
  // Layer 4: User-Agent validation
  if (!userAgent || userAgent.length < 5) {
    securityScore += 20;
    reasons.push('empty_user_agent');
  }
  
  if (userAgent.length > 500) {
    securityScore += 25;
    reasons.push('user_agent_too_long');
  }
  
  if (checkPatterns(userAgent, 'cli')) {
    securityScore += 35;
    reasons.push('cli_tool_detected');
  }
  
  // Layer 5: Header validation
  if (checkPatterns(referer, 'xss') || checkPatterns(referer, 'sql')) {
    securityScore += 40;
    reasons.push('malicious_referer');
  }
  
  if (contentType && !['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain', ''].some(type => contentType.includes(type))) {
    securityScore += 30;
    reasons.push('suspicious_content_type');
  }
  
  // Layer 6: IP validation
  if (!ip || ip === 'unknown' || ip === '') {
    securityScore += 15;
    reasons.push('invalid_ip');
  }
  
  // Check for IP spoofing patterns
  if (ip.includes(',') && ip.split(',').length > 3) {
    securityScore += 35;
    reasons.push('multiple_ip_addresses');
  }
  
  // Layer 7: Rate limiting simulation (basic)
  const requestTime = Date.now();
  // Note: For full rate limiting, use a proper rate limiting service
  
  // Decision making
  const blocked = securityScore >= 50;
  const suspicious = securityScore >= 30 && securityScore < 50;
  
  if (blocked) {
    const res = new NextResponse(
      JSON.stringify({
        success: false,
        error: "Access denied",
        reason: reasons.join(', '),
        score: securityScore,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
      }),
      {
        status: 403,
        headers: { 
          "Content-Type": "application/json",
          "X-Security-Score": securityScore.toString(),
          "X-Blocked-Reasons": reasons.join(';')
        },
      },
    );
    res.headers.set("X-Firewall-Status", "blocked");
    res.headers.set("X-Firewall-Reason", reasons.join('; '));
    res.headers.set("X-Firewall-Score", securityScore.toString());
    res.headers.set("X-Firewall-Request-ID", generateRequestId());
    return res;
  }
  
  // Allowed with warnings if suspicious
  const res = NextResponse.next();
  res.headers.set("X-Firewall-Status", "passed");
  if (suspicious) {
    res.headers.set("X-Firewall-Warning", "suspicious");
    res.headers.set("X-Firewall-Score", securityScore.toString());
  }
  res.headers.set("X-Firewall-Request-ID", generateRequestId());
  return res;
}

// Helper function to generate unique request ID
function generateRequestId() {
  return 'req_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Enhanced Security headers middleware (Edge-safe)
 */
export function securityHeadersMiddleware(_request) {
  const res = NextResponse.next();
  
  // Security headers
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), magnetometer=(), gyroscope=(), usb=(), payment=()"
  );
  
  // Additional security headers
  res.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  res.headers.set("X-Download-Options", "noopen");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  res.headers.set("X-Powered-By", "Secure Platform");
  
  // CSP Header (Content Security Policy)
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https: data:; connect-src 'self' https: wss:; frame-src 'none'; object-src 'none'; media-src 'self'; form-action 'self'; base-uri 'self';"
  );
  
  // Feature Policy
  res.headers.set(
    "Feature-Policy",
    "accelerometer 'none'; ambient-light-sensor 'none'; autoplay 'none'; camera 'none'; encrypted-media 'none'; fullscreen 'self'; geolocation 'none'; gyroscope 'none'; magnetometer 'none'; microphone 'none'; midi 'none'; payment 'none'; picture-in-picture 'none'; speaker 'none'; sync-xhr 'none'; usb 'none'; vr 'none'"
  );
  
  // Cache control for sensitive pages
  const path = _request.nextUrl.pathname;
  if (path.includes('/admin') || path.includes('/login') || path.includes('/dashboard')) {
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
  }
  
  return res;
}

// Export a helper function for additional security checks
export function performSecurityScan(request) {
  const scanResults = {
    threats: [],
    warnings: [],
    score: 0,
    passed: true
  };
  
  // Implement additional scanning logic here
  // This can be called from other parts of the application
  
  return scanResults;
}