#!/usr/bin/env bash
# Sync shared site content from the clean root (source of truth) into watermarked/.
# Watermark / demo-banner / Yur Shack credit stay only on the watermarked copy.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WM="$ROOT/watermarked"
CACHE_BUST="${CACHE_BUST:-wm1}"

if [[ ! -f "$ROOT/index.html" || ! -d "$WM" ]]; then
  echo "Expected clean root index.html and watermarked/ directory." >&2
  exit 1
fi

echo "Syncing shared files → watermarked/ (root is source of truth)"

cp "$ROOT/menu.js" "$WM/menu.js"
cp "$ROOT/menu-data.js" "$WM/menu-data.js"

# Rebuild watermarked styles: clean styles + watermark-only overlay
{
  # Rewrite root-relative asset URLs for the subdirectory
  sed -E 's|url\((["'"'"'])assets/|url(\1../assets/|g' "$ROOT/styles.css"
  echo
  cat "$WM/watermark-only.css"
} > "$WM/styles.css"

# Rebuild watermarked index from clean root
python3 - "$ROOT/index.html" "$WM/index.html" "$CACHE_BUST" <<'PY'
import re, sys
from pathlib import Path

src, dst, bust = sys.argv[1], sys.argv[2], sys.argv[3]
html = Path(src).read_text()

# Asset paths for subdirectory
html = html.replace('href="assets/', 'href="../assets/')
html = html.replace('src="assets/', 'src="../assets/')
html = html.replace('content="assets/', 'content="../assets/')

# Local stylesheet / script cache-bust
html = re.sub(r'href="styles\.css[^"]*"', f'href="styles.css?v={bust}"', html)
html = re.sub(r'src="menu\.js[^"]*"', f'src="menu.js?v={bust}"', html)

# Insert watermark + demo banner after <body>
banner = """  <div class="yur-shack-watermark" aria-hidden="true"></div>
  <div class="demo-banner" role="status">
    <span>Demo site</span>
    <span class="demo-banner__sep" aria-hidden="true">·</span>
    <span>Built by <a href="https://yurshack.co.uk" rel="noopener">Yur Shack</a></span>
  </div>

"""
if "yur-shack-watermark" not in html:
    html = re.sub(r"(<body[^>]*>\s*)", r"\1" + banner, html, count=1)

# Footer credit
credit = '    <p class="fine yur-shack-credit">Demo site by <a href="https://yurshack.co.uk" rel="noopener">Yur Shack</a></p>\n'
if "yur-shack-credit" not in html:
    html = html.replace(
        '    <p class="fine">Menu prices may change — confirm when ordering.</p>\n',
        '    <p class="fine">Menu prices may change — confirm when ordering.</p>\n' + credit,
    )

Path(dst).write_text(html)
print(f"wrote {dst}")
PY

echo "Done. Clean root remains unmarked; watermarked/ mirrors shared content."
