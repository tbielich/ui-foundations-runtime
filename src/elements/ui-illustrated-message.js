import { UIElement, define } from "./base.js";

const PRESETS = {
  empty: {
    heading: "Nothing here yet",
    description: "Add content or create a new item to get started.",
    icon: "message-info",
  },
  error: {
    heading: "Something went wrong",
    description: "Try again or go back to the previous step.",
    icon: "message-alert",
  },
  "no-results": {
    heading: "No results found",
    description: "Try adjusting your filters or search terms.",
    icon: "search",
  },
};

const ACTION_VARIANTS = ["solid", "outline", "ghost"];

function resolvePreset(value) {
  return PRESETS[value] ? value : "empty";
}

function resolveActionVariant(value) {
  return ACTION_VARIANTS.includes(value) ? value : "solid";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeIconName(value, fallback) {
  return /^[a-z0-9-]+$/.test(value) ? value : fallback;
}

function sanitizeHref(value) {
  if (!value) return "";
  return /^(?:https?:|mailto:|tel:|\/|#)/.test(value) ? value : "#";
}

/**
 * <uif-illustrated-message preset="empty" action-label="Create item"></uif-illustrated-message>
 *
 * Attributes:
 *   preset            — "empty" (default), "error", "no-results"
 *   heading           — overrides the preset heading
 *   description       — overrides the preset description
 *   illustration-icon — overrides the preset icon name
 *   action-label      — renders a single action when present
 *   action-href       — renders the action as a link; otherwise a button
 *   action-variant    — "solid" (default), "outline", "ghost"
 *   size              — "md" (default) or "sm"; relative to the inherited container scale
 *
 * Slots (light DOM): [slot="illustration"] and [slot="action"] replace the
 * default icon and generated action respectively.
 */
class UIIllustratedMessage extends UIElement {
  static get observedAttributes() {
    return [
      "preset",
      "heading",
      "description",
      "action-label",
      "action-href",
      "action-variant",
      "illustration-icon",
      "size",
    ];
  }

  connectedCallback() {
    if (!this._slotMarkup) {
      this._slotMarkup = {
        illustration: this.querySelector('[slot="illustration"]')?.outerHTML ?? "",
        action: this.querySelector('[slot="action"]')?.outerHTML ?? "",
      };
    }
    super.connectedCallback();
  }

  render() {
    const preset = resolvePreset(this.getAttr("preset", "empty"));
    const defaults = PRESETS[preset];
    const heading = this.hasAttribute("heading") ? this.getAttr("heading") : defaults.heading;
    const description = this.hasAttribute("description") ? this.getAttr("description") : defaults.description;
    const actionLabel = this.getAttr("action-label");
    const actionHref = sanitizeHref(this.getAttr("action-href"));
    const actionVariant = resolveActionVariant(this.getAttr("action-variant", "solid"));
    const size = this.getAttr("size", "md");
    const illustrationIcon = sanitizeIconName(
      this.hasAttribute("illustration-icon") ? this.getAttr("illustration-icon") : defaults.icon,
      defaults.icon,
    );

    const safeIllustrationIcon = escapeHtml(illustrationIcon);
    const safeHeading = escapeHtml(heading);
    const safeDescription = escapeHtml(description);
    const safeActionLabel = escapeHtml(actionLabel);
    const safeActionHref = escapeHtml(actionHref);

    const illustration = this._slotMarkup.illustration
      || `<span class="uif-icon" style="--uif-icon-src: url('/assets/icons/${safeIllustrationIcon}.svg');" aria-hidden="true"></span>`;

    let action = this._slotMarkup.action;
    if (!action && actionLabel) {
      action = actionHref
        ? `<a class="uif-button ${actionVariant}" href="${safeActionHref}">${safeActionLabel}</a>`
        : `<button class="uif-button ${actionVariant}" type="button">${safeActionLabel}</button>`;
    }

    const headingMarkup = heading
      ? `<h2 class="uif-illustrated-message-heading">${safeHeading}</h2>`
      : "";
    const descriptionMarkup = description
      ? `<p class="uif-illustrated-message-description">${safeDescription}</p>`
      : "";
    const actionMarkup = action
      ? `<div class="uif-illustrated-message-actions">${action}</div>`
      : "";

    const classes = ["uif-illustrated-message"];
    if (size === "sm") classes.push("sm");

    this.innerHTML = `<div class="${classes.join(" ")}" data-preset="${preset}"><div class="uif-illustrated-message-illustration" aria-hidden="true">${illustration}</div><div class="uif-illustrated-message-content">${headingMarkup}${descriptionMarkup}</div>${actionMarkup}</div>`;
  }
}

define("uif-illustrated-message", UIIllustratedMessage);
export { UIIllustratedMessage };
