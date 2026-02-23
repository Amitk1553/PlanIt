# Multi-Agent Task Executor Backend

Express + Prisma backend that turns free-form instructions into actionable multi-agent plans. It uses Google Gemini JSON-mode orchestration, Firecrawl-scraped BookMyShow listings, and Gemini 3.1-based web synthesis for fresh context, runs the required agents in parallel, aggregates their responses, and persists results in PostgreSQL.

## Prerequisites
- Node.js 18+
- PostgreSQL 13+
- A Google Gemini API key
- A Firecrawl API key

## Setup
1. Install dependencies:
  ```bash
  npm install
  ```
2. Configure environment variables (see `.env.example`). At minimum set:
  - `DATABASE_URL`
  - `GEMINI_API_KEY`
  - `PORT`
  - `FIRECRAWL_API_KEY`
3. Run Prisma migrations:
  ```bash
  npx prisma migrate dev --name init
  ```
4. Start the development server:
  ```bash
  npm run dev
  ```

## API
### `POST /api/users/signup`
Creates a user record so you can associate plans with a real person.

```json
{
  "email": "demo@example.com",
  "password": "demo-password"
}
```

Response:
```json
{
  "id": 1,
  "email": "demo@example.com"
}
```

### `POST /api/plan`
```json
{
  "userId": 1,
  "prompt": "Plan an evening in the city with a film, dinner, and weather check",
  "date": "2026-02-28",
  "location": {
    "country": "India",
    "state": "Jharkhand",
    "city": "Jamshedpur"
  }
}
```
> `location` and `date` are optional. When supplied, the planner will respect the exact country/state/city and the event date provided by the UI.

**Postman quick start**
- Method: `POST`
- URL: `http://localhost:4000/api/plan`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "userId": 1,
    "prompt": "Need a date night with a movie, dinner, weather read, plus any hot events",
    "date": "2026-03-07",
    "location": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Mumbai"
    }
  }
  ```

**Response**
```json
{
  "requestId": 42,
  "location": {
    "country": "India",
    "state": "Jharkhand",
    "city": "Jamshedpur"
  },
  "subtasks": ["movie", "restaurant", "weather", "web_search"],
  "results": [
    {
      "agent": "movie",
      "data": {
        "title": "Classic Cinema Night",
        "overview": "Indie feature followed by a filmmaker Q&A.",
        "showtime": "7:30 PM",
        "venue": "Phoenix Cinema",
        "eventDate": "2026-02-28T00:00:00.000Z",
        "eventDateLabel": "Saturday, February 28, 2026",
        "location": { "city": "Jamshedpur", "state": "Jharkhand", "country": "India" }
      }
    },
    { "agent": "restaurant", "data": { "name": "..." } },
    { "agent": "weather", "data": { "temperatureC": 24 } }
  ],
  "eventDate": "2026-02-28T00:00:00.000Z",
  "locationPrompt": "Please select your destination using the following structure:\n- Country (dropdown list)\n- State/Region (filtered by country)\n- City (filtered by state)\nReply in the form \"Country: <value> | State: <value> | City: <value>\" (example: Country: India | State: Jharkhand | City: Jamshedpur).\nDo not proceed until all three values are confirmed."
}
```

### Controlled location prompt
Use the following controlled prompt (also exported as `CONTROLLED_LOCATION_PROMPT` in `src/services/planner.service.js`) whenever you need to collect precise destination data from a user:

```
Please select your destination using the following structure:
- Country (dropdown list)
- State/Region (filtered by country)
- City (filtered by state)
Reply in the form "Country: <value> | State: <value> | City: <value>" (example: Country: India | State: Jharkhand | City: Jamshedpur).
Do not proceed until all three values are confirmed.
```

## Development Notes
- Agents are modular and wrap Gemini prompts so each domain has a clean contract.
- Planner service uses Gemini JSON schema generation and supports location overrides from the UI while requesting `movie`, `restaurant`, `weather`, or `web_search` agents.
- Aggregator orchestrates agent execution with `Promise.all` to guarantee concurrency.
- All database mutations flow through the plan repository for consistency.
- After pulling schema changes run `npx prisma migrate dev --name add_location_json` to update the Task location column to `Json`.
- Domain agents now submit lightweight prompts directly to Gemini using the helper in `src/agents/gemini.helper.js`. The movie agent calls Firecrawl to structure BookMyShow listings for the exact city and falls back to Gemini only when Firecrawl cannot return data, while the `web_search` agent leverages the `gemini-3.1-pro-preview` model to summarize timely findings without any external search API.
