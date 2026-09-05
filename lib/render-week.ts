import {
  DEFAULT_WEEK,
  DEFAULT_YEAR,
  formatSets,
  seedSessions,
  weekDates,
} from "./seed";
import type { Sessions } from "./types";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderWeekHtml(
  year = DEFAULT_YEAR,
  week = DEFAULT_WEEK,
  sessions: Sessions = seedSessions(),
): string {
  const dates = weekDates(year, week);
  const tabs: Array<[number, number]> = [];
  for (let i = -2; i <= 2; i++) {
    let ww = week + i;
    let yy = year;
    if (ww < 1) {
      yy -= 1;
      ww = 52;
    }
    if (ww > 52) {
      yy += 1;
      ww = 1;
    }
    tabs.push([yy, ww]);
  }
  const mon = new Date(`${dates[0]}T12:00:00`);
  const sun = new Date(`${dates[6]}T12:00:00`);
  const range = `${mon.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${sun.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  const tabHtml = tabs
    .map(([yy, ww]) => {
      const on = ww === week && yy === year ? " on" : "";
      return `<button class="pill${on}" data-w="${yy}-W${ww}">W${ww}</button>`;
    })
    .join("");

  const days = dates
    .map((d, i) => {
      const s = sessions[d];
      const body = s
        ? `<div class="muted">${esc(s.name || "")}</div>${s.exercises
            .map(
              (ex) =>
                `<div class="ex"><div class="name">${esc(ex.n)}</div><div class="sets">${esc(formatSets(ex.sets))}</div></div>`,
            )
            .join("")}<button class="btn block" data-d="${d}">Edit</button>`
        : `<div class="muted">No session</div><button class="btn block" data-d="${d}">Log session</button>`;
      return `<article class="day"><h2><span>${DAY_NAMES[i]} ${+d.slice(8)}</span><a href="/?view=log&amp;date=${d}">Log</a></h2>${body}</article>`;
    })
    .join("");

  return `<header><div><h1>Reza · Training log</h1><div class="sub">W${week} · Toronto · ${range}</div></div><a class="btn primary" href="/?view=log&amp;date=${dates[0]}">Log session</a></header>
  <div class="tabs">${tabHtml}</div>
  <p class="muted">Saves on this phone first. Cloud sync is optional — this page stays up if sync fails.</p>
  <div id="days">${days}</div>
  <button class="btn block" id="exp">Copy week as text</button>`;
}
