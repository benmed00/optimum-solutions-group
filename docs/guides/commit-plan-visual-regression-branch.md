# Commit Plan: Current Changes on `feature/consolidated-improvements-2025`

**Branch:** `feature/consolidated-improvements-2025`  
**Status:** Up to date with `origin` — all changes are local (staged, unstaged, untracked)  
**Date:** 2026-03-08

---

## Summary of Current Changes

| Category | Staged | Unstaged | Untracked |
| -------- | ------ | -------- | --------- |
| **Documentation** | `docs/guides/visual-regression-tests.md` (new) | Same file (edits) | — |
| **Package** | `package.json`, `package-lock.json` | `package.json` (edits) | — |
| **Playwright** | `playwright.visual.config.js` | Same (edits) | `playwright.config.js` |
| **Scripts** | — | — | `scripts/run-visual-all.js`, `scripts/kill-port.js` |
| **Tests** | — | `homepage.spec.js` | `tests/visual/helpers.js` |
| **Snapshots** | 47 renames + 4 new | 22 modified | 1 new |
| **Artifacts** | `test-results/.last-run.json` | Same | — |

---

## Proposed Commit Structure

### Commit 1: `chore(tooling): add visual test scripts and kill-port utility`

**Files:**
- `scripts/run-visual-all.js` (new)
- `scripts/kill-port.js` (new)
- `package.json` (add `test:visual:all`, `kill-port` scripts + `kill-port` dep)
- `package-lock.json`

**Rationale:** Scripts and package changes are tooling-only. `run-visual-all.js` enables `npm run test:visual:all` for desktop+mobile+tablet. `kill-port.js` is a cross-platform port-killer utility.

---

### Commit 2: `test(visual): add layout stability helpers for flaky screenshots`

**Files:**
- `tests/visual/helpers.js` (new)

**Rationale:** Shared utilities (`waitForLayoutStability`, `waitForFontsReady`) used by visual tests. Standalone commit for clarity.

---

### Commit 3: `test(visual): use platform-agnostic snapshot names and add mobile/tablet baselines`

**Files:**
- `playwright.visual.config.js` (pathTemplate without `{platform}`, VISUAL_ALL logic)
- `tests/visual/homepage.spec.js` (import helpers, use stabilization where needed)
- All snapshot renames: `*-win32.png` → `*-desktop.png` / `*-mobile.png` / `*-tablet.png`
- New snapshots: `homepage-dark-theme-chromium-mobile.png`, `homepage-full-page-chromium-mobile.png`, `homepage-light-theme-chromium-mobile.png`, `homepage-navigation-chromium-mobile.png`, `homepage-navigation-chromium-tablet.png`, `homepage-button-2-hover-chromium-tablet.png`

**Rationale:** Single coherent change: platform-agnostic naming + mobile/tablet coverage. Same baselines work on Windows (local) and Linux (CI).

---

### Commit 4: `docs: add visual regression tests guide`

**Files:**
- `docs/guides/visual-regression-tests.md` (new, final version)

**Rationale:** Documentation for the visual test setup, failure modes, and how to fix them.

---

### Commit 5 (optional): `chore: add default Playwright config delegating to visual config`

**Files:**
- `playwright.config.js` (new)

**Rationale:** Allows `npx playwright test` to run visual tests without specifying config. Optional if you prefer explicit `--config=playwright.visual.config.js`.

---

## Exclusions (Do Not Commit)

| File | Reason |
| ---- | ------ |
| `test-results/.last-run.json` | Gitignored; local run artifact |

---

## Execution Order

1. Unstage everything: `git reset HEAD`
2. Commit 1 → Commit 2 → Commit 3 → Commit 4 → (Commit 5 if desired)
3. Push: `git push origin feature/consolidated-improvements-2025`

---

## Alternative: Fewer Commits

If you prefer fewer, larger commits:

- **Option A:** Merge commits 1+2 into one: `chore(test): add visual test tooling and stability helpers`
- **Option B:** Merge commits 3+4: `test(visual): platform-agnostic snapshots, mobile/tablet baselines, and guide`

---

## Notes

- **Snapshot conflicts:** Some snapshots are both staged (rename) and unstaged (content change). Final commit should include the latest content; run `test:visual:update` once to regenerate if needed.
- **playwright.config.js:** Untracked; include only if you want `npx playwright test` to default to visual tests.

---

**Awaiting your consent before executing any git operations.**
