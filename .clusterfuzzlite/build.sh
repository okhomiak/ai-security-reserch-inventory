#!/bin/bash -eu
# Build the fuzz targets. The parsers under test use only the standard library,
# so nothing beyond the targets themselves needs installing.

cd "$SRC/ai-security-research-inventory"

for target in agent/fuzz_targets/fuzz_*.py; do
  name=$(basename "$target" .py)
  compile_python_fuzzer "$target" \
    --add-data "$SRC/ai-security-research-inventory/agent:agent"
done
