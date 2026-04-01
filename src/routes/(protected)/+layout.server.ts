import { getSshUser } from '$lib/motley_cue';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import SERVER_CONFIG from '$lib/server/config';
import CONFIG from '$lib/config';
import logger from '$lib/server/logger';
import { generateSshKeyPair, fetchOinitCertificate } from '$lib/server/oinit';

export const load = (async ({ locals }) => {
	if (!locals.session?.accessToken) {
		return error(403, new Error('Unauthorized'));
	}

	const session = locals.userSession;
	logger.debug('[+layout.server] session.mcEndpoint (public) =', session.mcEndpoint);

	// Use internal endpoint for server-side calls if configured
	// This allows different URLs for browser (public) vs server (internal Docker network)
	const internalEndpoint = SERVER_CONFIG.internalMcEndpoint;
	const mcEndpointUrl = new URL(internalEndpoint || session.mcEndpoint);

	logger.debug('[+layout.server] Using mcEndpoint for server-side call:', {
		href: mcEndpointUrl.href,
		hostname: mcEndpointUrl.hostname,
		port: mcEndpointUrl.port,
		pathname: mcEndpointUrl.pathname,
		isInternal: !!internalEndpoint && internalEndpoint !== session.mcEndpoint
	});

	const username = await getSshUser(fetch, mcEndpointUrl, session.token)
		.then((sshUser) => {
			logger.debug('[+layout.server] getSshUser returned:', sshUser);
			return sshUser?.username ?? '';
		})
		.catch((e) => {
			logger.error('[+layout.server] getSshUser failed:', e);
			return '';
		});

	// Determine the certificate hostname (public-facing hostname for SSH)
	const sshHostname = CONFIG.sshHostname || session.sshHostname;

	// Generate oinit credentials if configured and not already generated
	if (CONFIG.oinitEndpoint && !session.oinitPrivateKey) {
		try {
			const keyPair = generateSshKeyPair();
			const endpoint = `${CONFIG.oinitEndpoint}/${sshHostname}/certificate`;
			const certificate = await fetchOinitCertificate(
				locals.session.accessToken,
				keyPair.publicKey,
				endpoint
			);
			if (certificate) {
				session.oinitPrivateKey = keyPair.privateKey;
				session.oinitCertificate = certificate;
				logger.debug('[+layout.server] Generated oinit credentials');
			}
		} catch (e) {
			logger.error('[+layout.server] Failed to generate oinit credentials:', e);
		}
	}

	return {
		userId: locals.session?.user?.id,
		accessToken: locals.session?.accessToken,
		terminalSessions: locals.userSession.terminals,
		userSession: locals.userSession,
		username: username,
		oinitPrivateKey: session.oinitPrivateKey,
		oinitCertificate: session.oinitCertificate,
		sshHostname: sshHostname,
		session: locals.session
	};
}) satisfies LayoutServerLoad;
