/* Shared docs shell enhancement; the existing sidebar is moved, never cloned. */
(function () {
  const drawer = document.querySelector(".docs-navigation-drawer");
  const sidebar = document.querySelector(".docs-sidebar");
  const trigger = document.querySelector(".docs-navigation-trigger");
  const closeButton = document.querySelector(".docs-navigation-close");
  if (!drawer || !sidebar || !trigger || typeof drawer.showModal !== "function") return;

  const home = document.createComment("Documentation sidebar position");
  sidebar.before(home);
  let previousOverflow;
  let backdropPointer = false;
  document.documentElement.classList.add("docs-navigation-ready");

  // CSS owns the responsive threshold, avoiding a second breakpoint in JS.
  function isMobile() {
    return getComputedStyle(trigger.parentElement).display !== "none";
  }

  function finishClose() {
    if (previousOverflow === undefined) return;
    document.body.style.overflow = previousOverflow;
    previousOverflow = undefined;
    trigger.setAttribute("aria-expanded", "false");
    if (isMobile()) trigger.focus({ preventScroll: true });
  }

  function close() {
    if (!drawer.open) return;
    drawer.close();
    finishClose();
  }

  function syncLayout() {
    if (isMobile()) {
      drawer.append(sidebar);
    } else {
      const hadFocus = drawer.open || drawer.contains(document.activeElement);
      close();
      home.after(sidebar);
      if (hadFocus) sidebar.querySelector(".docs-search-input").focus({ preventScroll: true });
    }
  }

  trigger.addEventListener("click", function () {
    if (!isMobile()) return;
    if (drawer.open) return close();
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawer.showModal();
    trigger.setAttribute("aria-expanded", "true");
    closeButton.focus({ preventScroll: true });
  });
  closeButton.addEventListener("click", close);
  drawer.addEventListener("cancel", function (event) {
    event.preventDefault();
    close();
  });
  drawer.addEventListener("close", function () {
    if (!drawer.open) finishClose();
  });
  // Keep Tab at the dialog boundaries instead of letting focus reach browser chrome.
  drawer.addEventListener("keydown", function (event) {
    if (event.key !== "Tab") return;
    const items = Array.from(drawer.querySelectorAll(
      'button, a[href], input, select, textarea, summary, [tabindex]'
    )).filter(function (element) {
      return !element.disabled && element.tabIndex >= 0 && element.getClientRects().length;
    });
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  // A drag starting inside the sidebar must not count as a backdrop tap.
  drawer.addEventListener("pointerdown", function (event) {
    backdropPointer = event.target === drawer && outside(event);
  });
  drawer.addEventListener("click", function (event) {
    if (backdropPointer && event.target === drawer && outside(event)) close();
    backdropPointer = false;
  });
  function outside(event) {
    const rect = drawer.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX >= rect.right ||
      event.clientY < rect.top || event.clientY >= rect.bottom;
  }
  window.addEventListener("resize", syncLayout);
  syncLayout();
})();
