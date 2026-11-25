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

    const fieldset = this.ownerDocument.createElement("fieldset");
    fieldset.className = "uif-range-slider";
    fieldset.disabled = disabled;
    fieldset.toggleAttribute("data-invalid", invalid);
    fieldset.dataset.activeThumb = lower === upper && lower === max ? "lower" : "upper";

    const legend = this.ownerDocument.createElement("legend");
    legend.className = "uif-range-slider-label";
    legend.textContent = label;
    fieldset.append(legend);

    const values = this.ownerDocument.createElement("div");
    values.className = "uif-range-slider-values";

    const createValue = (kind, value) => {
      const wrapper = this.ownerDocument.createElement("span");
      wrapper.className = "uif-range-slider-value";
      const labelElement = this.ownerDocument.createElement("label");
      labelElement.htmlFor = `${baseId}-${kind}`;
      labelElement.textContent = this.getAttr(`${kind === "lower" ? "min" : "max"}-label`).trim() || (kind === "lower" ? "Minimum" : "Maximum");
      const output = this.ownerDocument.createElement("output");
      output.className = `uif-range-slider-output uif-range-slider-output-${kind}`;
      output.htmlFor = `${baseId}-${kind}`;
      output.textContent = String(value);
      wrapper.append(labelElement, output);
      values.append(wrapper);
      return output;
    };

    const lowerOutput = createValue("lower", lower);
    const upperOutput = createValue("upper", upper);
    fieldset.append(values);

    const track = this.ownerDocument.createElement("div");
    track.className = "uif-range-slider-track";
    const fill = this.ownerDocument.createElement("span");
    fill.className = "uif-range-slider-fill";
    fill.setAttribute("aria-hidden", "true");
    track.append(fill);

    const createInput = (kind, value, name) => {
      const input = this.ownerDocument.createElement("input");
      input.className = `uif-range-slider-input uif-range-slider-input-${kind}`;
      input.id = `${baseId}-${kind}`;
      input.type = "range";
      input.name = name;
      input.min = String(min);
      input.max = String(max);
      input.step = String(step);
      input.value = String(value);
      if (invalid) input.setAttribute("aria-invalid", "true");
      return input;
    };

    const lowerInput = createInput("lower", lower, this.getAttr("lower-name", "min"));
    const upperInput = createInput("upper", upper, this.getAttr("upper-name", "max"));
    track.append(lowerInput, upperInput);
    fieldset.append(track);

    const error = this.getAttr("error").trim();
    if (error) {
      const errorElement = this.ownerDocument.createElement("p");
      errorElement.className = "uif-range-slider-error";
      errorElement.id = `${baseId}-error`;
      errorElement.textContent = error;
      lowerInput.setAttribute("aria-describedby", errorElement.id);
      upperInput.setAttribute("aria-describedby", errorElement.id);
      fieldset.append(errorElement);
    }

    const sync = (source, emit) => {
      let nextLower = Number(lowerInput.value);
      let nextUpper = Number(upperInput.value);
      if (source === lowerInput && nextLower > nextUpper) nextLower = nextUpper;
      if (source === upperInput && nextUpper < nextLower) nextUpper = nextLower;
      lowerInput.value = String(nextLower);
      upperInput.value = String(nextUpper);
      lowerInput.max = String(nextUpper);
      upperInput.min = String(nextLower);
      lowerOutput.value = String(nextLower);
      lowerOutput.textContent = String(nextLower);
      upperOutput.value = String(nextUpper);
      upperOutput.textContent = String(nextUpper);
      lowerInput.setAttribute("aria-valuetext", `${lowerOutput.previousElementSibling.textContent}: ${nextLower}`);
      upperInput.setAttribute("aria-valuetext", `${upperOutput.previousElementSibling.textContent}: ${nextUpper}`);
      const span = max - min || 1;
      fieldset.style.setProperty("--uif-range-slider-lower", `${((nextLower - min) / span) * 100}%`);
      fieldset.style.setProperty("--uif-range-slider-upper", `${((nextUpper - min) / span) * 100}%`);
      if (emit) {
        this._reflectValues(nextLower, nextUpper);
        this.dispatchEvent(new CustomEvent("uif-change", {
          bubbles: true,
          detail: { lower: nextLower, upper: nextUpper },
        }));
      }
    };

    const inputs = [
      [lowerInput, "lower"],
      [upperInput, "upper"],
    ];
    for (const [input, kind] of inputs) {
      const activate = () => { fieldset.dataset.activeThumb = kind; };
      input.addEventListener("focus", activate);
      input.addEventListener("pointerdown", activate);
      input.addEventListener("input", () => sync(input, true));
      input.addEventListener("change", () => sync(input, true));
    }

    this.replaceChildren(fieldset);
    this._lowerInput = lowerInput;
    this._upperInput = upperInput;
    sync(null, false);
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
