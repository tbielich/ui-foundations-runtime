import figma, { html } from "@figma/code-connect/html";
import { TooltipProps } from "./web-tooltip";

figma.connect(
  "https://www.figma.com/design/uqMsy8fV1fPbQdAzgwlmBA/UI-Foundations?node-id=2535-291&m=dev",
  {
    props: {
      placement: figma.enum("Placement", {
        top: "top",
        bottom: "bottom",
        left: "left",
        right: "right",
      }),
      text: figma.string("Text"),
    },
    example: ({ placement, text }: TooltipProps) =>
      html`<span class="uif-tooltip-trigger">
  <button class="uif-button outline" type="button" aria-describedby="uif-tooltip-code-connect">Trigger</button>
  <span class="uif-tooltip" id="uif-tooltip-code-connect" role="tooltip" data-placement="${placement}">${text}</span>
</span>`,
  },
);
