import { UIElement, define } from "./base.js";

let nextTabId = 0;

/**
 * <uif-tab-list aria-label="Settings">
 *   <uif-tab label="General" selected controls="panel-1"></uif-tab>
 *   <uif-tab label="Advanced" controls="panel-2"></uif-tab>
 * </uif-tab-list>
 * <uif-tab-panel id="panel-1">General content</uif-tab-panel>
 * <uif-tab-panel id="panel-2" hidden>Advanced content</uif-tab-panel>
 */

class UITabList extends UIElement {
  static get observedAttributes() {
    return ["orientation", "aria-label"];
  }

  render() {
    const orientation = this.getAttr("orientation", "horizontal");
    const ariaLabel = this.getAttr("aria-label");
    if (!this._tabList) {
      this._tabList = this.ownerDocument.createElement("div");
      this._tabList.className = "uif-tab-list";
      this._tabList.setAttribute("role", "tablist");
      this._tabList.append(...this.childNodes);
      this.append(this._tabList);
      this._tabList.addEventListener("click", (event) => this._handleClick(event));
      this._tabList.addEventListener("keydown", (event) => this._handleKeydown(event));
      queueMicrotask(() => this._ensureInitialSelection());
    }

    this._tabList.setAttribute("aria-orientation", orientation);
    if (ariaLabel) this._tabList.setAttribute("aria-label", ariaLabel);
    else this._tabList.removeAttribute("aria-label");
  }

  _tabs() {
    return Array.from(
      this.querySelectorAll(":scope > .uif-tab-list > uif-tab"),
    );
  }

  _enabledTabs() {
    return this._tabs().filter((tab) => !tab.hasAttribute("disabled"));
  }

  _buttonFor(tab) {
    return tab?.querySelector(":scope > .uif-tab") ?? null;
  }

  _tabFromEvent(event) {
    const button = event.target?.closest?.(".uif-tab");
    const tab = button?.closest?.("uif-tab");
    return this._tabs().includes(tab) ? tab : null;
  }

  _ensureInitialSelection() {
    const tabs = this._enabledTabs();
    if (tabs.length === 0) return;

    const selected = tabs.find((tab) => tab.hasAttribute("selected")) ?? tabs[0];
    this._activateTab(selected, { focus: false });
  }

  _syncPanels(selectedTab) {
    for (const tab of this._tabs()) {
      const controls = tab.getAttribute("controls");
      if (!controls) continue;

      const panel = this.ownerDocument?.getElementById(controls);
      if (!panel || panel.tagName.toLowerCase() !== "uif-tab-panel") continue;

      const button = this._buttonFor(tab);
      if (button) panel.setAttribute("aria-labelledby", button.id);
      panel.toggleAttribute("hidden", tab !== selectedTab);
    }
  }

  _activateTab(tab, { focus = true } = {}) {
    if (!tab || tab.hasAttribute("disabled")) return;

    for (const candidate of this._tabs()) {
      const selected = candidate === tab;
      if (candidate.hasAttribute("selected") !== selected) {
        candidate.toggleAttribute("selected", selected);
      }
    }

    this._syncPanels(tab);

    if (focus) {
      this._buttonFor(tab)?.focus();
    }
  }

  _handleClick(event) {
    const tab = this._tabFromEvent(event);
    if (!tab || tab.hasAttribute("disabled")) return;
    this._activateTab(tab);
  }

  _handleKeydown(event) {
    const current = this._tabFromEvent(event);
    if (!current || current.hasAttribute("disabled")) return;

    const tabs = this._enabledTabs();
    const currentIndex = tabs.indexOf(current);
    if (currentIndex < 0) return;

    const orientation = this.getAttr("orientation", "horizontal");
    let nextIndex = null;

    if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else if (
      orientation === "horizontal" &&
      (event.key === "ArrowLeft" || event.key === "ArrowRight")
    ) {
      const offset = event.key === "ArrowRight" ? 1 : -1;
      nextIndex = (currentIndex + offset + tabs.length) % tabs.length;
    } else if (
      orientation === "vertical" &&
      (event.key === "ArrowUp" || event.key === "ArrowDown")
    ) {
      const offset = event.key === "ArrowDown" ? 1 : -1;
      nextIndex = (currentIndex + offset + tabs.length) % tabs.length;
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this._activateTab(current);
      return;
    } else {
      return;
    }

    event.preventDefault();
    this._activateTab(tabs[nextIndex]);
  }
}

define("uif-tab-list", UITabList);
export { UITabList };

/**
 * <uif-tab label="Tab 1" selected controls="panel-1"></uif-tab>
 *
 * Attributes:
 *   label    — tab button text
 *   selected — boolean
 *   disabled — boolean
 *   controls — ID of controlled panel
 */
class UITab extends UIElement {
  static get observedAttributes() {
    return ["label", "selected", "disabled", "controls"];
  }

  render() {
    const label = this.getAttr("label");
    const selected = this.getBool("selected");
    const disabled = this.getBool("disabled");
    const controls = this.getAttr("controls");

    if (!this._button) {
      this._button = this.ownerDocument.createElement("button");
      this._button.className = "uif-tab";
      this._button.setAttribute("role", "tab");
      do {
        this._button.id = `uif-tab-${++nextTabId}`;
      } while (this.ownerDocument.getElementById(this._button.id));
      this._button.type = "button";
      this.replaceChildren(this._button);
    }
    this._button.textContent = label;
    this._button.setAttribute("aria-selected", String(selected));
    this._button.tabIndex = selected ? 0 : -1;
    this._button.disabled = disabled;
    if (controls) this._button.setAttribute("aria-controls", controls);
    else this._button.removeAttribute("aria-controls");
  }
}

define("uif-tab", UITab);
export { UITab };

/**
 * <uif-tab-panel id="panel-1">Content</uif-tab-panel>
 *
 * Attributes:
 *   hidden — boolean
 */
class UITabPanel extends UIElement {
  static get observedAttributes() {
    return ["hidden"];
  }

  render() {
    if (!this._panel) {
      this._panel = this.ownerDocument.createElement("div");
      this._panel.className = "uif-tab-panel";
      this._panel.append(...this.childNodes);
      this.append(this._panel);
    }

    this.setAttribute("role", "tabpanel");
    this.tabIndex = 0;
  }
}

define("uif-tab-panel", UITabPanel);
export { UITabPanel };
