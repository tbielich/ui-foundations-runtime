import { UIElement, define } from "./base.js";

let nextCardId = 0;
const INTERACTIVE_SELECTOR = "a[href], button, input, select, textarea, [tabindex]:not([tabindex='-1'])";

/**
 * <uif-card title="Beach holiday" layout="vertical" href="/holidays/beach">
 *   <img slot="media" src="beach.jpg" alt="Coastline">
 *   <p slot="body">Seven nights with breakfast.</p>
 *   <span slot="footer">From €499</span>
 * </uif-card>
 *
 * Use selectable instead of href for a pressed-state choice card.
 */
class UICard extends UIElement {
  static get observedAttributes() {
    return ["title", "layout", "href", "action-label", "selectable", "selected", "disabled"];
  }

  render() {
    if (!this._sourceNodes) {
      this._sourceNodes = [...this.childNodes];
    }

    const title = this.getAttr("title").trim();
    const layout = this.getAttr("layout") === "horizontal" ? "horizontal" : "vertical";
    const href = this.getAttr("href").trim();
    const selectable = this.getBool("selectable");
    const selected = selectable && this.getBool("selected");
    const disabled = this.getBool("disabled");
    const cardId = this.id || `uif-card-${++nextCardId}`;
    const titleId = `${cardId}-title`;

    const card = this.ownerDocument.createElement("article");
    card.className = "uif-card";
    card.dataset.layout = layout;

    const sections = new Map();
    for (const slot of ["media", "header", "body", "footer"]) {
      const section = this.ownerDocument.createElement(slot === "header" ? "header" : "div");
      section.className = `uif-card-${slot}`;
      section.dataset.slot = slot;
      sections.set(slot, section);
    }

    if (title) {
      const heading = this.ownerDocument.createElement("h3");
      heading.className = "uif-card-title";
      heading.id = titleId;
      heading.textContent = title;
      sections.get("header").append(heading);
      card.setAttribute("aria-labelledby", titleId);
    } else {
      card.setAttribute("aria-label", this.getAttr("action-label", "Card"));
    }

    for (const sourceNode of this._sourceNodes) {
      const node = sourceNode;
      const slot = node.nodeType === 1 ? node.getAttribute("slot") : "";
      sections.get(sections.has(slot) ? slot : "body").append(node);
    }

    if (selectable || href) {
      const control = this.ownerDocument.createElement(selectable ? "button" : "a");
      control.className = "uif-card-control";
      const actionLabel = this.getAttr(
        "action-label",
        selectable ? `${selected ? "Deselect" : "Select"} ${title || "card"}` : `Open ${title || "card"}`,
      );
      control.textContent = actionLabel;
      if (selectable) {
        control.type = "button";
        control.setAttribute("aria-pressed", String(selected));
        control.disabled = disabled;
        control.addEventListener("click", () => {
          const preserveFocus = this.ownerDocument.activeElement === control;
          const nextSelected = !this.hasAttribute("selected");
          this.toggleAttribute("selected", nextSelected);
          if (preserveFocus) {
            queueMicrotask(() => this.querySelector(".uif-card-control")?.focus());
          }
          this.dispatchEvent(
            new CustomEvent("uif-select", {
              bubbles: true,
              detail: { selected: nextSelected },
            }),
          );
        });
      } else {
        control.href = href;
        if (disabled) {
          control.setAttribute("aria-disabled", "true");
          control.tabIndex = -1;
          control.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
          });
        }
      }
      sections.get("footer").append(control);
    }

    for (const section of sections.values()) {
      if (section.childNodes.length) card.append(section);
    }

    if (selectable) card.dataset.selected = String(selected);
    else card.removeAttribute("data-selected");

    const authoredInteractive = [...card.querySelectorAll(INTERACTIVE_SELECTOR)].filter(
      (element) => !element.classList.contains("uif-card-control"),
    );
    if ((selectable || href) && authoredInteractive.length) {
      this.warnDev(
        "Interactive cards use one explicit card control. Remove nested interactive content or omit href/selectable.",
      );
    }

    this.replaceChildren(card);
  }
}

define("uif-card", UICard);
export { UICard };
