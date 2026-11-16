import { html } from "@figma/code-connect/html";

// Inactive until the historical Figma node and property definitions are verified.
// The previous draft used node-id=1-1; do not publish that placeholder.
export const meterExample = ({ label, value, valueText }: { label: string; value: number; valueText: string }) =>
  html`<uif-meter label="${label}" value="${value}" value-text="${valueText}"></uif-meter>`;
