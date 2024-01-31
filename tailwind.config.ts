import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: global.safelist,
	theme: {
		extend: {}
	},
	plugins: []
} as Config;
