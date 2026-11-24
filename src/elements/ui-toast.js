import { UIElement, define } from "./base.js";

const VARIANTS = new Set(["info", "success", "warning", "error"]);
const DEFAULT_ICONS = {
  info: "info-circled",
  success: "checkmark-circled",
  warning: "exclamation-mark-circled",
  error: "cross-circled",
};
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function parseDuration(value) {
  const duration = Number.parseInt(value, 10);
  return Number.isFinite(duration) && duration >= 0 ? duration : 5000;
}

function moveFocusOutside(toast) {
  if (!toast.contains(toast.ownerDocument.activeElement)) return;
  const candidates = [...toast.ownerDocument.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
    (candidate) => !toast.contains(candidate) && !candidate.closest("[hidden], [inert]"),
  );
  const NodeClass = toast.ownerDocument.defaultView.Node;
  const next = candidates.find(
    (candidate) => toast.compareDocumentPosition(candidate) & NodeClass.DOCUMENT_POSITION_FOLLOWING,
  );
  const previous = candidates
    .filter(
      (candidate) => toast.compareDocumentPosition(candidate) & NodeClass.DOCUMENT_POSITION_PRECEDING,
    )
    .at(-1);
  (next || previous)?.focus({ preventScroll: true });
}

/**
 * A labelled stack for transient feedback. The region itself is not live;
 * each toast owns exactly one polite or assertive announcement.
 */
class UIToastRegion extends UIElement {
  static get observedAttributes() {
    return ["label", "position"];
  }

  render() {
    this.classList.add("uif-toast-region");
    this.setAttribute("role", "region");
    this.setAttribute("aria-label", this.getAttr("label", "Notifications"));
    const position = this.getAttr("position", "top-end");
    this.dataset.position = ["top-start", "top-end", "bottom-start", "bottom-end"].includes(position)
      ? position
      : "top-end";
  }
}

/**
 * <uif-toast variant="success" message="Saved" duration="5000"></uif-toast>
 *
 * Attributes:
 *   variant      — info, success, warning, or error
 *   message      — notification text; initial text content is the fallback
 *   duration     — auto-dismiss delay in milliseconds; 0 keeps the toast open
 *   urgency      — polite (default) or assertive; error defaults to assertive
 *   action-label — optional action button label
 *   dismiss-label — accessible dismiss button label (default: Dismiss notification)
 */
class UIToast extends UIElement {
  static get observedAttributes() {
    return ["variant", "message", "duration", "urgency", "action-label", "dismiss-label"];
  }

  constructor() {
    super();
    this._authoredMessage = null;
    this._timer = null;
    this._deadline = 0;
    this._remaining = 0;
    this._dismissed = false;
    this._handlePointerEnter = () => this.pause();
    this._handlePointerLeave = () => this.resume();
    this._handleFocusIn = () => this.pause();
    this._handleFocusOut = (event) => {
      if (!this.contains(event.relatedTarget)) this.resume();
    };
  }

  connectedCallback() {
    if (this._authoredMessage === null) this._authoredMessage = this.textContent.trim();
    super.connectedCallback();
    this.addEventListener("pointerenter", this._handlePointerEnter);
    this.addEventListener("pointerleave", this._handlePointerLeave);
    this.addEventListener("focusin", this._handleFocusIn);
    this.addEventListener("focusout", this._handleFocusOut);
  }

  disconnectedCallback() {
    this.#clearTimer();
    this.removeEventListener("pointerenter", this._handlePointerEnter);
    this.removeEventListener("pointerleave", this._handlePointerLeave);
    this.removeEventListener("focusin", this._handleFocusIn);
    this.removeEventListener("focusout", this._handleFocusOut);
  }

  render() {
    this.#clearTimer();
    this._dismissed = false;
    const requestedVariant = this.getAttr("variant", "info");
    const variant = VARIANTS.has(requestedVariant) ? requestedVariant : "info";
    const message = this.getAttr("message", this._authoredMessage || "").trim();
    const urgency = this.getAttr("urgency", variant === "error" ? "assertive" : "polite");
    const assertive = urgency === "assertive";
    const actionLabel = this.getAttr("action-label").trim();
    const dismissLabel = this.getAttr("dismiss-label", "Dismiss notification").trim()
      || "Dismiss notification";

    this.classList.add("uif-toast-host");
    this.innerHTML = `<div class="uif-toast ${variant}" role="${assertive ? "alert" : "status"}" aria-live="${assertive ? "assertive" : "polite"}" aria-atomic="true"><span class="uif-toast-icon"><span class="uif-icon" aria-hidden="true"></span></span><div class="uif-toast-content"><p class="uif-toast-message"></p>${actionLabel ? '<button type="button" class="uif-toast-action uif-button ghost"></button>' : ""}</div><button type="button" class="uif-toast-dismiss"><span class="uif-icon" aria-hidden="true"></span></button></div>`;

    const icon = this.querySelector(".uif-toast-icon .uif-icon");
    icon.style.setProperty("--uif-icon-src", `url('/assets/icons/${DEFAULT_ICONS[variant]}.svg')`);
    this.querySelector(".uif-toast-message").textContent = message;

    const action = this.querySelector(".uif-toast-action");
    if (action) {
      action.textContent = actionLabel;
      action.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("uif-action", {
          bubbles: true,
          composed: true,
          detail: { variant },
        }));
      });
    }

    const dismiss = this.querySelector(".uif-toast-dismiss");
    dismiss.setAttribute("aria-label", dismissLabel);
    dismiss.querySelector(".uif-icon").style.setProperty(
      "--uif-icon-src",
      "url('/assets/icons/cross.svg')",
    );
    dismiss.addEventListener("click", () => this.dismiss("dismiss"));

    this._remaining = parseDuration(this.getAttr("duration", "5000"));
    this.resume();
  }

  pause() {
    if (!this._timer) return;
    this._remaining = Math.max(0, this._deadline - Date.now());
    this.#clearTimer();
  }

  resume() {
    if (this._dismissed || this._timer || this._remaining <= 0) return;
    this._deadline = Date.now() + this._remaining;
    this._timer = this.ownerDocument.defaultView.setTimeout(
      () => this.dismiss("timeout"),
      this._remaining,
    );
  }

  dismiss(reason = "programmatic") {
    if (this._dismissed) return;
    this._dismissed = true;
    this.#clearTimer();
    if (reason !== "timeout") moveFocusOutside(this);
    this.dispatchEvent(new CustomEvent("uif-dismiss", {
      bubbles: true,
      composed: true,
      detail: { reason },
    }));
    const surface = this.querySelector(".uif-toast");
    surface?.classList.add("is-exiting");
    const reducedMotion = this.ownerDocument.defaultView.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    this.ownerDocument.defaultView.setTimeout(() => this.remove(), reducedMotion ? 0 : 160);
  }

  #clearTimer() {
    if (!this._timer) return;
    this.ownerDocument.defaultView.clearTimeout(this._timer);
    this._timer = null;
  }
}

define("uif-toast-region", UIToastRegion);
define("uif-toast", UIToast);
export { UIToast, UIToastRegion };
