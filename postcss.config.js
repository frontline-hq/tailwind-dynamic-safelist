import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { getSafelist } from './getSafelist.js';

/* 
Reads comments in svelte file and safelists accordingly. 
E.g.: `// dynamic-safelist: 'bg'`
*/
function processSvelte(code, path) {
	if (!path.includes('.svelte')) return [];
	return [...code.matchAll(new RegExp(`(?<=dynamic-safelist\\().+(?=\\))`, 'gm'))].map((m) => {
		return eval(m[0]);
	});
}

console.log('loading postcss config...');

export default {
	plugins: [
		tailwindcss({
			safelist: await getSafelist('./some-config-file.ts', processSvelte),
			content: ['./src/**/*.{html,js,svelte,ts}'],
			theme: {
				extend: {}
			}
		}),
		autoprefixer
	]
};
