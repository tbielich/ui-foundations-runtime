> Historical initial failure report. The completion retest with legacy CSS and DejaVu Sans Mono is recorded in `../verification.md` and `completion.json`; those supersede the CSS/font blocker status below. Clipboard denial and untested e-ink refresh/screenreader limitations remain.

# Physical BOOX browser verification — 2026-11-26

Device: BOOX Max2Pro, Android 6.0.1, built-in com.android.browser, Android WebView Chrome/88.0.4324.181. Connected over ADB USB. ADB reverse exposes the existing local Content preview at http://127.0.0.1:18800/patterns/content/. The existing Studio drawpad tab was preserved; testing opened a separate tab. No software, browser settings, package or firmware was installed/changed.

## Observed passes

- The Content module executes on the real device. Headings, nested lists, blockquote, code block and table exist in semantic DOM.
- Test script/image payloads remain inert: no executable elements, no attack side effect, only the HTTPS link is emitted.
- Navigation drawer opens/closes, exposes the Content link and moves focus to Close navigation.
- Long code keeps its own horizontal scrolling in the documentation surface. The original page has no page-wide horizontal overflow.
- Copy failure is announced and the button re-enables. A physical Android input tap was used, not only a synthetic DOM click.

## Failures / acceptance blockers

1. CSS @layer is unsupported. A constructed stylesheet containing @layer has zero parsed rules. All inspected UIF tokens are empty. Consequently UIF component styles are ignored; unlayered documentation/Prism styles and native browser controls account for the partial visual presentation. This also explains the owner's largely native-looking Studio screenshot. A supported older-browser distribution strategy is needed in UIF; Studio must not introduce private replacement skins.
2. Clipboard write is denied in this WebView even on the localhost secure context after a physical tap. The UI announces Copy unavailable. A separate read probe returned NotAllowedError. No successful copy is claimed; manual copying is still needed on this device.
3. The native monospace fallback has equal ASCII i/W widths but unequal Unicode drawing row widths: approximately 56.62 vs 50.87 CSS px for six-character rows. Corners/lines and spaces do not share consistent glyph metrics. The screenshot confirms broken joins. A suitable consumer-loaded mono font with complete box-drawing coverage is required before claiming Unicode grid fidelity. UIF class styles and their one-em row step were ignored because of blocker 1.

## Evidence and limitations

initial.json, css-support.json, functional.json, navigation.json and copy.json contain actual device measurements. content-initial.png and unicode-output.png are device screenshots pulled with ADB. The first exec-out screenshot was contaminated by BOOX diagnostic output and replaced with a valid device-side screencap/pull.

Screenshots do not establish physical e-ink refresh/ghosting quality. No BOOX acceptance is granted. No production deployment or consumer adoption was changed. The test tab remains open at the Content output; the original drawpad tab remains intact. The temporary screenshot file on /sdcard is removed after capture; USB forwarding remains for continued local review.

## Installed-font follow-up

Read actual font files from /system/fonts using ADB and inspected cmap/hmtx locally with fontTools in a temporary analysis environment. No fonts were installed or changed on the BOOX or bundled into the project. Android fonts.xml maps monospace to DroidSansMono and serif-monospace/Courier New/courier to CutiveMono. Both fonts lack the tested box-drawing, arc and block glyphs. CourierStd contains straight box lines and some full/half blocks with consistent 0.6em advance, but lacks rounded corners, quadrant blocks and circle arcs; the filename is not a registered Android browser family.

NotoSansSymbols-Regular-Subsetted contains the box-drawing corners/lines and blocks at 0.708008em, while DroidSansMono spaces are 0.600098em. It contains no ordinary space or ASCII letters in this subset. The browser mixes them: at 32px the 6-character rectangle top/bottom are 135.9375px, but its space-containing middle row is 122.125px. The named Courier/Cutive aliases also mismatch. This directly accounts for the broken rectangle alignment. Alternate quarter/half arcs have a different 0.604004em advance even within the symbol font.

Evidence: font-coverage.json, symbol-font-coverage.json, font-browser-metrics.json. None of the three tested mono candidates provides the complete tested Drawpad character repertoire. A consumer-loaded font with consistent space/box/arc/block advances is still needed; merely changing the CSS family to an installed filename will not solve this.
