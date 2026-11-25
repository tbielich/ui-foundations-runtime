import { UIElement, define } from "./base.js";
import { connectFormReset, disconnectFormReset } from "./form-reset.js";

let nextDropZoneId = 0;

/** A native file-input enhancement with optional drag-and-drop. */
class UIDropZone extends UIElement {
  static get observedAttributes() {
    return [
      "label", "description", "button-label", "name", "accept", "multiple",
      "disabled", "invalid", "error", "loading", "loading-message",
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    connectFormReset(this, this._input?.form, () => this._resetFormValue());
  }

  disconnectedCallback() {
    disconnectFormReset(this);
  }

  render() {
    if (!this._input || !this.contains(this._input)) this._createStructure();

    const label = this.getAttr("label").trim() || "Choose files";
    const description = this.getAttr("description").trim()
      || "Choose files with the button or drag and drop them here.";
    const buttonLabel = this.getAttr("button-label").trim() || "Choose files";
    const loading = this.getBool("loading");
    const disabled = this.getBool("disabled");
    const blocked = disabled || loading;
    const attributeError = this.getAttr("error").trim();
    const error = attributeError || this._validationError
      || (this.getBool("invalid") ? "Choose supported files." : "");
    const status = loading
      ? (this.getAttr("loading-message").trim() || "Processing files…")
      : error || this._selectionStatus;

    this._label.textContent = label;
    this._description.textContent = description;
    this._button.textContent = buttonLabel;
    const normalizedLabel = label.replace(/\s+/g, " ").toLowerCase();
    const normalizedButtonLabel = buttonLabel.replace(/\s+/g, " ").toLowerCase();
    const labelledBy = normalizedLabel === normalizedButtonLabel
      ? this._label.id
      : `${this._label.id} ${this._button.id}`;
    this._input.setAttribute("aria-labelledby", labelledBy);
    this._input.name = this.getAttr("name");
    this._input.accept = this.getAttr("accept");
    this._input.multiple = this.getBool("multiple");
    this._input.disabled = blocked;
    this._input.setAttribute("aria-invalid", String(Boolean(error)));
    this._target.setAttribute("aria-busy", String(loading));
    this._target.setAttribute("aria-disabled", String(blocked));
    this._target.toggleAttribute("data-disabled", blocked);
    this._target.toggleAttribute("data-loading", loading);
    this._target.toggleAttribute("data-invalid", Boolean(error));
    this._field.toggleAttribute("data-filled", this._selectedFiles.length > 0);
    this.toggleAttribute("data-filled", this._selectedFiles.length > 0);
    this._field.toggleAttribute("data-disabled", blocked);
    this._field.toggleAttribute("data-invalid", Boolean(error));
    if (blocked) this._resetDragState();

    this._input.setAttribute("aria-describedby", `${this._description.id} ${this._status.id}`);
    this._status.textContent = status;
    this._status.toggleAttribute("data-error", Boolean(error) && !loading);
    this._renderFiles();
  }

  _createStructure() {
    const baseId = this.id || `uif-drop-zone-${++nextDropZoneId}`;

    const field = this.ownerDocument.createElement("div");
    field.className = "uif-drop-zone";

    const label = this.ownerDocument.createElement("p");
    label.className = "uif-drop-zone-label";
    label.id = `${baseId}-label`;

    const description = this.ownerDocument.createElement("p");
    description.className = "uif-drop-zone-description";
    description.id = `${baseId}-description`;

    const target = this.ownerDocument.createElement("div");
    target.className = "uif-drop-zone-target";
    target.setAttribute("role", "group");
    target.setAttribute("aria-labelledby", label.id);
    target.setAttribute("aria-describedby", description.id);

    const input = this.ownerDocument.createElement("input");
    input.className = "uif-drop-zone-input";
    input.id = `${baseId}-input`;
    input.type = "file";
    input.setAttribute("aria-labelledby", label.id);

    const button = this.ownerDocument.createElement("label");
    button.className = "uif-button outline uif-drop-zone-button";
    button.id = `${baseId}-button-label`;
    button.htmlFor = input.id;

    const hint = this.ownerDocument.createElement("span");
    hint.className = "uif-drop-zone-hint";
    hint.textContent = "or drag and drop files here";
    hint.setAttribute("aria-hidden", "true");

    const files = this.ownerDocument.createElement("ul");
    files.className = "uif-drop-zone-files";
    files.setAttribute("aria-label", "Selected files");
    files.hidden = true;

    const status = this.ownerDocument.createElement("p");
    status.className = "uif-drop-zone-status";
    status.id = `${baseId}-status`;
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");

    input.addEventListener("change", () => {
      if (!this._dispatchingDropChange) this._applyFiles(input.files, "picker");
    });
    target.addEventListener("dragenter", (event) => this._handleDragEnter(event));
    target.addEventListener("dragover", (event) => this._handleDragOver(event));
    target.addEventListener("dragleave", (event) => this._handleDragLeave(event));
    target.addEventListener("drop", (event) => this._handleDrop(event));

    target.append(input, button, hint);
    field.append(label, description, target, files, status);
    this.replaceChildren(field);

    this._field = field;
    this._label = label;
    this._description = description;
    this._target = target;
    this._input = input;
    this._button = button;
    this._files = files;
    this._status = status;
    this._selectedFiles = [];
    this._selectionStatus = "";
    this._validationError = "";
    this._dragDepth = 0;
  }

  _applyFiles(fileList, source) {
    if (this._isBlocked()) return;
    const { accepted, errors } = this._validateFiles(fileList);
    this._selectedFiles = accepted;
    this._validationError = errors.join(" ");
    this._selectionStatus = accepted.length
      ? `${accepted.length} file${accepted.length === 1 ? "" : "s"} selected.`
      : "";
    this._replaceInputFiles(accepted);
    this.render();

    if (source === "drop") {
      this._dispatchingDropChange = true;
      this._input.dispatchEvent(new Event("change", { bubbles: true }));
      this._dispatchingDropChange = false;
    }
    if (accepted.length) {
      this.dispatchEvent(new CustomEvent("uif-files-selected", {
        bubbles: true,
        detail: { files: accepted.slice(), source },
      }));
    }
  }

  _validateFiles(fileList) {
    const files = Array.from(fileList || []);
    const accepted = [];
    const errors = [];
    const acceptsMultiple = this.getBool("multiple");
    const accept = this.getAttr("accept").trim();

    files.forEach((file) => {
      if (!this._matchesAccept(file, accept)) {
        errors.push(`“${file.name}” is not an accepted file type${accept ? ` (${accept})` : ""}.`);
      } else if (!acceptsMultiple && accepted.length > 0) {
        errors.push(`“${file.name}” was not added because only one file is allowed.`);
      } else {
        accepted.push(file);
      }
    });
    return { accepted, errors };
  }

  _matchesAccept(file, accept) {
    if (!accept) return true;
    const fileName = file.name.toLocaleLowerCase();
    const mime = file.type.toLocaleLowerCase();
    return accept.split(",").some((rawRule) => {
      const rule = rawRule.trim().toLocaleLowerCase();
      if (!rule) return false;
      if (rule.startsWith(".")) return fileName.endsWith(rule);
      if (rule.endsWith("/*")) return mime.startsWith(rule.slice(0, -1));
      return mime === rule;
    });
  }

  _replaceInputFiles(files) {
    if (typeof DataTransfer === "undefined") {
      if (!files.length) this._input.value = "";
      return;
    }
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    this._input.files = transfer.files;
  }

  _renderFiles() {
    this._files.replaceChildren();
    this._selectedFiles.forEach((file) => {
      const item = this.ownerDocument.createElement("li");
      item.className = "uif-drop-zone-file";
      item.textContent = file.name;
      this._files.append(item);
    });
    this._files.hidden = this._selectedFiles.length === 0;
  }

  _handleDragEnter(event) {
    if (this._isBlocked() || !this._hasDraggedFiles(event)) return;
    event.preventDefault();
    this._dragDepth += 1;
    this._target.setAttribute("data-drag-active", "");
  }

  _handleDragOver(event) {
    if (this._isBlocked() || !this._hasDraggedFiles(event)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  }

  _handleDragLeave() {
    this._dragDepth = Math.max(0, this._dragDepth - 1);
    if (this._dragDepth === 0) this._target.removeAttribute("data-drag-active");
  }

  _handleDrop(event) {
    if (this._isBlocked() || !this._hasDraggedFiles(event)) return;
    event.preventDefault();
    this._resetDragState();
    this._applyFiles(event.dataTransfer?.files, "drop");
  }

  _hasDraggedFiles(event) {
    return Array.from(event.dataTransfer?.types || []).includes("Files");
  }

  _isBlocked() {
    return this.getBool("disabled") || this.getBool("loading");
  }

  _resetDragState() {
    this._dragDepth = 0;
    this._target?.removeAttribute("data-drag-active");
  }

  _resetFormValue() {
    const hadSelectionState = this._selectedFiles.length > 0
      || Boolean(this._selectionStatus) || Boolean(this._validationError);
    this._selectedFiles = [];
    this._validationError = "";
    this._selectionStatus = hadSelectionState ? "File selection cleared." : "";
    this._resetDragState();
    this.render();
  }

  get files() {
    return this._selectedFiles.slice();
  }
}

define("uif-drop-zone", UIDropZone);
export { UIDropZone };
