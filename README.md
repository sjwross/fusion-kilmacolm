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
