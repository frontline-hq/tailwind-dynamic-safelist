import watcher from '@parcel/watcher';
import { resolve } from 'node:path';
import { fileURLToPath } from 'url';
import fs from 'node:fs/promises';
import uniq from 'lodash.uniq';
import fg from 'fast-glob';
import j from 'jiti';
const jiti = j(
	/*
	Credits to https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
	*/
	fileURLToPath(import.meta.url)
);

process.on('SIGINT', () => {
	// close watcher when Ctrl-C is pressed
	if (global.watcher) global.watcher.unsubscribe();

	process.exit(0);
});

// processFile: `(code: string, filename: string) => string[]` (this is the safelist)
export async function getSafelist(configPath, processFile) {
	// read safelist template from config
	// This could also be loading the config for processFile
	let { safelist } = jiti(configPath).configuration;

	async function readSafelist(path) {
		// read file
		const code = await fs.readFile(path, { encoding: 'utf8' });
		// process file to get safelist
		const processed = processFile(code, path);
		// push only new values to safelist
		processed.forEach((c) => {
			if (!safelist.includes(c)) {
				safelist = [...safelist, c];
			}
		});
		return safelist;
	}
	// On initial load, read all corresponding files.
	const stream = fg.globStream(['src/**/*.svelte'], { dot: true, absolute: true });
	for await (const entry of stream) {
		// pushes new tw classes to safelist
		safelist = await readSafelist(entry);
	}

	// Setup change watcher
	if (!global.watcher) {
		watcher
			.subscribe(resolve(process.cwd(), './src'), async (err, events) => {
				for (const { path } of events) safelist = await readSafelist(path);
				// shitty way to restart vite server?
				const viteConfigContent = await fs.readFile(resolve(process.cwd(), './postcss.config.js'), {
					encoding: 'utf8'
				});
				await fs.writeFile(resolve(process.cwd(), './postcss.config.js'), viteConfigContent);
			})
			.then((w) => (global.watcher = w));
	}

	return uniq(safelist);
}
