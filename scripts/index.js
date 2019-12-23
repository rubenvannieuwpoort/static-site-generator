#!/usr/bin/env node

var unified = require('unified');
var markdown = require('remark-parse');
var remark2rehype = require('remark-rehype');
var doc = require('rehype-document');
var format = require('rehype-format');
var html = require('rehype-stringify');
var report = require('vfile-reporter');
var katex = require('katex');
var fs = require('fs');

String.prototype.gather = gather;
String.prototype.replaceMany = replaceMany;

main();


// Replace everything that matches a regex with a replacement,
// and return the list of strings that matched the regex.
function gather(regex, replacement) {
	text = String(this);
	matches = [ ];
	while ((match = regex.exec(text)) !== null) {
		text = text.substring(0, match.index) + replacement + text.substring(match.index + match[0].length);
		matches.push(match.slice(1).filter(x => x != undefined)[0]);
	}
	return [ matches, text ];
};

// Replace the (n + 1)th occurence of a string by replacements[n],
// for all occurences of the string.
function replaceMany(character, replacements) {
	text = this;
	while (replacements.length > 0)
		text = text.replace(character, replacements.shift());
	return text;
}

// Wraps stylesheet URI with the proper HTML.
function stylesheet_code(href) {
	return '<link rel="stylesheet" type="text/css" href="' + href + '">';
}

// Wraps script URI with the proper HTML.
function script_code(href) {
	return '<script src="' + href + '"></script>';
}

// Generate HTML given a title, body, stylesheet paths, and script paths.
function html_document(title, body, favicon, stylesheets, scripts) {
	if (stylesheets === undefined) stylesheets = [];
	if (scripts === undefined) scripts = [];
	if (favicon !== undefined) {
		favicon_type = { 'ico': 'image/x-icon', 'gif': 'image/gif', 'png': 'image/png' }[favicon.substring(favicon.length - 3)];
	}
	
	return '<html>\n<head>\n'
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

// Generate HTML from markdown.
function markdown_to_html(markdown_contents) {
	display_math_regex = /\$\$(.*?)\$\$|\\\[(.*?)\\\]/;
	inline_math_regex = /\$(.*?)\$|\\\((.*?)\\\)/;
	
	// Replace math environments by some Chinese character. This is a
	// hack; it'd be better to use remark which probably has support for
	// using katex as well... But I can't be bothered right now.
	[ display_math, markdown_contents ] =
		markdown_contents.gather(display_math_regex, '〸');
	[ inline_math, markdown_contents ] =
		markdown_contents.gather(inline_math_regex, '〹');
	
	// Use KaTeX to render the math to HTML.
	display_math = display_math.map(
		x => katex.renderToString(x, { displayMode: true, output: 'html' }));
	inline_math = inline_math.map(
		x => katex.renderToString(x, { displayMode: false, output: 'html' }));
	
	// Summon the all-mighty remark to do our work.
	contents = unified().use(markdown).use(remark2rehype)
		.use(format).use(html).processSync(markdown_contents).contents;
	
	// Put the rendered math environments back in the rest of the HTML.
	contents = contents.replaceMany('〸', display_math);
	contents = contents.replaceMany('〹', inline_math);
	
	return contents;
}

function main() {	
	if (process.argv.length < 3) {
		console.log('Usage: index.js input.md > output.html');
		process.exit(1);
	}
	
	file_name = process.argv[2];
	if (!fs.existsSync(file_name)) {
		console.log(file_name + ' does not exist.');
		process.exit(2);
	}
	
	markdown_contents = fs.readFileSync(file_name, 'utf8', 'r');
	
	// Remove byte-order mark.
	if (markdown_contents.charCodeAt(0) === 0xFEFF) {
		markdown_contents = markdown_contents.substr(1);
	}
	
	title = /^(\# (.*)|(.+\n=))/gm.exec(markdown_contents)[1].split('\n')[0];
	if (title.startsWith('# ')) title = title.substring(2);
	
	html_contents =
		'<article>' + markdown_to_html(markdown_contents) +	'</article>';
	
	document = html_document(title, html_contents,  '../favicon.png',
		[ 'style.css', 'katex.min.css' ]);
		
	console.log(document);
}
