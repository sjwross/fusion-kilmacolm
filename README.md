# Fusion Kilmacolm

Public site for **Fusion**, the Chinese & Thai takeaway at 5 Lochwinnoch Road, Kilmacolm.

## Live

- Namecheap subdomain: https://fusion-kilmacolm.yurshack.co.uk/
- GitHub Pages: https://sjwross.github.io/fusion-kilmacolm/

## Local preview

```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

## Deploy to Namecheap

Document root on `premium139-4.web-hosting.com` (SSH port `21098`):

`~/public_html/fusion-kilmacolm`

```bash
export SSH_USER='your-cpanel-user'
export SSH_PRIVATE_KEY="$(cat ~/.ssh/id_ed25519)"   # or paste PEM
# optional overrides:
# export SSH_HOST=premium139-4.web-hosting.com
# export SSH_PORT=21098
# export REMOTE_DIR=public_html/fusion-kilmacolm
./deploy.sh
```

## Notes

- Static HTML/CSS/JS.
- Menu content transcribed from Fusion’s printed takeaway menu sheets.
