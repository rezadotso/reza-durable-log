import { seedSessions } from "@/lib/seed";
import { readWeek, writeWeek } from "@/lib/storage";
import type { WeekPayload } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(payload: WeekPayload, status = 200): Response {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function fail(error: unknown, sessions = seedSessions()): Response {
  return json({
    ok: false,
    sessions,
    error: error instanceof Error ? error.message : "Storage failed",
  });
}

export async function GET(): Promise<Response> {
  try {
    return json(await readWeek());
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      return json({
        ok: false,
        sessions: seedSessions(),
        error: "Invalid JSON body",
      });
    }
    const payload = (body && typeof body === "object" ? body : {}) as {
      sessions?: unknown;
      updatedAt?: unknown;
    };
    return json(await writeWeek(payload.sessions, payload.updatedAt));
  } catch (error) {
    return fail(error);
  }
}
