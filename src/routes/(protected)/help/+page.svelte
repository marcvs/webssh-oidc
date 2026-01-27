<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { errorMessage, uiBlock } from '$lib/stores';
	import MyCodeArea from '$lib/MyCodeArea.svelte';
	import { signOut } from '@auth/sveltekit/client';

	export let data: PageData;

	const loginParams = {
		user: data.session?.user.name ?? data.session?.user.email ?? data.session?.user.id ?? 'User',
		accessToken: data.accessToken,
		mcEndpoint: data.userSession.mcEndpoint,
		issuer: data.session?.profile.iss,
		sshHost: {
			hostname: data.userSession.sshHostname,
			port: data.userSession.sshPort
		},
		sshUser: data.username
	};

	const sshCmd = `ssh -p ${loginParams.sshHost.port} ${loginParams.sshUser}@${loginParams.sshHost.hostname}`;
	const mccliCmd = `mccli --mc-endpoint ${loginParams.mcEndpoint
		.toString()
		.replace(/\/$/, '')} --token ${loginParams.accessToken} ssh -p ${
		loginParams.sshHost.port
	} ${loginParams.sshHost.hostname}`;
	const mccliCmdOidcAgent = `mccli --mc-endpoint ${loginParams.mcEndpoint
		.toString()
		.replace(/\/$/, '')} --issuer ${loginParams.issuer} ssh -p ${
		loginParams.sshHost.port
	} ${loginParams.sshHost.hostname}`;

	onMount(async () => {
		if (!data.username) {
			errorMessage.set('No ssh username found.');
			console.error('No ssh username found. Signing out.');
			await signOut();
			$uiBlock = false;
		}
		$uiBlock = false;
        console.log('loginParams:', loginParams);
        console.log('sshCmd:', sshCmd);
        console.log('mccliCmd:', mccliCmd);
	});
</script>

<div class="flex flex-col gap-4 h-fit">
	<h1 class="text-2xl font-semibold text-mc-gray">Commandline Login</h1>
	<p class="text-mc-gray">
		The alternative to this web SSH login is to use the command line. There are several options to
		login to an SSH server with OpenId Connect using the commandline:
	</p>

	<h2 class="text-xl font-semibold text-mc-gray">1. Vanilla SSH</h2>

	<p class="text-mc-gray">
		You can use a vanilla SSH client to log in to the server. If you have already used the web
		client, the user <span class="font-semibold">{loginParams.sshUser}</span> has already been created
		for you. However, you will need to interactively pass the access token when prompted for it.
	</p>
	<MyCodeArea label="SSH commandline:" id="sshCmd" value={sshCmd} />

	<MyCodeArea label="Access Token:" id="token" value={loginParams.accessToken} />

	<h2 class="text-xl font-semibold text-mc-gray">2. mccli</h2>

	<p class="text-mc-gray">
		This tool is a wrapper around the vanilla SSH client that makes sure that the local user is
		created on the SSH server and then passes the access token to the server without any need for
		user interaction. Mccli also supports integration with
		<span class="font-semibold">oidc-agent</span>, a commandline tool for managing access tokens.
		This will ensure that a valid access token is always available for the SSH client.
	</p>
	<MyCodeArea label="mccli command:" id="mccliCmd" value={mccliCmd} />
	<MyCodeArea
		label="mccli command with oidc-agent integration:"
		id="mccliCmdOidcAgent"
		value={mccliCmdOidcAgent}
	/>

	<h1 class="text-2xl font-semibold text-mc-gray">Resources</h1>
	<p class="text-mc-gray">Here are some resources to help you get started with SSH-OIDC.</p>
	<ul class="list-disc list-inside text-mc-gray">
		<li>
			The web client for ssh:
			<a
				href="https://github.com/dianagudu/webssh-oidc"
				target="_blank"
				rel="noopener noreferrer"
				class="text-mc-blue-500 underline"
			>
				webssh-oidc
			</a>
		</li>
		<li>
			The server-side component for identity mapping and account management:
			<a
				href="https://motley-cue.readthedocs.io/"
				target="_blank"
				rel="noopener noreferrer"
				class="text-mc-blue-500 underline"
			>
				motley-cue
			</a>
		</li>
		<li>
			The client-side wrapper for SSH with OIDC:
			<a
				href="https://mccli.readthedocs.io/"
				target="_blank"
				rel="noopener noreferrer"
				class="text-mc-blue-500 underline"
			>
				mccli
			</a>
		</li>
		<li>
			The client-side tool for managing OIDC tokens:
			<a
				href="https://indigo-dc.gitbook.io/oidc-agent"
				target="_blank"
				rel="noopener noreferrer"
				class="text-mc-blue-500 underline"
			>
				oidc-agent
			</a>
		</li>
	</ul>
</div>
