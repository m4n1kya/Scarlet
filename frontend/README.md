# SCARLET Web Client (`frontend`)

The client-side command center and analytics interface for **SCARLET**, engineered with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **Framer Motion**, and **Recharts**.

---

## Architecture & Routes

| Route | Component | Description |
| :--- | :--- | :--- |
| `/` | [`src/app/page.tsx`](src/app/page.tsx) | **Control Center & Live Telemetry**: Supports drag-and-drop image upload, live `react-webcam` streaming, reactive WebGL status visualization ([`EvilEye.tsx`](src/components/EvilEye.tsx)), and real-time hazard telemetry. |
| `/analytics` | [`src/app/analytics/page.tsx`](src/app/analytics/page.tsx) | **Telemetry Analytics Suite**: Multi-chart historical visualization featuring Detection Volume Area Charts, Activity vs. Confidence Composed Charts, Class Signature Radar Charts, and Risk Distribution Donut Charts. |
| `/history` | [`src/app/history/page.tsx`](src/app/history/page.tsx) | **Audit Log**: Searchable, filterable historical detection ledger synchronized with the backend SQLite database. |
| `/about` | [`src/app/about/page.tsx`](src/app/about/page.tsx) | **System Overview**: Technical architecture, YOLOv8 model specifications, and risk heuristic documentation. |

---

## Development

Ensure the FastAPI backend is running on `http://localhost:8000`, then start the frontend development server:

```bash
# Install dependencies
npm install

# Start Turbopack dev server on http://localhost:3000
npm run dev

# Build production bundle
npm run build
```
