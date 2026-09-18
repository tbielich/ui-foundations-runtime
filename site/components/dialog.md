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

<h2 id="usage">Usage</h2>

<p>Dialog follows the native HTML <code>&lt;dialog&gt;</code> model. Use it for focused decisions or tasks that temporarily block interaction with the page.</p>

{% call uif.dialog(title="Confirm action", description="Review the information before continuing.", dismissible=true, open=false) %}
  <p>Dialog content can contain composed UIF components, including Alert when warning or error feedback is needed.</p>
{% endcall %}

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
