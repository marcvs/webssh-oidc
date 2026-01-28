import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 8444,
		strictPort: false,
		proxy: {
			// Proxy WebSocket connections to the Express server in development
			'/ws': {
				target: 'ws://localhost:8445',
				ws: true,
				changeOrigin: true
			}
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
