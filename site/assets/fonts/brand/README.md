# Documentation-owned brand fonts

These seven families support the UIF documentation and playground experience.
`site/assets/brand-fonts.css` opts into them explicitly, using relative URLs in
`fonts/brand/`. The Runtime npm package contains no font binaries, no font-face
loader and no automatic request to a font service. Consumers own font loading.

All seven documentation webfont families are self-hosted here, including
their licenses and conversion/source records. Inter and Rokkitt no longer use
the Google Fonts API. Exo 2, Orbitron, Manrope and Bricolage Grotesque supply
Brand B/C; Roboto Slab supplies Brand A headings. Bricolage is instanced at
optical size 14 and width 100 to match Figma, retaining variable weight.
SF Mono remains a locally installed fallback reference; no Apple font binary is
distributed. Brand font stacks use the existing Basic Sans/Serif fallbacks and
generic terminals. Family primitives use the concrete catalogue; the
legacy Sans/Serif/Mono JSON and CSS names are compatibility output projections,
not additional canonical families. See the issue #339 implementation evidence.

Orbitron is shipped as its unmodified upstream TTF, avoiding ambiguity around
Reserved Font Name conditions for modified conversions. Other families use
WOFF2. Font files retain their bundled OFL/Apache licences independently of
the package licence; keep the notices and source records when redistributing.
