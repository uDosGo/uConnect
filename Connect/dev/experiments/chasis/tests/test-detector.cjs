"use strict";

const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { detectRuntime } = require("../src/runtime-detector.cjs");

function mkTmp(structure) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "chasis-detector-"));
  for (const file of structure) fs.writeFileSync(path.join(dir, file), "");
  return dir;
}

assert.equal(detectRuntime(mkTmp(["package.json"])), "node");
assert.equal(detectRuntime(mkTmp(["requirements.txt"])), "python");
assert.equal(detectRuntime(mkTmp(["index.html"])), "static");
console.log("test-detector passed");
