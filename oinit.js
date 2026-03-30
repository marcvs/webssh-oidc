// @ts-check

import sshpk from 'sshpk';
import logger from './logger.js';

/**
 * Generate an ephemeral SSH key pair for oinit certificate authentication
 * @returns {{ privateKey: string, publicKey: string }}
 */
export function generateSshKeyPair() {
	const key = sshpk.generatePrivateKey('ed25519');
	logger.debug('[oinit] Generated ephemeral ed25519 key pair');
	return {
		privateKey: key.toString('openssh'),
		publicKey: key.toPublic().toString('ssh')
	};
}

/**
 * Fetch SSH certificate from oinit CA
 * @param {string} accessToken - OIDC access token
 * @param {string} publicKey - SSH public key in OpenSSH format
 * @param {string} endpoint - oinit CA endpoint URL (e.g., http://localhost:8080/oinit/api/v1/localhost/certificate)
 * @returns {Promise<string | null>} The SSH certificate or null on failure
 */
export async function fetchOinitCertificate(accessToken, publicKey, endpoint) {
	// Normalize endpoint URL - remove double slashes (except after protocol)
	const normalizedEndpoint = endpoint.replace(/([^:]\/)\/+/g, '$1');

	const requestBody = {
		Publickey: publicKey,
		Token: accessToken
	};

	logger.debug(`[oinit] Calling oinit CA endpoint: ${normalizedEndpoint}`);
	logger.debug(`[oinit] Request body: ${JSON.stringify(requestBody, null, 2)}`);

	const response = await fetch(normalizedEndpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(requestBody)
	});

	if (!response.ok) {
		const errorText = await response.text();
		logger.error(`[oinit] CA request failed: status=${response.status} body=${errorText}`);
		return null;
	}

	const data = await response.json();
	// logger.debug(`[oinit] CA response received: ${data.certificate?.substring(0, 80)}...`);
	logger.debug(`[oinit] CA response received: ${data.certificate}`);
	return data.certificate;
}
