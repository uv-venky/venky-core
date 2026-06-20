import { atom } from 'jotai';
import type { Integration } from '@/lib/api-client';

// Track if integrations have been loaded (to avoid showing warnings before fetch)
export const integrationsLoadedAtom = atom(false);

// Selected integration for forms/dialogs
export const selectedIntegrationAtom = atom<Integration | null>(null);

// Version counter that increments when integrations are added/deleted/modified
// Components can use this to know when to re-fetch integrations
export const integrationsVersionAtom = atom(0);
