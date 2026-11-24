import { UIElement, define } from "./base.js";

function targetFor(tag) {
  return tag.querySelector(":scope > .uif-tag > .uif-tag-remove") || tag;
}

/** A removable or static categorization label. */
class UITag extends UIElement {
  static get observedAttributes() {
    return ["label", "size", "icon", "avatar-src", "removable", "remove-label"];
  }

  render() {
    const label = this.getAttr("label").trim() || this.textContent.trim() || "Tag";
    const size = this.getAttr("size") === "sm" ? "sm" : "md";
    const icon = this.getAttr("icon").trim();
    const avatarSrc = this.getAttr("avatar-src").trim();
    const removable = this.getBool("removable");

    this.setAttribute("role", "listitem");
    const tag = this.ownerDocument.createElement("span");
    tag.className = `uif-tag${size === "sm" ? " sm" : ""}`;

    if (avatarSrc) {
      const avatar = this.ownerDocument.createElement("img");
      avatar.className = "uif-tag-avatar";
      avatar.src = avatarSrc;
      avatar.alt = "";
      avatar.setAttribute("aria-hidden", "true");
      tag.append(avatar);
    } else if (icon) {
      const iconElement = this.ownerDocument.createElement("span");
      iconElement.className = "uif-icon uif-tag-icon";
      iconElement.style.setProperty("--uif-icon-src", `url('/assets/icons/${icon}.svg')`);
      iconElement.setAttribute("aria-hidden", "true");
      tag.append(iconElement);
    }

    const text = this.ownerDocument.createElement("span");
    text.className = "uif-tag-label";
    text.textContent = label;
    tag.append(text);

    if (removable) {
      const remove = this.ownerDocument.createElement("button");
      remove.className = "uif-tag-remove";
      remove.type = "button";
      remove.setAttribute("aria-label", this.getAttr("remove-label", `Remove ${label}`));
      const removeIcon = this.ownerDocument.createElement("span");
      removeIcon.className = "uif-icon";
      removeIcon.style.setProperty("--uif-icon-src", "url('/assets/icons/cross.svg')");
      removeIcon.setAttribute("aria-hidden", "true");
      remove.append(removeIcon);
      remove.addEventListener("click", () => this.removeTag());
      tag.append(remove);
    }

    this.replaceChildren(tag);
    if (!this.closest("uif-tag-group")) this.tabIndex = removable ? -1 : 0;
  }

  removeTag() {
    const group = this.closest("uif-tag-group");
    if (group && typeof group.removeTag === "function") {
      group.removeTag(this);
      return;
    }
    const detail = { label: this.getAttr("label").trim() || "Tag", index: 0 };
    this.dispatchEvent(new CustomEvent("uif-remove", { bubbles: true, detail }));
    this.remove();
  }
}

/** A labelled list with roving focus and stable focus after tag removal. */
class UITagGroup extends UIElement {
  static get observedAttributes() {
    return ["label", "overflow"];
  }

  render() {
    if (!this._group) {
      this._group = this.ownerDocument.createElement("div");
      this._group.className = "uif-tag-group";
      this._group.setAttribute("role", "list");
      this._group.append(...this.childNodes);
      this.append(this._group);
      this._group.addEventListener("keydown", (event) => this._handleKeydown(event));
    }
    this._group.setAttribute("aria-label", this.getAttr("label", "Tags"));
    this._group.dataset.overflow = this.getAttr("overflow") === "scroll" ? "scroll" : "wrap";
    queueMicrotask(() => this._syncRoving());
  }

  _tags() {
    return [...this._group.querySelectorAll(":scope > uif-tag")];
  }

  _syncRoving(preferredIndex = 0) {
    const tags = this._tags();
    tags.forEach((tag, index) => {
      const target = targetFor(tag);
      tag.tabIndex = target === tag && index === preferredIndex ? 0 : -1;
      if (target !== tag) target.tabIndex = index === preferredIndex ? 0 : -1;
    });
  }

  _focusAt(index) {
    const tags = this._tags();
    if (!tags.length) {
      this.tabIndex = -1;
      this.focus();
      return;
    }
    const resolvedIndex = (index + tags.length) % tags.length;
    this._syncRoving(resolvedIndex);
    targetFor(tags[resolvedIndex]).focus();
  }

  _handleKeydown(event) {
    const tag = event.target.closest?.("uif-tag");
    const tags = this._tags();
    const index = tags.indexOf(tag);
    if (index < 0) return;

    let nextIndex = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = index + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = index - 1;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tags.length - 1;
    else if ((event.key === "Delete" || event.key === "Backspace") && tag.hasAttribute("removable")) {
      event.preventDefault();
      this.removeTag(tag);
      return;
    } else return;

    event.preventDefault();
    this._focusAt(nextIndex);
  }

  removeTag(tag) {
    const tags = this._tags();
    const index = tags.indexOf(tag);
    if (index < 0 || !tag.hasAttribute("removable")) return;
    const detail = { label: tag.getAttr("label").trim() || "Tag", index };
    tag.dispatchEvent(new CustomEvent("uif-remove", { bubbles: true, detail }));
    tag.remove();
    queueMicrotask(() => this._focusAt(Math.min(index, this._tags().length - 1)));
  }
}

define("uif-tag", UITag);
define("uif-tag-group", UITagGroup);
export { UITag, UITagGroup };
