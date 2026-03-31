import { env } from '$env/dynamic/public';

const CONFIG = {
	mcEndpoint: env.PUBLIC_MC_ENDPOINT_URL,
	oinitEndpoint: env.PUBLIC_OINIT_ENDPOINT_URL,
	oinitCertHostname: env.PUBLIC_OINIT_CERT_SSH_HOSTNAME_FQDN,
	sshHost: {
		hostname: env.PUBLIC_SSH_HOSTNAME_FQDN,
		port: parseInt(env.PUBLIC_SSH_PORT) || 22
	} as { hostname: string; port: number }
};

export default CONFIG;
