# Font delivery and licence review

Review date: 2026-11-11, Europe/Berlin. Scope: the local UIF Runtime implementation, generated package assets, documentation and playground. This is a technical and source-based legal risk review, not a legal opinion, blanket GDPR certification, review of a deployed website, or advice on responding to a particular demand letter.

## Finding and remediation

The pre-existing `src/core/base/fonts.css` imported Inter/Rokkitt dynamically from `fonts.googleapis.com`. Therefore adding local B/C fonts alone would not have removed third-party font requests. This import has been replaced with local, pinned Inter/Rokkitt WOFF2 files and accompanying original licence texts, notices and source hashes. All seven Runtime webfont families now use package-relative URLs. Orbitron uses its byte-identical original upstream TTF; the other six use WOFF2. Documentation CSP no longer permits Google font/style origins. Downloads during development are distinct from requests by visitors at runtime.

Official German supervisory guidance recommends hosting the font files locally to avoid transferring visitor data to the external font service. This is the approach implemented here. The cited guidance is from 2022; it must not be described as evidence of a new November 2026 warning-letter wave. See [LfD Niedersachsen, 24 November 2022](https://www.lfd.niedersachsen.de/startseite/infothek/presseinformationen/abmahnungen-zu-datenschutzverstossen-auf-webseiten-vermeiden-google-fonts-lokal-einbinden-217509.html) and [HBDI, 1 November 2022](https://datenschutz.hessen.de/datenschutz/internet-und-medien/google-fonts-abmahnungen).

## Current legal development and its limits

The BGH referred questions concerning dynamic IP addresses and deliberately provoked compensation claims in its [28 August 2025 order, VI ZR 258/24](https://juris.bundesgerichtshof.de/cgi-bin/rechtsprechung/document.py?Gericht=bgh&Art=en&nr=143100). The [Advocate General's Opinion of 5 November 2026, C-654/25, ECLI:EU:C:2026:948](https://curia.europa.eu/juris/document/document.jsf?docid=316768&doclang=DE) proposes rejecting non-material damage where a person deliberately, repeatedly and automatically provokes the infringement to obtain compensation. This is an Advocate General's proposal, not a final Court judgment and not permission for arbitrary third-party font requests. No current new warning-letter campaign was established by the reviewed primary sources. Actual letters, deadlines and claims need individual qualified legal assessment.

## Bundled font licence inventory

| Family | Shipped licence | Treatment |
| --- | --- | --- |
| Inter | SIL OFL 1.1 | Local WOFF2 compression; complete copyright/licence, source and hashes |
| Rokkitt | SIL OFL 1.1 | Local WOFF2 compression; complete copyright/licence, source and hashes |
| Roboto Slab | Apache 2.0 | Existing local asset, full licence and conversion notice retained |
| Exo 2 | SIL OFL 1.1 | Local WOFF2 compression, no subsetting |
| Orbitron | SIL OFL 1.1, Reserved Font Name Orbitron | Exact original upstream TTF; no conversion or font modification |
| Manrope | SIL OFL 1.1 | Local WOFF2 compression, no subsetting |
| Bricolage Grotesque | SIL OFL 1.1; no reserved name declared in supplied header | Modified by fixing optical size14/width100; variable weight retained; modification described in conversion notice |
| SF Mono | No Apple binary supplied | Installed-font reference only, with terminal `monospace`; no redistribution right inferred |

The licence files travel with the fonts under `src/assets/fonts/runtime`, are copied to `dist/assets/fonts/runtime`, and are included in the package file inventory. Licences for those assets remain their respective OFL/Apache licences; the package's own licence does not replace them. No standalone sale or author endorsement is claimed.

The [official OFL FAQ](https://openfontlicense.org/ofl-faq/) permits self-hosted webfont distribution subject to its conditions and distinguishes compression-only WOFF/WOFF2 conversion from modified fonts. Reserved-name restrictions and preservation of copyright/licensing metadata matter. The specific bundled licence texts, rather than the fact that a font appears on Google Fonts, are the reviewed permissions. Retain these files when distributing the package or copying assets into a consumer.

## Verification and boundaries

The network gate must observe actual browser requests, without stripping imports or blocking Google requests to hide them. A source scan alone is insufficient. Browser regression tests exercise all three brands in both schemes, selected actual platform fonts, primary font failure, Basic fallback and Orbitron's missing uppercase sharp-S glyph. The remaining layout stress tests are reported separately from font/network delivery.

The earlier conversation experiment `typography-next.html` is a separate local preview and used an external Google stylesheet. It is not shipped in Runtime or the docs site and is not covered by the production-package zero-external-request gate. Do not publish that old experiment unchanged. Figma's own application/service processing, hosting logs, other third-party services and a deployed consumer's integration are outside this bounded review. A later deployment requires checking its actual network behaviour again.

The independent Orbitron WOFF2 review found only head bookkeeping changes and omission of an empty DSIG table, but that is not literal byte-for-byte identity. To avoid relying on a conditional RFN conversion interpretation, the final implementation ships the exact upstream TTF instead. Its hash equals the pinned source hash. Earlier WOFF2 review records remain historical evidence; that converted binary is removed from the shipping source.
