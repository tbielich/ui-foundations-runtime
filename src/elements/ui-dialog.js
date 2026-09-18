import { UIElement, define } from "./base.js";

let dialogCounter = 0;

class UIDialog extends UIElement {
  static get observedAttributes() {
    return [
      "open",
      "dismissible",
      "title",
      "description",
      "confirm-label",
      "cancel-label",
    ];
  }

  constructor() {
    super();
    dialogCounter += 1;
    this._uid = `uif-dialog-${dialogCounter}`;
    this._dialog = null;
    this._body = null;
    this._title = null;
    this._description = null;
    this._closeButton = null;
    this._cancelButton = null;
    this._confirmButton = null;
    this._invoker = null;

    this._handleCancel = this._handleCancel.bind(this);
    this._handleClick = this._handleClick.bind(this);
  }

  render() {
    if (!this._dialog) {
      this.#build();
    }
    this.#syncContent();
    this.#syncOpenState();
  }

  #build() {
    const consumerNodes = Array.from(this.childNodes);

    const dialog = document.createElement("dialog");
    dialog.className = "uif-dialog";

    const header = document.createElement("header");
    header.className = "uif-dialog-header";

    const title = document.createElement("h2");
    title.className = "uif-dialog-title";
    title.id = `${this._uid}-title`;
    header.append(title);

    const closeButton = document.createElement("button");
    closeButton.className = "uif-button ghost uif-dialog-close";
    closeButton.type = "button";
    closeButton.dataset.action = "dismiss";
    closeButton.setAttribute("aria-label", "Close dialog");
    closeButton.textContent = "×";
    header.append(closeButton);

    const body = document.createElement("div");
    body.className = "uif-dialog-body";

    const description = document.createElement("p");
    description.className = "uif-dialog-description";
    description.id = `${this._uid}-description`;
    body.append(description);
    for (const node of consumerNodes) body.append(node);

    const actions = document.createElement("footer");
    actions.className = "uif-dialog-actions";

    const cancelButton = document.createElement("button");
    cancelButton.className = "uif-button outline";
    cancelButton.type = "button";
    cancelButton.dataset.action = "cancel";
    actions.append(cancelButton);

    const confirmButton = document.createElement("button");
    confirmButton.className = "uif-button solid";
    confirmButton.type = "button";
    confirmButton.dataset.action = "confirm";
    actions.append(confirmButton);

    dialog.append(header, body, actions);
    dialog.setAttribute("aria-labelledby", title.id);
    dialog.addEventListener("cancel", this._handleCancel);
    dialog.addEventListener("click", this._handleClick);

    this.replaceChildren(dialog);

    this._dialog = dialog;
    this._body = body;
    this._title = title;
    this._description = description;
    this._closeButton = closeButton;
    this._cancelButton = cancelButton;
    this._confirmButton = confirmButton;
  }

  #isDismissible() {
    const value = this.getAttribute("dismissible");
    return value === null || value !== "false";
  }

  #syncContent() {
    const title = this.getAttr("title", "").trim();
    const description = this.getAttr("description", "").trim();
    const confirmLabel = this.getAttr("confirm-label", "Confirm");
    const cancelLabel = this.getAttr("cancel-label", "Cancel");
    const dismissible = this.#isDismissible();

    if (!title) {
      this.warnDev("<uif-dialog> requires a title for its accessible name.");
    }

    this._title.textContent = title || "Dialog";
    this._description.textContent = description;
    this._description.hidden = !description;

    if (description) {
      this._dialog.setAttribute("aria-describedby", this._description.id);
    } else {
      this._dialog.removeAttribute("aria-describedby");
    }

    this._closeButton.hidden = !dismissible;
    this._cancelButton.hidden = !dismissible;
    this._cancelButton.textContent = cancelLabel;
    this._confirmButton.textContent = confirmLabel;
  }

  #syncOpenState() {
    const shouldOpen = this.hasAttribute("open");

    if (shouldOpen && !this._dialog.open) {
      const active = document.activeElement;
      this._invoker =
        active && active !== document.body && !this.contains(active) ? active : null;
      this._dialog.showModal();
      return;
    }

    if (!shouldOpen && this._dialog.open) {
      this._dialog.close();
      this.#restoreFocus();
    }
  }

  #emit(name, detail = {}) {
    this.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
        composed: true,
        detail,
      }),
    );
  }

  #close(reason) {
    if (this._dialog.open) {
      this._dialog.close();
    }
    if (this.hasAttribute("open")) {
      this.removeAttribute("open");
    }
    this.#emit("uif-dialog-close", { reason });
    this.#restoreFocus();
  }

  #restoreFocus() {
    const invoker = this._invoker;
    this._invoker = null;
    if (
      invoker &&
      invoker.isConnected &&
      typeof invoker.focus === "function" &&
      !invoker.hasAttribute?.("disabled")
    ) {
      invoker.focus();
    }
  }

  _handleCancel(event) {
    event.preventDefault();

    if (!this.#isDismissible()) return;

    this.#emit("uif-dialog-cancel", { source: "escape" });
    this.#close("escape");
  }

  _handleClick(event) {
    const action = event.target.closest?.("[data-action]")?.dataset?.action;

    if (action === "dismiss" && this.#isDismissible()) {
      this.#close("dismiss");
      return;
    }

    if (action === "cancel" && this.#isDismissible()) {
      this.#emit("uif-dialog-cancel", { source: "action" });
      this.#close("cancel");
      return;
    }

    if (action === "confirm") {
      this.#emit("uif-dialog-confirm");
    }
  }
}

define("uif-dialog", UIDialog);

export { UIDialog };
