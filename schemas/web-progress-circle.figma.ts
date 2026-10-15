import figma, { html } from "@figma/code-connect/html";

figma.connect(
  "https://www.figma.com/design/uqMsy8fV1fPbQdAzgwlmBA/UI-Foundations?node-id=PROGRESS-CIRCLE-NODE-ID&m=dev",
  {
    props: {
      size: figma.enum("Size", {
        S: "sm",
        M: "md",
        L: "lg",
      }),
      value: figma.number("Value"),
      label: figma.string("Label"),
    },
    example: ({ size, value, label }) =>
      html`<uif-progress-circle size="${size}" value="${value}" label="${label}"></uif-progress-circle>`,
  },
);
