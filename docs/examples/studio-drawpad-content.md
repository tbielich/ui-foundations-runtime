# Studio adoption after Runtime release

The current published `ui-foundations@1.1.0` does not contain Content or the legacy CSS entry. Keep Studio pinned to its published package; do not point its dependency at the Runtime worktree. The adjacent patch is prepared against the input hash in `docs/evidence/content-342/studio-source-manifest.json` and has passed `git apply --check`.

After the reviewed Runtime change is merged and a package containing these capabilities is published:

1. Install that exact published version in Studio and update its lockfile. The proposed release is 1.2.0 because Content and the optional legacy CSS entry add public capabilities; this is not a publication instruction.
2. Apply `studio-drawpad-content.patch` in the existing Studio deployment worktree.
3. Copy the unmodified DejaVu Sans Mono font, licence and source metadata from `site/assets/fonts/brand/dejavu-*` into `app/drawpad/fonts/`, keeping the filename `dejavu-sans-mono.ttf`. Font loading is consumer-owned; this is not an application component skin or a new Runtime token.
4. Run Studio's package build. It copies only the installed npm distribution, app HTML, consumer font loader and licensed font assets into `public/`.
5. Verify the built package consumer on desktop, mobile and the actual BOOX before publishing `public/`.

The patch uses `uif-code` for all exported source and adds `uif-code-grid` only to Unicode output. JSON, SVG and CSS keep ordinary code line height. Whitespace is preserved with `wrap="off"`. It loads the Runtime legacy bundle only when CSS layers are unavailable, before the consumer font-role override. Existing artwork geometry, export formats and weights 100–900 remain intact.

An isolated diagnostic at `/studio-content-check/` was tested on the real BOOX using the candidate Runtime build. This establishes compatibility evidence for the prepared changes; it is not published-package adoption or a production deployment. The original online Studio tab and actual app source/dependency were preserved. The baseline CSS geometry also benefits from the restored border-box reset, but no general CSS/SVG renderer equivalence is claimed.
