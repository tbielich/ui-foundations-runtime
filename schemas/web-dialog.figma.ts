import figma, { html } from "@figma/code-connect/html";
import { DialogProps } from "./web-dialog";

figma.connect(
  "https://www.figma.com/design/uqMsy8fV1fPbQdAzgwlmBA/UI-Foundations?node-id=3120-110&m=dev",
  {
    props: {
      dismissible: figma.boolean("Dismissible"),
      title: figma.string("Title"),
      description: figma.string("Description"),
    },
    example: ({ dismissible, title, description }: DialogProps) =>
      html`<uif-dialog
  title="${title}"
  description="${description}"
  dismissible="${dismissible}"
>
  Dialog content
</uif-dialog>`,
  },
);
