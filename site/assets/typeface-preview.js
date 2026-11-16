/* This control changes specimen visibility, never the document Brand context. */
(function () {
  var section = document.getElementById("typefaces");
  if (!section) return;
  var buttons = section.querySelectorAll("[data-typeface-brand]");
  var panels = section.querySelectorAll("[data-typeface-panel]");
  function select(brand) {
    buttons.forEach(function (item) {
      item.setAttribute("aria-pressed", String(item.dataset.typefaceBrand === brand));
    });
    panels.forEach(function (panel) {
      panel.hidden = panel.dataset.typefacePanel !== brand;
    });
  }
  select(window.UIFPreviewPreferences.restore().brand);
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      select(window.UIFPreviewPreferences.save({ brand: button.dataset.typefaceBrand }).brand);
    });
  });
})();
