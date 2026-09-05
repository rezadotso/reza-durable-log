import { list, put } from "@vercel/blob";
import { initialCloudFile, normalizeSessions, STORAGE_PATH } from "./seed";
import type { Sessions, WeekPayload } from "./types";

type StoredWeek = {
  sessions: Sessions;
  updatedAt: number;
};

const RENTRY_ID =
  process.env.SHARED_JSON_ID || "reza-durable-log";
const RENTRY_SECRET =
  process.env.SHARED_JSON_SECRET || "reza-w36-shared-log";
const RENTRY_ORIGIN = "https://rentry.co";

function seedPayload(error?: string): WeekPayload {
  const seed = initialCloudFile();
  return {
    ok: !error,
    sessions: seed.sessions,
    updatedAt: seed.updatedAt,
    ...(error ? { error } : {}),
  };
}

function parseStored(raw: unknown): StoredWeek {
  const seed = initialCloudFile();
  if (!raw || typeof raw !== "object") return seed;
  const data = raw as { sessions?: unknown; updatedAt?: unknown };
  return {
    sessions: normalizeSessions(data.sessions),
    updatedAt:
      typeof data.updatedAt === "number" && Number.isFinite(data.updatedAt)
        ? data.updatedAt
        : seed.updatedAt,
  };
}

function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function hasUpstash(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function hasHttpStore(): boolean {
  return Boolean(RENTRY_ID && RENTRY_SECRET);
}

async function readBlob(): Promise<StoredWeek | null> {
  const { blobs } = await list({ prefix: STORAGE_PATH, limit: 20 });
  const blob =
    blobs.find((item) => item.pathname === STORAGE_PATH) || blobs[0];
  if (!blob) return null;
  const res = await fetch(blob.url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Blob read failed (${res.status})`);
  return parseStored(await res.json());
}

async function writeBlob(data: StoredWeek): Promise<void> {
  await put(STORAGE_PATH, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

async function readRedis(): Promise<StoredWeek | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(`${url}/get/${encodeURIComponent(STORAGE_PATH)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis read failed (${res.status})`);
  const body = (await res.json()) as { result?: string | null };
  if (!body.result) return null;
  return parseStored(JSON.parse(body.result));
}

async function writeRedis(data: StoredWeek): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash env missing");
  const res = await fetch(`${url}/set/${encodeURIComponent(STORAGE_PATH)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(JSON.stringify(data)),
  });
  if (!res.ok) throw new Error(`Redis write failed (${res.status})`);
}

async function rentryForm(
  path: string,
  fields: Record<string, string>,
): Promise<unknown> {
  const res = await fetch(`${RENTRY_ORIGIN}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP store failed (${res.status})`);
  const body = (await res.json()) as {
    status?: string;
    content?: unknown;
    errors?: string;
  };
  if (String(body.status) !== "200") {
    throw new Error(body.errors || `HTTP store rejected (${body.status})`);
  }
  return body.content;
}

async function readHttpStore(): Promise<StoredWeek | null> {
  const content = (await rentryForm(`/api/fetch/${RENTRY_ID}`, {
    edit_code: RENTRY_SECRET,
  })) as { text?: string };
  if (!content?.text) return null;
  return parseStored(JSON.parse(content.text));
}

async function writeHttpStore(data: StoredWeek): Promise<void> {
  await rentryForm(`/api/edit/${RENTRY_ID}`, {
    edit_code: RENTRY_SECRET,
    text: JSON.stringify(data),
  });
}

async function ensureInitial(
  read: () => Promise<StoredWeek | null>,
  write: (data: StoredWeek) => Promise<void>,
): Promise<StoredWeek> {
  const existing = await read();
  if (existing) return existing;
  const initial = initialCloudFile();
  await write(initial);
  return initial;
}

export async function readWeek(): Promise<WeekPayload> {
  try {
    if (hasBlobToken()) {
      const data = await ensureInitial(readBlob, writeBlob);
      return { ok: true, sessions: data.sessions, updatedAt: data.updatedAt };
    }
    if (hasUpstash()) {
      const data = await ensureInitial(readRedis, writeRedis);
      return { ok: true, sessions: data.sessions, updatedAt: data.updatedAt };
    }
    if (hasHttpStore()) {
      const data = await ensureInitial(readHttpStore, writeHttpStore);
      return { ok: true, sessions: data.sessions, updatedAt: data.updatedAt };
    }
    return seedPayload("Storage not configured. Set BLOB_READ_WRITE_TOKEN.");
  } catch (error) {
    return seedPayload(error instanceof Error ? error.message : "Storage read failed");
  }
}

export async function writeWeek(
  sessionsInput: unknown,
  updatedAtInput?: unknown,
): Promise<WeekPayload> {
  const sessions = normalizeSessions(sessionsInput);
  const updatedAt =
    typeof updatedAtInput === "number" && Number.isFinite(updatedAtInput)
      ? updatedAtInput
      : Date.now();
  const data: StoredWeek = { sessions, updatedAt };

  try {
    if (hasBlobToken()) {
      await writeBlob(data);
      return { ok: true, sessions, updatedAt };
    }
    if (hasUpstash()) {
      await writeRedis(data);
      return { ok: true, sessions, updatedAt };
    }
    if (hasHttpStore()) {
      await writeHttpStore(data);
      return { ok: true, sessions, updatedAt };
    }
    return {
      ok: false,
      sessions,
      updatedAt,
      error: "Storage not configured. Set BLOB_READ_WRITE_TOKEN.",
    };
  } catch (error) {
    return {
      ok: false,
      sessions,
      updatedAt,
      error: error instanceof Error ? error.message : "Storage write failed",
    };
  }
}
