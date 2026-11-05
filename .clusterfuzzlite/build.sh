#!/bin/bash -eu
# Build the fuzz targets. The parsers under test use only the standard library,
# so nothing beyond the targets themselves needs installing.

cd "$SRC/ai-security-research-inventory"

# --paths, not --add-data. The first build used --add-data, which copies
# agent/ into the bundle as *data*: the files are present at runtime but
# PyInstaller's analysis never resolved `import fetch`, so fetch.py was never
# frozen in as a module and every target died at startup with
# ModuleNotFoundError. --paths puts agent/ on the analysis search path, so the
# imports resolve and the modules are bundled properly.
#
# --hidden-import belt and braces: the imports sit inside
# `with atheris.instrument_imports():`, and a static analyser is entitled to
# miss imports nested in a context manager.
for target in agent/fuzz_targets/fuzz_*.py; do
  compile_python_fuzzer "$target" \
    --paths "$SRC/ai-security-research-inventory/agent" \
    --hidden-import fetch \
    --hidden-import gate
done
