# planIt frontend

React + Vite single-page UI that orchestrates your Express agents. The landing hero matches the hand-drawn sketch: prompt bar up top, weather/movies/restaurants panels underneath.

## Stack

- React 19 + JavaScript + Vite
- Tailwind CSS tokens (shadcn-inspired components) + GSAP flourishes
- Fetches your `/api/weather`, `/api/movies`, `/api/restaurants` endpoints directly

## Getting started

```bash
cd frontend
cp .env.example .env     # default base: http://localhost:4001
npm install
npm run dev
```

Make sure the backend is running on port 4001 (or update `VITE_API_BASE_URL`). The form requires a full `{ city, state, country }` payload to mirror the backend validators.

## Project map

- `src/App.jsx` – hero layout, GSAP motion, weather/movie/restaurant columns
- `src/components/prompt-form.jsx` – prompt input, suggestion chips, location/date fields
- `src/lib/api.js` – tiny wrapper that talks to the Express routes
- `src/components/ui/*` – shadcn-style primitives (Button, Card, Badge, etc.)

Happy planning ✦
