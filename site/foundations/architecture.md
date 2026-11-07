---
layout: layouts/docs.njk
title: System Overview
description: How tokens, patterns, and components fit together in an application.
navTitle: System Overview
order: 1
permalink: /foundations/architecture/
---
{% import "macros/foundation-docs.njk" as foundation %}


{% call foundation.feature("The system", "From values to interfaces.", "Start with tokens, use patterns for individual controls, and compose them into an interaction.") %}
<ol class="foundation-stack"><li><span>01</span><div><strong>Tokens</strong><small>Color, spacing, type, and shape</small></div></li><li><span>02</span><div><strong>Patterns</strong><small>Button, Input, Checkbox</small></div></li><li><span>03</span><div><strong>Components</strong><small>Date Picker, Dialog</small></div></li><li><span>04</span><div><strong>Your interface</strong><small>Content, data, and application behavior</small></div></li></ol>
{% endcall %}


## Tokens

Tokens carry visual decisions such as color, spacing, typography, and borders.
The model follows **Core → Appearance → Semantics → Patterns**. Brand, Scheme,
and Scale are independent Appearance concerns.

Use the [token reference](/foundations/design-tokens/) to find the right role
before overriding a visual property.

## Patterns

[Patterns](/patterns/) provide HTML structures and CSS classes for controls
such as Button, Input, and Checkbox. Use their documented markup with the
package styles. Individual pages explain where JavaScript is needed for behavior.

## Components

[Date Picker](/components/date-picker/) and [Dialog](/components/dialog/) document
interactions that combine markup, state, and JavaScript. Check each page for
integration requirements and limitations.

Optional light-DOM Web Components provide JavaScript wrappers for supported
patterns. They use the same CSS and tokens as plain HTML. Import only the
wrappers your application needs; see [Getting Started](/getting-started/).

## Examples

[Examples](/examples/) show how to compose the building blocks into forms and
page layouts. Adapt their content, validation, and application behavior to your
own flow.

## Application responsibilities

Your application supplies content, accessible labels, business validation,
data, and actions. A styled control alone does not provide those behaviors.
Check the documented keyboard behavior and test the completed flow in context.

{{ foundation.next("/getting-started/", "Build your first interface", "Install the styles and choose an integration.") }}
