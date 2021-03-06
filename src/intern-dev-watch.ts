#!/usr/bin/env node 

import { watch } from 'chokidar';
import { echo, exec } from 'shelljs';
import { join } from 'path';
import { buildDir, copyAll, getResources, glob } from './common';

function createCopier(dest: string) {
	let outDir = join(buildDir, dest);
	return function (filename: string) {
		copyAll([ filename ], outDir);
	};
}

glob('**/tsconfig.json').forEach(function (tsconfig) {
	echo(`## Starting tsc watcher for ${tsconfig}`);
	exec(`tsc --project "${tsconfig}" --watch`, { async: true });
});

const resources = getResources();

Object.keys(resources).forEach(function (dest) {
	const scheduleCopy = createCopier(dest);
	const watcher = watch(resources[dest]).on('ready', function () {
		echo(`## Watching files in ${dest}`);
		watcher.on('add', scheduleCopy);
		watcher.on('change', scheduleCopy);
		watcher.on('unlink', scheduleCopy);
	}).on('error', function (error) {
		echo('Watcher error:', error);
	});
});
