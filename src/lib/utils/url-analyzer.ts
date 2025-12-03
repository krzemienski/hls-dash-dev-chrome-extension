// src/lib/utils/url-analyzer.ts

export interface UrlAnalysis {
  domain: string;
  path: string;
  hasAuth: boolean;
  authParams: string[];
  hasTimestamp: boolean;
  cdn: string | null;
  protocol: string;
  queryParams: Map<string, string>;
}

/**
 * Parse URL query parameters
 */
export function parseUrlParameters(url: string): Map<string, string> {
  try {
    const urlObj = new URL(url);
    const params = new Map<string, string>();

    urlObj.searchParams.forEach((value, key) => {
      params.set(key, value);
    });

    return params;
  } catch {
    return new Map();
  }
}

/**
 * Analyze manifest URL
 */
export function analyzeManifestUrl(url: string): UrlAnalysis {
  let urlObj: URL;

  try {
    urlObj = new URL(url);
  } catch {
    return {
      domain: '',
      path: url,
      hasAuth: false,
      authParams: [],
      hasTimestamp: false,
      cdn: null,
      protocol: '',
      queryParams: new Map()
    };
  }

  const queryParams = parseUrlParameters(url);

  // Detect authentication parameters
  const authKeywords = ['token', 'key', 'auth', 'signature', 'sig', 'apikey', 'api_key'];
  const authParams = Array.from(queryParams.keys()).filter(key =>
    authKeywords.some(keyword => key.toLowerCase().includes(keyword))
  );

  // Detect timestamp parameters
  const timestampKeywords = ['timestamp', 'ts', 'time', 't'];
  const hasTimestamp = Array.from(queryParams.keys()).some(key =>
    timestampKeywords.some(keyword => key.toLowerCase().includes(keyword))
  );

  return {
    domain: urlObj.hostname,
    path: urlObj.pathname,
    hasAuth: authParams.length > 0,
    authParams,
    hasTimestamp,
    cdn: detectCDN(url),
    protocol: urlObj.protocol.replace(':', ''),
    queryParams
  };
}

/**
 * Detect CDN from URL
 */
export function detectCDN(url: string): string | null {
  const hostname = new URL(url).hostname.toLowerCase();

  // CloudFront
  if (hostname.includes('cloudfront.net')) {
    return 'CloudFront';
  }

  // Akamai
  if (hostname.includes('akamaized.net') || hostname.includes('akamaihd.net')) {
    return 'Akamai';
  }

  // Fastly
  if (hostname.includes('fastly.net')) {
    return 'Fastly';
  }

  // Cloudflare
  if (hostname.includes('cloudflare')) {
    return 'Cloudflare';
  }

  // Google Cloud CDN
  if (hostname.includes('googleapis.com') || hostname.includes('gvt1.com')) {
    return 'Google Cloud CDN';
  }

  // Azure CDN
  if (hostname.includes('azureedge.net')) {
    return 'Azure CDN';
  }

  // Limelight
  if (hostname.includes('lldns.net') || hostname.includes('llnwd.net')) {
    return 'Limelight';
  }

  // Level3/CenturyLink
  if (hostname.includes('footprint.net')) {
    return 'Level3';
  }

  // Verizon EdgeCast
  if (hostname.includes('edgecastcdn.net')) {
    return 'Verizon EdgeCast';
  }

  // KeyCDN
  if (hostname.includes('kxcdn.com')) {
    return 'KeyCDN';
  }

  return null;
}
