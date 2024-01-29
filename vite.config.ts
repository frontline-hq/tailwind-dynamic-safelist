import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import ViteRestart from 'vite-plugin-restart';

export default defineConfig({
	plugins: [
		ViteRestart({
			reload: ['postcss.config.js']
		}),
		sveltekit()
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
