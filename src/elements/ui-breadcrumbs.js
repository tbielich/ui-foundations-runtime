import { UIElement, define } from "./base.js";

/**
 * <uif-breadcrumbs label="Breadcrumb" collapse-at="4" separator="/">
 *   <a href="/">Home</a>
 *   <a href="/holidays">Holidays</a>
 *   <span aria-current="page">Booking</span>
 * </uif-breadcrumbs>
 */
class UIBreadcrumbs extends UIElement {
  static get observedAttributes() {
    return ["label", "collapse-at", "separator"];
  }

  render() {
    if (!this._sourceItems) {
      this._sourceItems = [...this.children];
    }

    const label = this.getAttr("label", "Breadcrumb").trim() || "Breadcrumb";
    const separator = this.getAttr("separator", "/");
    const requestedCollapseAt = Number.parseInt(this.getAttr("collapse-at", "4"), 10);
    const collapseAt = Number.isFinite(requestedCollapseAt)
      ? Math.max(3, requestedCollapseAt)
      : 4;
    const items = [...this._sourceItems];

    const nav = this.ownerDocument.createElement("nav");
    nav.className = "uif-breadcrumbs";
    nav.setAttribute("aria-label", label);
    nav.style.setProperty("--uif-breadcrumbs-separator", JSON.stringify(separator));

    const list = this.ownerDocument.createElement("ol");
    list.className = "uif-breadcrumbs-list";
    const currentIndex = Math.max(
      0,
      items.findIndex((item) => item.getAttribute("aria-current") === "page"),
    );
    const resolvedCurrentIndex = items.some(
      (item) => item.getAttribute("aria-current") === "page",
    )
      ? currentIndex
      : items.length - 1;

    items.forEach((item, index) => {
      if (index === resolvedCurrentIndex) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });

    const createItem = (content, extraClass = "") => {
      const item = this.ownerDocument.createElement("li");
      item.className = `uif-breadcrumbs-item${extraClass ? ` ${extraClass}` : ""}`;
      item.append(content);
      return item;
    };

    const createDisclosure = (hiddenItems, label) => {
      const disclosureItem = this.ownerDocument.createElement("li");
      disclosureItem.className = "uif-breadcrumbs-item uif-breadcrumbs-disclosure-item";
      const disclosure = this.ownerDocument.createElement("details");
      disclosure.className = "uif-breadcrumbs-disclosure";
      const summary = this.ownerDocument.createElement("summary");
      summary.className = "uif-breadcrumbs-disclosure-trigger";
      summary.setAttribute("aria-label", label);
      summary.textContent = "…";
      const hiddenList = this.ownerDocument.createElement("ol");
      hiddenList.className = "uif-breadcrumbs-hidden-list";
      for (const item of hiddenItems) hiddenList.append(createItem(item));
      disclosure.append(summary, hiddenList);
      disclosureItem.append(disclosure);
      return disclosureItem;
    };

    if (items.length > collapseAt) {
      const visibleIndexes = new Set([0, resolvedCurrentIndex]);
      if (resolvedCurrentIndex > 0) visibleIndexes.add(resolvedCurrentIndex - 1);
      else if (items.length > 1) visibleIndexes.add(1);

      for (let index = 0; index < items.length; ) {
        if (visibleIndexes.has(index)) {
          list.append(createItem(items[index]));
          index += 1;
          continue;
        }

        const hiddenStart = index;
        while (index < items.length && !visibleIndexes.has(index)) index += 1;
        const label = index <= resolvedCurrentIndex
          ? "Show previous breadcrumb items"
          : "Show following breadcrumb items";
        list.append(createDisclosure(items.slice(hiddenStart, index), label));
      }
      nav.dataset.collapsed = "true";
    } else {
      for (const item of items) list.append(createItem(item));
    }

    if (!items.length) {
      this.warnDev("<uif-breadcrumbs> requires at least one breadcrumb item.");
    }

    nav.append(list);
    this.replaceChildren(nav);
  }
}

define("uif-breadcrumbs", UIBreadcrumbs);
export { UIBreadcrumbs };
