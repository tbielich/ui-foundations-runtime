import { html } from "@figma/code-connect/html";
import { InlineAlertProps } from "./web-inline-alert";

// Inactive until the historical Figma node and property definitions for
// Inline Alert (#55) are verified. Figma live parity is owner-deferred; no
// Figma node reference is published here and the Code Connect binding is
// intentionally omitted.
export const inlineAlertExample = ({
  className,
  title,
  description,
  icon,
  dismissible,
}: InlineAlertProps) =>
  html`<div class="${className}" role="alert">
  <span class="uif-inline-alert-icon">
    <span class="uif-icon" style="--uif-icon-src: url('/assets/icons/${icon}.svg')" aria-hidden="true"></span>
  </span>
  <div class="uif-inline-alert-content">
    <strong class="uif-inline-alert-title">${title}</strong>
    <p class="uif-inline-alert-description">${description}</p>
  </div>${dismissible
    ? html`
  <button type="button" class="uif-inline-alert-dismiss" aria-label="Dismiss">
    <span class="uif-icon" style="--uif-icon-src: url('/assets/icons/cross.svg')" aria-hidden="true"></span>
  </button>`
    : ""}
</div>`;
