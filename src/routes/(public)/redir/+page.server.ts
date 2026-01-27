import type { PageServerLoad } from './$types';

import { redirect } from '@sveltejs/kit';

import { createUserSession, sessionStore } from '$lib/server/sessions';

export const load = (async (e) => {
	const data = {
		token: e.locals.session?.accessToken,
		mcEndpoint: e.url.searchParams.get('mcEndpoint'),
		sshHostname: e.url.searchParams.get('sshHostname'),
		sshPort: Number(e.url.searchParams.get('sshPort') || 22)
	};

     console.debug('[redir] Received callback with data:', {
         hasToken: !!data.token,
         mcEndpoint: data.mcEndpoint,
         sshHostname: data.sshHostname,
         sshPort: data.sshPort
     });

	if (!data.token || !data.mcEndpoint || !data.sshHostname) {
		console.error('[redir] Missing required data, redirecting to login');
		return redirect(302, '/login');
	}

	// Validate that mcEndpoint is a properly formed URL
	try {
      const mcUrl = new URL(data.mcEndpoint);
      console.debug('[redir] Parsed mcEndpoint URL:', {
          href: mcUrl.href,
          hostname: mcUrl.hostname,
          port: mcUrl.port,
          pathname: mcUrl.pathname
      });
		// new URL(data.mcEndpoint);
	} catch (err) {
        console.error('[redir] Invalid mcEndpoint URL:', data.mcEndpoint, err);
		// console.error('[redir] Invalid mcEndpoint URL');
	}

	createUserSession(data.token, data.mcEndpoint, data.sshHostname, data.sshPort);

	return redirect(302, '/terminal');
}) satisfies PageServerLoad;
