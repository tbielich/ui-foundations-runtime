import { UIElement, define } from "./base.js";
import { renderSymbol } from "../ui/components/symbol.js";

/** Decorative only. The parent supplies meaning and interaction. */
class UISymbol extends UIElement {
  static get observedAttributes() {
    return ["name", "weight"];
  }

  render() {
    this.innerHTML = renderSymbol(this.getAttr("name"), this.getAttr("weight", "400"));
  }
}

define("uif-symbol", UISymbol);
export { UISymbol };
