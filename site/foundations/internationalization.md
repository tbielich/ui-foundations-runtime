---
layout: layouts/docs.njk
title: Internationalization
description: Direction, labels, and locale considerations when composing an interface.
navTitle: Internationalization
order: 6
permalink: /foundations/internationalization/
---
{% import "macros/foundation-docs.njk" as foundation %}


{% call foundation.feature("Direction & language", "Let content set the direction.", "Keep text, alignment, and spacing responsive to the language of the interface.") %}
<div class="foundation-directions"><div dir="ltr"><small>English · left to right</small><p lang="en">Your next journey</p></div><div dir="rtl"><small>العربية · من اليمين إلى اليسار</small><p lang="ar">رحلتك القادمة</p></div></div><p class="foundation-caption">Text direction example. Review complete patterns separately in each supported direction.</p>
{% endcall %}


## Text and labels

Supply translated labels, help text, and messages in your application. Allow
space for longer text and check wrapping at narrow widths. Localise accessible
names as well as visible text.

## Right-to-left layouts

Set `dir="rtl"` on the document for a right-to-left interface. Prefer logical
CSS properties such as `margin-inline-start` for application layouts.

Review each pattern you use. RTL support is not verified across the whole
library; some styles still use physical alignment, including table text.
Check icon direction, control order, alignment, and keyboard behavior in context.

## Dates and numbers

Your application supplies locale-specific formats and content. Check the Date
Picker's documented format and behavior before using it for another locale;
a document language or direction attribute does not provide date localisation.

{{ foundation.next("/components/date-picker/", "Check date entry", "Review the format and interactions before adapting to a locale.") }}
