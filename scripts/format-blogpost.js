#!/usr/bin/env node

const fs = require('fs');
const mk = require('@traptitech/markdown-it-katex');
const markdown = require('markdown-it')(
	{
		html: true,
		breaks: true,
		typographer: true,
		quotes: '“”‘’',
		imgsize: true,
		table: true
	}
).use(mk, { output: 'html', throwOnError: true });

main();

// Wraps stylesheet URI with the proper HTML.
function stylesheet_code(href) {
	return '<link rel="stylesheet" type="text/css" href="' + href + '">';
}

// Wraps script URI with the proper HTML.
function script_code(href) {
	return '<script type="text/javascript" src="' + href + '"></script>';
}

// Generate HTML given a title, body, stylesheet paths, and script paths.
function html_document(title, body, favicon, stylesheets, scripts) {
	if (stylesheets === undefined) stylesheets = [];
	if (scripts === undefined) scripts = [];
	if (favicon !== undefined) {
		favicon_type = { 'ico': 'image/x-icon', 'gif': 'image/gif', 'png': 'image/png' }[favicon.substring(favicon.length - 3)];
	}
	
	return '<!DOCTYPE html>\n<html>\n<head>\n'
		+ '<meta charset="utf-8">\n'
		+ '<title>' + title + '</title>\n'
		+ '<meta name="viewport" content="width=device-width">\n'
		+ stylesheets.map(stylesheet_code).join(' ') + '\n'
		+ scripts.map(script_code).join(' ') + '\n'
		+ (favicon !== undefined ? '<link rel="shortcut icon" type="' + favicon_type + '" href="' + favicon + '">' : '') + '\n'
		+ '</head>\n<body>' + '\n'
		+ body + '\n'
		+ '</body>\n</html>';
}

function main() {
	if (process.argv.length < 4) {
		console.log('Usage: index.js title input.md > output.html');
		process.exit(1);
	}
	
	file_name = process.argv[3];
	if (!fs.existsSync(file_name)) {
		console.log(file_name + ' does not exist.');
		process.exit(2);
	}
	
	markdown_contents = fs.readFileSync(file_name, 'utf8', 'r');
	
	// Remove byte-order mark.
	if (markdown_contents.charCodeAt(0) === 0xFEFF) {
		markdown_contents = markdown_contents.substr(1);
	}
	
	title = process.argv[2];
	html_contents = '<article>' + markdown.render(markdown_contents) + '</article>';
	
	document = html_document(title, html_contents,  '../favicon.png',
		[ 'style.css', 'katex.min.css' ]);
	
	console.log(document);
}
