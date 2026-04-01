import { env } from '$env/dynamic/private';

const CONFIG = {
	mcEndpoint: env.MC_ENDPOINT,
	oinitEndpoint: env.OINIT_ENDPOINT,
	sshHostname: env.SSH_HOSTNAME,
	sshInternalHost: {
		hostname: env.SSH_INTERNAL_HOSTNAME || env.SSH_HOSTNAME,
		port: parseInt(env.SSH_PORT) || 22
	} as { hostname: string; port: number }
};

export default CONFIG;
