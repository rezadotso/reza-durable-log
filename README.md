# Reza · Training log

Phone-first shared training log. The week UI always renders from **localStorage** (or the W36 seed). Cloud sync is optional and cannot blank the page.

**Live (writes work):** [https://reza-oktrue-log.vercel.app](https://reza-oktrue-log.vercel.app)

**Pasha — shared JSON:** [https://reza-oktrue-log.vercel.app/api/week](https://reza-oktrue-log.vercel.app/api/week)

The first production project (`reza-durable-log.vercel.app`) still fail-softs with `ok:false` because Vercel MCP cannot create a Blob store, set env vars, or redeploy that project (403). Shared writes live on `reza-oktrue-log`, which uses the provisioned HTTP JSON store.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43147](http://127.0.0.1:43147). The HTML page does not call storage during render.

## Shared log (Pasha)

Read the current cloud week as JSON:

```
GET /api/week
```

```
https://reza-oktrue-log.vercel.app/api/week
```

Response shape (always JSON, HTTP 200 even when storage is down):

```json
{ "ok": true, "sessions": { "2026-08-31": { "name": "Back + Core A", "exercises": [] } }, "updatedAt": 1756656000000 }
```

On storage failure: `{ "ok": false, "sessions": { ...seed... }, "error": "..." }`.

## Storage

Priority (first configured backend wins):

1. **Vercel Blob** — `BLOB_READ_WRITE_TOKEN` (object `training-log.json`)
2. **Upstash Redis REST** — `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
3. **HTTP JSON store** — already provisioned in this deploy so shared writes work without dashboard clicks. Override with `SHARED_JSON_ID` + `SHARED_JSON_SECRET` if you move it.

Vercel MCP cannot create a Blob store or set production env vars on this hobby team, so the live app uses the HTTP store until a Blob token is injected from the dashboard.

Do **not** use Prisma / Postgres. If every store fails, `/` and `/api/week` still return HTTP 200 with the W36 seed (`ok:false`).

## Sync rules

1. First paint: `localStorage` key `reza-durable-log-v1`, else W36 seed.
2. Background `GET /api/week` — merge only if `ok` and `updatedAt` is newer.
3. Save writes localStorage first, then `POST /api/week`. Failure toast: **Saved on phone. Cloud sync failed.**

## W36 seed

- Mon 2026-08-31 Back + Core A (full catalog)
- Tue 2026-09-01 Chest + Shoulders (incline 1×8 @ 60, laterals 3×12 @ 30)
- Wed 2026-09-02 Arms + Core B (EZ-bar 3×12 @ 60)
- Fri 2026-09-04 Legs stays empty until Reza logs it
