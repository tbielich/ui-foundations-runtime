import { UIElement, define } from "./base.js";

let nextSegmentedControlId = 0;

/** A labelled native radio group presented as connected segments. */
class UISegmentedControl extends UIElement {
  static get observedAttributes() {
    return ["label", "name", "value", "size", "disabled"];
  }

  connectedCallback() {
    if (!this._options) {
      this._options = [...this.querySelectorAll(":scope > [data-value]")].map((option) => ({
        value: option.getAttribute("data-value") || option.textContent.trim(),
        label: option.getAttribute("data-label") || option.textContent.trim(),
        icon: option.getAttribute("data-icon") || "",
        disabled: option.hasAttribute("data-disabled"),
      }));
    }
    super.connectedCallback();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this._reflectingValue && name === "value") return;
    super.attributeChangedCallback(name, oldValue, newValue);
  }

  render() {
    const baseId = this.id || `uif-segmented-control-${++nextSegmentedControlId}`;
    const label = this.getAttr("label").trim() || "Options";
    const name = this.getAttr("name").trim() || `${baseId}-option`;
    const selected = this.getAttr("value").trim() || this._options?.[0]?.value || "";
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
    for (const [index, option] of (this._options || []).entries()) {
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
      input.checked = option.value === selected;
      input.disabled = option.disabled;
      input.addEventListener("change", () => {
        if (!input.checked) return;
        this._reflectingValue = true;
        this.setAttribute("value", input.value);
        this._reflectingValue = false;
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
  }

  get value() {
    return this.querySelector("input:checked")?.value ?? "";
  }
}

define("uif-segmented-control", UISegmentedControl);
export { UISegmentedControl };
