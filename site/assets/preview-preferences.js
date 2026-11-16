/* Preview preferences are consumer state; the documentation root stays fixed. */
(function () {
  var storageKey = "uif-docs-preview-context";
  function validBrand(value) { return ["a", "b", "c"].indexOf(value) !== -1; }
  function validMode(value) { return ["light", "dark"].indexOf(value) !== -1; }
  function read() {
    var stored = {};
    try { stored = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch (error) { /* Storage is optional. */ }
    var params = new URL(window.location.href).searchParams;
    var brand = params.get("brand");
    var mode = params.get("mode");
    return {
      brand: validBrand(brand) ? brand : validBrand(stored.brand) ? stored.brand : "a",
      mode: validMode(mode) ? mode : validMode(stored.mode) ? stored.mode : "light"
    };
  }
  function remember(state) {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (error) { /* URL state still works. */ }
    return state;
  }
  function restore() { return remember(read()); }
  function save(next) {
    var state = read();
    if (validBrand(next.brand)) state.brand = next.brand;
    if (validMode(next.mode)) state.mode = next.mode;
    var url = new URL(window.location.href);
    url.searchParams.set("brand", state.brand);
    url.searchParams.set("mode", state.mode);
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    return remember(state);
  }
  window.UIFPreviewPreferences = { read: read, restore: restore, save: save };
})();
