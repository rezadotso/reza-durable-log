export type SetRow = {
  r: string;
  l: string;
  bw: boolean;
};

export type Exercise = {
  n: string;
  sets: SetRow[];
};

export type Session = {
  name: string;
  exercises: Exercise[];
  notes?: string;
};

export type Sessions = Record<string, Session>;

export type WeekPayload = {
  ok: boolean;
  sessions: Sessions;
  updatedAt?: number;
  error?: string;
};

export type CatalogRow = [string, number, string, string, 0 | 1];
