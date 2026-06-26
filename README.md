# Music Player

Full-stack music streaming platform scaffolded from `ARCHITECTURE.md`.

## Run Locally

1. Copy `.env.example` to `.env` and update secrets if needed.
2. Start PostgreSQL:

```bash
docker compose up -d
```

3. Install dependencies:

```bash
npm install
```

4. Start both apps in separate terminals:

```bash
npm run dev:api
npm run dev:web
```

The API runs at `http://localhost:48731/api` and the web app runs at `http://localhost:3010`.
