const KEY = "reza-durable-log-v1";
const C = {
  "Back + Core A": [
    ["Strict hollow pull-ups", 4, "8", "", 1],
    ["Single-arm cable lat pulldown", 3, "10", "55", 0],
    ["Smith Pendlay", 4, "6", "155", 0],
    ["Smith shrug", 3, "10", "155", 0],
    ["Narrow-grip chin-up", 3, "8", "", 1],
    ["Straight-arm pulldown", 3, "12", "90", 0],
    ["Seated cable row", 3, "12", "100", 0],
    ["Dragon flag", 4, "5", "", 1],
    ["Hollow hold", 3, "30s", "", 1]
  ],
  "Chest + Shoulders": [
    ["Gymnast dips", 4, "12", "", 1],
    ["Pike push-ups", 4, "10", "", 1],
    ["Incline DB press", 4, "12", "55", 0],
    ["Seated DB lateral raise", 3, "12", "35", 0],
    ["Fly machine", 3, "15", "150", 0],
    ["Rear-delt fly", 4, "15", "90", 0],
    ["Arnold press", 3, "12", "35", 0]
  ],
  Legs: [
    ["Smith BSS", 3, "10", "115", 0],
    ["Back squat", 4, "6", "205", 0],
    ["Leg curl", 3, "8", "90", 0],
    ["Ski", 2, "500m", "", 0],
    ["Assault bike", 3, "20s/40s", "", 0],
    ["Wall balls", 2, "20", "9kg", 0]
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
    ["Hollow hold", 3, "30s", "", 1]
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
    ["Wall balls", 3, "25", "9kg", 0]
  ],
  Run: [
    ["Easy run", 1, "40min", "", 0],
    ["Threshold", 1, "", "", 0],
    ["Tempo", 1, "", "", 0],
    ["Long run", 1, "", "", 0]
  ],
  Other: []
};
const SN = Object.keys(C);

function mk(n, sets, r, l, bw) {
  return { n: n, sets: Array.from({ length: sets }, function () { return { r: r, l: l, bw: !!bw }; }) };
}

const SEED = {
  "2026-08-31": {
    name: "Back + Core A",
    exercises: [
      mk("Strict hollow pull-ups", 4, "8", "", 1),
      mk("Single-arm cable lat pulldown", 3, "10", "55", 0),
      mk("Smith Pendlay", 4, "6", "155", 0),
      mk("Smith shrug", 3, "10", "155", 0),
      mk("Narrow-grip chin-up", 3, "8", "", 1),
      mk("Straight-arm pulldown", 3, "12", "90", 0),
      mk("Seated cable row", 3, "12", "100", 0),
      mk("Dragon flag", 4, "5", "", 1),
      mk("Hollow hold", 3, "30s", "", 1)
    ]
  },
  "2026-09-01": {
    name: "Chest + Shoulders",
    exercises: [
      mk("Gymnast dips", 4, "12", "", 1),
      mk("Pike push-ups", 4, "10", "", 1),
      { n: "Incline DB press", sets: [{ r: "8", l: "60", bw: 0 }] },
      mk("Seated DB lateral raise", 3, "12", "30", 0),
      mk("Fly machine", 3, "15", "150", 0),
      mk("Rear-delt fly", 4, "15", "90", 0),
      mk("Arnold press", 3, "12", "35", 0)
    ]
  },
  "2026-09-02": {
    name: "Arms + Core B",
    exercises: [
      mk("Narrow-grip chin-up", 4, "8", "", 1),
      mk("EZ-bar curl", 3, "12", "60", 0),
      mk("Overhead cable tricep extension", 4, "12", "75", 0),
      mk("Hammer curl", 3, "12", "75", 0),
      mk("Tricep dip", 3, "12", "", 1),
      mk("Concentration curl", 3, "10", "25", 0),
      mk("Dragon flag", 4, "5", "", 1),
      mk("Ab wheel rollout", 3, "8", "", 1),
      mk("Hollow hold", 3, "30s", "", 1)
    ]
  }
};

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
  });
}

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

function loadLocal() {
  try {
    const j = JSON.parse(localStorage.getItem(KEY) || "null");
    if (j && j.sessions) {
      return { sessions: j.sessions, u: j.u || 0 };
    }
  } catch (e) {}
  const sessions = clone(SEED);
  const u = Date.now();
  try {
    localStorage.setItem(KEY, JSON.stringify({ sessions: sessions, u: u }));
  } catch (e) {}
  return { sessions: sessions, u: u };
}

function saveLocal(sessions, u) {
  const updated = u || Date.now();
  try {
    localStorage.setItem(KEY, JSON.stringify({ sessions: sessions, u: updated }));
  } catch (e) {}
  return updated;
}

function fmt(sets) {
  if (!sets || !sets.length) return "";
  const same = sets.every(function (x) {
    return x.r === sets[0].r && !!x.bw === !!sets[0].bw && (x.l || "") === (sets[0].l || "");
  });
  if (same) {
    const s = sets[0];
    return sets.length + "x" + s.r + (s.bw ? " BW" : (s.l ? " @ " + s.l : ""));
  }
  return sets.map(function (s) {
    return (s.r || "") + (s.bw ? " BW" : (s.l ? " @" + s.l : ""));
  }).join(" / ");
}

let toastTimer = null;
function toast(m, ms) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = m;
  t.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.style.display = "none"; }, ms || 1800);
}

function qs() {
  return Object.fromEntries(new URLSearchParams(location.search));
}

function go(path, params) {
  const u = new URL(location.origin + (path.charAt(0) === "/" ? path : "/" + path));
  if (params) {
    Object.keys(params).forEach(function (k) {
      if (params[k] != null) u.searchParams.set(k, params[k]);
    });
  }
  location.href = u.href;
}

function weekDates(y, w) {
  const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
  const dow = simple.getUTCDay();
  const start = new Date(simple);
  if (dow <= 4) start.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
  else start.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
  return Array.from({ length: 7 }, function (_, i) {
    const x = new Date(start);
    x.setUTCDate(start.getUTCDate() + i);
    return x.toISOString().slice(0, 10);
  });
}

let local = loadLocal();
let sessions = local.sessions;

async function pullCloud() {
  try {
    const r = await fetch("/api/week", { cache: "no-store" });
    const j = await r.json();
    if (!j || !j.sessions) return;
    const cloudU = j.updatedAt || 0;
    if (j.ok && cloudU > local.u) {
      sessions = j.sessions;
      local = { sessions: sessions, u: cloudU };
      saveLocal(sessions, cloudU);
      render();
      return;
    }
    if (j.ok && local.u > cloudU && local.u > 0) {
      await pushCloud(false);
    }
  } catch (e) {}
}

async function pushCloud(showFail) {
  try {
    const r = await fetch("/api/week", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessions: sessions, updatedAt: local.u })
    });
    const j = await r.json();
    if (!j || !j.ok) throw new Error((j && j.error) || "sync failed");
    return true;
  } catch (e) {
    if (showFail !== false) toast("Saved on phone. Cloud sync failed.", 2800);
    return false;
  }
}

function renderWeek() {
  const q = qs();
  let y = 2026;
  let w = 36;
  if (q.w) {
    const p = q.w.split("-W");
    y = +p[0];
    w = +p[1];
  }
  const dates = weekDates(y, w);
  const tabs = [];
  for (let i = -2; i <= 2; i++) {
    let ww = w + i;
    let yy = y;
    if (ww < 1) { yy--; ww = 52; }
    if (ww > 52) { yy++; ww = 1; }
    tabs.push([yy, ww]);
  }
  const mon = new Date(dates[0] + "T12:00:00");
  const sun = new Date(dates[6] + "T12:00:00");
  const range = mon.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + "–" + sun.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = "<header><div><h1>Reza · Training log</h1><div class=\"sub\">W" + w + " · Toronto · " + range + "</div></div><button class=\"btn primary\" id=\"top\">Log session</button></header>" +
    "<div class=\"tabs\">" + tabs.map(function (t) {
      return "<button class=\"pill" + (t[1] === w && t[0] === y ? " on" : "") + "\" data-w=\"" + t[0] + "-W" + t[1] + "\">W" + t[1] + "</button>";
    }).join("") + "</div>" +
    "<p class=\"muted\">Saves on this phone first. Cloud sync is optional — this page stays up if sync fails.</p>" +
    "<div id=\"days\"></div>" +
    "<button class=\"btn block\" id=\"exp\">Copy week as text</button>";
  const days = document.getElementById("days");
  dates.forEach(function (d, i) {
    const s = sessions[d];
    let body = s
      ? "<div class=\"muted\">" + esc(s.name || "") + "</div>" + s.exercises.map(function (ex) {
        return "<div class=\"ex\"><div class=\"name\">" + esc(ex.n) + "</div><div class=\"sets\">" + esc(fmt(ex.sets)) + "</div></div>";
      }).join("") + "<button class=\"btn block\" data-d=\"" + d + "\">Edit</button>"
      : "<div class=\"muted\">No session</div><button class=\"btn block\" data-d=\"" + d + "\">Log session</button>";
    days.innerHTML += "<article class=\"day\"><h2><span>" + names[i] + " " + (+d.slice(8)) + "</span><a href=\"#\" data-d=\"" + d + "\">Log</a></h2>" + body + "</article>";
  });
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById("top").onclick = function () {
    go("/", { view: "log", date: dates.indexOf(today) >= 0 ? today : dates[0] });
  };
  document.querySelectorAll("[data-w]").forEach(function (b) {
    b.onclick = function () { go("/", { w: b.getAttribute("data-w") }); };
  });
  document.querySelectorAll("[data-d]").forEach(function (b) {
    b.onclick = function (e) {
      e.preventDefault();
      go("/", { view: "log", date: b.getAttribute("data-d") });
    };
  });
  document.getElementById("exp").onclick = function () {
    let t = "W" + w + " " + range + "\n";
    dates.forEach(function (d, i) {
      const s = sessions[d];
      t += "\n" + names[i] + " " + d + (s ? ": " + s.name : ": (empty)") + "\n";
      if (s) s.exercises.forEach(function (ex) { t += "- " + ex.n + ": " + fmt(ex.sets) + "\n"; });
    });
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { toast("Copied"); }).catch(function () { prompt("Copy", t); });
    } else {
      prompt("Copy", t);
    }
  };
}

function renderLog() {
  const q = qs();
  let date = q.date || new Date().toISOString().slice(0, 10);
  let draft = sessions[date] ? clone(sessions[date]) : { name: q.name || "Legs", exercises: [], notes: "" };
  if (!draft.name) draft.name = "Legs";
  const app = document.getElementById("app");
  if (!app) return;

  function paint() {
    app.innerHTML = "<header><div><a href=\"/\">← Week</a><h1>Log session</h1></div></header>" +
      "<label>Date</label><input type=\"date\" id=\"date\" value=\"" + esc(date) + "\"/>" +
      "<label>Session name</label><div class=\"row\" id=\"pills\">" + SN.map(function (s) {
        return "<button class=\"pill" + (s === draft.name ? " on" : "") + "\" data-s=\"" + esc(s) + "\">" + esc(s) + "</button>";
      }).join("") + "</div>" +
      "<label>Tap an exercise</label><div class=\"chips\" id=\"chips\">" + (C[draft.name] || []).map(function (c, i) {
        return "<button class=\"chip\" data-i=\"" + i + "\">" + esc(c[0]) + "<br><span class=\"muted\">" + c[1] + "x" + c[2] + (c[4] ? " BW" : (c[3] ? " @ " + c[3] : "")) + "</span></button>";
      }).join("") + "</div>" +
      "<label>Or name one</label><div class=\"row\"><input id=\"custom\" placeholder=\"Exercise\"/><button class=\"btn\" id=\"addC\">Add</button></div>" +
      "<div id=\"ex\"></div>" +
      "<label>Notes</label><textarea id=\"notes\" rows=\"3\">" + esc(draft.notes || "") + "</textarea>" +
      "<button class=\"btn primary block\" id=\"save\">Save session</button>";
    document.getElementById("date").onchange = function (e) {
      date = e.target.value;
      draft = sessions[date] ? clone(sessions[date]) : { name: draft.name || "Legs", exercises: [], notes: "" };
      paint();
    };
    document.querySelectorAll("#pills .pill").forEach(function (b) {
      b.onclick = function () { draft.name = b.getAttribute("data-s"); paint(); };
    });
    document.querySelectorAll("#chips .chip").forEach(function (b) {
      b.onclick = function () {
        const c = C[draft.name][+b.getAttribute("data-i")];
        draft.exercises.push(mk(c[0], c[1], c[2], c[3], c[4]));
        paintEx();
      };
    });
    document.getElementById("addC").onclick = function () {
      const n = document.getElementById("custom").value.trim();
      if (!n) return;
      draft.exercises.push(mk(n, 1, "10", "", 0));
      document.getElementById("custom").value = "";
      paintEx();
    };
    document.getElementById("notes").oninput = function (e) { draft.notes = e.target.value; };
    document.getElementById("save").onclick = async function () {
      if (!draft.exercises.length) return toast("Add an exercise");
      sessions[date] = { name: draft.name, exercises: draft.exercises, notes: draft.notes || "" };
      local.u = saveLocal(sessions);
      const synced = await pushCloud(true);
      if (synced) toast("Saved");
      setTimeout(function () { go("/", {}); }, synced ? 350 : 2200);
    };
    paintEx();
  }

  function paintEx() {
    const box = document.getElementById("ex");
    if (!box) return;
    box.innerHTML = draft.exercises.map(function (ex, ei) {
      return "<div class=\"day\"><div style=\"display:flex;justify-content:space-between\"><strong>" + esc(ex.n) + "</strong><button class=\"btn\" data-rm=\"" + ei + "\">Remove</button></div>" +
        ex.sets.map(function (s, si) {
          return "<div class=\"setrow\"><span class=\"muted\">#" + (si + 1) + "</span>" +
            "<input data-e=\"" + ei + "\" data-s=\"" + si + "\" data-f=\"r\" value=\"" + esc(s.r) + "\" placeholder=\"reps\"/>" +
            "<input data-e=\"" + ei + "\" data-s=\"" + si + "\" data-f=\"l\" value=\"" + esc(s.bw ? "" : s.l) + "\" placeholder=\"load\"" + (s.bw ? " disabled" : "") + "/>" +
            "<label style=\"margin:0;display:flex;gap:4px;align-items:center\"><input type=\"checkbox\" data-e=\"" + ei + "\" data-s=\"" + si + "\" data-f=\"bw\"" + (s.bw ? " checked" : "") + "/>BW</label></div>";
        }).join("") +
        "<button class=\"btn\" data-add=\"" + ei + "\">+ set</button></div>";
    }).join("") || "<p class=\"muted\">Tap an exercise. Each set has its own load.</p>";
    box.querySelectorAll("[data-rm]").forEach(function (b) {
      b.onclick = function () { draft.exercises.splice(+b.getAttribute("data-rm"), 1); paintEx(); };
    });
    box.querySelectorAll("[data-add]").forEach(function (b) {
      b.onclick = function () {
        const ex = draft.exercises[+b.getAttribute("data-add")];
        const last = ex.sets[ex.sets.length - 1] || { r: "10", l: "", bw: 0 };
        ex.sets.push({ r: last.r, l: last.l, bw: last.bw });
        paintEx();
      };
    });
    box.querySelectorAll("input[data-e]").forEach(function (inp) {
      inp.onchange = inp.oninput = function () {
        const s = draft.exercises[+inp.getAttribute("data-e")].sets[+inp.getAttribute("data-s")];
        if (inp.getAttribute("data-f") === "bw") {
          s.bw = inp.checked;
          if (s.bw) s.l = "";
          paintEx();
          return;
        }
        s[inp.getAttribute("data-f")] = inp.value;
      };
    });
  }

  paint();
}

function render() {
  const q0 = qs();
  const p = location.pathname;
  if (q0.view === "log" || p.indexOf("log") >= 0) renderLog();
  else renderWeek();
}

render();
pullCloud();
