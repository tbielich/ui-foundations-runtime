import { UIElement, define } from "./base.js";

const PLACEMENTS = new Set(["top", "bottom", "left", "right"]);
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");
let popoverSequence = 0;

function oppositePlacement(placement) {
  return { top: "bottom", bottom: "top", left: "right", right: "left" }[placement];
}

class UIPopover extends UIElement {
  static get observedAttributes() {
    return ["trigger", "placement", "label", "open"];
  }

  constructor() {
    super();
    this._panelId = `uif-popover-${++popoverSequence}`;
    this._panel = null;
    this._trigger = null;
    this._triggerAttributes = null;
    this._resizeObserver = null;
    this._wasOpen = false;
    this._handleTriggerClick = () => this.toggle();
    this._handleDocumentPointer = (event) => {
      if (!this.contains(event.target) && !this._trigger?.contains(event.target)) {
        this.close("outside", false);
      }
    };
    this._handleDocumentKey = (event) => {
      if (event.key !== "Escape" || !this.hasAttribute("open")) return;
      event.preventDefault();
      this.close("escape", true);
    };
    this._handleViewportChange = () => this.#schedulePosition();
    this._handlePanelClick = (event) => {
      if (event.target.closest?.("[data-uif-popover-close]")) this.close("dismiss", true);
    };
  }

  disconnectedCallback() {
    this.#detachOpenListeners();
    this.#unbindTrigger();
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  render() {
    if (!this._panel) this.#build();
    this.#bindTrigger();
    this.#syncPanel();
    this.#syncOpenState();
  }

  open() {
    if (!this.hasAttribute("open")) this.setAttribute("open", "");
  }

  close(reason = "programmatic", restoreFocus = true) {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    if (restoreFocus && this._trigger?.isConnected) {
      this._trigger.focus({ preventScroll: true });
    }
    this.dispatchEvent(new CustomEvent("uif-dismiss", {
      bubbles: true,
      composed: true,
      detail: { reason },
    }));
  }

  toggle() {
    if (this.hasAttribute("open")) this.close("trigger", true);
    else this.open();
  }

  #build() {
    const content = Array.from(this.childNodes);
    const panel = this.ownerDocument.createElement("div");
    panel.className = "uif-popover";
    panel.id = this._panelId;
    panel.hidden = true;
    panel.tabIndex = -1;
    panel.setAttribute("role", "dialog");
    panel.addEventListener("click", this._handlePanelClick);

    const body = this.ownerDocument.createElement("div");
    body.className = "uif-popover-content";
    body.append(...content);
    const arrow = this.ownerDocument.createElement("span");
    arrow.className = "uif-popover-arrow";
    arrow.setAttribute("aria-hidden", "true");
    panel.append(body, arrow);
    this.replaceChildren(panel);
    this._panel = panel;
  }

  #syncPanel() {
    const label = this.getAttr("label").trim();
    if (label) this._panel.setAttribute("aria-label", label);
    else {
      this._panel.removeAttribute("aria-label");
      this.warnDev("<uif-popover> requires a label for its dialog content.");
    }
    const requested = this.getAttr("placement", "bottom");
    this._panel.dataset.preferredPlacement = PLACEMENTS.has(requested) ? requested : "bottom";
  }

  #bindTrigger() {
    const triggerId = this.getAttr("trigger").trim();
    const nextTrigger = triggerId ? this.ownerDocument.getElementById(triggerId) : null;
    if (nextTrigger === this._trigger) return;
    this.#unbindTrigger();
    if (!nextTrigger) {
      if (triggerId) this.warnDev(`<uif-popover> could not find trigger #${triggerId}.`);
      return;
    }
    this._trigger = nextTrigger;
    this._triggerAttributes = {
      controls: nextTrigger.getAttribute("aria-controls"),
      expanded: nextTrigger.getAttribute("aria-expanded"),
      haspopup: nextTrigger.getAttribute("aria-haspopup"),
    };
    nextTrigger.setAttribute("aria-controls", this._panelId);
    nextTrigger.setAttribute("aria-expanded", this.hasAttribute("open") ? "true" : "false");
    nextTrigger.setAttribute("aria-haspopup", "dialog");
    nextTrigger.addEventListener("click", this._handleTriggerClick);
  }

  #unbindTrigger() {
    if (!this._trigger) return;
    this._trigger.removeEventListener("click", this._handleTriggerClick);
    for (const [name, value] of Object.entries(this._triggerAttributes || {})) {
      const attribute = `aria-${name}`;
      if (value === null) this._trigger.removeAttribute(attribute);
      else this._trigger.setAttribute(attribute, value);
    }
    this._trigger = null;
    this._triggerAttributes = null;
  }

  #syncOpenState() {
    const isOpen = this.hasAttribute("open");
    this._trigger?.setAttribute("aria-expanded", isOpen ? "true" : "false");
    this._panel.hidden = !isOpen;

    if (isOpen && !this._wasOpen) {
      this._wasOpen = true;
      this.#attachOpenListeners();
      this.#schedulePosition();
      const focusTarget = this._panel.querySelector(FOCUSABLE_SELECTOR) || this._panel;
      focusTarget.focus({ preventScroll: true });
      this.dispatchEvent(new CustomEvent("uif-popover-toggle", {
        bubbles: true,
        composed: true,
        detail: { open: true },
      }));
      return;
    }

    if (!isOpen && this._wasOpen) {
      this._wasOpen = false;
      this.#detachOpenListeners();
      if (this._panel.contains(this.ownerDocument.activeElement) && this._trigger?.isConnected) {
        this._trigger.focus({ preventScroll: true });
      }
      this.dispatchEvent(new CustomEvent("uif-popover-toggle", {
        bubbles: true,
        composed: true,
        detail: { open: false },
      }));
    }
  }

  #attachOpenListeners() {
    this.ownerDocument.addEventListener("pointerdown", this._handleDocumentPointer, true);
    this.ownerDocument.addEventListener("keydown", this._handleDocumentKey);
    const view = this.ownerDocument.defaultView;
    view.addEventListener("resize", this._handleViewportChange);
    view.addEventListener("scroll", this._handleViewportChange, true);
    if (view.ResizeObserver) {
      this._resizeObserver = new view.ResizeObserver(this._handleViewportChange);
      this._resizeObserver.observe(this._panel);
      if (this._trigger) this._resizeObserver.observe(this._trigger);
    }
  }

  #detachOpenListeners() {
    this.ownerDocument.removeEventListener("pointerdown", this._handleDocumentPointer, true);
    this.ownerDocument.removeEventListener("keydown", this._handleDocumentKey);
    const view = this.ownerDocument.defaultView;
    view.removeEventListener("resize", this._handleViewportChange);
    view.removeEventListener("scroll", this._handleViewportChange, true);
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  #schedulePosition() {
    if (!this.hasAttribute("open") || !this._trigger) return;
    this.ownerDocument.defaultView.requestAnimationFrame(() => this.#position());
  }

  #position() {
    if (!this.hasAttribute("open") || !this._trigger) return;
    const view = this.ownerDocument.defaultView;
    const triggerRect = this._trigger.getBoundingClientRect();
    const panelRect = this._panel.getBoundingClientRect();
    const preferred = this._panel.dataset.preferredPlacement;
    const gap = 12;
    const edge = 8;
    const space = {
      top: triggerRect.top,
      bottom: view.innerHeight - triggerRect.bottom,
      left: triggerRect.left,
      right: view.innerWidth - triggerRect.right,
    };
    const required = preferred === "top" || preferred === "bottom"
      ? panelRect.height + gap
      : panelRect.width + gap;
    const opposite = oppositePlacement(preferred);
    const placement = space[preferred] < required && space[opposite] > space[preferred]
      ? opposite
      : preferred;

    let left = triggerRect.left + (triggerRect.width - panelRect.width) / 2;
    let top = triggerRect.top + (triggerRect.height - panelRect.height) / 2;
    if (placement === "top") top = triggerRect.top - panelRect.height - gap;
    if (placement === "bottom") top = triggerRect.bottom + gap;
    if (placement === "left") left = triggerRect.left - panelRect.width - gap;
    if (placement === "right") left = triggerRect.right + gap;

    left = Math.min(Math.max(edge, left), Math.max(edge, view.innerWidth - panelRect.width - edge));
    top = Math.min(Math.max(edge, top), Math.max(edge, view.innerHeight - panelRect.height - edge));
    this._panel.style.left = `${Math.round(left)}px`;
    this._panel.style.top = `${Math.round(top)}px`;
    this._panel.dataset.placement = placement;
  }
}

define("uif-popover", UIPopover);
export { UIPopover };
