"use strict";

const assert = require("node:assert");
const { getRuntimePort } = require("../src/utils.cjs");

assert.equal(getRuntimePort("node"), 3000);
assert.equal(getRuntimePort("python"), 8000);
assert.equal(getRuntimePort("static"), 8080);
assert.equal(getRuntimePort("unknown"), 8080);

console.log("test-manager passed");
