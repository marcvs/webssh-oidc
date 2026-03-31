import config from 'config';
import { env } from '$env/dynamic/private';

export type ProviderConfig = {
	issuer: string;
	clientId: string;
	clientSecret: string;
	id?: string;
	name?: string;
};

const CONFIG = {
	// empty list of providers if not configured
	providers: (config.has('providers') ? config.get('providers') : []) as ProviderConfig[],

	// Internal MC endpoint for server-side calls (Docker internal network)
	// Falls back to MC_ENDPOINT if not set
	internalMcEndpoint: env.INTERNAL_MC_ENDPOINT || env.MC_ENDPOINT
};

export default CONFIG;
