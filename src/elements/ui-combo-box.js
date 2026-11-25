import { UIElement, define } from "./base.js";

let nextComboBoxId = 0;

/** Authored option content for <uif-combo-box>. */
class UIComboBoxOption extends UIElement {}

/** An editable ARIA combobox that keeps DOM focus on its text input. */
class UIComboBox extends UIElement {
  static get observedAttributes() {
    return [
      "label", "name", "value", "placeholder", "freeform", "loading",
      "disabled", "readonly", "invalid", "error", "empty-message",
      "loading-message", "error-message",
    ];
  }

  connectedCallback() {
    if (!this._optionData) this._optionData = this._readAuthoredOptions();
    super.connectedCallback();
    this.ownerDocument.addEventListener("pointerdown", this._handleOutsidePointer);
    window.addEventListener("resize", this._handleViewportChange);
    window.addEventListener("scroll", this._handleViewportChange, true);
    window.visualViewport?.addEventListener("resize", this._handleViewportChange);
    window.visualViewport?.addEventListener("scroll", this._handleViewportChange);
  }

  disconnectedCallback() {
    this.ownerDocument.removeEventListener("pointerdown", this._handleOutsidePointer);
    window.removeEventListener("resize", this._handleViewportChange);
    window.removeEventListener("scroll", this._handleViewportChange, true);
    window.visualViewport?.removeEventListener("resize", this._handleViewportChange);
    window.visualViewport?.removeEventListener("scroll", this._handleViewportChange);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "value" && this._reflectingValue) return;
    super.attributeChangedCallback(name, oldValue, newValue);
  }

  render() {
    if (!this._optionData) this._optionData = this._readAuthoredOptions();
    if (!this._input || !this.contains(this._input)) this._createStructure();

    const label = this.getAttr("label").trim() || "Choose an option";
    const disabled = this.getBool("disabled");
    const readOnly = this.getBool("readonly");
    const loading = this.getBool("loading");
    const error = this.getAttr("error").trim();
    const invalid = this.getBool("invalid") || Boolean(error);

    this._label.textContent = label;
    this._input.placeholder = this.getAttr("placeholder");
    this._input.disabled = disabled;
    this._input.readOnly = readOnly;
    this._input.setAttribute("aria-readonly", String(readOnly));
    this._input.setAttribute("aria-busy", String(loading));
    this._input.setAttribute("aria-invalid", String(invalid));
    this._toggle.disabled = disabled;
    this._hidden.name = this.getAttr("name");
    this._hidden.disabled = disabled;
    this._field.toggleAttribute("data-disabled", disabled);
    this._field.toggleAttribute("data-readonly", readOnly);
    this._field.toggleAttribute("data-invalid", invalid);
    this._field.toggleAttribute("data-loading", loading);
    this._listbox.setAttribute("aria-busy", String(loading));

    if (this._lastValueAttribute !== this.getAttr("value")) {
      this._lastValueAttribute = this.getAttr("value");
      this._selectedValue = this._lastValueAttribute;
      const selected = this._optionData.find((option) => option.value === this._selectedValue);
      this._query = selected?.textValue ?? "";
      this._input.value = this._query;
      this._hidden.value = this._selectedValue;
    }

    this._error.textContent = error;
    this._error.hidden = !error;
    if (error) this._input.setAttribute("aria-describedby", this._error.id);
    else this._input.removeAttribute("aria-describedby");

    if (disabled) this.close();
    this._renderOptions(false);
    this._announceStateChange(loading, error);
  }

  _createStructure() {
    const baseId = this.id || `uif-combo-box-${++nextComboBoxId}`;
    const inputId = `${baseId}-input`;
    const listboxId = `${baseId}-listbox`;

    const field = this.ownerDocument.createElement("div");
    field.className = "uif-combo-box";

    const label = this.ownerDocument.createElement("label");
    label.className = "uif-combo-box-label";
    label.htmlFor = inputId;

    const control = this.ownerDocument.createElement("div");
    control.className = "uif-combo-box-control";

    const input = this.ownerDocument.createElement("input");
    input.className = "uif-combo-box-input";
    input.id = inputId;
    input.type = "text";
    input.autocomplete = "off";
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", listboxId);

    const toggle = this.ownerDocument.createElement("button");
    toggle.className = "uif-combo-box-toggle";
    toggle.type = "button";
    toggle.tabIndex = -1;
    toggle.setAttribute("aria-label", "Show suggestions");
    toggle.setAttribute("aria-controls", listboxId);
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "▾";

    const hidden = this.ownerDocument.createElement("input");
    hidden.type = "hidden";

    const popup = this.ownerDocument.createElement("div");
    popup.className = "uif-combo-box-popup";
    popup.tabIndex = 0;
    popup.hidden = true;

    const listbox = this.ownerDocument.createElement("div");
    listbox.className = "uif-combo-box-listbox";
    listbox.id = listboxId;
    listbox.setAttribute("role", "listbox");

    const state = this.ownerDocument.createElement("p");
    state.className = "uif-combo-box-state";
    state.hidden = true;

    const error = this.ownerDocument.createElement("p");
    error.className = "uif-combo-box-error";
    error.id = `${baseId}-error`;
    error.hidden = true;

    const status = this.ownerDocument.createElement("span");
    status.className = "uif-combo-box-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");

    input.addEventListener("input", () => {
      if (this._committing) return;
      this._query = input.value;
      this._selectedValue = "";
      this._hidden.value = "";
      this._reflectValue("");
      this._activeKey = "";
      this._renderOptions(false);
      this.open();
    });
    input.addEventListener("change", (event) => {
      if (this._committing) return;
      event.stopPropagation();
      if (this.getBool("freeform") && !input.readOnly) this._commitFreeform();
      else this._restoreCommittedQuery();
    });
    input.addEventListener("keydown", (event) => this._handleKeydown(event));
    input.addEventListener("focus", () => {
      if (!input.disabled) this.open();
    });
    toggle.addEventListener("click", () => {
      const wasOpen = this._open;
      input.focus();
      if (wasOpen) this.close();
      else this.open();
    });

    control.append(input, toggle);
    popup.append(listbox, state);
    field.append(label, control, hidden, popup, error, status);
    this.replaceChildren(field);

    this._field = field;
    this._label = label;
    this._input = input;
    this._toggle = toggle;
    this._hidden = hidden;
    this._popup = popup;
    this._listbox = listbox;
    this._state = state;
    this._error = error;
    this._status = status;

    const initialValue = this.getAttr("value");
    const selected = this._optionData.find((option) => option.value === initialValue);
    this._selectedValue = initialValue;
    this._query = selected?.textValue ?? "";
    input.value = this._query;
    hidden.value = initialValue;
    input.defaultValue = this._query;
    hidden.defaultValue = initialValue;
    this._lastValueAttribute = initialValue;
  }

  _readAuthoredOptions() {
    return Array.from(this.children)
      .filter((element) => element.matches("uif-combo-box-option, [data-value]"))
      .map((element, index) => {
        const textValue = element.getAttribute("text-value")?.trim()
          || element.getAttribute("data-label")?.trim()
          || element.textContent.trim();
        const value = element.getAttribute("value")
          ?? element.getAttribute("data-value")
          ?? textValue;
        return {
          key: `${value}\u0000${index}`,
          value,
          textValue,
          disabled: element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true",
          content: Array.from(element.childNodes, (node) => node.cloneNode(true)),
        };
      });
  }

  _normalizeOptions(options) {
    return Array.from(options || [], (option, index) => {
      const value = String(option?.value ?? option?.textValue ?? option?.label ?? "");
      const textValue = String(option?.textValue ?? option?.label ?? value).trim();
      const content = [];
      if (option?.content instanceof Node) content.push(option.content.cloneNode(true));
      else content.push(this.ownerDocument.createTextNode(String(option?.content ?? option?.label ?? textValue)));
      return {
        key: `${value}\u0000${index}`,
        value,
        textValue,
        disabled: Boolean(option?.disabled),
        content,
      };
    });
  }

  _filteredOptions() {
    const query = this._query.trim().toLocaleLowerCase();
    if (!query) return this._optionData.map((option, sourceIndex) => ({ option, sourceIndex }));
    return this._optionData
      .map((option, sourceIndex) => ({ option, sourceIndex }))
      .filter(({ option }) => option.textValue.toLocaleLowerCase().includes(query));
  }

  _renderOptions(announce) {
    if (!this._listbox) return;
    const filtered = this._filteredOptions();
    const enabled = filtered.filter(({ option }) => !option.disabled);
    if (!enabled.some(({ option }) => option.key === this._activeKey)) {
      const selected = enabled.find(({ option }) => option.value === this._selectedValue);
      this._activeKey = selected?.option.key ?? "";
    }

    this._listbox.replaceChildren();
    filtered.forEach(({ option, sourceIndex }) => {
      const item = this.ownerDocument.createElement("div");
      item.className = "uif-combo-box-option";
      item.id = `${this._listbox.id}-option-${sourceIndex}`;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(option.value === this._selectedValue));
      item.setAttribute("aria-disabled", String(option.disabled));
      item.toggleAttribute("data-active", option.key === this._activeKey);
      item.dataset.value = option.value;
      option.content.forEach((node) => item.append(node.cloneNode(true)));
      item.addEventListener("pointerdown", (event) => event.preventDefault());
      item.addEventListener("click", () => {
        if (!option.disabled) this._select(option, false);
      });
      this._listbox.append(item);
    });

    const activeIndex = filtered.findIndex(({ option }) => option.key === this._activeKey);
    if (this._open && activeIndex >= 0) {
      this._input.setAttribute("aria-activedescendant", this._listbox.children[activeIndex].id);
    } else {
      this._input.removeAttribute("aria-activedescendant");
    }

    const loading = this.getBool("loading");
    const error = this.getAttr("error").trim();
    let stateMessage = "";
    if (loading) stateMessage = this.getAttr("loading-message").trim() || "Loading options…";
    else if (error && filtered.length === 0) stateMessage = this.getAttr("error-message").trim() || error;
    else if (filtered.length === 0) stateMessage = this.getAttr("empty-message").trim() || "No suggestions found.";
    this._state.textContent = stateMessage;
    this._state.hidden = !stateMessage;
    this._listbox.hidden = filtered.length === 0;

    if (announce && !loading) {
      this._announce(error || `${filtered.length} suggestion${filtered.length === 1 ? "" : "s"} available.`);
    }
    if (this._open) this._positionPopup();
  }

  _handleKeydown(event) {
    const enabled = this._filteredOptions().filter(({ option }) => !option.disabled);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      this.open();
      const current = enabled.findIndex(({ option }) => option.key === this._activeKey);
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const next = current < 0
        ? (delta > 0 ? 0 : enabled.length - 1)
        : (current + delta + enabled.length) % enabled.length;
      if (enabled[next]) this._setActive(enabled[next].option.key);
    } else if ((event.key === "Home" || event.key === "End") && this._open && enabled.length) {
      event.preventDefault();
      this._setActive(enabled[event.key === "Home" ? 0 : enabled.length - 1].option.key);
    } else if (event.key === "Enter") {
      if (!this._open) return;
      event.preventDefault();
      const active = enabled.find(({ option }) => option.key === this._activeKey)?.option;
      if (active) this._select(active, false);
      else if (this.getBool("freeform")) this._commitFreeform();
    } else if (event.key === "Escape" && this._open) {
      event.preventDefault();
      this.close();
    } else if (event.key === "Tab") {
      this.close();
    }
  }

  _setActive(key) {
    this._activeKey = key;
    this._renderOptions(false);
    const active = this._listbox.querySelector("[data-active]");
    active?.scrollIntoView({ block: "nearest" });
  }

  _select(option, freeform) {
    if (this._input.disabled || this._input.readOnly) return;
    this._selectedValue = option.value;
    this._query = option.textValue;
    this._input.value = option.textValue;
    this._hidden.value = option.value;
    this._activeKey = option.key;
    this._reflectValue(option.value);
    this._emitCommit({ value: option.value, textValue: option.textValue, freeform });
    this.close();
    this._input.focus();
  }

  _commitFreeform() {
    if (!this.getBool("freeform") || this._input.disabled || this._input.readOnly) return;
    const textValue = this._input.value.trim();
    this._selectedValue = textValue;
    this._query = textValue;
    this._hidden.value = textValue;
    this._reflectValue(textValue);
    this._emitCommit({ value: textValue, textValue, freeform: true });
    this.close();
  }

  _emitCommit(detail) {
    this._committing = true;
    this._input.dispatchEvent(new Event("input", { bubbles: true }));
    this._input.dispatchEvent(new Event("change", { bubbles: true }));
    this._committing = false;
    this.dispatchEvent(new CustomEvent("uif-selection", { bubbles: true, detail }));
  }

  _restoreCommittedQuery() {
    const selected = this._optionData.find((option) => option.value === this._selectedValue);
    this._query = selected?.textValue ?? "";
    this._input.value = this._query;
  }

  _reflectValue(value) {
    this._lastValueAttribute = value;
    if (this.getAttr("value") === value) return;
    this._reflectingValue = true;
    this.setAttribute("value", value);
    this._reflectingValue = false;
  }

  _announceStateChange(loading, error) {
    if (loading && !this._lastLoading) {
      this._announce(this.getAttr("loading-message").trim() || "Loading options.");
    } else if (!loading && this._lastLoading) {
      this._renderOptions(true);
    } else if (error && error !== this._lastError) {
      this._announce(this.getAttr("error-message").trim() || error);
    }
    this._lastLoading = loading;
    this._lastError = error;
  }

  _announce(message) {
    if (!this._status || this._status.textContent === message) return;
    this._status.textContent = "";
    requestAnimationFrame(() => {
      if (this._status) this._status.textContent = message;
    });
  }

  open() {
    if (!this._popup || this._input.disabled) return;
    this._open = true;
    this._popup.hidden = false;
    this._input.setAttribute("aria-expanded", "true");
    this._toggle.setAttribute("aria-expanded", "true");
    this._renderOptions(false);
    requestAnimationFrame(() => this._positionPopup());
  }

  close() {
    if (!this._popup) return;
    this._open = false;
    this._popup.hidden = true;
    this._input.setAttribute("aria-expanded", "false");
    this._toggle.setAttribute("aria-expanded", "false");
    this._input.removeAttribute("aria-activedescendant");
  }

  _positionPopup() {
    if (!this._open || this._popup.hidden) return;
    const rect = this._field.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const gap = 4;
    const margin = 8;
    const width = Math.min(Math.max(rect.width, 160), viewportWidth - margin * 2);
    const left = Math.min(Math.max(rect.left, margin), viewportWidth - width - margin);
    const below = viewportHeight - rect.bottom - gap - margin;
    const above = rect.top - gap - margin;
    const placeAbove = below < 160 && above > below;
    const available = Math.max(48, placeAbove ? above : below);
    const maxHeight = Math.min(256, available);
    const top = placeAbove ? Math.max(margin, rect.top - gap - maxHeight) : rect.bottom + gap;
    Object.assign(this._popup.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      maxHeight: `${maxHeight}px`,
    });
    this._popup.dataset.placement = placeAbove ? "top" : "bottom";
  }

  _handleOutsidePointer = (event) => {
    if (this._open && !this.contains(event.target)) this.close();
  };

  _handleViewportChange = () => {
    if (this._open) this._positionPopup();
  };

  get value() {
    return this._selectedValue ?? this.getAttr("value");
  }

  set value(value) {
    this.setAttribute("value", String(value ?? ""));
  }

  get query() {
    return this._input?.value ?? this._query ?? "";
  }

  get options() {
    return (this._optionData || []).map(({ value, textValue, disabled }) => ({ value, textValue, disabled }));
  }

  set options(options) {
    const activeValue = this._optionData?.find((option) => option.key === this._activeKey)?.value;
    this._optionData = this._normalizeOptions(options);
    const active = this._optionData.find((option) => option.value === activeValue && !option.disabled);
    this._activeKey = active?.key ?? "";
    const selected = this._optionData.find((option) => option.value === this._selectedValue);
    if (selected && !this._query) {
      this._query = selected.textValue;
      if (this._input) this._input.value = this._query;
    }
    this._renderOptions(true);
  }
}

define("uif-combo-box-option", UIComboBoxOption);
define("uif-combo-box", UIComboBox);
export { UIComboBox, UIComboBoxOption };
