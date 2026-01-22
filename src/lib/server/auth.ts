import { SvelteKitAuth } from '@auth/sveltekit';
import type { Action, Handle } from '@sveltejs/kit';

import providers from '$lib/server/providers';

// hook for auth.js oidc authentication
export const { handle, signIn, signOut } = SvelteKitAuth({
	trustHost: true,
    // FIXME: marcus put this back when moving to https
    useSecureCookies: process.env.NODE_ENV === 'production',
	// useSecureCookies: false,
	providers: providers,
	callbacks: {
		async jwt({ token, account, user, profile }) {
			// Persist the OIDC access_token to the token right after signin
			if (account) {
				// check if access token is present
				if (!account.access_token) {
					throw new Error('Access token not present');
				}
				token.accessToken = account.access_token;
				if (account.expires_in) {
					token.expiresAt = Date.now() + account.expires_in;
				}
			}
			if (profile) {
				if (token.profile) token.profile = { ...token.profile, ...profile };
				else token.profile = profile;
			}
			if (user) {
				if (token.user) token.user = { ...token.user, ...user };
				else token.user = user;
			}
			return token;
		},
		async session({ session, token }) {
			// Send properties to the client, like an access_token from a provider.
			const new_session = {
				...session,
				accessToken: token.accessToken,
				expiresAt: token.expiresAt,
				profile: token.profile
			};
			if (token.user) {
				if (new_session.userinfo) new_session.userinfo = { ...new_session.userinfo, ...token.user };
				else new_session.userinfo = token.user;
			}
			return new_session;
		}
	}
}) satisfies { handle: Handle; signIn: Action; signOut: Action };

declare module '@auth/core/types' {
	interface Session {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			preferred_username?: string | null;
		};
		expiresAt: number;
		accessToken: string;
		profile: { [key: string]: string | number | boolean | string[] };
		userinfo: { [key: string]: string | number | boolean | string[] } | {};
	}
}

declare module '@auth/core/jwt' {
	interface JWT {
		accessToken: string;
		expiresAt: number;
	}
}
