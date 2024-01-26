import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const safelist = [];

setTimeout(() => {
	safelist.push('bg-green-500');
	console.log('pushed to safelist');
}, '10000');

export default {
	plugins: [
		tailwindcss({
			safelist,
			content: ['./src/**/*.{html,js,svelte,ts}'],
			theme: {
				extend: {}
			}
		}),
		autoprefixer
	]
};
