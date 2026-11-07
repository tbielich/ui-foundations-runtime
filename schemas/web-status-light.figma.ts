import { html } from "@figma/code-connect/html";
import { StatusLightProps } from "./web-status-light";

// Inactive until historical node-id=2385-709 and its properties are verified.
export const statusLightExample = ({ text, variant, size }: StatusLightProps) =>
  html`<uif-status-light variant="${variant}" size="${size}">${text}</uif-status-light>`;
