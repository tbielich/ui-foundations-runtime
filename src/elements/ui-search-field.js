import { UIElement, define } from "./base.js";

let nextSearchFieldId = 0;

/** A labelled native search field with clear and search events. */
class UISearchField extends UIElement {
  static get observedAttributes() {
    return ["label", "name", "value", "placeholder", "disabled", "quiet", "clear-label"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this._reflectingValue && name === "value") return;
    super.attributeChangedCallback(name, oldValue, newValue);
  }

  render() {
    const inputId = `${this.id || `uif-search-field-${++nextSearchFieldId}`}-input`;
    const label = this.getAttr("label").trim() || "Search";

    if (!this._input || !this.contains(this._input)) {
      const field = this.ownerDocument.createElement("div");
      field.className = "uif-search-field";

      const labelElement = this.ownerDocument.createElement("label");
      labelElement.className = "uif-search-field-label";

      const control = this.ownerDocument.createElement("div");
      control.className = "uif-search-field-control";

      const icon = this.ownerDocument.createElement("span");
      icon.className = "uif-icon uif-search-field-icon";
      icon.style.setProperty("--uif-icon-src", "url('/assets/icons/search.svg')");
      icon.setAttribute("aria-hidden", "true");

      const input = this.ownerDocument.createElement("input");
      input.className = "uif-search-field-input";
      input.type = "search";
      input.addEventListener("input", () => this._syncInput());
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") this._emitSearch(input.value);
      });

      const clear = this.ownerDocument.createElement("button");
      clear.className = "uif-search-field-clear";
      clear.type = "button";
      const clearIcon = this.ownerDocument.createElement("span");
      clearIcon.className = "uif-icon";
      clearIcon.style.setProperty("--uif-icon-src", "url('/assets/icons/cross-circled.svg')");
      clearIcon.setAttribute("aria-hidden", "true");
      clear.append(clearIcon);
      clear.addEventListener("click", () => {
        if (clear.disabled) return;
        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        input.focus();
      });

      control.append(icon, input, clear);
      field.append(labelElement, control);
      this.replaceChildren(field);
      this._field = field;
      this._label = labelElement;
      this._input = input;
      this._clear = clear;
    }

    this._field.toggleAttribute("data-quiet", this.getBool("quiet"));
    this._label.htmlFor = inputId;
    this._label.textContent = label;
    this._input.id = inputId;
    this._input.name = this.getAttr("name");
    const value = this.getAttr("value");
    if (this._input.value !== value) this._input.value = value;
    this._input.placeholder = this.getAttr("placeholder");
    this._input.disabled = this.getBool("disabled");
    this._clear.setAttribute("aria-label", this.getAttr("clear-label").trim() || `Clear ${label}`);
    this._syncInput();
  }

  _syncInput() {
    if (!this._input || !this._clear) return;
    this._clear.disabled = this._input.disabled || this._input.value.length === 0;
    this._reflectValue(this._input.value);
  }

  _reflectValue(value) {
    if (this.getAttribute("value") === value) return;
    this._reflectingValue = true;
    this.setAttribute("value", value);
    this._reflectingValue = false;
  }

  _emitSearch(query) {
    this.dispatchEvent(new CustomEvent("uif-search", {
      bubbles: true,
      detail: { query },
    }));
  }

  get value() {
    return this._input?.value ?? this.getAttr("value");
  }

  set value(value) {
    const normalized = String(value ?? "");
    if (this._input) {
      this._input.value = normalized;
      this._input.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      this.setAttribute("value", normalized);
    }
  }
}

define("uif-search-field", UISearchField);
export { UISearchField };
