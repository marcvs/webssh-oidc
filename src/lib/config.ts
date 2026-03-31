import { env } from '$env/dynamic/private';

const CONFIG = {
	mcEndpoint: env.MC_ENDPOINT,
	oinitEndpoint: env.OINIT_ENDPOINT,
	oinitCertHostname: env.SSH_CERT_HOSTNAME,
	sshHost: {
		hostname: env.SSH_HOSTNAME,
		port: parseInt(env.SSH_PORT) || 22
	} as { hostname: string; port: number }
};

export default CONFIG;
