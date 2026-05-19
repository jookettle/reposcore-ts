PYTHON ?= python3
DOCS_MD := $(filter-out docs/README.md docs/README-template.md, $(wildcard docs/*.md))

docs/README.md: $(DOCS_MD) tools/update-docs-readme.py
	$(PYTHON) tools/update-docs-readme.py

README.md: README-template.md index.ts tools/update-synopsis.py
	$(PYTHON) tools/update-synopsis.py

.PHONY: docs synopsis
docs: docs/README.md
synopsis: README.md
