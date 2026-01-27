import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { handle as skauth } from '$lib/server/auth';

import { getUserSession } from '$lib/server/sessions';
import type { RequestEvent } from '@sveltejs/kit';

function isLoggedIn({ locals: { session } }: RequestEvent) {
	if (session && session.accessToken) {
		const userSession = getUserSession(session.accessToken);
		if (userSession) return true;
	}
	return false;
}

// hook for checking whether the user is logged in and redirecting to the appropriate endpoint
const authcheck = (async ({ event, resolve }) => {
	// get session and set event local session
	const session = await event.locals?.auth();
	event.locals.session = session;

	if (event.route.id === '/(public)') {
		if (isLoggedIn(event)) {
			return redirect(302, '/terminal');
		} else {
			return redirect(302, '/login');
		}
	}

	if (event.route.id?.startsWith('/(public)/login') && isLoggedIn(event)) {
        console.debug('User already logged in. Redirecting to terminal...');
		return redirect(302, '/terminal');
	}

	if (event.route.id?.startsWith('/(protected)')) {
		if (!isLoggedIn(event) || !session) return redirect(302, '/login');
		const userSession = getUserSession(session.accessToken);
		if (!userSession) return redirect(302, '/login'); // should never happen....

		event.locals.userSession = userSession;
	}

	return await resolve(event);
}) satisfies Handle;

export const handle = sequence(skauth, authcheck);
