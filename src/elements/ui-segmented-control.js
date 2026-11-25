import { UIElement, define } from "./base.js";
import { connectFormReset, disconnectFormReset } from "./form-reset.js";

let nextSegmentedControlId = 0;

function normalizeOptions(options) {
  if (!Array.isArray(options)) return [];
  return options.map((option) => ({
    value: String(option?.value ?? option?.label ?? ""),
    label: String(option?.label ?? option?.value ?? ""),
    icon: String(option?.icon ?? ""),
    disabled: Boolean(option?.disabled),
  }));
}

/** A labelled native radio group presented as connected segments. */
class UISegmentedControl extends UIElement {
  static get observedAttributes() {
    return ["label", "name", "value", "size", "disabled"];
  }

  connectedCallback() {
    if (!this._options) {
      this._options = normalizeOptions([...this.querySelectorAll(":scope > [data-value]")].map((option) => ({
        value: option.getAttribute("data-value") || option.textContent.trim(),
        label: option.getAttribute("data-label") || option.textContent.trim(),
        icon: option.getAttribute("data-icon") || "",
        disabled: option.hasAttribute("data-disabled"),
      })));
    }
    super.connectedCallback();
    connectFormReset(this, this.querySelector("input")?.form, () => {
      this._reflectValue(this.querySelector("input:checked")?.value ?? null);
    });
  }

  disconnectedCallback() {
    disconnectFormReset(this);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this._reflectingValue && name === "value") return;
    this._updatingDefaultValue = name === "value";
    super.attributeChangedCallback(name, oldValue, newValue);
    this._updatingDefaultValue = false;
  }

  render() {
    const baseId = this.id || `uif-segmented-control-${++nextSegmentedControlId}`;
    const label = this.getAttr("label").trim() || "Options";
    const name = this.getAttr("name").trim() || `${baseId}-option`;
    const requestedValue = this.getAttr("value").trim();
    const options = this._options || [];
    let selectedIndex = options.findIndex((option) => !option.disabled && option.value === requestedValue);
    if (selectedIndex < 0) selectedIndex = options.findIndex((option) => !option.disabled);
    if (!this._defaultValueInitialized || this._updatingDefaultValue) {
      this._defaultValue = selectedIndex < 0 ? null : options[selectedIndex].value;
      this._defaultValueInitialized = true;
    }
    let defaultIndex = options.findIndex((option) => !option.disabled && option.value === this._defaultValue);
    if (defaultIndex < 0) defaultIndex = options.findIndex((option) => !option.disabled);
    const size = ["sm", "lg"].includes(this.getAttr("size")) ? this.getAttr("size") : "md";
    const groupDisabled = this.getBool("disabled");

    const fieldset = this.ownerDocument.createElement("fieldset");
    fieldset.className = `uif-segmented-control ${size}`;
    fieldset.disabled = groupDisabled;

    const legend = this.ownerDocument.createElement("legend");
    legend.className = "uif-segmented-control-label";
    legend.textContent = label;
    fieldset.append(legend);

    const segments = this.ownerDocument.createElement("div");
    segments.className = "uif-segmented-control-options";
    for (const [index, option] of options.entries()) {
      const optionId = `${baseId}-option-${index}`;
      const wrapper = this.ownerDocument.createElement("label");
      wrapper.className = "uif-segmented-control-option";
      wrapper.htmlFor = optionId;

      const input = this.ownerDocument.createElement("input");
      input.className = "uif-segmented-control-input";
      input.id = optionId;
      input.type = "radio";
      input.name = name;
      input.value = option.value;
      input.checked = index === selectedIndex;
      input.defaultChecked = index === defaultIndex;
      input.disabled = option.disabled;
      input.addEventListener("change", () => {
        if (!input.checked) return;
        this._reflectValue(input.value);
        this.dispatchEvent(new CustomEvent("uif-change", {
          bubbles: true,
          detail: { value: input.value },
        }));
      });

      const content = this.ownerDocument.createElement("span");
      content.className = "uif-segmented-control-content";
      if (option.icon) {
        const icon = this.ownerDocument.createElement("span");
        icon.className = "uif-icon";
        icon.style.setProperty("--uif-icon-src", `url('/assets/icons/${option.icon}.svg')`);
        icon.setAttribute("aria-hidden", "true");
        content.append(icon);
      }
      const text = this.ownerDocument.createElement("span");
      text.textContent = option.label;
      content.append(text);
      wrapper.append(input, content);
      segments.append(wrapper);
    }

    fieldset.append(segments);
    this.replaceChildren(fieldset);
    this._reflectValue(selectedIndex < 0 ? null : options[selectedIndex].value);
  }

  _reflectValue(value) {
    this._reflectingValue = true;
    if (value === null) this.removeAttribute("value");
    else if (this.getAttribute("value") !== value) this.setAttribute("value", value);
    this._reflectingValue = false;
  }

  get options() {
    return (this._options || []).map((option) => ({ ...option }));
  }

  set options(options) {
    this._options = normalizeOptions(options);
    if (this._initialized) this.render();
  }

  get value() {
    return this.querySelector("input:checked")?.value ?? "";
  }
}

define("uif-segmented-control", UISegmentedControl);
export { UISegmentedControl };
