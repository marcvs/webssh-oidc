import { z } from 'zod';

type Fetch = (input: URL | RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

const ABORT_TIMEOUT = 10000;

/**
 * Safely append a path segment to a URL, ensuring proper slash handling.
 * Handles cases where base path may or may not have a trailing slash.
 */
const appendPath = (baseUrl: URL, path: string): URL => {
	const url = new URL(baseUrl);
	// Ensure base pathname ends with / before appending
	if (!url.pathname.endsWith('/')) {
		url.pathname += '/';
	}
	// Remove leading slash from path if present
	url.pathname += path.replace(/^\//, '');
	return url;
};

export const loadOps = async (fetch: Fetch, mcEndpoint: URL) => {
	const url = appendPath(mcEndpoint, 'info');
	console.debug('[motley_cue] loadOps: mcEndpoint =', mcEndpoint.toString());
	console.debug('[motley_cue] loadOps: final URL =', url.toString());

	const response = await fetch(url, { signal: AbortSignal.timeout(ABORT_TIMEOUT) });
	if (response.ok) {
		const jsonRaw = await response.json();

		const schema = z.object({
			supported_OPs: z.array(z.string())
		});

		const parsedAPIResponse = schema.safeParse(jsonRaw);
		if (!parsedAPIResponse.success) {
			throw new Error(`Failed to parse API response: ${parsedAPIResponse.error.errors}`);
		}

		const supportedOPs = parsedAPIResponse.data.supported_OPs;
		return supportedOPs.map((op: string) => op.trim().replace(/\/+$/, ''));
	} else {
		throw new Error(`Could not get info from ${url} (${response.status} ${response.statusText})`);
	}
};

export const loadOpInfo = async (fetch: Fetch, mcEndpoint: URL, opUrl: string) => {
	const url = appendPath(mcEndpoint, 'info/op');
	url.searchParams.set('url', opUrl);
	console.debug('[motley_cue] loadOpInfo: mcEndpoint =', mcEndpoint.toString());
	console.debug('[motley_cue] loadOpInfo: final URL =', url.toString());

	const response = await fetch(url, { signal: AbortSignal.timeout(ABORT_TIMEOUT) });
	if (response.ok) {
		const jsonRaw = await response.json();

		const schema = z.object({
			scopes: z.array(z.string()),
			audience: z.string()
		});

		const parsedAPIResponse = schema.safeParse(jsonRaw);
		if (!parsedAPIResponse.success) {
			throw new Error(`Failed to parse API response: ${parsedAPIResponse.error.errors}`);
		}

		return parsedAPIResponse.data;
	} else {
		throw new Error(
			`Could not get info for OP ${opUrl} (${response.status} ${response.statusText})`
		);
	}
};

export const deployUser = async (fetch: Fetch, mcEndpoint: URL, accessToken: string) => {
	const url = appendPath(mcEndpoint, 'user/deploy');
	console.debug('[motley_cue] deployUser: mcEndpoint =', mcEndpoint.toString());
	console.debug('[motley_cue] deployUser: final URL =', url.toString());

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		},
		signal: AbortSignal.timeout(ABORT_TIMEOUT)
	});

	if (response.ok) {
		const jsonRaw = await response.json();

		const schema = z.object({
			state: z.string(),
			credentials: z.object({
				ssh_user: z.string()
			})
		});

		const parsedAPIResponse = schema.safeParse(jsonRaw);
		if (!parsedAPIResponse.success) {
			throw new Error(`Failed to parse API response: ${parsedAPIResponse.error.errors}`);
		}

		return parsedAPIResponse.data;
	} else {
		throw new Error(`Could not deploy user (${response.status} ${response.statusText})`);
	}
};

export const getUserStatus = async (fetch: Fetch, mcEndpoint: URL, accessToken: string) => {
	const url = appendPath(mcEndpoint, 'user/get_status');
	console.debug('[motley_cue] getUserStatus: mcEndpoint =', mcEndpoint.toString());
	console.debug('[motley_cue] getUserStatus: final URL =', url.toString());

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		},
		signal: AbortSignal.timeout(ABORT_TIMEOUT)
	});

	if (response.ok) {
		const jsonRaw = await response.json();

		const schema = z.object({
			state: z.string(),
			message: z.string()
		});

		const parsedAPIResponse = schema.safeParse(jsonRaw);
		if (!parsedAPIResponse.success) {
			throw new Error(`Failed to parse API response: ${parsedAPIResponse.error.errors}`);
		}

		return parsedAPIResponse.data;
	} else {
		throw new Error(`Could not get user status (${response.status} ${response.statusText})`);
	}
};

export const getSshUser = async (fetch: Fetch, mcEndpoint: URL, accessToken: string) => {
	let status = await getUserStatus(fetch, mcEndpoint, accessToken);
	if (status.state === 'not_deployed') {
		let deployment = await deployUser(fetch, mcEndpoint, accessToken);
		if (deployment.state === 'deployed') {
			return { username: deployment.credentials.ssh_user };
		}
	} else {
		return { username: status.message.split(' ')[1] };
	}
};
