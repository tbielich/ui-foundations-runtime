const resetBindings = new WeakMap();

/** Synchronize a light-DOM Custom Element after its owning form resets. */
export function connectFormReset(element, form, synchronize) {
  disconnectFormReset(element);
  if (!form) return;

  const handleReset = (event) => {
    setTimeout(() => {
      if (!event.defaultPrevented && element.isConnected && element.closest("form") === form) {
        synchronize();
      }
    }, 0);
  };
  form.addEventListener("reset", handleReset);
  resetBindings.set(element, { form, handleReset });
}

/** Remove a previously registered form reset listener. */
export function disconnectFormReset(element) {
  const binding = resetBindings.get(element);
  if (!binding) return;
  binding.form.removeEventListener("reset", binding.handleReset);
  resetBindings.delete(element);
}
