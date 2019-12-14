# Static site generator

This static site generator is designed to render markdown with LaTex to static HTML pages with as little fuzz as possible. It is explicitly designed to fit my needs, so it will not have support for many features.

It utilizes [node.js](https://github.com/nodejs/node), [remark](https://github.com/remarkjs/remark), and [KaTeX](https://github.com/KaTeX/KaTeX), and uses make to generate the site.


## Configuration

This generator will create a site with just two types of pages. An index page, which contains a list of links to blog entries. This page is generated by the generate_index script (which uses get_title.js). The index will show the title and date of the post, and sort the posts by date.

The files in index_files and post_files will get copied to the file containing the index and blog posts, respectively. This makes it possible to link to these files in the HTML files using relative paths.

The posts should be in markdown format in the 'posts' folder. The filename of a blogpost should be prefixed with a date in the form `yyyy-mm-dd`, and should have the 'md' extension. So a filename should look like: `2019-12-07-my-title`.

To generate the site, simply run `make`. A folder 'site' will be generated, which contains your site. You don't need to run a server to look at the files, so you can just doubleclick index.html to see the result.

Note that to remove the HTML of a blog post, it is necessary to run `make clean && make`, or manually remove the HTML file in site/posts.


## Example

Make sure you have node and npm installed, then run:

	git clone https://github.com/rubenvannieuwpoort/static-site-generator
	cd static-site-generator
	npm install
	filename=$(date +"%Y-%m-%d")"-markdown-test.md"
	wget https://raw.githubusercontent.com/rubenvannieuwpoort/markdown-example/master/markdown-example.md -O posts/$filename
	make


