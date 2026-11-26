# Pi chat integration for issue 342

The adjacent patch is based on the existing local `pi-dashboard-codex-chat` source, including its pre-existing uncommitted Codex work; input hashes are recorded in the evidence manifest. No Pi files were overwritten. Apply with `git apply --check` first to detect concurrent changes.

Prerequisite: install a published `ui-foundations` package version exporting `ui-foundations/behaviors/content` and including the new Content CSS. Version 1.1.0 does not contain it. Use an exact release version and commit the consumer lockfile; do not use a sibling Runtime checkout in production.

The patch adds a Vite module entry importing the package and styles. Only assistant messages are formatted; user messages and source/evidence metadata stay text. Before the module loads (or if it fails), textContent remains the safe fallback. Existing history is upgraded after module load. Code labels are German, headings start at h4 below the conversation h2 and message h3. Source content remains stored in chat history, not converted to HTML.

Validation before deployment: run the consumer build/checks after installing the released dependency, verify the patched source still applies, then confirm long answers, copy feedback, keyboard access and readable glyphs on BOOX. This patch has browser integration coverage in Runtime, not a real Pi deployment or BOOX acceptance. No server/proxy, model selection or data changes are needed.
