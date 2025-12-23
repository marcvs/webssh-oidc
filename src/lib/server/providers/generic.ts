import type { OAuthUserConfig, OAuthConfig } from '@auth/core/providers';
import logger from '$lib/server/logger';

export interface GenericProfile extends Record<string, any> {
	aud: string;
	azp: string;
	email: string;
	email_verified: boolean;
	exp: number;
	family_name: string;
	given_name: string;
	hd: string;
	iat: number;
	iss: string;
	jti: string;
	name: string;
	nbf: number;
	picture: string;
	sub: string;
	preferred_username: string;
}

export default function Generic<P extends GenericProfile>(
	options: OAuthUserConfig<P>
): OAuthConfig<P> {
    // logger.debug(`GENERIC provider function called with options: ${JSON.stringify(options, null, 2)}`);
	const config = {
		id: 'generic',
		name: 'Generic Provider',
		type: 'oidc',
		checks: ['pkce', 'state'], 
		...options
	};
	logger.debug(`GENERIC provider final config:${JSON.stringify(config, null, 2)}`);
    return config;
}
