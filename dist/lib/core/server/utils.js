import { isAfter, isBefore } from 'date-fns';
import { isIP } from 'node:net';
/**
 * Resolve the public-facing origin from a request, respecting proxy headers
 * (X-Forwarded-Proto, X-Forwarded-Host) set by ALB / reverse proxies.
 * Falls back to the URL's own origin for local dev.
 */
export function getRequestOrigin(req) {
    const proto = req.headers.get('x-forwarded-proto') || new URL(req.url).protocol.replace(':', '');
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || new URL(req.url).host;
    return `${proto}://${host}`;
}
export function getValidIpAddress(headers) {
    const forwardedFor = headers.get('x-forwarded-for');
    const realIp = headers.get('x-real-ip');
    let ip = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || 'unknown';
    if (ip === '::1') {
        ip = '127.0.0.1';
    }
    // Validate IP format (IPv4 or IPv6)
    const validIp = isIP(ip) ? ip : `unknown:${ip}`;
    return validIp;
}
export function isUserActiveSync(user) {
    if (user.locked) {
        return false;
    }
    if (isAfter(user.start_date, new Date())) {
        return false;
    }
    if (user.end_date && isBefore(user.end_date, new Date())) {
        return false;
    }
    return true;
}
//# sourceMappingURL=utils.js.map