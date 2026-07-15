import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const contextSource = fs.readFileSync(path.join(directory, "cursor-context.tsx"), "utf8");
const cursorSource = fs.readFileSync(path.join(directory, "custom-cursor.tsx"), "utf8");

test("tracks fine mouse pointers without touch-device false positives", () => {
  assert.match(contextSource, /any-hover:\s*hover/);
  assert.match(contextSource, /any-pointer:\s*fine/);
  assert.match(contextSource, /pointermove/);
  assert.doesNotMatch(contextSource, /ontouchstart|mousemove/);
});

test("batches cursor movement and centers without layout reads", () => {
  assert.match(contextSource, /requestAnimationFrame/);
  assert.match(contextSource, /translate\(-50%,\s*-50%\)/);
  assert.doesNotMatch(contextSource, /offsetWidth|offsetHeight/);
});

test("does not render or hide the native cursor without a fine pointer", () => {
  assert.match(cursorSource, /isCustomCursorEnabled/);
  assert.match(cursorSource, /!isHomepage\s*\|\|\s*!isCustomCursorEnabled/);
  assert.match(cursorSource, /isHomepage\s*&&\s*isCustomCursorEnabled/);
});
