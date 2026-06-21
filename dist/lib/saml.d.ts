import 'server-only';
import * as saml from 'samlify';
export declare function getProviders(url: string): Promise<{
  sp: saml.ServiceProviderInstance;
  idp: saml.IdentityProviderInstance;
}>;
export declare function createLogoutRequest(url: string, logoutNameID: string, sessionIndex: string): Promise<string>;
//# sourceMappingURL=saml.d.ts.map
