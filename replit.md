# Consulta CNPJ

A browser-based tool for batch CNPJ lookup using the public [BrasilAPI](https://brasilapi.com.br/).

## How to run

The app is served as static files with Python's built-in HTTP server on port 5000.

**Workflow:** `Start application` — runs `python3 -m http.server 5000`

## Stack

- Pure HTML / CSS / JavaScript (no build step, no backend)
- [SheetJS](https://sheetjs.com/) for Excel import/export (loaded from CDN)
- [BrasilAPI](https://brasilapi.com.br/api/cnpj/v1/) for CNPJ data

## Files

- `index.html` — main entry point (split version with external CSS/JS)
- `style.css` — stylesheet
- `script.js` — application logic
- `puxar_endereço.html` — original self-contained single-file version

## User preferences

- Keep existing project structure
