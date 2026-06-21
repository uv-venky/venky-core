/**
 * Generate Content Security Policy with appropriate directives
 * Customize this based on application requirements
 */
export declare function getContentSecurityPolicy(nonce: string): string;
/**
 * Generate Content Security Policy for files API route
 * Allows iframe embedding for PDF viewing
 */
export declare function getContentSecurityPolicyForFiles(nonce: string): string;
//# sourceMappingURL=secure-headers.d.ts.map