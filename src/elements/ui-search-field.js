import { UIElement, define } from "./base.js";

let nextSearchFieldId = 0;

/** A labelled native search field with clear and search events. */
class UISearchField extends UIElement {
  static get observedAttributes() {
    return ["label", "name", "value", "placeholder", "disabled", "quiet", "clear-label"];
  }

  render() {
    const inputId = `${this.id || `uif-search-field-${++nextSearchFieldId}`}-input`;
    const label = this.getAttr("label").trim() || "Search";
    const input = this.ownerDocument.createElement("input");
    input.className = "uif-search-field-input";
    input.id = inputId;
    input.type = "search";
    input.name = this.getAttr("name");
    input.value = this.getAttr("value");
    input.placeholder = this.getAttr("placeholder");
    input.disabled = this.getBool("disabled");

    const field = this.ownerDocument.createElement("div");
    field.className = "uif-search-field";
    field.toggleAttribute("data-quiet", this.getBool("quiet"));

    const labelElement = this.ownerDocument.createElement("label");
    labelElement.className = "uif-search-field-label";
    labelElement.htmlFor = inputId;
    labelElement.textContent = label;

    const control = this.ownerDocument.createElement("div");
    control.className = "uif-search-field-control";

    const icon = this.ownerDocument.createElement("span");
    icon.className = "uif-icon uif-search-field-icon";
    icon.style.setProperty("--uif-icon-src", "url('/assets/icons/search.svg')");
    icon.setAttribute("aria-hidden", "true");

    const clear = this.ownerDocument.createElement("button");
    clear.className = "uif-search-field-clear";
    clear.type = "button";
    clear.setAttribute("aria-label", this.getAttr("clear-label").trim() || `Clear ${label}`);
    const clearIcon = this.ownerDocument.createElement("span");
    clearIcon.className = "uif-icon";
    clearIcon.style.setProperty("--uif-icon-src", "url('/assets/icons/cross-circled.svg')");
    clearIcon.setAttribute("aria-hidden", "true");
    clear.append(clearIcon);

    const syncClear = () => {
      clear.disabled = input.disabled || input.value.length === 0;
    };
    input.addEventListener("input", syncClear);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") this._emitSearch(input.value);
    });
    clear.addEventListener("click", () => {
      if (clear.disabled) return;
      input.value = "";
      syncClear();
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.focus();
    });

    control.append(icon, input, clear);
    field.append(labelElement, control);
    this.replaceChildren(field);
    syncClear();
    this._input = input;
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
