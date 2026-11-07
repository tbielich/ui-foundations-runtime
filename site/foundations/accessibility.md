---
layout: layouts/docs.njk
title: Accessibility
description: Accessibility requirements and checks for interfaces built with UI Foundations.
navTitle: Accessibility
order: 3
permalink: /foundations/accessibility/
---
{% import "macros/foundation-docs.njk" as foundation %}


Accessibility is a requirement for patterns, components, examples, and documentation.
Use the guidance below when building and reviewing an interface.

{% call foundation.feature("In context", "Make the next step clear.", "A visible label identifies the field. An associated message explains the problem and how to recover.") %}
<div class="foundation-sample"><label for="foundation-email">Email address</label><input id="foundation-email" type="email" value="alex@" aria-invalid="true" aria-describedby="foundation-email-error" autocomplete="off"><p class="foundation-caption" id="foundation-email-error"><strong>Incomplete email.</strong> Enter a full address, such as alex@example.com.</p></div><p class="foundation-caption">Example error state. Try focusing the field with your keyboard.</p>
{% endcall %}


## Implementation expectations

Accessibility is a baseline requirement for shipped patterns, components,
examples, and documentation in this repository. Local implementation guidance
focuses on how accessibility principles are expressed in code and validation.

### Semantic markup

Components use the correct HTML element or ARIA role so assistive technology can
identify them. Buttons are `<button>`, links are `<a>`, form controls use
`<input>`, `<select>`, or `<textarea>` with associated `<label>` elements.

### Keyboard access

Check that each interactive control is reachable and operable with a keyboard,
with visible focus and a logical focus order. Follow the keyboard guidance on
the component page, especially for composite widgets and dialogs.

### State communication

States like disabled, checked, expanded, selected, and invalid are communicated
through native HTML attributes or ARIA states — not through visual styling
alone.

### Color and contrast

Check text, controls, and focus indicators against the backgrounds used in
your application. Test the actual state and brand/scheme combination, including
any token overrides. Using a semantic token alone does not establish contrast
for every possible composition.

## Design checklist for accessibility

When reviewing an interface, check:

- Accessible use of color (WCAG 1.4.1)
- Accessible contrast for text (WCAG 1.4.3)
- Accessible contrast for UI components (WCAG 1.4.11)
- Keyboard interactions documented
- Screen reader behavior verified

## Testing expectations

Automated checks catch structural issues. Manual testing with screen readers
(VoiceOver, NVDA) and keyboard-only navigation is required before a component
reaches stable status.

{{ foundation.next("/patterns/form/", "Build an accessible form", "Apply labels, help text, and validation in context.") }}
