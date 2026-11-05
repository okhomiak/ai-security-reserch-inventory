#!/usr/bin/env python3
"""Atheris fuzz target for the feed parser.

fetch._parse_xml is the one function in this codebase that consumes bytes from
hosts we do not control. A publisher can change their feed, a host can be
hijacked, and a response can be garbage - and an unhandled exception here means
the weekly ingest does not run and the dashboard does not update.

Only exceptions the caller already handles are acceptable; anything else is a
finding.
"""

import sys
import pathlib
import xml.etree.ElementTree as ET

import atheris

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

with atheris.instrument_imports():
    import fetch

# What fetch_feed() catches around _parse_xml.
HANDLED = (ET.ParseError, ValueError, UnicodeDecodeError,
           AttributeError, TypeError, KeyError, IndexError, RecursionError)


def TestOneInput(data: bytes) -> None:
    try:
        fetch._parse_xml(data)
    except HANDLED:
        return
    except MemoryError:
        return


def main() -> None:
    atheris.Setup(sys.argv, TestOneInput)
    atheris.Fuzz()


if __name__ == "__main__":
    main()
