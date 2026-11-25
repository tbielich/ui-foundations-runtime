/**
 * Input Controls — Progressive Enhancement
 *
 * Gives Search Field, Number Field, and Range Slider Nunjucks output the same
 * interaction contract as their Custom Element counterparts.
 */

const CONTROL_SELECTOR = ".uif-search-field, .uif-number-field, .uif-range-slider";
const enhancedControls = new WeakSet();

function controlsWithin(root) {
  const controls = [];
  if (root.matches?.(CONTROL_SELECTOR)) controls.push(root);
  if (root.querySelectorAll) controls.push(...root.querySelectorAll(CONTROL_SELECTOR));
  return controls;
}

function dispatchNativeChanges(input) {
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function enhanceSearchField(field) {
  const input = field.querySelector('.uif-search-field-input[type="search"]');
  const clear = field.querySelector(".uif-search-field-clear");
  if (!input || !clear) return;

  const sync = () => { clear.disabled = input.disabled || input.value.length === 0; };
  input.addEventListener("input", sync);
  clear.addEventListener("click", () => {
    if (clear.disabled || input.disabled) return;
    input.value = "";
    dispatchNativeChanges(input);
    input.focus();
  });
  sync();
}

function finiteConstraint(value, fallback) {
  const number = Number(value);
  return value !== "" && Number.isFinite(number) ? number : fallback;
}

function formatNumberFieldValue(field, input) {
  const value = input.valueAsNumber;
  if (!Number.isFinite(value)) return "No value";
  const locale = field.dataset.locale || "en";
  const format = field.dataset.format || "decimal";
  const currency = field.dataset.currency || "EUR";
  if (format === "currency") {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
  }
  if (format === "percent") {
    return new Intl.NumberFormat(locale, { style: "percent" }).format(value / 100);
  }
  return new Intl.NumberFormat(locale).format(value);
}

function enhanceNumberField(field) {
  const input = field.querySelector('.uif-number-field-input[type="number"]');
  const output = field.querySelector(".uif-number-field-formatted");
  const down = field.querySelector(".uif-number-field-step-down");
  const up = field.querySelector(".uif-number-field-step-up");
  if (!input || !output || !down || !up) return;

  const sync = () => {
    const formatted = formatNumberFieldValue(field, input);
    output.textContent = formatted;
    input.setAttribute("aria-valuetext", formatted);
  };
  const step = (direction) => {
    if (input.disabled || input.readOnly) return;
    const min = finiteConstraint(input.min, -Infinity);
    const max = finiteConstraint(input.max, Infinity);
    if (input.value === "") input.value = String(Number.isFinite(min) ? min : 0);
    else if (direction === "down") input.stepDown();
    else input.stepUp();
    const value = input.valueAsNumber;
    if (Number.isFinite(value)) input.value = String(Math.min(max, Math.max(min, value)));
    sync();
    dispatchNativeChanges(input);
    field.dispatchEvent(new CustomEvent("uif-change", {
      bubbles: true,
      detail: { value: input.valueAsNumber },
    }));
  };

  input.addEventListener("input", sync);
  input.addEventListener("change", sync);
  down.addEventListener("click", () => step("down"));
  up.addEventListener("click", () => step("up"));
  sync();
}

function enhanceRangeSlider(field) {
  const lowerInput = field.querySelector(".uif-range-slider-input-lower");
  const upperInput = field.querySelector(".uif-range-slider-input-upper");
  const lowerOutput = field.querySelector(".uif-range-slider-output-lower");
  const upperOutput = field.querySelector(".uif-range-slider-output-upper");
  if (!lowerInput || !upperInput || !lowerOutput || !upperOutput) return;

  const rangeMin = Number(lowerInput.min);
  const rangeMax = Number(upperInput.max);
  const sync = (source, emit) => {
    let lower = Number(lowerInput.value);
    let upper = Number(upperInput.value);
    if (source === lowerInput && lower > upper) lower = upper;
    if (source === upperInput && upper < lower) upper = lower;
    lowerInput.value = String(lower);
    upperInput.value = String(upper);
    lowerInput.max = String(upper);
    upperInput.min = String(lower);
    lowerOutput.textContent = String(lower);
    upperOutput.textContent = String(upper);
    const lowerLabel = field.querySelector(`label[for="${CSS.escape(lowerInput.id)}"]`)?.textContent || "Minimum";
    const upperLabel = field.querySelector(`label[for="${CSS.escape(upperInput.id)}"]`)?.textContent || "Maximum";
    lowerInput.setAttribute("aria-valuetext", `${lowerLabel}: ${lower}`);
    upperInput.setAttribute("aria-valuetext", `${upperLabel}: ${upper}`);
    const span = rangeMax - rangeMin || 1;
    field.style.setProperty("--uif-range-slider-lower", `${((lower - rangeMin) / span) * 100}%`);
    field.style.setProperty("--uif-range-slider-upper", `${((upper - rangeMin) / span) * 100}%`);
    if (emit) {
      field.dispatchEvent(new CustomEvent("uif-change", {
        bubbles: true,
        detail: { lower, upper },
      }));
    }
  };
  const bindInput = (input, kind) => {
    const activate = () => { field.dataset.activeThumb = kind; };
    input.addEventListener("focus", activate);
    input.addEventListener("pointerdown", activate);
    input.addEventListener("input", () => sync(input, true));
    input.addEventListener("change", () => sync(input, true));
  };

  bindInput(lowerInput, "lower");
  bindInput(upperInput, "upper");
  sync(null, false);
}

function enhanceControl(control) {
  if (enhancedControls.has(control)) return;
  if (control.closest("uif-search-field, uif-number-field, uif-range-slider")) return;
  enhancedControls.add(control);
  if (control.classList.contains("uif-search-field")) enhanceSearchField(control);
  else if (control.classList.contains("uif-number-field")) enhanceNumberField(control);
  else if (control.classList.contains("uif-range-slider")) enhanceRangeSlider(control);
}

/** Enhance macro-rendered input controls within a root. */
export function enhanceInputControls(root = document) {
  controlsWithin(root).forEach(enhanceControl);
}

/** Observe a root for macro-rendered input controls added later. */
export function observeInputControls(root = document.body) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) controlsWithin(node).forEach(enhanceControl);
      }
    }
  });
  observer.observe(root, { childList: true, subtree: true });
  return observer;
}

if (typeof window !== "undefined" && !window.__INPUT_CONTROLS_NO_AUTO) {
  const initialize = () => {
    enhanceInputControls();
    observeInputControls();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
}
