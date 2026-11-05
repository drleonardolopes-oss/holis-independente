import {env} from 'cloudflare:workers';
export const PLATFORM_OWNER=String(env.HOLIS_OWNER_EMAIL||'').trim().toLowerCase();
