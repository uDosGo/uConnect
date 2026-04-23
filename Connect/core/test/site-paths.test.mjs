import { test } from "node:test";
import assert from "node:assert/strict";
import { relativePathToAssets } from "../dist/lib/site-paths.js";

test("relativePathToAssets depth 0 and 1", () => {
  assert.equal(relativePathToAssets("page.html"), "./assets/theme.css");
  assert.equal(relativePathToAssets("a/page.html"), "../assets/theme.css");
});
