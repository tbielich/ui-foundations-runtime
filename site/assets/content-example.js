import { renderContent } from "../vendor/ui-foundations/components/content.js";

const source = [
  "# Working with formatted content",
  "",
  "Use **Content** to display text with headings, lists and code. Mark a word with *emphasis* when it needs attention. Use `uif-code` for monospaced code.",
  "",
  "1. Review the example",
  "   - Use headings to find a section",
  "   - Copy the code you need",
  "2. Check the code before using it",
  "",
  "> Treat generated content as untrusted input. HTML is displayed as text.",
  "",
  "```js",
  "const message = '<script>shown as text</script>';",
  "console.log(message);",
  "```",
  "",
  "| Output | Purpose |",
  "| --- | --- |",
  "| Markdown | Structured explanation |",
  "| Plain text | Unchanged Unicode drawing |",
].join("\n");
const target = document.getElementById("content-example");
const variants = document.querySelectorAll("[data-content-variant]");
let selectedVariant = "formatted";
const examples = {
  formatted: source,
  inline: "Run `npm run build` to build the project.",
  code: '```js\nconst message = "Hello UIF";\nconsole.log(message);\n```',
  unicode: "╭────╮\n│    │\n├────┤\n│    │\n╰────╯",
};
const descriptions = {
  formatted: "Headings, paragraphs, lists and tables from Markdown.",
  inline: "Short names and commands within a sentence.",
  code: "Source code with preserved spaces and line breaks.",
  unicode: "Drawing characters with preserved spacing. Connected lines require a suitable monospaced font.",
};
function updatePreview() {
  document.getElementById("content-variant-description").textContent = descriptions[selectedVariant];
  const drawing = selectedVariant === "unicode";
  renderContent(target, examples[selectedVariant] || source, {
    headingLevel: 3,
    copy: false,
    format: drawing ? "text" : "markdown",
  });
  if (drawing) target.querySelector("pre")?.classList.add("uif-code-grid");
}
variants.forEach(button => button.addEventListener("click", () => {
  selectedVariant = button.dataset.contentVariant;
  variants.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
  updatePreview();
}));
updatePreview();
