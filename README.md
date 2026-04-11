# Solaris Insights — Python Analytics Dashboard

A Streamlit/Dash-style sales analytics dashboard with filters, KPIs, and interactive charts. Styled to match the Python + Plotly Dash aesthetic that data engineering teams ship.

**Live demo:** https://shaisolaris.github.io/solaris-python-dashboard/

## What it shows

- **Sidebar filters** — date range (dual sliders), region dropdown, category dropdown
- **4 KPI cards** — revenue, units sold, customers, average order
- **Line chart** — monthly revenue trend with area fill and data points
- **Bar chart** — revenue breakdown by region, top region highlighted in Python yellow
- **Scatter plot** — units vs. customers, colored by category
- **DataFrame preview table** — `df.head(20)` with monospace font, matching the Pandas look
- **Live data chip** indicating FastAPI → BigQuery refresh every 5 minutes
- **Python brand colors** — `#306998` blue and `#FFD43B` yellow
- **Dark mode** with localStorage persistence
- Fully responsive

## What this demo represents

This is the **visual proof** for a Python data engagement. The real backend (FastAPI routes, Pandas transformations, Plotly Dash components, BigQuery queries) lives in companion repositories. This showcase compiles the same dashboard structure into a Next.js-hosted preview.

## Stack

- Next.js 15 (App Router, static export)
- React 19 + TypeScript
- Tailwind CSS 3
- Custom SVG charts (no chart library — keeps the bundle small)
- Deployed to GitHub Pages

## Run locally

```bash
npm install
npm run dev
```

## License

MIT.
