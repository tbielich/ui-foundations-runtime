---
layout: layouts/docs.njk
title: Dialog
description: Native dialog for focused interactions that temporarily require user attention.
navTitle: Dialog
order: 22
permalink: /components/dialog/
playgroundUrl: /components/dialog-playground/
playgroundLabel: Open Dialog Playground
---
{% import "macros/ui.njk" as uif %}
{% import "macros/component-docs.njk" as docs %}


<div class="docs-hero">
{% call docs.preview() %}
<button class="uif-button solid" type="button" id="dialog-demo-trigger">Open dialog</button>
<uif-dialog id="dialog-demo" title="Save your changes?" description="Review your changes before saving." dismissible="true" confirm-label="Save changes" cancel-label="Keep editing"><p>This example does not save any data.</p></uif-dialog>
{% endcall %}
{{ docs.links(playgroundUrl, playgroundLabel, figmaConnections.urlsByName[page.fileSlug]) }}
</div>

<h2 id="anatomy">Anatomy</h2>

<div class="docs-options-table-wrap">
<table class="docs-options-table">
<thead><tr><th>Part</th><th>Purpose</th></tr></thead>
<tbody>
<tr><td>Title</td><td>Names the task or decision and provides the accessible name.</td></tr>
<tr><td>Description and content</td><td>Explain what the user needs to review.</td></tr>
<tr><td>Actions</td><td>Provide an explicit confirm or cancel choice.</td></tr>
<tr><td>Close control</td><td>Dismisses the dialog when dismissible is enabled.</td></tr>
</tbody>
</table>
</div>

<h2 id="options">Options</h2>

<div class="docs-table-wrap">
<table class="docs-options-table">
<thead><tr><th>Attribute</th><th>Default</th><th>Purpose</th></tr></thead>
<tbody><tr><td><code>title</code></td><td>Empty</td><td>Visible title; supply a meaningful name.</td></tr><tr><td><code>description</code></td><td>Empty</td><td>Optional supporting text.</td></tr><tr><td><code>dismissible</code></td><td><code>true</code></td><td>Set to <code>false</code> to prevent cancellation and Escape dismissal.</td></tr><tr><td><code>open</code></td><td>Absent</td><td>Presence opens the modal. Remove it to close.</td></tr><tr><td><code>confirm-label</code></td><td>Confirm</td><td>Label for the primary action.</td></tr><tr><td><code>cancel-label</code></td><td>Cancel</td><td>Label for the cancellation action.</td></tr></tbody>
</table>
</div>

<h2 id="usage">Usage</h2>

Use Dialog for a task or decision that temporarily requires the user's attention.
Use inline content for information that does not need to block the current flow.

```html
<uif-dialog title="Save your changes?" confirm-label="Save changes">
  <p>Review your changes before continuing.</p>
</uif-dialog>
```

The example above shows the element's markup. Opening it requires registration
and an explicit trigger. Your application handles the confirm event and decides
when to close the dialog.

<h2 id="keyboard-interactions">Keyboard interactions</h2>

<div class="docs-table-wrap">
<table class="docs-options-table">
<thead><tr><th>Key</th><th>Behavior</th></tr></thead>
<tbody><tr><td>Tab / Shift + Tab</td><td>Move between focusable controls inside the modal.</td></tr><tr><td>Escape</td><td>Close when dismissible is enabled.</td></tr><tr><td>Enter / Space on an action</td><td>Activate the focused button.</td></tr></tbody>
</table>
</div>

<h2 id="behavior">Behavior</h2>

- Opening uses native <code>showModal()</code>.
- A dismissible Dialog closes through the explicit close control or Escape.
- Backdrop clicks do not dismiss the Dialog.
- Confirm emits <code>uif-dialog-confirm</code> and does not force close.
- Cancel emits <code>uif-dialog-cancel</code> and closes a dismissible Dialog.
- Closing emits <code>uif-dialog-close</code>.
- Browser Back/history behavior belongs to the embedding application.
- Dialog does not define Alert, S/M/L, or density variants.

<h2 id="accessibility">Accessibility</h2>

- Every Dialog requires an accessible name through its visible title.
- A concise description is associated with <code>aria-describedby</code> when provided.
- Native modal behavior provides top-layer presentation, background inertness, and focus containment.
- Focus returns to the invoking control when it still exists and can receive focus.
- If the invoker is removed or disabled, the consumer decides the appropriate fallback focus target.

<h2 id="composition">Composition</h2>

<p>Alert is a separate reusable component. Place Alert inside Dialog when the flow needs warning, error, or status messaging; do not convert Dialog itself into an alert variant.</p>

<h2 id="theming">Theming</h2>

Dialog combines its surface styles with Button patterns for its actions.
Use the brand and scheme switches in the preview to inspect those contexts.

<h2 id="integration">Integration</h2>

Register `UIDialog` from the aggregate `ui-foundations/elements` entry.

```js
import "ui-foundations/elements";

const dialog = document.querySelector("uif-dialog");
const trigger = document.querySelector("#open-dialog");
trigger.addEventListener("click", () => dialog.setAttribute("open", ""));
dialog.addEventListener("uif-dialog-confirm", () => {
  // Save or validate in your application, then close when appropriate.
  dialog.removeAttribute("open");
});
```

Provide a button with `id="open-dialog"` for this example. Confirm does not close
a dialog automatically, so validation can keep it open when necessary.

<script type="module">
  import "{{ '/vendor/ui-foundations/elements/ui-dialog.js' | sitePath }}";
  const dialog = document.getElementById("dialog-demo");
  document.getElementById("dialog-demo-trigger").addEventListener("click", () => dialog.setAttribute("open", ""));
  dialog.addEventListener("uif-dialog-confirm", () => dialog.removeAttribute("open"));
</script>
