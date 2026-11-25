import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clamp,
  wrapHue,
  parseHex,
  parseRgb,
  parseHsl,
  parseColor,
  rgbaToHex,
  rgbaToHsla,
  hslaToRgba,
  rgbaToHsva,
  hsvaToRgba,
} from "../src/elements/color-conversion.js";

const channelDistance = (left, right) => Math.max(
  Math.abs(left.r - right.r),
  Math.abs(left.g - right.g),
  Math.abs(left.b - right.b),
  Math.abs(left.a - right.a) * 255,
);

test("color parsing accepts canonical Hex, RGB and HSL with alpha", () => {
  assert.deepEqual(parseHex("#369c"), { r: 51, g: 102, b: 153, a: 0.8 });
  assert.deepEqual(parseRgb("rgb(300, -2, 127 / 50%)"), { r: 255, g: 0, b: 127, a: 0.5 });
  assert.equal(rgbaToHex(parseHsl("hsl(480, 100%, 50% / .25)")), "#00FF0040");
  assert.equal(rgbaToHex(parseHsl("hsl(120 100% 50% / .25)")), "#00FF0040");
  assert.deepEqual(parseColor("not a color"), null);
  assert.deepEqual(parseHex("#12"), null);
});

test("clamping and hue wrapping never produce unsafe numeric state", () => {
  assert.equal(clamp(-1), 0);
  assert.equal(clamp(4), 1);
  assert.equal(wrapHue(-30), 330);
  assert.equal(wrapHue(750), 30);
  assert.equal(wrapHue(Number.NaN), 0);
  assert.equal(clamp(Number.NaN), 0);
  for (const value of ["#000", "#fff8", "rgb(0, 300, 25)", "hsl(-720, 150%, -20%)"]) {
    const color = parseColor(value);
    assert.ok(color);
    assert.ok(Object.values(color).every(Number.isFinite));
    assert.match(rgbaToHex(color), /^#[0-9A-F]{6}(?:[0-9A-F]{2})?$/);
  }
});

test("RGBA, HSLA and HSVA round trips remain within channel tolerance", () => {
  const samples = [
    { r: 0, g: 0, b: 0, a: 0 },
    { r: 255, g: 255, b: 255, a: 1 },
    { r: 12, g: 99, b: 240, a: 0.37 },
    { r: 230, g: 70, b: 125, a: 0.8 },
  ];
  for (const sample of samples) {
    assert.ok(channelDistance(sample, hslaToRgba(rgbaToHsla(sample))) <= 1);
    assert.ok(channelDistance(sample, hsvaToRgba(rgbaToHsva(sample))) <= 1);
  }
});
