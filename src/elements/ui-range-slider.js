import { UIElement, define } from "./base.js";

let nextRangeSliderId = 0;

function numberAttribute(element, name, fallback) {
  const attribute = element.getAttribute(name);
  if (attribute === null || attribute.trim() === "") return fallback;
  const value = Number(attribute);
  return Number.isFinite(value) ? value : fallback;
}

/** Two labelled native range inputs constrained to a non-crossing interval. */
class UIRangeSlider extends UIElement {
  static get observedAttributes() {
    return [
      "label", "min-label", "max-label", "min", "max", "step", "lower", "upper",
      "lower-name", "upper-name", "disabled", "invalid", "error",
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this._reflectingValues && (name === "lower" || name === "upper")) return;
    super.attributeChangedCallback(name, oldValue, newValue);
  }

  render() {
    const baseId = this.id || `uif-range-slider-${++nextRangeSliderId}`;
    const min = numberAttribute(this, "min", 0);
    const max = Math.max(min, numberAttribute(this, "max", 100));
    const stepValue = numberAttribute(this, "step", 1);
    const step = stepValue > 0 ? stepValue : 1;
    const lower = Math.min(max, Math.max(min, numberAttribute(this, "lower", min)));
    const upper = Math.min(max, Math.max(lower, numberAttribute(this, "upper", max)));
    const disabled = this.getBool("disabled");
    const invalid = this.getBool("invalid");
    const label = this.getAttr("label").trim() || "Range";

    if (!this._lowerInput || !this.contains(this._lowerInput)) {
      const fieldset = this.ownerDocument.createElement("fieldset");
      fieldset.className = "uif-range-slider";

      const legend = this.ownerDocument.createElement("legend");
      legend.className = "uif-range-slider-label";
      fieldset.append(legend);

      const values = this.ownerDocument.createElement("div");
      values.className = "uif-range-slider-values";
      const createValue = (kind) => {
        const wrapper = this.ownerDocument.createElement("span");
        wrapper.className = "uif-range-slider-value";
        const labelElement = this.ownerDocument.createElement("label");
        const output = this.ownerDocument.createElement("span");
        output.className = `uif-range-slider-output uif-range-slider-output-${kind}`;
        wrapper.append(labelElement, output);
        values.append(wrapper);
        return { labelElement, output };
      };
      const lowerValue = createValue("lower");
      const upperValue = createValue("upper");
      fieldset.append(values);

      const track = this.ownerDocument.createElement("div");
      track.className = "uif-range-slider-track";
      const fill = this.ownerDocument.createElement("span");
      fill.className = "uif-range-slider-fill";
      fill.setAttribute("aria-hidden", "true");
      track.append(fill);

      const createInput = (kind) => {
        const input = this.ownerDocument.createElement("input");
        input.className = `uif-range-slider-input uif-range-slider-input-${kind}`;
        input.type = "range";
        const activate = () => { fieldset.dataset.activeThumb = kind; };
        input.addEventListener("focus", activate);
        input.addEventListener("pointerdown", activate);
        input.addEventListener("input", () => this._syncRange(input, true));
        input.addEventListener("change", () => this._syncRange(input, true));
        return input;
      };
      const lowerInput = createInput("lower");
      const upperInput = createInput("upper");
      track.append(lowerInput, upperInput);
      fieldset.append(track);

      const errorElement = this.ownerDocument.createElement("p");
      errorElement.className = "uif-range-slider-error";
      this.replaceChildren(fieldset);
      this._fieldset = fieldset;
      this._legend = legend;
      this._lowerLabel = lowerValue.labelElement;
      this._upperLabel = upperValue.labelElement;
      this._lowerOutput = lowerValue.output;
      this._upperOutput = upperValue.output;
      this._lowerInput = lowerInput;
      this._upperInput = upperInput;
      this._error = errorElement;
      fieldset.dataset.activeThumb = lower === upper && lower === max ? "lower" : "upper";
    }

    this._rangeMin = min;
    this._rangeMax = max;
    if (this._fieldset.disabled !== disabled) this._fieldset.disabled = disabled;
    this._fieldset.toggleAttribute("data-invalid", invalid);
    this._legend.textContent = label;

    const lowerId = `${baseId}-lower`;
    const upperId = `${baseId}-upper`;
    const lowerLabel = this.getAttr("min-label").trim() || "Minimum";
    const upperLabel = this.getAttr("max-label").trim() || "Maximum";
    this._lowerLabel.htmlFor = lowerId;
    this._lowerLabel.textContent = lowerLabel;
    this._upperLabel.htmlFor = upperId;
    this._upperLabel.textContent = upperLabel;

    this._lowerInput.id = lowerId;
    this._lowerInput.name = this.getAttr("lower-name", "min");
    this._upperInput.id = upperId;
    this._upperInput.name = this.getAttr("upper-name", "max");
    this._lowerInput.min = String(min);
    this._lowerInput.max = String(upper);
    this._upperInput.min = String(lower);
    this._upperInput.max = String(max);
    this._lowerInput.step = String(step);
    this._upperInput.step = String(step);
    if (this._lowerInput.value !== String(lower)) this._lowerInput.value = String(lower);
    if (this._upperInput.value !== String(upper)) this._upperInput.value = String(upper);
    if (invalid) {
      this._lowerInput.setAttribute("aria-invalid", "true");
      this._upperInput.setAttribute("aria-invalid", "true");
    } else {
      this._lowerInput.removeAttribute("aria-invalid");
      this._upperInput.removeAttribute("aria-invalid");
    }

    const error = this.getAttr("error").trim();
    if (error) {
      this._error.id = `${baseId}-error`;
      this._error.textContent = error;
      this._fieldset.append(this._error);
      this._lowerInput.setAttribute("aria-describedby", this._error.id);
      this._upperInput.setAttribute("aria-describedby", this._error.id);
    } else {
      this._error.remove();
      this._lowerInput.removeAttribute("aria-describedby");
      this._upperInput.removeAttribute("aria-describedby");
    }
    this._syncRange(null, false);
  }

  _syncRange(source, emit) {
    const lowerInput = this._lowerInput;
    const upperInput = this._upperInput;
    if (!lowerInput || !upperInput) return;
    let nextLower = Number(lowerInput.value);
    let nextUpper = Number(upperInput.value);
    if (source === lowerInput && nextLower > nextUpper) nextLower = nextUpper;
    if (source === upperInput && nextUpper < nextLower) nextUpper = nextLower;
    lowerInput.value = String(nextLower);
    upperInput.value = String(nextUpper);
    lowerInput.max = String(nextUpper);
    upperInput.min = String(nextLower);
    this._lowerOutput.textContent = String(nextLower);
    this._upperOutput.textContent = String(nextUpper);
    lowerInput.setAttribute("aria-valuetext", `${this._lowerLabel.textContent}: ${nextLower}`);
    upperInput.setAttribute("aria-valuetext", `${this._upperLabel.textContent}: ${nextUpper}`);
    const span = this._rangeMax - this._rangeMin || 1;
    this._fieldset.style.setProperty("--uif-range-slider-lower", `${((nextLower - this._rangeMin) / span) * 100}%`);
    this._fieldset.style.setProperty("--uif-range-slider-upper", `${((nextUpper - this._rangeMin) / span) * 100}%`);
    if (emit) {
      this._reflectValues(nextLower, nextUpper);
      this.dispatchEvent(new CustomEvent("uif-change", {
        bubbles: true,
        detail: { lower: nextLower, upper: nextUpper },
      }));
    }
  }

  _reflectValues(lower, upper) {
    this._reflectingValues = true;
    if (this.getAttribute("lower") !== String(lower)) this.setAttribute("lower", String(lower));
    if (this.getAttribute("upper") !== String(upper)) this.setAttribute("upper", String(upper));
    this._reflectingValues = false;
  }

  get value() {
    return {
      lower: Number(this._lowerInput?.value),
      upper: Number(this._upperInput?.value),
    };
  }
}

define("uif-range-slider", UIRangeSlider);
export { UIRangeSlider };
