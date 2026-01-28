import config from 'config';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

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
	// Falls back to PUBLIC_MC_ENDPOINT_URL if not set
	internalMcEndpoint: env.INTERNAL_MC_ENDPOINT_URL || publicEnv.PUBLIC_MC_ENDPOINT_URL
};

export default CONFIG;
