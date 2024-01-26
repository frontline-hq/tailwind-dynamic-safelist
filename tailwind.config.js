import plugin from 'tailwindcss/plugin';

const safelist = [];

setTimeout(() => {
	safelist.push('bg-green-500');
	console.log('pushed to safelist');
}, '10000');

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: [
		plugin(
			async function ({ addUtilities, addComponents, e, config }) {
				// Add your custom styles here
				// Watch .svelte files
				console.log('ss');
			},
			{ safelist: safelist }
		)
	]
};
