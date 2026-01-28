<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import logo from '$lib/assets/webssh-oidc-square.png';
	import { errorMessage, uiBlock } from '$lib/stores';
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import { clickOutside } from '$lib/clickoutside';
	import UserMenuItem from '$lib/UserMenuItem.svelte';

	let expand = false;

	const handleLogout = async () => {
        console.log('signing out ...');
		try {
			$uiBlock = true;
			signOut().then(() => {
                console.log('sign out successful');
                // console.log('loginParams', $loginParams);
                console.log('session', $page.data.session);
                // $loginParams = null;
				$page.data.session = null;
			});
		} catch {
			$uiBlock = false;
		}
	};

	const handleUserProfileInfo = () => {
		goto('/profile');
	};

	const handleHelp = () => {
		goto('/help');
	};

	const handleGoHome = () => {
		goto('/terminal');
	};
</script>

<nav
	class="px-2 py-4 bg-white/80
            backdrop-blur-md shadow-md w-full
            fixed top-0 left-0 right-0 z-10 h-20"
>
	<div class="flex flex-row sm:w-4/5 mx-auto sm:px-0 px-6">
		<button type="button" id="home" title="Home" on:click={handleGoHome}>
			<div class="flex items-center space-x-3">
				<img class="h-10 object-cover" src={logo} alt="webssh-oidc logo" />
				<h3 class="text-xl text-mc-gray font-semibold tracking-tight">SSH with OIDC</h3>
			</div>
		</button>

		<button
			type="button"
			id="user-menu"
			title="User Menu"
			class="relative ml-auto"
			on:click={() => {
				expand = !expand;
			}}
			use:clickOutside
			on:outsideclick={() => (expand = false)}
		>
			<div
				class="border border-solid focus:outline-none focus:ring-mc-blue-500 focus:border-mc-blue-500 hover:ring-mc-blue-500 hover:border-mc-blue-500 rounded-full"
				class:expanded={expand}
			>
				<Icon icon="mdi:account-circle" class="text-5xl text-mc-gray" />
			</div>

			{#if expand}
				<div
					transition:slide={{ duration: 400 }}
					class="absolute top-12 right-0 p-2 bg-gray-50 text-mc-gray z-10 shadow-md rounded-md overflow-clip grid grid-flow-row"
				>
					<div class="h-8 w-full text-nowrap font-semibold text-start px-2">
						{$page.data.session?.user?.name ?? $page.data.session?.user?.email}
					</div>
					<div class="border-t border-gray-300 p-1"></div>
					<UserMenuItem icon="mdi:account" text="My Profile" callback={handleUserProfileInfo} />
					<UserMenuItem icon="mdi:terminal" text="Sessions" callback={handleGoHome} />
					<UserMenuItem icon="mdi:help" text="Help" callback={handleHelp} />
					<UserMenuItem icon="mdi:logout" text="Sign Out" callback={handleLogout} />
				</div>
			{/if}
		</button>
	</div>
</nav>

<style lang="postcss">
	.expanded {
		@apply border-mc-blue-500 ring-mc-blue-500;
		@apply text-mc-gray-300;
	}
</style>
