/**
 * Generate Content Security Policy with appropriate directives
 * Customize this based on application requirements
 */
export function getContentSecurityPolicy(nonce) {
    // Allow connections to same origin, auth providers, API endpoints, and S3 for file uploads.
    // A raw IP (106.51.73.87:8082) was previously listed here; removed — it
    // looked like a dev endpoint leaked into prod CSP. Re-add via env if needed.
    const connectSrc = ["'self'", 'https://*.amazonaws.com', 'https://cdn.jsdelivr.net'].filter(Boolean);
    // Allow images from same origin and data URLs (for embedded content)
    const imgSrc = [
        "'self'",
        'data:',
        'blob:',
        'https://*.tile.openstreetmap.org',
        'https://cdn.jsdelivr.net',
        'https://*.amazonaws.com',
    ];
    // Allow styles from same origin and inline styles (helpful for component libraries)
    const styleSrc = ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'];
    // Script sources
    // Note: 'unsafe-eval' is required for D3.js which uses new Function() for parsing
    // This is a security tradeoff needed for map/chart visualizations
    const scriptSrc = ["'self'", `'nonce-${nonce}'`, 'https://cdn.jsdelivr.net', "'unsafe-eval'"];
    const fontSrc = ["'self'", `'nonce-${nonce}'`, 'https://cdn.jsdelivr.net'];
    return [
        `base-uri 'self'`,
        `connect-src ${connectSrc.join(' ')}`,
        `default-src 'self'`,
        `font-src ${fontSrc.join(' ')}`,
        `form-action 'self'`,
        `frame-ancestors 'self'`,
        `frame-src 'self'`,
        `img-src ${imgSrc.join(' ')}`,
        `manifest-src 'self'`,
        `object-src 'none'`,
        `script-src ${scriptSrc.join(' ')}`,
        `style-src ${styleSrc.join(' ')}`,
        `upgrade-insecure-requests`,
        `worker-src 'self' blob:`,
    ].join('; ');
}
/**
 * Generate Content Security Policy for files API route
 * Allows iframe embedding for PDF viewing
 */
export function getContentSecurityPolicyForFiles(nonce) {
    // Allow connections to same origin, auth providers, API endpoints, and S3 for file uploads.
    // A raw IP (106.51.73.87:8082) was previously listed here; removed — it
    // looked like a dev endpoint leaked into prod CSP. Re-add via env if needed.
    const connectSrc = ["'self'", 'https://*.amazonaws.com', 'https://cdn.jsdelivr.net'].filter(Boolean);
    // Allow images from same origin and data URLs (for embedded content)
    const imgSrc = [
        "'self'",
        'data:',
        'blob:',
        'https://*.tile.openstreetmap.org',
        'https://cdn.jsdelivr.net',
        'https://*.amazonaws.com',
    ];
    // Allow styles from same origin and inline styles (helpful for component libraries)
    const styleSrc = ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'];
    // Script sources
    // Note: 'unsafe-eval' is required for D3.js which uses new Function() for parsing
    // This is a security tradeoff needed for map/chart visualizations
    const scriptSrc = ["'self'", `'nonce-${nonce}'`, 'https://cdn.jsdelivr.net', "'unsafe-eval'"];
    const fontSrc = ["'self'", `'nonce-${nonce}'`, 'https://cdn.jsdelivr.net'];
    return [
        `base-uri 'self'`,
        `connect-src ${connectSrc.join(' ')}`,
        `default-src 'self'`,
        `font-src ${fontSrc.join(' ')}`,
        `form-action 'self'`,
        `frame-ancestors 'self'`, // Allow iframe embedding from same origin
        `img-src ${imgSrc.join(' ')}`,
        `object-src 'none'`,
        `script-src ${scriptSrc.join(' ')}`,
        `style-src ${styleSrc.join(' ')}`,
        `upgrade-insecure-requests`,
        `worker-src 'self' blob:`,
    ].join('; ');
}
//# sourceMappingURL=secure-headers.js.map