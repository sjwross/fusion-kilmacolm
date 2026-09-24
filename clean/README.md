# Clean site (no watermark)

Unmarked copies of the Fusion Kilmacolm pages (no Yur Shack overlay).

From the repo root:

```bash
python3 -m http.server 8000 --bind 0.0.0.0
# then open http://localhost:8000/clean/
```

Asset paths point at `../assets/`. The live site at the repository root is the watermarked build.
