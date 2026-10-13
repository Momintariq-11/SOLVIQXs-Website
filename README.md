# SOLVIQX website — final version

Static site: `index.html`, `404.html`, `styles.css`, `script.js`, and `assets/` (logo pieces and favicon). No build step.

`404.html` is the custom "page not found" page. Cloudflare Pages uses it automatically for any address that doesn't exist. (The simple local Python server doesn't; open http://localhost:8000/404.html to preview it.)

## View it locally

Open a terminal in this folder and run:

```
python -m http.server 8000
```

Then open http://localhost:8000 in Chrome or Edge. (Double-clicking `index.html` also works.)

## Put it live on solviqx.com (Cloudflare Pages)

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Upload assets.
2. Upload this folder.
3. In the project's Custom domains tab, add `solviqx.com` (DNS and SSL are set up automatically because the domain is already on Cloudflare).

## Before / after launch

- Contact form: currently opens the visitor's email app addressed to connect@solviqx.com. Connect a form service (e.g. Formspree or Web3Forms) so inquiries arrive directly.
- Fonts (Space Grotesk + DM Sans) load from Google Fonts.
- After it's live, submit the site in Google Search Console so Google can index it.
