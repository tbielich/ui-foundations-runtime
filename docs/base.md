# Base — Native UI

Base is an optional, code-only presentation entry. It applies the shared reset,
Brand A heading sizes, line heights, weights and component sizing, using
`system-ui, sans-serif`. Its geometry dependency closure is generated from existing
Brand A tokens; it does not copy a palette, font families, radii or shadows.
Native browser controls, focus indicators and validation remain in charge.

## Use Base

```js
import "ui-foundations/base.css";
import "ui-foundations/elements";
```

Choose this instead of `core.css`/`ui.css` or the existing branded bundle. Loading
Base after the branded CSS does not undo those rules. No `data-brand="base"` is
required: Base is a rendering entry, not another Figma Brand.

The host owns color-scheme policy. For example, `color-scheme: light dark` on the
host document lets native controls follow the browser's selected scheme. Base
uses the system Sans Serif stack and does not force a Brand palette onto the host document.

## Enhanced behavior

The same custom elements and macros remain usable. For progressive enhancement
of static markup, import the existing modules explicitly:

```js
import { Calendar } from "ui-foundations/behaviors/calendar";
import { DateInput } from "ui-foundations/behaviors/date-input";
import { enhanceInputFields } from "ui-foundations/behaviors/input-field";
import { enhanceTable } from "ui-foundations/behaviors/table";
```

Instantiate `Calendar`/`DateInput` with the corresponding markup root and call the
enhancement functions for your container. Table sorting emits `uif:sort` with a
column and direction; applying that request to application data remains the
consumer's responsibility.

Alongside the sizing reset, Base supplies structural styles needed for hidden panels, tooltip and
calendar placement, selected-state indication, input auxiliary controls and icons.
Native `details`, `dialog`, `meter` and `progress` visuals are preserved. Custom
compositions such as a calendar grid or table resizer remain UIF enhancements;
they are not claims of pixel-identical OS widgets. Their overlay/selection colors
use CSS system colors rather than a UIF Brand palette.

## Fonts belong to the consumer

The npm package supplies family roles and fallback stacks but no font binaries,
`@font-face` declarations or font-service requests. A/B/C consumers provide their
own licensed, preferably self-hosted fonts. Missing faces fall through the declared
Basic families to generic platform families. The documentation is a separate
consumer and explicitly loads its local Brand font assets; those assets are not
part of the npm package. Base requires none of them.

## Sizing boundary

The sizing reset shares Brand A numerical typography and component dimensions.
Text widths vary with platform fonts. Native select widgets may ignore CSS line
height or enforce platform minimums; their font size, padding and declared height
still use the shared values. Native meter/progress tracks and checkbox/switch
artwork retain platform rendering. Calendars keep their cell sizes and scroll
locally when the available width is smaller than the grid. This is a native
presentation option, not a pixel-identical rendering of Brand A.
