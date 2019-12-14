IN = $(wildcard posts/*.md)
IN2 = $(addsuffix .html,$(basename $(IN)))
OUT = $(subst posts/,site/posts/,$(IN2))

default: site/index.html $(OUT)

site/posts/%.html: posts/%.md
	mkdir -p site/posts
	cp -r post_files/* site/posts/
	scripts/index.js $< > $@

site/index.html: posts/*
	mkdir -p site/posts
	for folder in $$(ls -d posts/*/) ; do \
		cp -r "$$folder" "site/$$folder" ; \
	done
	cp -r index_files/* site/
	scripts/generate_index > $@

clean:
	rm -rf site
