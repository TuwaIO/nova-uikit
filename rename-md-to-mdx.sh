#!/bin/bash
# Script to find and rename .md files to .mdx within a specific directory
find apps/docs/src/API_Reference -name "*.md" -exec sh -c 'mv "$0" "${0%.md}.mdx"' {} \;
echo "✅ Renamed all .md files to .mdx in API Reference."