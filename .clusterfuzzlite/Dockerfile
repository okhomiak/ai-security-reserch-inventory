# ClusterFuzzLite build image. The agent is pure Python with one third-party
# dependency, so the stock Python base builder is enough.
FROM gcr.io/oss-fuzz-base/base-builder-python

RUN apt-get update && apt-get install -y --no-install-recommends python3-pip \
    && rm -rf /var/lib/apt/lists/*

COPY . $SRC/ai-security-research-inventory
WORKDIR $SRC/ai-security-research-inventory
COPY .clusterfuzzlite/build.sh $SRC/build.sh
