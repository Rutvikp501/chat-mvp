import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import expressSlowDown from 'express-slow-down';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import winston from 'winston'; // Logger

// 🟢 SECURITY LOGGER (Production-ready)
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/security.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// 1. RATE LIMITING (IP-based) ⭐
export const rateLimiter = rateLimit({
  windowMs:Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,// 1 minute
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  message: { error: 'Too many requests from this IP', retryAfter: 60 },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>  req.url.includes("socket.io") ||(process.env.RATE_LIMIT_SKIP_IPS || '127.0.0.1,::1').split(',').includes(req.ip),
  handler: (req, res, next, options) => {
    // Log blocking event
    securityLogger.warn('🚫 RATE LIMIT', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      ua: req.headers['user-agent']?.slice(0, 100)
    });
    res.status(options.statusCode).json(options.message);
  }
});

// 2. BURST PROTECTION ⭐
export const slowDown = expressSlowDown({
  windowMs:Number(process.env.SLOW_DOWN_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  delayAfter: Number(process.env.SLOW_DOWN_DELAY_AFTER) || 100,
  skip: (req) => req.url.includes("socket.io"),
  delayMs: () => Number(process.env.SLOW_DOWN_DELAY_MS) || 1000,
  
  handler: (req, res, next) => {
    // Log slow down event
    securityLogger.warn('🐌 SLOW DOWN', {
      ip: req.ip,
      url: req.url,
      method: req.method
    });
    next();
  }
});

// 3. BOT DETECTION ⭐
function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch (err) {
    return fallback;
  }
}

export const botProtection = (req, res, next) => {
  const ua = new UAParser(req.headers['user-agent']);
  const result = ua.getResult();
if (req.url.includes("socket.io")) {
    return next();
}

  const defaultBotPatterns = [
    'bot', 'crawler', 'spider', 'scrapy', 'wget', 'curl',
    'phantom', 'headless', 'puppeteer', 'playwright', 'selenium'
  ];

  const botPatterns = process.env.BOT_PATTERNS
    ? safeJsonParse(process.env.BOT_PATTERNS, defaultBotPatterns)
    : defaultBotPatterns;

  const isBot = botPatterns.some(pattern =>
    (result.ua || "").toLowerCase().includes(pattern) ||
    JSON.stringify(result.device || "").toLowerCase().includes(pattern)
  );

  if (isBot && !isAllowedBot(req)) {
    securityLogger.warn('🤖 BOT BLOCKED', {
      ip: req.ip,
      ua: result.ua,
      device: result.device,
      url: req.url
    });
    return res.status(403).json({ error: 'Bot access denied' });
  }

  next();
};

function isAllowedBot(req) {
  const defaultGoodBots = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot',
    'baiduspider', 'facebookexternalhit',
    'twitterbot', 'linkedinbot'
  ];

  const goodBots = process.env.GOOD_BOTS
    ? safeJsonParse(process.env.GOOD_BOTS, defaultGoodBots)
    : defaultGoodBots;

  return goodBots.some(bot =>
    req.headers['user-agent']?.toLowerCase().includes(bot)
  );
}


// 4. WAF ⭐
// export const wafMiddleware = (req, res, next) => {
//   const suspiciousPatterns = [
//     /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|WHERE|OR|AND)\b/gi, /('|--|\/\*)/,
//     /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, /javascript\s*:/gi, /on\w+\s*=/gi,
//     /\.\.\//, /\/etc\/|\/proc\/|\/var\/|\/tmp\//,
//     /(?:\b(?:cat|ls|rm|curl|wget|nc|ncat|ping|whoami)\b|\||;|&&|\$\()/i
//   ];
  
//   const checkString = `${req.url} ${JSON.stringify(req.body)} ${JSON.stringify(req.query)} ${req.headers['user-agent'] || ''}`;
//   const isMalicious = suspiciousPatterns.some(pattern => pattern.test(checkString));
  
//   if (isMalicious) {
//     securityLogger.warn('🛡️ WAF BLOCKED', {
//       ip: req.ip,
//       method: req.method,
//       url: req.url,
//       payload: req.body,
//       threat: 'MALICIOUS_PATTERN'
//     });
//     return res.status(403).json({ error: 'Request blocked by security filter' });
//   }
  
//   next();
// };

// 5. COUNTRY BLOCK ⭐
export const countryFilter = (req, res, next) => {
  const blockedCountries = (process.env.COUNTRY_BLOCK_LIST || 'PK,TR,KZ,KP').split(',')
  const geo = geoip.lookup(req.ip);
  
  if (geo && blockedCountries.includes(geo.country)) {
    securityLogger.warn('🌍 GEO BLOCKED', {
      ip: req.ip,
      country: geo.country,
      city: geo.city,
      url: req.url
    });
    if (req.url.includes("socket.io")) return next();

    return res.status(403).json({ error: 'Access denied by location' });
  }
  
  next();
};

// 6. SECURITY HEADERS ⭐
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
});

// 🎯 COMBINED SECURITY STACK + LOGGING
export const securityStack = [
  securityHeaders,
  rateLimiter,
  slowDown,
  // wafMiddleware,
  botProtection,
  countryFilter,
];

// 🟢 REQUEST MONITORING MIDDLEWARE
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    securityLogger.info('📊 REQUEST', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      ip: req.ip,
      duration: `${duration}ms`,
      userAgent: req.headers['user-agent']?.slice(0, 100)
    });
  });
  next();
};

