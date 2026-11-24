import { UIElement, define } from "./base.js";

const DEFAULT_ICONS = {
  info: "info-circled",
  positive: "checkmark-circled",
  negative: "cross-circled",
  notice: "exclamation-mark-circled",
};

const VARIANTS = ["info", "positive", "negative", "notice"];
const ICON_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button",
  "input:not([type='hidden'])",
  "select",
  "textarea",
  "summary",
  "[contenteditable]",
  "[tabindex]",
].join(",");

function sanitizeIconName(name) {
  if (!name || !ICON_NAME_PATTERN.test(name)) return "";
  return name;
}

function isAvailableFocusTarget(element, owner) {
  const HTMLElementClass = owner.ownerDocument?.defaultView?.HTMLElement;
  if (
    !HTMLElementClass ||
    !(element instanceof HTMLElementClass) ||
    !element.isConnected ||
    owner.contains(element)
  ) {
    return false;
  }
  if (element.matches(":disabled") || element.closest("[hidden], [inert], .is-hidden")) return false;
  const style = owner.ownerDocument.defaultView.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
}

function focusTarget(element, owner) {
  if (!isAvailableFocusTarget(element, owner)) return false;
  element.focus({ preventScroll: true });
  return owner.ownerDocument.activeElement === element;
}

function fallbackFocusTargets(owner) {
  const candidates = [...owner.ownerDocument.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
    (element) => element.tabIndex >= 0 && isAvailableFocusTarget(element, owner),
  );
  const NodeClass = owner.ownerDocument.defaultView.Node;
  const next = candidates.find(
    (element) => owner.compareDocumentPosition(element) & NodeClass.DOCUMENT_POSITION_FOLLOWING,
  );
  const previous = candidates
    .filter(
      (element) => owner.compareDocumentPosition(element) & NodeClass.DOCUMENT_POSITION_PRECEDING,
    )
    .at(-1);
  return [next, previous].filter(Boolean);
}

/**
 * <uif-inline-alert variant="info" title="Heads up" description="Something to know."></uif-inline-alert>
 * <uif-inline-alert variant="negative" title="Error" dismissible></uif-inline-alert>
 *
 * Attributes:
 *   variant     — "" / "default" (neutral), "info", "positive", "negative", "notice"
 *   title       — bold heading text
 *   description — body text
 *   icon        — override icon name; defaults to a variant-appropriate icon
 *   size        — "md" (default) or "sm"; relative to the inherited container scale
 *   action-label — optional action text; renders a button by default
 *   action-href  — allowed link URL (http(s), mailto, tel, / or #); otherwise #
 *   dismissible — boolean; adds a dismiss button that hides the alert
 *   dismiss-focus-target — optional ID reference for the post-dismiss focus destination
 *
 * Properties:
 *   dismissFocusTarget — optional HTMLElement for the post-dismiss focus destination
 */
class UIInlineAlert extends UIElement {
  static get observedAttributes() {
    return [
      "variant",
      "title",
      "description",
      "icon",
      "size",
      "dismissible",
      "action-label",
      "action-href",
      "dismiss-focus-target",
    ];
  }

  get dismissFocusTarget() {
    return this._dismissFocusTarget ?? null;
  }

  set dismissFocusTarget(target) {
    this._dismissFocusTarget = target;
  }

  _moveFocusAfterDismissal() {
    const referencedId = this.getAttr("dismiss-focus-target").trim();
    const referencedTarget = referencedId ? this.ownerDocument.getElementById(referencedId) : null;
    const targets = [this.dismissFocusTarget, referencedTarget, ...fallbackFocusTargets(this)];

    for (const target of new Set(targets)) {
      if (focusTarget(target, this)) return;
    }

    const previousTabIndex = this.getAttribute("tabindex");
    this.setAttribute("tabindex", "-1");
    this.focus({ preventScroll: true });
    if (previousTabIndex === null) this.removeAttribute("tabindex");
    else this.setAttribute("tabindex", previousTabIndex);
  }

  render() {
    const requested = this.getAttr("variant", "");
    const variant = VARIANTS.includes(requested) ? requested : "";
    const title = this.getAttr("title");
    const description = this.getAttr("description");
    const iconOverride = sanitizeIconName(this.getAttr("icon"));
    const size = this.getAttr("size", "md");
    const dismissible = this.getBool("dismissible");

    const actionLabel = this.getAttr("action-label");
    const requestedHref = this.getAttr("action-href");
    const actionHref = /^(?:https?:|mailto:|tel:|\/|#)/.test(requestedHref) ? requestedHref : "#";
    const actionHtml = actionLabel
      ? `<div class="uif-inline-alert-action">${requestedHref ? '<a class="uif-button outline"></a>' : '<button type="button" class="uif-button outline"></button>'}</div>`
      : "";

    const icon = iconOverride || DEFAULT_ICONS[variant] || "";

    const classes = ["uif-inline-alert"];
    if (variant) classes.push(variant);
    if (size === "sm") classes.push("sm");

    const iconHtml = icon
      ? `<span class="uif-inline-alert-icon"><span class="uif-icon" style="--uif-icon-src: url('/assets/icons/${icon}.svg')" aria-hidden="true"></span></span>`
      : "";

    const titleHtml = title ? `<strong class="uif-inline-alert-title"></strong>` : "";
    const descHtml = description ? `<p class="uif-inline-alert-description"></p>` : "";

    const dismissHtml = dismissible
      ? `<button type="button" class="uif-inline-alert-dismiss" aria-label="Dismiss"><span class="uif-icon" style="--uif-icon-src: url('/assets/icons/cross.svg')" aria-hidden="true"></span></button>`
      : "";

    this.innerHTML = `<div class="${classes.join(" ")}" role="alert">${iconHtml}<div class="uif-inline-alert-content">${titleHtml}${descHtml}${actionHtml}</div>${dismissHtml}</div>`;

    // Assign user text via textContent so markup in attributes is not interpreted.
    if (title) {
      this.querySelector(".uif-inline-alert-title").textContent = title;
    }
    if (description) {
      this.querySelector(".uif-inline-alert-description").textContent = description;
    }

    if (actionLabel) {
      const action = this.querySelector(".uif-inline-alert-action > *");
      action.textContent = actionLabel;
      if (requestedHref) action.setAttribute("href", actionHref);
    }

    if (dismissible) {
      const btn = this.querySelector(".uif-inline-alert-dismiss");
      if (btn) {
        btn.addEventListener("click", () => {
          const alert = this.querySelector(".uif-inline-alert");
          if (alert) {
            this._moveFocusAfterDismissal();
            alert.classList.add("is-hidden");
            this.dispatchEvent(new CustomEvent("uif-dismiss", { bubbles: true }));
          }
        });
      }
    }
  }
}

define("uif-inline-alert", UIInlineAlert);
export { UIInlineAlert };
