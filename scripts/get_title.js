#!/usr/bin/env node

/* Command-line utility to obtain the title of an article.
 * This functionality is also implemented in index.js,
 * but this CLI is needed for the bash script generate_index. */

var fs = require('fs');

if (process.argv.length < 2) {
	console.log('Usage: ' + process.argv[0] + ' path/to/article.md');
	process.exit(1);
}

file_name = process.argv[2];
if (!fs.existsSync(file_name)) {
	console.log(file_name + ' does not exist.');
	process.exit(2);
}

markdown_contents = fs.readFileSync(file_name, 'utf8', 'r');

// Remove byte order mark if present
if (markdown_contents.charCodeAt(0) === 0xFEFF) {
	markdown_contents = markdown_contents.substr(1);
}

// Get first level 1 header with pound and leading space removed
title = /^(\# (.*)|(.+\n=))/gm.exec(markdown_contents)[1].split('\n')[0];
if (title.startsWith('# ')) title = title.substring(2);

console.log(title);
