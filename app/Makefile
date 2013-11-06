SRC = $(wildcard client/*/*.js)
HTML = $(wildcard client/*/*.html)
COMPONENTJSON = $(wildcard client/*/component.json)
TEMPLATES = $(HTML:.html=.js)

build: components $(SRC) $(TEMPLATES)
	@echo building
	@component build --dev

components: component.json $(COMPONENTJSON)
	@echo installing
	@component install

%.js: %.html
	@echo converting
	@component convert $<

clean:
	@echo cleaning
	rm -fr build components $(TEMPLATES)

.PHONY: clean