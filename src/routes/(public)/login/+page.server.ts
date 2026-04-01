import type { PageServerLoad } from './$types';
import providers from '$lib/server/providers';
import type { OP } from '$lib/types';
import CONFIG from '$lib/config';

export const load = (async () => {
	const providerMap: { [issuer: string]: OP } = providers.reduce(
		(map: { [issuer: string]: OP }, provider) => {
			if (provider.issuer) {
				map[provider.issuer] = {
					id: provider.id,
					issuer: provider.issuer
				};
			}
			return map;
		},
		{}
	);

	return {
		providers: providerMap,
		config: {
			mcEndpoint: CONFIG.mcEndpoint,
			sshInternalHost: CONFIG.sshInternalHost
		}
	};
}) satisfies PageServerLoad;
