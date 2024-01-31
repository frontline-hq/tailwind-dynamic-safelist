import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import fs from 'node:fs/promises';
import fg from 'fast-glob';
import { resolve } from 'node:path';
import uniq from 'lodash.uniq';
import difference from 'lodash.difference';

const configFileName = 'some-config-file.ts';
const safelist = new Map<string, string[]>();

async function updateSafelist(path: string, processFile: (code: string, path: string) => string[]) {
	// read file
	const code = await fs.readFile(path, { encoding: 'utf8' });
	// process file to get safelist
	const processed = processFile(code, path);
	// push only new values to safelist
	safelist.set(path, processed);
	return uniq([...safelist.values()].flatMap((v) => v)) as string[];
}

function processSvelte(code: string, path: string): string[] {
	if (!path.includes('.svelte')) return [];
	return [...code.matchAll(new RegExp(`(?<=dynamic-safelist\\().+(?=\\))`, 'gm'))].map((m) => {
		return (0, eval)(m[0]);
	});
}

async function reloadTailwind() {
	const fileContent = await fs.readFile(resolve(process.cwd(), './tailwind.config.ts'), {
		encoding: 'utf8'
	});
	await fs.writeFile(resolve(process.cwd(), './tailwind.config.ts'), fileContent);
}

export default defineConfig({
	plugins: [
		{
			name: 'dynamic-safelist',
			enforce: 'pre',
			async configureServer(server) {
				// TODO: What should I do with this?
				const stream = fg.globStream(['src/**/*.svelte'], { dot: true, absolute: true });
				for await (const entry of stream) {
					// pushes new tw classes to safelist
					global.safelist = await updateSafelist(entry, processSvelte);
				}

				server.watcher.add(['src/**/*.svelte', `./${configFileName}`]);
				server.watcher.on('add', handleFileChange);
				server.watcher.on('change', handleFileChange);
				server.watcher.on('unlink', unlinkFile);

				async function handleFileChange(path: string) {
					if (path.includes(configFileName)) {
						console.log(`Config file ${configFileName} changed. Restarting vite...`);
						server.restart();
					}
					if (path.endsWith('.svelte')) {
						const newSafelist = await updateSafelist(path, processSvelte);
						if (difference(newSafelist, global.safelist ?? []).length > 0) {
							global.safelist = newSafelist;
							console.log(`Safelist has changed. Restarting vite...`);
							await reloadTailwind();
						}
					}
				}

				async function unlinkFile(path: string) {
					if (path.endsWith('.svelte')) safelist.delete(path);
					await reloadTailwind();
				}
			}
		},
		sveltekit()
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
