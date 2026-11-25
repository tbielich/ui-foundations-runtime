import { UIElement, define } from "./base.js";
import { connectFormReset, disconnectFormReset } from "./form-reset.js";
import {
  clamp,
  wrapHue,
  normalizeRgba,
  parseColor,
  rgbaToHex,
  rgbaToRgbString,
  rgbaToHslString,
  rgbaToCss,
  rgbaToHsva,
  hsvaToRgba,
} from "./color-conversion.js";

let nextColorPickerId = 0;

const DEFAULT_COLOR = { r: 0, g: 102, b: 204, a: 1 };
const DEFAULT_SWATCHES = [
  { value: "#0066CC", label: "Ocean blue" },
  { value: "#00875A", label: "Forest green" },
  { value: "#D83B01", label: "Warm orange" },
  { value: "#C239B3", label: "Magenta" },
  { value: "#5C2D91", label: "Violet" },
  { value: "#737373", label: "Neutral gray" },
  { value: "#000000", label: "Black" },
  { value: "#FFFFFF", label: "White" },
];
const FORMAT_ERRORS = {
  hex: "Enter a valid Hex color.",
  rgb: "Enter a valid RGB color.",
  hsl: "Enter a valid HSL color.",
};

/** A synchronized, dependency-free family of accessible color controls. */
class UIColorPicker extends UIElement {
  static get observedAttributes() {
    return ["label", "name", "value", "swatches", "disabled", "readonly", "invalid", "error"];
  }

  connectedCallback() {
    super.connectedCallback();
    connectFormReset(this, this._hidden?.form, () => this._resetFormValue());
  }

  disconnectedCallback() {
    disconnectFormReset(this);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "value" && this._reflectingValue) return;
    if (name === "value" && this._initialized && oldValue !== newValue) {
      this._applyValue(newValue);
    }
    if (name === "swatches" && this._initialized && oldValue !== newValue) {
      this._swatchData = this._parseSwatches(newValue);
      this._renderSwatches();
    }
    super.attributeChangedCallback(name, oldValue, newValue);
  }

  render() {
    if (!this._field || !this.contains(this._field)) this._createStructure();
    this._renderState();
  }

  _createStructure() {
    const baseId = this.id || `uif-color-picker-${++nextColorPickerId}`;
    const authoredValue = this.getAttr("value").trim();
    const parsedInitial = authoredValue ? parseColor(authoredValue) : null;
    const initial = parsedInitial || DEFAULT_COLOR;
    this._color = normalizeRgba(initial);
    this._hsva = rgbaToHsva(this._color);
    this._defaultColor = { ...this._color };
    this._defaultHsva = { ...this._hsva };
    this._parseError = authoredValue && !parsedInitial ? FORMAT_ERRORS.hex : "";
    if (authoredValue) this._reflectValue(rgbaToHex(this._color));
    if (!this._swatchData) this._swatchData = this._parseSwatches(this.getAttr("swatches"));

    const field = this.ownerDocument.createElement("fieldset");
    field.className = "uif-color-picker";

    const legend = this.ownerDocument.createElement("legend");
    legend.className = "uif-color-picker-legend";

    const visuals = this.ownerDocument.createElement("div");
    visuals.className = "uif-color-picker-visuals";

    const area = this.ownerDocument.createElement("div");
    area.className = "uif-color-picker-area";
    area.setAttribute("role", "group");
    area.setAttribute("aria-label", "Saturation and brightness");
    const saturation = this._createAreaAxis(`${baseId}-saturation`, "Saturation");
    const brightness = this._createAreaAxis(`${baseId}-brightness`, "Brightness");
    const areaFocus = this.ownerDocument.createElement("span");
    areaFocus.className = "uif-color-picker-area-focus";
    areaFocus.setAttribute("aria-hidden", "true");
    const areaMarker = this.ownerDocument.createElement("span");
    areaMarker.className = "uif-color-picker-marker";
    areaMarker.setAttribute("aria-hidden", "true");
    area.append(saturation, brightness, areaFocus, areaMarker);

    const wheel = this.ownerDocument.createElement("div");
    wheel.className = "uif-color-picker-wheel";
    wheel.tabIndex = 0;
    wheel.setAttribute("role", "slider");
    wheel.setAttribute("aria-label", "Hue wheel");
    wheel.setAttribute("aria-valuemin", "0");
    wheel.setAttribute("aria-valuemax", "359");
    const wheelMarker = this.ownerDocument.createElement("span");
    wheelMarker.className = "uif-color-picker-wheel-marker";
    wheelMarker.setAttribute("aria-hidden", "true");
    wheel.append(wheelMarker);
    visuals.append(area, wheel);

    const ranges = this.ownerDocument.createElement("div");
    ranges.className = "uif-color-picker-ranges";
    const hue = this._createRange(`${baseId}-hue`, "Hue", 0, 359, 1);
    const alpha = this._createRange(`${baseId}-alpha`, "Opacity", 0, 100, 1);
    ranges.append(hue.row, alpha.row);

    const summary = this.ownerDocument.createElement("div");
    summary.className = "uif-color-picker-summary";
    const preview = this.ownerDocument.createElement("span");
    preview.className = "uif-color-picker-preview";
    preview.setAttribute("role", "img");
    const value = this.ownerDocument.createElement("p");
    value.className = "uif-color-picker-value";
    summary.append(preview, value);

    const inputs = this.ownerDocument.createElement("div");
    inputs.className = "uif-color-picker-inputs";
    const hex = this._createTextInput(`${baseId}-hex`, "Hex", "#0066CC", "hex");
    const rgb = this._createTextInput(`${baseId}-rgb`, "RGB", "rgb(0, 102, 204)", "rgb");
    const hsl = this._createTextInput(`${baseId}-hsl`, "HSL", "hsl(210 100% 40%)", "hsl");
    inputs.append(hex.row, rgb.row, hsl.row);

    const swatchLabel = this.ownerDocument.createElement("span");
    swatchLabel.className = "uif-color-picker-swatches-label";
    swatchLabel.id = `${baseId}-swatches-label`;
    swatchLabel.textContent = "Preset colors";
    const swatches = this.ownerDocument.createElement("div");
    swatches.className = "uif-color-picker-swatches";
    swatches.setAttribute("role", "grid");
    swatches.setAttribute("aria-labelledby", swatchLabel.id);

    const error = this.ownerDocument.createElement("p");
    error.className = "uif-color-picker-error";
    error.id = `${baseId}-error`;
    error.setAttribute("role", "alert");
    error.hidden = true;

    const hidden = this.ownerDocument.createElement("input");
    hidden.type = "hidden";

    field.append(legend, visuals, ranges, summary, inputs, swatchLabel, swatches, error, hidden);
    this.replaceChildren(field);

    this._field = field;
    this._legend = legend;
    this._area = area;
    this._saturation = saturation;
    this._brightness = brightness;
    this._areaFocus = areaFocus;
    this._areaMarker = areaMarker;
    this._wheel = wheel;
    this._wheelMarker = wheelMarker;
    this._hue = hue.input;
    this._hueOutput = hue.output;
    this._alpha = alpha.input;
    this._alphaOutput = alpha.output;
    this._preview = preview;
    this._valueText = value;
    this._hex = hex.input;
    this._rgb = rgb.input;
    this._hsl = hsl.input;
    this._swatches = swatches;
    this._error = error;
    this._hidden = hidden;

    wheel.addEventListener("keydown", (event) => this._handleWheelKeydown(event));
    this._bindPointerControl(area, (event) => this._updateFromAreaPointer(event), false);
    this._bindPointerControl(wheel, (event) => this._updateFromWheelPointer(event));

    this._bindRange(this._saturation, (numeric, eventType) => {
      this._setHsva({ ...this._hsva, s: clamp(numeric / 100) }, eventType);
    });
    this._bindRange(this._brightness, (numeric, eventType) => {
      this._setHsva({ ...this._hsva, v: clamp(numeric / 100) }, eventType);
    });
    [
      [this._saturation, "saturation", "Saturation"],
      [this._brightness, "brightness", "Brightness"],
    ].forEach(([input, axis, label]) => {
      input.addEventListener("focus", () => {
        this._area.dataset.focusAxis = axis;
        this._areaFocus.textContent = label;
      });
      input.addEventListener("blur", () => {
        this._area.removeAttribute("data-focus-axis");
        this._areaFocus.textContent = "";
      });
    });
    this._bindRange(this._hue, (numeric, eventType) => {
      this._setHsva({ ...this._hsva, h: wrapHue(numeric) }, eventType);
    });
    this._bindRange(this._alpha, (numeric, eventType) => {
      this._setHsva({ ...this._hsva, a: clamp(numeric / 100) }, eventType);
    });
    [this._hex, this._rgb, this._hsl].forEach((input) => {
      input.addEventListener("input", (event) => event.stopPropagation());
      input.addEventListener("change", (event) => {
        event.stopPropagation();
        this._commitText(input);
      });
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          input.blur();
        }
      });
    });

    this._renderSwatches();
    this._hidden.defaultValue = rgbaToHex(this._defaultColor);
  }

  _createAreaAxis(id, label) {
    const input = this.ownerDocument.createElement("input");
    input.id = id;
    input.className = "uif-color-picker-area-axis";
    input.type = "range";
    input.min = "0";
    input.max = "100";
    input.step = "1";
    input.setAttribute("aria-label", label);
    return input;
  }

  _createRange(id, labelText, min, max, step) {
    const row = this.ownerDocument.createElement("div");
    row.className = "uif-color-picker-range";
    const label = this.ownerDocument.createElement("label");
    label.htmlFor = id;
    label.textContent = labelText;
    const input = this.ownerDocument.createElement("input");
    input.id = id;
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    const output = this.ownerDocument.createElement("span");
    output.className = "uif-color-picker-range-value";
    output.setAttribute("aria-hidden", "true");
    row.append(label, input, output);
    return { row, input, output };
  }

  _createTextInput(id, labelText, placeholder, format) {
    const row = this.ownerDocument.createElement("label");
    row.className = "uif-color-picker-input";
    row.htmlFor = id;
    const label = this.ownerDocument.createElement("span");
    label.textContent = labelText;
    const input = this.ownerDocument.createElement("input");
    input.id = id;
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.placeholder = placeholder;
    input.dataset.format = format;
    row.append(label, input);
    return { row, input };
  }

  _bindRange(input, update) {
    input.addEventListener("keydown", (event) => {
      if (this.getBool("readonly")) event.preventDefault();
    });
    input.addEventListener("input", (event) => {
      event.stopPropagation();
      if (this.getBool("readonly")) {
        this._renderState();
        return;
      }
      update(Number(input.value), "input");
    });
    input.addEventListener("change", (event) => {
      event.stopPropagation();
      if (this.getBool("readonly")) this._renderState();
      else this._emit("change");
    });
  }

  _bindPointerControl(control, update, focusOnPointer = true) {
    control.addEventListener("pointerdown", (event) => {
      if (this._isInteractionBlocked()) return;
      event.preventDefault();
      if (focusOnPointer) control.focus();
      control.setPointerCapture(event.pointerId);
      update(event);
    });
    control.addEventListener("pointermove", (event) => {
      if (control.hasPointerCapture(event.pointerId) && !this._isInteractionBlocked()) update(event);
    });
    control.addEventListener("pointerup", (event) => {
      if (!control.hasPointerCapture(event.pointerId)) return;
      control.releasePointerCapture(event.pointerId);
      if (!this._isInteractionBlocked()) this._emit("change");
    });
  }

  _updateFromAreaPointer(event) {
    const rect = this._area.getBoundingClientRect();
    const s = clamp((event.clientX - rect.left) / Math.max(rect.width, 1));
    const v = clamp(1 - (event.clientY - rect.top) / Math.max(rect.height, 1));
    this._setHsva({ ...this._hsva, s, v }, "input");
  }

  _updateFromWheelPointer(event) {
    const rect = this._wheel.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    const h = wrapHue(Math.atan2(y, x) * 180 / Math.PI + 90);
    this._setHsva({ ...this._hsva, h }, "input");
  }

  _handleWheelKeydown(event) {
    if (this._isInteractionBlocked()) return;
    const deltas = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -10, PageUp: 10 };
    if (!(event.key in deltas) && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const hsv = { ...this._hsva };
    if (event.key === "Home") hsv.h = 0;
    else if (event.key === "End") hsv.h = 359;
    else hsv.h = wrapHue(hsv.h + deltas[event.key] * (event.shiftKey ? 10 : 1));
    this._setHsva(hsv, "input");
    this._emit("change");
  }

  _commitText(input) {
    if (this._isInteractionBlocked()) return;
    const format = input.dataset.format;
    const parsed = parseColor(input.value, format);
    if (!parsed) {
      this._invalidInput = input;
      this._parseError = FORMAT_ERRORS[format];
      this._renderState();
      input.focus();
      return;
    }
    this._setColor(parsed, "input");
    this._emit("change");
  }

  _applyValue(value) {
    const parsed = parseColor(value || "");
    if (parsed) {
      this._setColor(parsed);
      return;
    }
    this._parseError = FORMAT_ERRORS.hex;
    this._invalidInput = null;
    this._reflectValue(rgbaToHex(this._color || DEFAULT_COLOR));
    this._renderState();
  }

  _setColor(color, eventType = "") {
    const normalized = normalizeRgba(color);
    const derived = rgbaToHsva(normalized);
    if (!this._hsva || derived.s > 0) {
      this._hsva = derived;
    } else if (derived.v > 0) {
      this._hsva = { ...derived, h: this._hsva.h };
    } else {
      this._hsva = { ...this._hsva, v: 0, a: derived.a };
    }
    this._color = normalized;
    this._finishColorUpdate(eventType);
  }

  _setHsva(color, eventType = "") {
    this._hsva = {
      h: wrapHue(color?.h),
      s: clamp(color?.s),
      v: clamp(color?.v),
      a: clamp(color?.a ?? 1),
    };
    this._color = hsvaToRgba(this._hsva);
    this._finishColorUpdate(eventType);
  }

  _finishColorUpdate(eventType) {
    this._parseError = "";
    this._invalidInput = null;
    this._reflectValue(rgbaToHex(this._color));
    this._renderState();
    if (eventType) this._emit(eventType);
  }

  _emit(type) {
    this.dispatchEvent(new Event(type, { bubbles: true }));
    if (type === "change") {
      this.dispatchEvent(new CustomEvent("uif-color-change", {
        bubbles: true,
        detail: { value: rgbaToHex(this._color), color: { ...this._color } },
      }));
    }
  }

  _reflectValue(value) {
    if (this.getAttr("value") === value) return;
    this._reflectingValue = true;
    this.setAttribute("value", value);
    this._reflectingValue = false;
  }

  _renderState() {
    if (!this._field) return;
    const disabled = this.getBool("disabled");
    const readOnly = this.getBool("readonly");
    const externalError = this.getAttr("error").trim();
    const invalid = this.getBool("invalid") || Boolean(externalError) || Boolean(this._parseError);
    const errorMessage = this._parseError || externalError || (this.getBool("invalid") ? "Choose a valid color." : "");
    const hsv = this._hsva || rgbaToHsva(this._color);
    const value = rgbaToHex(this._color);
    const opacity = Math.round(this._color.a * 100);
    const hueColor = rgbaToCss(hsvaToRgba({ h: hsv.h, s: 1, v: 1, a: 1 }));

    this._legend.textContent = this.getAttr("label").trim() || "Color";
    this._field.disabled = disabled;
    this._field.toggleAttribute("data-readonly", readOnly);
    this._field.toggleAttribute("data-invalid", invalid);
    this._hidden.name = this.getAttr("name");
    this._hidden.value = value;
    this._hidden.disabled = disabled;

    this._area.style.setProperty("--uif-color-picker-hue", hueColor);
    this._saturation.value = String(Math.round(hsv.s * 100));
    this._saturation.disabled = disabled;
    this._saturation.setAttribute("aria-readonly", String(readOnly));
    this._saturation.setAttribute("aria-invalid", String(invalid));
    this._saturation.setAttribute("aria-valuetext", `Saturation ${Math.round(hsv.s * 100)}%`);
    this._brightness.value = String(Math.round(hsv.v * 100));
    this._brightness.disabled = disabled;
    this._brightness.setAttribute("aria-readonly", String(readOnly));
    this._brightness.setAttribute("aria-invalid", String(invalid));
    this._brightness.setAttribute("aria-valuetext", `Brightness ${Math.round(hsv.v * 100)}%`);
    this._areaMarker.style.left = `${hsv.s * 100}%`;
    this._areaMarker.style.top = `${(1 - hsv.v) * 100}%`;

    const radians = (hsv.h - 90) * Math.PI / 180;
    this._wheel.setAttribute("aria-valuenow", String(Math.round(hsv.h)));
    this._wheel.setAttribute("aria-valuetext", `${Math.round(hsv.h)} degrees`);
    this._wheel.setAttribute("aria-readonly", String(readOnly));
    this._wheel.setAttribute("aria-disabled", String(disabled));
    this._wheel.setAttribute("aria-invalid", String(invalid));
    this._wheel.tabIndex = disabled ? -1 : 0;
    this._wheelMarker.style.left = `${50 + Math.cos(radians) * 43}%`;
    this._wheelMarker.style.top = `${50 + Math.sin(radians) * 43}%`;

    this._hue.value = String(Math.round(hsv.h));
    this._hue.disabled = disabled;
    this._hue.setAttribute("aria-readonly", String(readOnly));
    this._hue.setAttribute("aria-invalid", String(invalid));
    this._hue.setAttribute("aria-valuetext", `${Math.round(hsv.h)} degrees`);
    this._hueOutput.textContent = `${Math.round(hsv.h)}°`;
    this._alpha.value = String(opacity);
    this._alpha.disabled = disabled;
    this._alpha.setAttribute("aria-readonly", String(readOnly));
    this._alpha.setAttribute("aria-invalid", String(invalid));
    this._alpha.setAttribute("aria-valuetext", `${opacity}%`);
    this._alphaOutput.textContent = `${opacity}%`;

    this._preview.style.setProperty("--uif-color-picker-current-color", rgbaToCss(this._color));
    this._preview.setAttribute("aria-label", `Current color ${value}, opacity ${opacity}%`);
    this._valueText.textContent = `${value} · opacity ${opacity}%`;

    const textValues = new Map([
      [this._hex, value],
      [this._rgb, rgbaToRgbString(this._color)],
      [this._hsl, rgbaToHslString(this._color)],
    ]);
    textValues.forEach((textValue, input) => {
      if (input !== this._invalidInput) input.value = textValue;
      input.disabled = disabled;
      input.readOnly = readOnly;
      input.setAttribute("aria-invalid", String(invalid && (this._invalidInput ? input === this._invalidInput : true)));
    });

    this._swatches.setAttribute("aria-invalid", String(invalid));
    const describedControls = [
      this._saturation,
      this._brightness,
      this._wheel,
      this._hue,
      this._alpha,
      this._hex,
      this._rgb,
      this._hsl,
      this._swatches,
    ];
    describedControls.forEach((control) => {
      if (errorMessage) control.setAttribute("aria-describedby", this._error.id);
      else control.removeAttribute("aria-describedby");
    });
    this._error.textContent = errorMessage;
    this._error.hidden = !errorMessage;
    this._updateSwatchState(disabled, readOnly);
  }

  _parseSwatches(value) {
    const authored = String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
    const source = authored.length ? authored.map((color) => ({ value: color, label: color })) : DEFAULT_SWATCHES;
    return source.flatMap((item) => {
      const parsed = parseColor(item.value);
      return parsed ? [{ value: rgbaToHex(parsed), label: String(item.label || rgbaToHex(parsed)) }] : [];
    });
  }

  _renderSwatches() {
    if (!this._swatches) return;
    this._swatches.replaceChildren();
    this._swatchData.forEach((swatch, index) => {
      if (index % 4 === 0) {
        const row = this.ownerDocument.createElement("div");
        row.className = "uif-color-picker-swatch-row";
        row.setAttribute("role", "row");
        this._swatches.append(row);
      }
      const button = this.ownerDocument.createElement("button");
      button.className = "uif-color-picker-swatch";
      button.type = "button";
      button.setAttribute("role", "gridcell");
      button.dataset.index = String(index);
      button.style.setProperty("--uif-color-picker-swatch-color", rgbaToCss(parseColor(swatch.value)));
      button.addEventListener("click", () => {
        if (this._isInteractionBlocked()) return;
        this._setColor(parseColor(swatch.value), "input");
        this._emit("change");
      });
      button.addEventListener("keydown", (event) => this._handleSwatchKeydown(event, index));
      this._swatches.lastElementChild.append(button);
    });
    this._updateSwatchState(this.getBool("disabled"), this.getBool("readonly"));
  }

  _updateSwatchState(disabled, readOnly) {
    if (!this._swatches) return;
    const current = rgbaToHex(this._color);
    const buttons = Array.from(this._swatches.querySelectorAll(".uif-color-picker-swatch"));
    let selectedIndex = this._swatchData.findIndex((swatch) => swatch.value === current);
    if (selectedIndex < 0) selectedIndex = 0;
    buttons.forEach((button, index) => {
      const swatch = this._swatchData[index];
      const selected = swatch.value === current;
      button.disabled = disabled;
      button.tabIndex = index === selectedIndex ? 0 : -1;
      button.setAttribute("aria-selected", String(selected));
      button.setAttribute("aria-readonly", String(readOnly));
      button.setAttribute("aria-label", `${swatch.label}, ${swatch.value}${selected ? ", selected" : ""}`);
    });
  }

  _handleSwatchKeydown(event, index) {
    const buttons = Array.from(this._swatches.querySelectorAll(".uif-color-picker-swatch"));
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + buttons.length) % buttons.length;
    else if (event.key === "ArrowDown") next = Math.min(index + 4, buttons.length - 1);
    else if (event.key === "ArrowUp") next = Math.max(index - 4, 0);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = buttons.length - 1;
    else return;
    event.preventDefault();
    buttons.forEach((button, buttonIndex) => { button.tabIndex = buttonIndex === next ? 0 : -1; });
    buttons[next]?.focus();
  }

  _isInteractionBlocked() {
    return this.getBool("disabled") || this.getBool("readonly");
  }

  _resetFormValue() {
    this._setHsva(this._defaultHsva);
    this._hidden.value = rgbaToHex(this._defaultColor);
  }

  get value() {
    return rgbaToHex(this._color || DEFAULT_COLOR);
  }

  set value(value) {
    const nextValue = String(value ?? "");
    if (this._initialized) this._applyValue(nextValue);
    else this.setAttribute("value", nextValue);
  }

  get color() {
    return { ...(this._color || DEFAULT_COLOR) };
  }

  get swatches() {
    return this._swatchData?.map((swatch) => ({ ...swatch })) || [];
  }

  set swatches(swatches) {
    this._swatchData = Array.from(swatches || []).flatMap((item) => {
      const parsed = parseColor(item?.value);
      return parsed ? [{ value: rgbaToHex(parsed), label: String(item?.label || rgbaToHex(parsed)) }] : [];
    });
    this._renderSwatches();
    this._renderState();
  }
}

define("uif-color-picker", UIColorPicker);
export { UIColorPicker };
export * from "./color-conversion.js";
