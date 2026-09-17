import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const source = fs.readFileSync(new URL("./fund-tabs.tsx", import.meta.url), "utf8");
const output = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
} }).outputText;
const exports = {};
new Function("require", "exports", output)(createRequire(import.meta.url), exports);

function wheel({ content = 900, height = 600, top = 0, deltaY = 100, deltaX = 0, ctrlKey = false } = {}) {
  let stopped = false;
  exports.handlePanelWheel({
    currentTarget: { scrollHeight: content, clientHeight: height, scrollTop: top },
    deltaY, deltaX, ctrlKey,
    stopPropagation() { stopped = true; },
    preventDefault() { assert.fail("Native panel scrolling must remain enabled"); },
  });
  return stopped;
}

test("a fitting list lets the page scroll in either direction", () => {
  assert.equal(wheel({ content: 400 }), false);
  assert.equal(wheel({ content: 600 }), false);
  assert.equal(wheel({ content: 600, deltaY: -100 }), false);
});

test("an overflowing list consumes the wheel only while it can move", () => {
  assert.equal(wheel(), true);
  assert.equal(wheel({ top: 150 }), true);
  assert.equal(wheel({ top: 150, deltaY: -100 }), true);
  assert.equal(wheel({ top: 300, deltaY: -100 }), true);
  assert.equal(wheel({ top: 300 }), false);
  assert.equal(wheel({ top: 0, deltaY: -100 }), false);
});

test("fractional boundaries do not trap the wheel", () => {
  assert.equal(wheel({ top: 299.67 }), false);
  assert.equal(wheel({ top: 0.33, deltaY: -100 }), false);
});

test("zoom, horizontal and zero-delta gestures remain untouched", () => {
  assert.equal(wheel({ ctrlKey: true }), false);
  assert.equal(wheel({ deltaX: 120 }), false);
  assert.equal(wheel({ deltaY: 0 }), false);
});
