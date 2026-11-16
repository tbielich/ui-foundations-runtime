// Native properties are authoritative; HTML cannot express indeterminate.
const initialized = new WeakSet();

export function initializeCheckboxes(root = document) {
  for (const input of root.querySelectorAll('input.uif-checkbox[type="checkbox"]')) {
    if (initialized.has(input)) continue;
    initialized.add(input);
    if (input.hasAttribute("data-indeterminate")) input.indeterminate = true;
    const sync = () => {
      input.classList.toggle("is-checked", input.checked);
      input.classList.toggle("is-indeterminate", input.indeterminate);
      // Native semantics expose checked/mixed without a stale ARIA override.
      input.removeAttribute("aria-checked");
    };
    sync();
    input.addEventListener("change", sync);
  }
}

initializeCheckboxes();
