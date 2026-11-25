import { UIElement, define } from "./base.js";

let nextTreeId = 0;

function directItems(container) {
  return [...container.children].filter((child) => child.localName === "uif-tree-item");
}

function parentItem(item) {
  const group = item.parentElement?.closest?.(".uif-tree-item-group");
  return group?.parentElement?.localName === "uif-tree-item" ? group.parentElement : null;
}

function itemLabel(item) {
  return item.getAttribute("label")?.trim() || item.getAttribute("value")?.trim() || "Tree item";
}

function itemValue(item) {
  return item.getAttribute("value")?.trim() || itemLabel(item);
}

/** An authored item owned and initialized by its closest TreeView. */
class UITreeItem extends UIElement {}

/** An ARIA tree with roving focus, selection, reordering and host-owned lazy loading. */
class UITreeView extends UIElement {
  static get observedAttributes() {
    return ["label", "selection", "reorderable"];
  }

  constructor() {
    super();
    this._activeItem = null;
    this._draggedItem = null;
    this._dropTarget = null;
    this._typeahead = "";
    this._typeaheadTimer = null;
    this._loadRequests = new Map();
  }

  disconnectedCallback() {
    clearTimeout(this._typeaheadTimer);
    this._loadRequests.forEach((request) => request.controller.abort());
    this._loadRequests.clear();
  }

  render() {
    this.classList.add("uif-tree-view");
    this.removeAttribute("role");
    this.removeAttribute("aria-label");

    if (!this._treeReady) {
      this._treeReady = true;
      const roots = directItems(this);
      const tree = this.ownerDocument.createElement("div");
      tree.className = "uif-tree-view-tree";
      tree.setAttribute("role", "tree");
      tree.append(...roots);
      this._tree = tree;

      const status = this.ownerDocument.createElement("p");
      status.className = "uif-tree-view-status";
      status.id = `${this.id || `uif-tree-view-${++nextTreeId}`}-status`;
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      status.setAttribute("aria-atomic", "true");
      this._status = status;
      this.append(tree, status);

      this.addEventListener("keydown", (event) => this._handleKeydown(event));
      this.addEventListener("click", (event) => this._handleClick(event));
      this.addEventListener("dragstart", (event) => this._handleDragStart(event));
      this.addEventListener("dragover", (event) => this._handleDragOver(event));
      this.addEventListener("dragleave", (event) => this._handleDragLeave(event));
      this.addEventListener("drop", (event) => this._handleDrop(event));
      this.addEventListener("dragend", () => this._clearDropTarget());
    }

    this._tree.setAttribute("aria-label", this.getAttr("label", "Tree"));
    this._syncSelectionMode();
    this._refresh();
  }

  get selectedValues() {
    return this._allItems()
      .filter((item) => item.getAttribute("aria-selected") === "true")
      .map(itemValue);
  }

  _selectionMode() {
    const mode = this.getAttr("selection", "single");
    return mode === "multiple" || mode === "none" ? mode : "single";
  }

  _syncSelectionMode() {
    const multiple = this._selectionMode() === "multiple";
    if (multiple) this._tree.setAttribute("aria-multiselectable", "true");
    else this._tree.removeAttribute("aria-multiselectable");
  }

  _allItems() {
    return [...this.querySelectorAll("uif-tree-item")];
  }

  _visibleItems() {
    return this._allItems().filter((item) => {
      let ancestor = parentItem(item);
      while (ancestor) {
        if (ancestor.getAttribute("aria-expanded") !== "true") return false;
        ancestor = parentItem(ancestor);
      }
      return true;
    });
  }

  _groupFor(item, create = false) {
    let group = [...item.children].find((child) => child.classList?.contains("uif-tree-item-group"));
    if (!group && create) {
      group = this.ownerDocument.createElement("div");
      group.className = "uif-tree-item-group";
      group.setAttribute("role", "group");
      item.append(group);
    }
    return group || null;
  }

  _prepareItem(item) {
    if (item.dataset.treePrepared === "true") return;
    const children = directItems(item);
    const label = itemLabel(item);
    item.dataset.treePrepared = "true";
    item.classList.add("uif-tree-item");
    item.setAttribute("role", "treeitem");
    item.setAttribute("aria-label", label);
    item.tabIndex = -1;

    const row = this.ownerDocument.createElement("div");
    row.className = "uif-tree-item-row";
    row.setAttribute("role", "presentation");

    const toggle = this.ownerDocument.createElement("span");
    toggle.className = "uif-tree-item-toggle";
    toggle.dataset.treeToggle = "";
    toggle.setAttribute("aria-hidden", "true");
    row.append(toggle);

    const text = this.ownerDocument.createElement("span");
    text.className = "uif-tree-item-label";
    text.textContent = label;
    row.append(text);

    const selection = this.ownerDocument.createElement("span");
    selection.className = "uif-tree-item-selection";
    selection.setAttribute("aria-hidden", "true");
    row.append(selection);

    item.replaceChildren(row);
    if (children.length || item.hasAttribute("lazy")) {
      const group = this._groupFor(item, true);
      group.append(...children);
    }
  }

  _refresh() {
    directItems(this._tree).forEach((item) => this._prepareBranch(item));
    this._normalizeSelection();
    this._syncBranch(this._tree, 1);

    const visible = this._visibleItems();
    if (!this._activeItem || !visible.includes(this._activeItem)) {
      this._activeItem = visible.find((item) => item.getAttribute("aria-selected") === "true") || visible[0] || null;
    }
    this._allItems().forEach((item) => {
      item.tabIndex = item === this._activeItem ? 0 : -1;
    });
  }

  _prepareBranch(item) {
    this._prepareItem(item);
    const group = this._groupFor(item);
    if (group) directItems(group).forEach((child) => this._prepareBranch(child));
  }

  _syncBranch(container, level) {
    const items = directItems(container);
    items.forEach((item, index) => {
      const group = this._groupFor(item);
      const children = group ? directItems(group) : [];
      const expandable = children.length > 0 || item.hasAttribute("lazy");
      const expanded = expandable && item.hasAttribute("expanded");
      const row = item.querySelector(":scope > .uif-tree-item-row");
      const toggle = row?.querySelector(".uif-tree-item-toggle");
      const selection = row?.querySelector(".uif-tree-item-selection");

      item.setAttribute("aria-level", String(level));
      item.setAttribute("aria-posinset", String(index + 1));
      item.setAttribute("aria-setsize", String(items.length));
      item.setAttribute("aria-label", itemLabel(item));
      row?.querySelector(".uif-tree-item-label")?.replaceChildren(itemLabel(item));
      if (expandable) item.setAttribute("aria-expanded", String(expanded));
      else item.removeAttribute("aria-expanded");
      if (group) group.hidden = !expanded;
      if (toggle) {
        toggle.textContent = item.hasAttribute("data-loading") ? "…" : item.hasAttribute("data-load-error") ? "!" : expanded ? "▾" : expandable ? "▸" : "";
      }
      if (selection) selection.textContent = item.getAttribute("aria-selected") === "true" ? "✓ Selected" : "";
      if (row) row.draggable = this.hasAttribute("reorderable");
      if (children.length) this._syncBranch(group, level + 1);
    });
  }

  _normalizeSelection() {
    const mode = this._selectionMode();
    const items = this._allItems();
    let selectedFound = false;
    items.forEach((item) => {
      if (mode === "none") {
        item.removeAttribute("aria-selected");
        return;
      }
      let selected = item.hasAttribute("selected");
      if (mode === "single" && selected) {
        if (selectedFound) selected = false;
        selectedFound = true;
      }
      item.toggleAttribute("selected", selected);
      item.setAttribute("aria-selected", String(selected));
    });
  }

  _focusItem(item) {
    if (!item || !this._visibleItems().includes(item)) return;
    this._activeItem = item;
    this._allItems().forEach((candidate) => {
      candidate.tabIndex = candidate === item ? 0 : -1;
    });
    item.focus();
  }

  _selectItem(item) {
    const mode = this._selectionMode();
    if (mode === "none") return;
    const selected = item.getAttribute("aria-selected") === "true";
    if (mode === "single") {
      this._allItems().forEach((candidate) => candidate.toggleAttribute("selected", candidate === item));
    } else {
      item.toggleAttribute("selected", !selected);
    }
    this._normalizeSelection();
    this._syncBranch(this._tree, 1);
    const isSelected = item.getAttribute("aria-selected") === "true";
    this.dispatchEvent(new CustomEvent("uif-selection", {
      bubbles: true,
      detail: { item, value: itemValue(item), selected: isSelected, values: this.selectedValues },
    }));
  }

  _handleClick(event) {
    const item = event.target.closest?.("uif-tree-item");
    if (!item || item.closest("uif-tree-view") !== this) return;
    const row = event.target.closest?.(".uif-tree-item-row");
    if (!row || row.parentElement !== item) return;
    this._focusItem(item);
    if (event.target.closest?.("[data-tree-toggle]") && item.hasAttribute("aria-expanded")) {
      this._setExpanded(item, item.getAttribute("aria-expanded") !== "true");
    } else {
      this._selectItem(item);
    }
  }

  _handleKeydown(event) {
    const item = event.target.closest?.("uif-tree-item");
    if (!item || item.closest("uif-tree-view") !== this) return;

    if (this.hasAttribute("reorderable") && event.ctrlKey && event.shiftKey) {
      if (this._handleKeyboardReorder(item, event.key)) event.preventDefault();
      return;
    }

    const visible = this._visibleItems();
    const index = visible.indexOf(item);
    let next = null;
    if (event.key === "ArrowDown") next = visible[Math.min(index + 1, visible.length - 1)];
    else if (event.key === "ArrowUp") next = visible[Math.max(index - 1, 0)];
    else if (event.key === "Home") next = visible[0];
    else if (event.key === "End") next = visible[visible.length - 1];
    else if (event.key === "ArrowRight") {
      if (item.hasAttribute("aria-expanded") && item.getAttribute("aria-expanded") !== "true") this._setExpanded(item, true);
      else next = directItems(this._groupFor(item) || { children: [] })[0];
    } else if (event.key === "ArrowLeft") {
      if (item.getAttribute("aria-expanded") === "true") this._setExpanded(item, false);
      else next = parentItem(item);
    } else if (event.key === "Enter" && item.hasAttribute("data-load-error")) {
      this._setExpanded(item, true);
    } else if (event.key === "Enter" || event.key === " ") {
      this._selectItem(item);
    } else if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      this._handleTypeahead(item, event.key);
      event.preventDefault();
      return;
    } else return;

    event.preventDefault();
    if (next) this._focusItem(next);
  }

  _handleTypeahead(item, key) {
    clearTimeout(this._typeaheadTimer);
    this._typeahead += key.toLocaleLowerCase();
    this._typeaheadTimer = setTimeout(() => { this._typeahead = ""; }, 700);
    const visible = this._visibleItems();
    const start = visible.indexOf(item);
    const ordered = [...visible.slice(start + 1), ...visible.slice(0, start + 1)];
    const match = ordered.find((candidate) => itemLabel(candidate).toLocaleLowerCase().startsWith(this._typeahead));
    if (match) this._focusItem(match);
  }

  _setExpanded(item, expanded) {
    if (!item.hasAttribute("aria-expanded") && !item.hasAttribute("lazy")) return;
    if (!expanded) {
      item.removeAttribute("expanded");
      this._loadRequests.get(item)?.controller.abort();
      this._refresh();
    } else {
      item.setAttribute("expanded", "");
      if (item.hasAttribute("lazy") && !item.hasAttribute("data-loaded") && directItems(this._groupFor(item) || { children: [] }).length === 0) {
        this._loadItem(item);
      } else {
        this._refresh();
      }
    }
    this.dispatchEvent(new CustomEvent("uif-toggle", {
      bubbles: true,
      detail: { item, value: itemValue(item), expanded },
    }));
  }

  _loadItem(item) {
    this._loadRequests.get(item)?.controller.abort();
    const controller = new AbortController();
    const request = { controller, settled: false };
    this._loadRequests.set(item, request);
    item.removeAttribute("data-load-error");
    item.setAttribute("data-loading", "");
    item.setAttribute("aria-busy", "true");
    this._status.textContent = `Loading children for ${itemLabel(item)}.`;
    this._refresh();

    const finish = () => {
      item.removeAttribute("data-loading");
      item.removeAttribute("aria-busy");
      this._loadRequests.delete(item);
    };
    const resolve = (children = []) => {
      if (request.settled || controller.signal.aborted) return;
      request.settled = true;
      const group = this._groupFor(item, true);
      const existing = new Set(directItems(group).map(itemValue));
      let added = 0;
      for (const child of children) {
        const node = child?.nodeType === 1 ? child : this._itemFromData(child);
        if (!node || node.localName !== "uif-tree-item" || existing.has(itemValue(node))) continue;
        existing.add(itemValue(node));
        group.append(node);
        added += 1;
      }
      item.setAttribute("data-loaded", "");
      finish();
      this._status.textContent = `${added} ${added === 1 ? "child" : "children"} loaded for ${itemLabel(item)}.`;
      this._refresh();
      this._focusItem(item);
    };
    const reject = (error = "Try again") => {
      if (request.settled || controller.signal.aborted) return;
      request.settled = true;
      finish();
      item.removeAttribute("expanded");
      item.setAttribute("data-load-error", "");
      const message = error instanceof Error ? error.message : String(error || "Try again");
      this._status.textContent = `Could not load children for ${itemLabel(item)}: ${message}. Press Enter to retry.`;
      this._refresh();
      this._focusItem(item);
    };
    controller.signal.addEventListener("abort", () => {
      if (request.settled) return;
      request.settled = true;
      finish();
      this._refresh();
    }, { once: true });

    const accepted = this.dispatchEvent(new CustomEvent("uif-load", {
      bubbles: true,
      cancelable: true,
      detail: { item, value: itemValue(item), signal: controller.signal, resolve, reject },
    }));
    if (!accepted) controller.abort();
  }

  _itemFromData(data) {
    if (!data || typeof data !== "object") return null;
    const item = this.ownerDocument.createElement("uif-tree-item");
    item.setAttribute("value", String(data.value ?? data.label ?? ""));
    item.setAttribute("label", String(data.label ?? data.value ?? "Tree item"));
    ["expanded", "selected", "lazy"].forEach((name) => {
      if (data[name]) item.setAttribute(name, "");
    });
    if (Array.isArray(data.children)) item.append(...data.children.map((child) => this._itemFromData(child)).filter(Boolean));
    return item;
  }

  _handleKeyboardReorder(item, key) {
    const siblings = directItems(item.parentElement);
    const index = siblings.indexOf(item);
    if (key === "ArrowUp" && index > 0) return this._moveItem(item, siblings[index - 1], "before", "keyboard");
    if (key === "ArrowDown" && index < siblings.length - 1) return this._moveItem(item, siblings[index + 1], "after", "keyboard");
    if (key === "ArrowRight" && index > 0) return this._moveItem(item, siblings[index - 1], "inside", "keyboard");
    const parent = parentItem(item);
    if (key === "ArrowLeft" && parent) return this._moveItem(item, parent, "after", "keyboard");
    return false;
  }

  _handleDragStart(event) {
    if (!this.hasAttribute("reorderable")) return;
    const row = event.target.closest?.(".uif-tree-item-row");
    const item = row?.parentElement;
    if (!item || item.localName !== "uif-tree-item") return;
    this._draggedItem = item;
    item.setAttribute("data-dragging", "");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", itemValue(item));
    }
  }

  _handleDragOver(event) {
    if (!this._draggedItem) return;
    const row = event.target.closest?.(".uif-tree-item-row");
    const target = row?.parentElement;
    if (!target || target.localName !== "uif-tree-item" || target === this._draggedItem || this._draggedItem.contains(target)) return;
    event.preventDefault();
    const rect = row.getBoundingClientRect();
    const offset = event.clientY - rect.top;
    const position = offset < rect.height / 3 ? "before" : offset > rect.height * 2 / 3 ? "after" : "inside";
    this._setDropTarget(target, position);
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
  }

  _handleDragLeave(event) {
    if (!this._dropTarget) return;
    const next = event.relatedTarget;
    if (!next || !this._dropTarget.item.contains(next)) this._clearDropTarget(false);
  }

  _handleDrop(event) {
    if (!this._draggedItem || !this._dropTarget) return;
    event.preventDefault();
    const { item: target, position } = this._dropTarget;
    this._moveItem(this._draggedItem, target, position, "pointer");
    this._clearDropTarget();
  }

  _setDropTarget(item, position) {
    this._clearDropTarget(false);
    item.setAttribute("data-drop-position", position);
    this._dropTarget = { item, position };
  }

  _clearDropTarget(clearSource = true) {
    if (this._dropTarget) this._dropTarget.item.removeAttribute("data-drop-position");
    this._dropTarget = null;
    if (clearSource && this._draggedItem) this._draggedItem.removeAttribute("data-dragging");
    if (clearSource) this._draggedItem = null;
  }

  _moveItem(item, target, position, method) {
    if (!item || !target || item === target || item.contains(target)) return false;
    const fromContainer = item.parentElement;
    const fromParent = parentItem(item);
    const oldIndex = directItems(fromContainer).indexOf(item);
    let toContainer;
    if (position === "inside") {
      toContainer = this._groupFor(target, true);
      target.setAttribute("expanded", "");
      toContainer.append(item);
    } else {
      toContainer = target.parentElement;
      toContainer.insertBefore(item, position === "before" ? target : target.nextSibling);
    }
    const toParent = parentItem(item);
    const newIndex = directItems(toContainer).indexOf(item);
    this._activeItem = item;
    this._refresh();
    this._focusItem(item);
    const announcement = `${itemLabel(item)} moved ${position} ${itemLabel(target)}.`;
    this._status.textContent = announcement;
    this.dispatchEvent(new CustomEvent("uif-reorder", {
      bubbles: true,
      detail: {
        item,
        value: itemValue(item),
        fromParent: fromParent ? itemValue(fromParent) : null,
        toParent: toParent ? itemValue(toParent) : null,
        oldIndex,
        newIndex,
        position,
        method,
      },
    }));
    return true;
  }
}

define("uif-tree-item", UITreeItem);
define("uif-tree-view", UITreeView);
export { UITreeItem, UITreeView };
