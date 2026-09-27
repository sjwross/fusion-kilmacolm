# Fusion Kilmacolm

Public site for **Fusion**, the Chinese & Thai takeaway at 5 Lochwinnoch Road, Kilmacolm.

## Live

- Namecheap subdomain: https://fusion-kilmacolm.yurshack.co.uk/
- GitHub Pages: https://sjwross.github.io/fusion-kilmacolm/

The **main site (repo root)** is the unmarked client build (no Yur Shack watermark).

A watermarked demo copy lives under [`watermarked/`](watermarked/) (also deployed at `/watermarked/`).

## Local preview

```bash
python3 -m http.server 8000 --bind 0.0.0.0
# Clean main site:        http://localhost:8000/
# Watermarked demo copy:  http://localhost:8000/watermarked/
```

## Keeping both copies in sync

Edit the **root** site (source of truth). Then run:

```bash
./scripts/sync-site-copies.sh
```

This copies shared `menu.js` / `menu-data.js` / styles / page content into `watermarked/`, while keeping the Yur Shack watermark, demo banner, and footer credit only on that copy.

## Deploy to Namecheap

Document root on `premium139-4.web-hosting.com` (SSH port `21098`):

`~/subdomains/fusion-kilmacolm`

```bash
# Secrets expected in the Cloud Agent environment:
#   YURSHACK_SSH_PRIVATE_KEY
#   YURSHACK_SSH_USER
#   YURSHACK_SSH_HOST   (optional)
#   YURSHACK_SSH_PORT   (optional)
./deploy.sh
```

## Notes

- Static HTML/CSS/JS.
- Menu content transcribed from Fusion’s printed takeaway menu sheets.
- **Watermark:** the live root site shows a Yur Shack demo watermark. An unmarked copy is saved under [`clean/`](clean/).
