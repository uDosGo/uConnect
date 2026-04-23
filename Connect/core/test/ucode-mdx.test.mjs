import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseMdxUcode,
  runMdxUcode,
  parseAndRunMdxUcode,
  evalExpr,
} from "../dist/ucode-mdx/index.js";

test("parseMdxUcode handles PRINT, CHOICE, IF YES/NO", () => {
  const src = `
PRINT "Hi"
CHOICE "Go?" YES NO
IF YES THEN
PRINT "Y"
ELSE
PRINT "N"
END IF
`;
  const stmts = parseMdxUcode(src);
  assert.equal(stmts.length, 3);
  assert.equal(stmts[0].kind, "print");
  assert.equal(stmts[1].kind, "choice");
  assert.equal(stmts[2].kind, "if");
});

test("parseMdxUcode parses QUIZ with FEEDBACK", () => {
  const src = `
QUIZ "Q?"
    OPTION "A" FALSE
    OPTION "B" TRUE
FEEDBACK "Nice."
`;
  const stmts = parseMdxUcode(src);
  assert.equal(stmts.length, 1);
  assert.equal(stmts[0].kind, "quiz");
  assert.equal(stmts[0].options.length, 2);
  assert.equal(stmts[0].feedback, "Nice.");
});

test("forbidden LIST throws at parse time", () => {
  assert.throws(() => parseMdxUcode('LIST "vault"'), /not allowed/);
});

test("runMdxUcode runs print and branch on YES", async () => {
  const out = [];
  const host = {
    print: (t) => {
      out.push(t);
    },
    input: async () => "x",
    choice: async () => "YES",
    navigate: () => {},
    setVisibility: () => {},
    quizFeedback: () => {},
  };
  await parseAndRunMdxUcode(
    `
CHOICE "?" YES NO
IF YES THEN
PRINT "branch-yes"
ELSE
PRINT "branch-no"
END IF
`,
    host
  );
  assert.deepEqual(out, ["branch-yes"]);
});

test("INPUT and PRINT concat", async () => {
  const out = [];
  const host = {
    print: (t) => {
      out.push(t);
    },
    input: async () => "Ada",
    choice: async () => "NO",
    navigate: () => {},
    setVisibility: () => {},
    quizFeedback: () => {},
  };
  await parseAndRunMdxUcode(
    `
INPUT "Name?" name
PRINT "Hello, " + name
`,
    host
  );
  assert.deepEqual(out, ["Hello, Ada"]);
});

test("evalExpr concat", () => {
  assert.equal(evalExpr('"a" + "b"', {}), "ab");
  assert.equal(evalExpr("x + y", { x: "1", y: "2" }), "12");
});

test("SHOW with IF uses variables", async () => {
  const vis = [];
  const host = {
    print: () => {},
    input: async () => "",
    choice: async () => "adventurer",
    navigate: () => {},
    setVisibility: (id, v) => {
      vis.push([id, v]);
    },
    quizFeedback: () => {},
  };
  const stmts = parseMdxUcode(`
LET choice = "adventurer"
SHOW "secret" IF choice = "adventurer"
`);
  await runMdxUcode(stmts, host);
  assert.deepEqual(vis, [["secret", true]]);
});
