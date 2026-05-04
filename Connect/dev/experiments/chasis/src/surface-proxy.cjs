"use strict";

function openSurfaceUrl(name, state) {
  if (!state || !state.port) throw new Error(`Project ${name} has no running port; start it first.`);
  return `http://localhost:${state.port}`;
}

module.exports = { openSurfaceUrl };
