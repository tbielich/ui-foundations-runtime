/** Experimental decorative Symbol. Parent owns meaning; no label or role API. */
export interface SymbolProps {
  name: "checkmark" | "dash" | "chevron" | "plus" | "cross";
  /** Experimental stroke control, 100..900; default 400. Separate from font weight. */
  weight?: number | string;
}
