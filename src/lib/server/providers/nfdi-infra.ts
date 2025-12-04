import type { OAuthUserConfig, OAuthConfig } from '@auth/core/providers';

export interface NfdiInfraProfile extends Record<string, any> {
	aud: string;
	azp: string;
	exp: number;
	iat: number;
	iss: string;
	jti: string;
	nbf: number;
	sub: string;

	auth_time: number;
	typ: string;
	session_state: string;
	sid: string;
	authenticating_authority: string;

	eduperson_assurance: string;
	eduperson_entitlement: string[];
	voperson_id: string;
	voperson_external_affiliation: string[];
	voperson_verified_email: string;
	email: string;
	email_verified: string;
	family_name: string;
	given_name: string;
	name: string;
	orcid: string;
	preferred_username: string;
	ssh_public_key: string;
}

export default function NfdiInfra<P extends NfdiInfraProfile>(options: OAuthUserConfig<P>): OAuthConfig<P> {
	return {
		id: 'nfdi-infra',
		name: 'NFDI Infrastructure Proxy',
		type: 'oidc',
		issuer: 'https://infraproxy.nfdi-aai.dfn.de',
		authorization: {
			params: {
				scope:
					'openid profile email eduperson_assurance eduperson_entitlement voperson_external_affiliation voperson_id'
			}
		},
		checks: ['pkce', 'state'],
		...options
	};
}
