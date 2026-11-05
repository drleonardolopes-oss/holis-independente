// Only tokens signed by the configured Cloudflare Access tenant are accepted.
const cache = new Map();
function decode(s) { return Uint8Array.from(atob(s.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0)); }
function obj(s) { return JSON.parse(new TextDecoder().decode(decode(s))); }
export async function verifyAccess(token, config, fetcher = fetch) {
  try {
    const { issuer, audience } = config;
    if (!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer || '') || !audience || !token || token.length > 20000) return null;
    const parts = token.split('.'); if (parts.length !== 3) return null;
    const head = obj(parts[0]), claims = obj(parts[1]), now = Date.now() / 1000;
    if (head.alg !== 'RS256' || typeof head.kid !== 'string' || claims.iss !== issuer || claims.type !== 'app' || typeof claims.sub !== 'string' || !claims.sub || typeof claims.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(claims.email) || !Number.isFinite(claims.exp) || claims.exp <= now || !Number.isFinite(claims.iat) || claims.iat > now + 30 || (claims.nbf !== undefined && (!Number.isFinite(claims.nbf) || claims.nbf > now + 30))) return null;
    if (!(Array.isArray(claims.aud) ? claims.aud : [claims.aud]).includes(audience)) return null;
    let keys = cache.get(issuer);
    if (!keys || keys.expires < Date.now()) {
      const response = await fetcher(issuer + '/cdn-cgi/access/certs', { redirect: 'manual', signal: AbortSignal.timeout(5000) });
      if (!response.ok) return null;
      const jwks = await response.json(); if (!Array.isArray(jwks.keys) || jwks.keys.length > 30) return null;
      keys = { expires: Date.now() + 300000, list: jwks.keys }; cache.set(issuer, keys);
    }
    const jwk = keys.list.find(k => k.kid === head.kid && k.kty === 'RSA' && (!k.alg || k.alg === 'RS256') && (!k.use || k.use === 'sig'));
    if (!jwk) return null;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    if (!await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decode(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]))) return null;
    return { userId: claims.sub, email: claims.email.toLowerCase(), displayName: claims.email, fullName: null };
  } catch { return null; }
}
