'use server';
import 'server-only';
import * as saml from 'samlify';
const DANGEROUS_XML_PATTERNS = [/<!DOCTYPE/i, /<!ENTITY/i, /\bSYSTEM\b/i, /\bPUBLIC\b/i];
/**
 * JS-only XML guard for SAML payloads.
 *
 * This intentionally avoids the Java-backed XSD validator. It blocks the XML
 * constructs most commonly used for XXE/DTD attacks, but it does not perform
 * full schema validation.
 */
async function validateSamlXml(xml) {
  if (typeof xml !== 'string' || xml.trim().length === 0) {
    throw new Error('ERR_INVALID_XML');
  }
  for (const pattern of DANGEROUS_XML_PATTERNS) {
    if (pattern.test(xml)) {
      throw new Error('ERR_INVALID_XML');
    }
  }
  return 'SUCCESS_VALIDATE_XML';
}
saml.setSchemaValidator({ validate: validateSamlXml });
export async function getProviders(url) {
  const callbackUrl = process.env.SAML_CALLBACK_URL
    ? new URL(process.env.SAML_CALLBACK_URL)
    : new URL('/api/auth/sso/callback', process.env.APP_URL ?? url);
  const sp = saml.ServiceProvider({
    entityID: process.env.SAML_ENTITY_ID,
    assertionConsumerService: [
      {
        Binding: saml.Constants.namespace.binding.post,
        Location: callbackUrl.toString(),
      },
    ],
    singleLogoutService: [
      {
        Binding: saml.Constants.namespace.binding.post,
        Location: callbackUrl.toString(),
      },
    ],
  });
  const idp = saml.IdentityProvider({
    metadata: process.env.SAML_METADATA,
  });
  return { sp, idp };
}
export async function createLogoutRequest(url, logoutNameID, sessionIndex) {
  const { sp, idp } = await getProviders(url);
  const { context } = sp.createLogoutRequest(idp, 'redirect', {
    logoutNameID,
    sessionIndex,
  });
  return context;
}
//# sourceMappingURL=saml.js.map
