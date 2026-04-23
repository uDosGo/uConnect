"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { ensureDir, getRuntimePort, ADAPTORS_DIR } = require("./utils.cjs");

function writeIfMissing(filePath, content) {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, content, "utf8");
}

function generateAdaptor(name, repoPath, runtime) {
  const adaptorDir = path.join(ADAPTORS_DIR, name);
  ensureDir(adaptorDir);

  const yaml = `name: ${name}
version: 1
original_repo: "${repoPath}"

runtime:
  type: ${runtime}
  build: "${runtime === "node" ? "npm install" : runtime === "python" ? "pip install -r requirements.txt" : "echo no-build"}"
  start: "${runtime === "node" ? "npm start" : runtime === "python" ? "python -m uvicorn main:app --host 0.0.0.0 --port 8000" : "python3 -m http.server 8080"}"
  port: ${getRuntimePort(runtime)}

integration:
  variables:
    - name: UDOS_USER
      source: "{{ user.name }}"
    - name: UDOS_THEME
      source: "{{ ui.theme }}"
    - name: UDOS_SKIN
      source: "{{ ui.skin }}"
    - name: UDOS_LENS
      source: "{{ ui.lens }}"
  api:
    - path: "/api/status"
      method: GET
      action: "return container health"
  events:
    - name: "project:updated"
      action: "spool process"

surface:
  mode: fullscreen
  navigation: internal
`;

  const adaptorYamlPath = path.join(ADAPTORS_DIR, `${name}.yaml`);
  writeIfMissing(adaptorYamlPath, yaml);
  writeIfMissing(path.join(adaptorDir, "adaptor.yaml"), yaml);
  writeIfMissing(
    path.join(adaptorDir, "Dockerfile"),
    `FROM node:20-alpine
WORKDIR /workspace
RUN apk add --no-cache bash
EXPOSE ${getRuntimePort(runtime)}
CMD ["bash", "-lc", "${runtime === "node" ? "npm install || true; npm start" : runtime === "python" ? "pip install -r requirements.txt || true; python -m uvicorn main:app --host 0.0.0.0 --port 8000 || python -m http.server 8000" : runtime === "static" ? "python3 -m http.server 8080" : "sleep infinity"}"]
`
  );
  writeIfMissing(
    path.join(adaptorDir, "api.js"),
    `"use strict";

module.exports = function registerApi(app) {
  app.get("/api/items", (_req, res) => {
    let items = [];
    const lens = process.env.UDOS_LENS;
    if (lens === "high-priority") items = items.filter((i) => i.priority === "high");
    res.json(items);
  });
};
`
  );
  writeIfMissing(path.join(adaptorDir, "events.js"), `"use strict";\nmodule.exports = function registerEvents(_bus) {};\n`);
  writeIfMissing(
    path.join(adaptorDir, "surface.js"),
    `"use strict";\nmodule.exports = function surfaceConfig() { return { mode: "fullscreen", navigation: "internal" }; };\n`
  );
}

module.exports = { generateAdaptor };
