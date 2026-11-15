import { html } from "@figma/code-connect/html";
import { ProgressBarProps } from "./web-progress-bar";

// Inactive until a real Figma node and property definitions are verified.
// The historical node-id=9001-1 is not accepted as current evidence.
export const progressBarExample = ({ value, label }: ProgressBarProps) =>
  html`<uif-progress-bar value="${value}" label="${label}"></uif-progress-bar>`;
