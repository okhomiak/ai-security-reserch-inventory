# Pinned by digest, not tag: a tag is a moving pointer and Scorecard counts it
# as an unpinned dependency. The agent is pure Python and the base builder
# already ships pip, so there is nothing to apt-get install - which also
# removes the unpinned package install that was flagged on line 3.
FROM gcr.io/oss-fuzz-base/base-builder-python@sha256:21f6fab17ace4dc76e1c56de91ee95d3d03da021df94b41056ba036f6c6f55e9

COPY . $SRC/ai-security-research-inventory
WORKDIR $SRC/ai-security-research-inventory
COPY .clusterfuzzlite/build.sh $SRC/build.sh
