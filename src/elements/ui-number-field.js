import { UIElement, define } from "./base.js";

let nextNumberFieldId = 0;

function finiteNumber(value, fallback = null) {
  if (value === null || String(value).trim() === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function positiveStep(value) {
  const number = finiteNumber(value);
  return number !== null && number > 0 ? number : 1;
}

function normalizeLocale(locale) {
  const value = locale.trim();
  return /^[A-Za-z]{2,3}(?:-[A-Za-z]{4})?(?:-(?:[A-Za-z]{2}|[0-9]{3}))?$/.test(value) ? value : "en";
}

function formatNumberFieldValue(value, format, currency, locale) {
  if (!Number.isFinite(value)) return "No value";
  const resolvedLocale = normalizeLocale(locale);
  const currencyValue = currency.trim().toUpperCase();
  const resolvedCurrency = /^[A-Z]{3}$/.test(currencyValue) ? currencyValue : "EUR";
  if (format === "currency") {
    return new Intl.NumberFormat(resolvedLocale, {
      style: "currency",
      currency: resolvedCurrency,
    }).format(value);
  }
  if (format === "percent") {
    return new Intl.NumberFormat(resolvedLocale, { style: "percent" }).format(value / 100);
  }
  return new Intl.NumberFormat(resolvedLocale).format(value);
}

/** A labelled native number input with clamped step controls and formatted output. */
class UINumberField extends UIElement {
  static get observedAttributes() {
    return [
      "label", "name", "value", "min", "max", "step", "disabled", "readonly",
      "invalid", "error", "format", "currency", "locale",
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this._reflectingValue && name === "value") return;
    super.attributeChangedCallback(name, oldValue, newValue);
  }

  render() {
    const baseId = this.id || `uif-number-field-${++nextNumberFieldId}`;
    const inputId = `${baseId}-input`;
    const outputId = `${baseId}-formatted`;
    const errorId = `${baseId}-error`;
    const label = this.getAttr("label").trim() || "Number";
    const valueAttribute = this.getAttribute("value");
    const value = valueAttribute === null ? 0 : finiteNumber(valueAttribute);
    const min = finiteNumber(this.getAttribute("min"));
    const max = finiteNumber(this.getAttribute("max"));
    const step = positiveStep(this.getAttribute("step"));
    const disabled = this.getBool("disabled");
    const readonly = this.getBool("readonly");
    const invalid = this.getBool("invalid");

    const field = this.ownerDocument.createElement("div");
    field.className = "uif-number-field";
    field.toggleAttribute("data-invalid", invalid);

    const labelElement = this.ownerDocument.createElement("label");
    labelElement.className = "uif-number-field-label";
    labelElement.htmlFor = inputId;
    labelElement.textContent = label;

    const control = this.ownerDocument.createElement("div");
    control.className = "uif-number-field-control";

    const input = this.ownerDocument.createElement("input");
    input.className = "uif-number-field-input";
    input.id = inputId;
    input.type = "number";
    input.name = this.getAttr("name");
    input.value = value === null ? "" : String(value);
    if (min !== null) input.min = String(min);
    if (max !== null) input.max = String(max);
    input.step = String(step);
    input.disabled = disabled;
    input.readOnly = readonly;
    if (invalid) input.setAttribute("aria-invalid", "true");

    const output = this.ownerDocument.createElement("output");
    output.className = "uif-number-field-formatted";
    output.id = outputId;
    output.htmlFor = inputId;

    const makeButton = (direction) => {
      const button = this.ownerDocument.createElement("button");
      button.className = `uif-number-field-step uif-number-field-step-${direction}`;
      button.type = "button";
      button.disabled = disabled || readonly;
      button.setAttribute("aria-label", `${direction === "down" ? "Decrease" : "Increase"} ${label}`);
      const icon = this.ownerDocument.createElement("span");
      icon.className = "uif-icon";
      icon.style.setProperty("--uif-icon-src", `url('/assets/icons/${direction === "down" ? "minus" : "plus"}-circled.svg')`);
      icon.setAttribute("aria-hidden", "true");
      button.append(icon);
      button.addEventListener("click", () => this._step(direction));
      return button;
    };

    const down = makeButton("down");
    const up = makeButton("up");
    control.append(down, input, up);
    field.append(labelElement, control, output);

    const error = this.getAttr("error").trim();
    if (error) {
      const errorElement = this.ownerDocument.createElement("p");
      errorElement.className = "uif-number-field-error";
      errorElement.id = errorId;
      errorElement.textContent = error;
      input.setAttribute("aria-describedby", `${outputId} ${errorId}`);
      field.append(errorElement);
    } else {
      input.setAttribute("aria-describedby", outputId);
    }

    const syncInput = () => {
      this._reflectValue(input.value);
      this._syncFormatted();
    };
    input.addEventListener("input", syncInput);
    input.addEventListener("change", syncInput);
    this.replaceChildren(field);
    this._input = input;
    this._output = output;
    this._syncFormatted();
  }

  _reflectValue(value) {
    if (this.getAttribute("value") === value) return;
    this._reflectingValue = true;
    this.setAttribute("value", value);
    this._reflectingValue = false;
  }

  _format(value) {
    return formatNumberFieldValue(
      value,
      this.getAttr("format", "decimal"),
      this.getAttr("currency", "EUR"),
      this.getAttr("locale", "en"),
    );
  }

  _syncFormatted() {
    if (!this._input || !this._output) return;
    const value = this._input.valueAsNumber;
    const formatted = this._format(value);
    this._output.value = formatted;
    this._output.textContent = formatted;
    this._input.setAttribute("aria-valuetext", formatted);
  }

  _step(direction) {
    if (!this._input || this._input.disabled || this._input.readOnly) return;
    const min = this._input.min === "" ? -Infinity : finiteNumber(this._input.min, -Infinity);
    const max = this._input.max === "" ? Infinity : finiteNumber(this._input.max, Infinity);
    if (this._input.value === "") {
      this._input.value = String(Number.isFinite(min) ? min : 0);
    } else if (direction === "down") {
      this._input.stepDown();
    } else {
      this._input.stepUp();
    }
    const value = this._input.valueAsNumber;
    if (Number.isFinite(value)) this._input.value = String(Math.min(max, Math.max(min, value)));
    this._syncFormatted();
    this._input.dispatchEvent(new Event("input", { bubbles: true }));
    this._input.dispatchEvent(new Event("change", { bubbles: true }));
    this.dispatchEvent(new CustomEvent("uif-change", {
      bubbles: true,
      detail: { value: this._input.valueAsNumber },
    }));
  }

  get valueAsNumber() {
    return this._input?.valueAsNumber ?? Number.NaN;
  }
}

define("uif-number-field", UINumberField);
export { UINumberField };
