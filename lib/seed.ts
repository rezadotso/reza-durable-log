import type { CatalogRow, Exercise, Session, Sessions, SetRow } from "./types";

export const STORAGE_PATH = "training-log.json";
export const DEFAULT_YEAR = 2026;
export const DEFAULT_WEEK = 36;

export const CATALOGS: Record<string, CatalogRow[]> = {
  "Back + Core A": [
    ["Strict hollow pull-ups", 4, "8", "", 1],
    ["Single-arm cable lat pulldown", 3, "10", "55", 0],
    ["Smith Pendlay", 4, "6", "155", 0],
    ["Smith shrug", 3, "10", "155", 0],
    ["Narrow-grip chin-up", 3, "8", "", 1],
    ["Straight-arm pulldown", 3, "12", "90", 0],
    ["Seated cable row", 3, "12", "100", 0],
    ["Dragon flag", 4, "5", "", 1],
    ["Hollow hold", 3, "30s", "", 1],
  ],
  "Chest + Shoulders": [
    ["Gymnast dips", 4, "12", "", 1],
    ["Pike push-ups", 4, "10", "", 1],
    ["Incline DB press", 4, "12", "55", 0],
    ["Seated DB lateral raise", 3, "12", "35", 0],
    ["Fly machine", 3, "15", "150", 0],
    ["Rear-delt fly", 4, "15", "90", 0],
    ["Arnold press", 3, "12", "35", 0],
  ],
  Legs: [
    ["Smith BSS", 3, "10", "115", 0],
    ["Back squat", 4, "6", "205", 0],
    ["Leg curl", 3, "8", "90", 0],
    ["Ski", 2, "500m", "", 0],
    ["Assault bike", 3, "20s/40s", "", 0],
    ["Wall balls", 2, "20", "9kg", 0],
  ],
  "Arms + Core B": [
    ["Narrow-grip chin-up", 4, "8", "", 1],
    ["EZ-bar curl", 3, "12", "60", 0],
    ["Overhead cable tricep extension", 4, "12", "75", 0],
    ["Hammer curl", 3, "12", "75", 0],
    ["Tricep dip", 3, "12", "", 1],
    ["Concentration curl", 3, "10", "25", 0],
    ["Dragon flag", 4, "5", "", 1],
    ["Ab wheel rollout", 3, "8", "", 1],
    ["Hollow hold", 3, "30s", "", 1],
  ],
  HYROX: [
    ["SkiErg", 3, "500m", "", 0],
    ["Row", 3, "500m", "", 0],
    ["Assault bike", 4, "30s", "", 0],
    ["Sled push", 2, "20m", "100", 0],
    ["Sled pull", 2, "20m", "100", 0],
    ["Burpee broad jump", 3, "10", "", 1],
    ["Farmers carry", 3, "20m", "24kg×2", 0],
    ["Sandbag lunge", 2, "16", "20kg", 0],
    ["Wall balls", 3, "25", "9kg", 0],
  ],
  Run: [
    ["Easy run", 1, "40min", "", 0],
    ["Threshold", 1, "", "", 0],
    ["Tempo", 1, "", "", 0],
    ["Long run", 1, "", "", 0],
  ],
  Other: [],
};

export const SESSION_NAMES = Object.keys(CATALOGS);

export function makeExercise(
  n: string,
  sets: number,
  r: string,
  l: string,
  bw: number | boolean,
): Exercise {
  const row: SetRow = { r, l, bw: !!bw };
  return { n, sets: Array.from({ length: sets }, () => ({ ...row })) };
}

export function seedSessions(): Sessions {
  return {
    "2026-08-31": {
      name: "Back + Core A",
      exercises: [
        makeExercise("Strict hollow pull-ups", 4, "8", "", 1),
        makeExercise("Single-arm cable lat pulldown", 3, "10", "55", 0),
        makeExercise("Smith Pendlay", 4, "6", "155", 0),
        makeExercise("Smith shrug", 3, "10", "155", 0),
        makeExercise("Narrow-grip chin-up", 3, "8", "", 1),
        makeExercise("Straight-arm pulldown", 3, "12", "90", 0),
        makeExercise("Seated cable row", 3, "12", "100", 0),
        makeExercise("Dragon flag", 4, "5", "", 1),
        makeExercise("Hollow hold", 3, "30s", "", 1),
      ],
    },
    "2026-09-01": {
      name: "Chest + Shoulders",
      exercises: [
        makeExercise("Gymnast dips", 4, "12", "", 1),
        makeExercise("Pike push-ups", 4, "10", "", 1),
        { n: "Incline DB press", sets: [{ r: "8", l: "60", bw: false }] },
        makeExercise("Seated DB lateral raise", 3, "12", "30", 0),
        makeExercise("Fly machine", 3, "15", "150", 0),
        makeExercise("Rear-delt fly", 4, "15", "90", 0),
        makeExercise("Arnold press", 3, "12", "35", 0),
      ],
    },
    "2026-09-02": {
      name: "Arms + Core B",
      exercises: [
        makeExercise("Narrow-grip chin-up", 4, "8", "", 1),
        makeExercise("EZ-bar curl", 3, "12", "60", 0),
        makeExercise("Overhead cable tricep extension", 4, "12", "75", 0),
        makeExercise("Hammer curl", 3, "12", "75", 0),
        makeExercise("Tricep dip", 3, "12", "", 1),
        makeExercise("Concentration curl", 3, "10", "25", 0),
        makeExercise("Dragon flag", 4, "5", "", 1),
        makeExercise("Ab wheel rollout", 3, "8", "", 1),
        makeExercise("Hollow hold", 3, "30s", "", 1),
      ],
    },
  };
}

export function weekDates(year: number, week: number): string[] {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dow = simple.getUTCDay();
  const start = new Date(simple);
  if (dow <= 4) {
    start.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
  } else {
    start.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
  }
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(start);
    x.setUTCDate(start.getUTCDate() + i);
    return x.toISOString().slice(0, 10);
  });
}

export function formatSets(sets: SetRow[]): string {
  if (!sets || !sets.length) return "";
  const same = sets.every(
    (x) =>
      x.r === sets[0].r &&
      !!x.bw === !!sets[0].bw &&
      (x.l || "") === (sets[0].l || ""),
  );
  if (same) {
    const s = sets[0];
    return `${sets.length}x${s.r}${s.bw ? " BW" : s.l ? ` @ ${s.l}` : ""}`;
  }
  return sets
    .map((s) => `${s.r || ""}${s.bw ? " BW" : s.l ? ` @${s.l}` : ""}`)
    .join(" / ");
}

export function isSession(value: unknown): value is Session {
  if (!value || typeof value !== "object") return false;
  const s = value as Session;
  return typeof s.name === "string" && Array.isArray(s.exercises);
}

export function normalizeSessions(input: unknown): Sessions {
  if (!input || typeof input !== "object") return seedSessions();
  const out: Sessions = {};
  for (const [date, session] of Object.entries(input as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isSession(session)) continue;
    out[date] = {
      name: String(session.name || "Other"),
      notes: typeof session.notes === "string" ? session.notes : "",
      exercises: (session.exercises || []).map((ex) => ({
        n: String(ex?.n || "Exercise"),
        sets: (ex?.sets || []).map((row) => ({
          r: String(row?.r ?? ""),
          l: String(row?.l ?? ""),
          bw: !!row?.bw,
        })),
      })),
    };
  }
  return Object.keys(out).length ? out : seedSessions();
}

export function initialCloudFile() {
  return {
    sessions: seedSessions(),
    updatedAt: Date.UTC(2026, 7, 31, 16, 0, 0),
  };
}
