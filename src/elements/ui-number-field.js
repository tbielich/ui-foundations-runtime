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

    if (!this._input || !this.contains(this._input)) {
      const field = this.ownerDocument.createElement("div");
      field.className = "uif-number-field";

      const labelElement = this.ownerDocument.createElement("label");
      labelElement.className = "uif-number-field-label";

      const control = this.ownerDocument.createElement("div");
      control.className = "uif-number-field-control";

      const input = this.ownerDocument.createElement("input");
      input.className = "uif-number-field-input";
      input.type = "number";
      const syncInput = () => {
        this._reflectValue(input.value);
        this._syncFormatted();
      };
      input.addEventListener("input", syncInput);
      input.addEventListener("change", syncInput);

      const makeButton = (direction) => {
        const button = this.ownerDocument.createElement("button");
        button.className = `uif-number-field-step uif-number-field-step-${direction}`;
        button.type = "button";
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
      const output = this.ownerDocument.createElement("span");
      output.className = "uif-number-field-formatted";
      const errorElement = this.ownerDocument.createElement("p");
      errorElement.className = "uif-number-field-error";

      control.append(down, input, up);
      field.append(labelElement, control, output);
      this.replaceChildren(field);
      this._field = field;
      this._label = labelElement;
      this._input = input;
      this._down = down;
      this._up = up;
      this._output = output;
      this._error = errorElement;
    }

    this._field.toggleAttribute("data-invalid", invalid);
    this._label.htmlFor = inputId;
    this._label.textContent = label;
    this._input.id = inputId;
    this._input.name = this.getAttr("name");
    const normalizedValue = value === null ? "" : String(value);
    if (this._input.value !== normalizedValue) this._input.value = normalizedValue;
    if (min === null) this._input.removeAttribute("min");
    else this._input.min = String(min);
    if (max === null) this._input.removeAttribute("max");
    else this._input.max = String(max);
    this._input.step = String(step);
    this._input.disabled = disabled;
    this._input.readOnly = readonly;
    if (invalid) this._input.setAttribute("aria-invalid", "true");
    else this._input.removeAttribute("aria-invalid");
    this._down.disabled = disabled || readonly;
    this._up.disabled = disabled || readonly;
    this._down.setAttribute("aria-label", `Decrease ${label}`);
    this._up.setAttribute("aria-label", `Increase ${label}`);
    this._output.id = outputId;

    const error = this.getAttr("error").trim();
    if (error) {
      this._error.id = errorId;
      this._error.textContent = error;
      this._field.append(this._error);
      this._input.setAttribute("aria-describedby", errorId);
    } else {
      this._error.remove();
      this._input.removeAttribute("aria-describedby");
    }
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
