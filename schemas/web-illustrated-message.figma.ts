import { html } from "@figma/code-connect/html";
import { IllustratedMessageProps } from "./web-illustrated-message";

// Inactive until the historical Figma node and property definitions for
// Illustrated Message (#62) are verified. Figma live parity is owner-deferred;
// no Figma node reference is published here and the Code Connect binding is
// intentionally omitted. Presets covered: empty, error, no-results.
export const illustratedMessageExample = ({
  preset,
  heading,
  description,
  actionLabel,
  actionHref,
  actionVariant,
  illustrationIcon,
}: IllustratedMessageProps) =>
  html`<div class="uif-illustrated-message" data-preset="${preset || "empty"}">
  <div class="uif-illustrated-message-illustration" aria-hidden="true">
    <span class="uif-icon" style="--uif-icon-src: url('/assets/icons/${illustrationIcon || "message-info"}.svg');" aria-hidden="true"></span>
  </div>
  <div class="uif-illustrated-message-content">
    <h2 class="uif-illustrated-message-heading">${heading}</h2>
    <p class="uif-illustrated-message-description">${description}</p>
  </div>${actionLabel
    ? html`
  <div class="uif-illustrated-message-actions">${actionHref
    ? html`<a class="uif-button ${actionVariant || "solid"}" href="${actionHref}">${actionLabel}</a>`
    : html`<button class="uif-button ${actionVariant || "solid"}" type="button">${actionLabel}</button>`}</div>`
    : ""}
</div>`;
