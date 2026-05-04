package server

import "net/http"

const demoIndexHTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>uDos Demo Index</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; background: #0b1020; color: #e5e7eb; }
    .wrap { max-width: 1100px; margin: 24px auto; padding: 0 16px; }
    .card { background: #111827; border: 1px solid #374151; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    h1, h2 { margin: 0 0 12px; }
    .muted { color: #9ca3af; font-size: 14px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
    .link { display: block; border: 1px solid #334155; border-radius: 10px; padding: 12px; text-decoration: none; color: #e5e7eb; background: #0f172a; }
    .link:hover { border-color: #64748b; }
    code { color: #93c5fd; }
    ul { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>uDos Story Surface Index</h1>
      <p class="muted">Detailed index for all live story demo options (TUI, websocket, GUI skin styles, and transport endpoints).</p>
      <p><code>USXD_STORY_TUI=1 go run ./cmd/usxd-server</code></p>
    </div>

    <div class="card">
      <h2>Demo Pages</h2>
      <div class="grid">
        <a class="link" href="/demo/story">/demo/story - Raw live state inspector</a>
        <a class="link" href="/demo/final">/demo/final - Tailwind-style final GUI surface</a>
      </div>
    </div>

    <div class="card">
      <h2>Transport Endpoints</h2>
      <ul>
        <li><code>/api/usxd/state</code> - Current snapshot JSON</li>
        <li><code>/ws/usxd</code> - Real-time state stream for TUI interactions</li>
        <li><code>/healthz</code> - Health probe</li>
      </ul>
    </div>

    <div class="card">
      <h2>Story Runtime Controls</h2>
      <ul>
        <li><code>Enter</code> advance/submit</li>
        <li><code>b</code> back</li>
        <li><code>←/→</code> move stars/scale/choice cursor</li>
        <li><code>Space</code> toggle multi-choice or set single-choice</li>
        <li><code>Esc</code> cancel, <code>q</code> quit</li>
      </ul>
    </div>

    <div class="card">
      <h2>Theme Targets</h2>
      <ul>
        <li>Typeform-style minimal flow</li>
        <li>Marp-style presentation flow</li>
        <li>Teletext terminal flow</li>
        <li>ThinUI low-resource web flow</li>
      </ul>
      <p class="muted">Story logic stays identical; only presentation chrome changes.</p>
    </div>
  </div>
</body>
</html>`

const storyDemoHTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>uDos Story Live State</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; background: #0b1020; color: #e5e7eb; }
    .wrap { max-width: 980px; margin: 24px auto; padding: 0 16px; }
    .card { background: #111827; border: 1px solid #374151; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .muted { color: #9ca3af; font-size: 14px; }
    .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .badge { background: #1f2937; border: 1px solid #374151; border-radius: 999px; padding: 4px 10px; font-size: 12px; }
    .title { font-size: 18px; margin: 0 0 8px; }
    .step { font-size: 16px; margin: 0 0 8px; }
    pre { white-space: pre-wrap; word-break: break-word; background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 12px; }
    code { color: #93c5fd; }
    a { color: #93c5fd; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1 class="title">uDos Story Live State</h1>
      <div class="row">
        <span class="badge" id="status">connecting...</span>
        <span class="badge" id="progress">step -/-</span>
        <span class="badge" id="version">version -</span>
      </div>
      <p class="muted">Run with <code>USXD_STORY_TUI=1 go run ./cmd/usxd-server</code>, then interact in TUI. This page updates from <code>/ws/usxd</code>. <a href="/demo">Back to demo index</a></p>
    </div>

    <div class="card">
      <h2 class="step" id="stepLabel">Waiting for story state...</h2>
      <pre id="payload">{}</pre>
    </div>
  </div>

  <script>
    const status = document.getElementById("status");
    const progress = document.getElementById("progress");
    const version = document.getElementById("version");
    const stepLabel = document.getElementById("stepLabel");
    const payload = document.getElementById("payload");

    const wsProto = location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(wsProto + "://" + location.host + "/ws/usxd");

    ws.onopen = () => { status.textContent = "connected"; };
    ws.onclose = () => { status.textContent = "disconnected"; };
    ws.onerror = () => { status.textContent = "error"; };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const widget = data?.widgets?.instances?.find((w) => w.type === "story");
        const p = widget?.payload || {};
        const step = p.step || {};
        const current = p.current ?? "-";
        const total = p.total ?? "-";
        progress.textContent = "step " + current + "/" + total;
        version.textContent = "version " + (data?.open_box?.usxd_version || "-");
        stepLabel.textContent = step.label || step.title || step.type || "Story state received";
        payload.textContent = JSON.stringify(data, null, 2);
      } catch {
        payload.textContent = event.data;
      }
    };
  </script>
</body>
</html>`

const finalSurfaceDemoHTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>uDos Final Story Surface</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <div class="max-w-5xl mx-auto p-6 space-y-4">
    <header class="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <span class="px-3 py-1 rounded-full bg-slate-800 border border-slate-700" id="status">connecting...</span>
        <span class="px-3 py-1 rounded-full bg-slate-800 border border-slate-700" id="progress">story -/-</span>
        <span class="px-3 py-1 rounded-full bg-slate-800 border border-slate-700" id="version">version -</span>
      </div>
      <h1 class="mt-3 text-xl font-semibold">uDos Story Final GUI Surface (Tailwind-style)</h1>
      <p class="mt-2 text-slate-300 text-sm">Live websocket mirror of TUI story flow. <a class="underline" href="/demo">Demo index</a></p>
    </header>

    <main class="rounded-xl border border-slate-700 bg-slate-900 p-0 overflow-hidden">
      <div class="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
        <div class="text-sm text-slate-300">Narrative Spine</div>
        <div class="text-xs text-slate-400" id="stepType">step type -</div>
      </div>
      <section class="p-5 space-y-4">
        <h2 class="text-lg font-medium" id="stepLabel">Waiting for state...</h2>
        <p class="text-slate-300 text-sm" id="stepContent"></p>

        <div class="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
          <div class="text-xs text-slate-400 mb-2">Control Preview</div>
          <div id="controlView" class="space-y-2 text-sm"></div>
        </div>
      </section>
      <footer class="px-5 py-3 border-t border-slate-700 flex items-center justify-between text-sm">
        <div class="text-slate-400">← Back</div>
        <div class="w-56 bg-slate-800 rounded-full h-2 overflow-hidden">
          <div id="bar" class="h-full bg-cyan-400" style="width: 0%"></div>
        </div>
        <div class="text-slate-200">Enter →</div>
      </footer>
    </main>

    <details class="rounded-xl border border-slate-700 bg-slate-900 p-4">
      <summary class="cursor-pointer text-sm text-slate-200">Raw websocket payload</summary>
      <pre id="payload" class="mt-3 text-xs text-slate-300 whitespace-pre-wrap"></pre>
    </details>
  </div>

  <script>
    const statusEl = document.getElementById("status");
    const progressEl = document.getElementById("progress");
    const versionEl = document.getElementById("version");
    const stepTypeEl = document.getElementById("stepType");
    const stepLabelEl = document.getElementById("stepLabel");
    const stepContentEl = document.getElementById("stepContent");
    const controlViewEl = document.getElementById("controlView");
    const payloadEl = document.getElementById("payload");
    const barEl = document.getElementById("bar");

    function starLine(max, value) {
      let out = "";
      for (let i = 1; i <= max; i++) out += i <= value ? "★ " : "☆ ";
      return out.trim();
    }

    function renderControl(step) {
      if (!step || !step.type) return "<div class='text-slate-500'>No control yet.</div>";
      if (step.type === "input") return "<input class='w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2' placeholder='" + (step.placeholder || "") + "' />";
      if (step.type === "single_choice" || step.type === "multi_choice") {
        const opts = step.options || [];
        return opts.map((o) => {
          const dot = o.selected || o.default ? "●" : "○";
          return "<div class='px-3 py-2 rounded border border-slate-700 bg-slate-900'>" + dot + " " + (o.label || o.value) + "</div>";
        }).join("");
      }
      if (step.type === "stars") return "<div class='text-2xl'>" + starLine(step.max || 5, step.value || 0) + "</div>";
      if (step.type === "scale") {
        const min = step.min || 1;
        const max = step.max || 5;
        let html = "<div class='flex gap-2'>";
        for (let i = min; i <= max; i++) {
          const active = i === step.value;
          html += "<span class='px-3 py-1 rounded border " + (active ? "bg-cyan-500/30 border-cyan-300" : "bg-slate-900 border-slate-700") + "'>[" + i + "]</span>";
        }
        html += "</div>";
        return html;
      }
      return "<div class='text-slate-300'>" + (step.content || "Press Enter to continue") + "</div>";
    }

    const wsProto = location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(wsProto + "://" + location.host + "/ws/usxd");
    ws.onopen = () => { statusEl.textContent = "connected"; };
    ws.onclose = () => { statusEl.textContent = "disconnected"; };
    ws.onerror = () => { statusEl.textContent = "error"; };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        payloadEl.textContent = JSON.stringify(data, null, 2);
        const story = data?.widgets?.instances?.find((w) => w.type === "story")?.payload || {};
        const step = story.step || {};
        const current = story.current || "-";
        const total = story.total || "-";
        progressEl.textContent = "story " + current + "/" + total;
        versionEl.textContent = "version " + (data?.open_box?.usxd_version || "-");
        stepTypeEl.textContent = "step type " + (step.type || "-");
        stepLabelEl.textContent = step.label || step.title || "Narrative step";
        stepContentEl.textContent = step.content || "";
        controlViewEl.innerHTML = renderControl(step);
        const pct = (typeof current === "number" && typeof total === "number" && total > 0) ? Math.floor((current / total) * 100) : 0;
        barEl.style.width = pct + "%";
      } catch {
        payloadEl.textContent = event.data;
      }
    };
  </script>
</body>
</html>`

func DemoIndexHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write([]byte(demoIndexHTML))
	}
}

func StoryDemoHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write([]byte(storyDemoHTML))
	}
}

func FinalSurfaceDemoHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write([]byte(finalSurfaceDemoHTML))
	}
}
