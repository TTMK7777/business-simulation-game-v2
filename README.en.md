# Business Empire 2.0 - IT Industry Management Simulation

[日本語](./README.md) | **English**

![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat&logo=typescript&logoColor=white)
![Lit](https://img.shields.io/badge/Lit-3.3-324FFF?style=flat&logo=lit&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-125%20tests-6E9F18?style=flat&logo=vitest&logoColor=white)

> A full-fledged management simulation game where you run an IT company and aim for success through hiring and developing employees, product development, and market competition. Player actions unlock real-world management theories (PPM, Ansoff, two-factor theory, and 14 others in total) as an in-game encyclopedia, so you **learn management while you play**.

## Quick Start

```bash
npm install
npm run dev        # Start the dev server
npm run dev:sp     # LAN-exposed mode (for testing on a smartphone)
npm run build      # Production build
npm test           # Run tests
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Language | TypeScript 5.9 (`strict: true`, `noUnusedLocals`) |
| UI | Lit 3 (incremental migration) + template literals |
| Build | Vite 8 (rolldown), PWA support |
| Charts | Chart.js 4 (lazy initialization) |
| Storage | LocalForage + Zod validation |
| Testing | Vitest (125 tests) |

## Architecture

```
src/lib/
├── types/          Type definitions (GameState, Employee, Product, etc.)
├── config/         Configuration & constants (personalities, departments, skills, ceo)
├── store/          State-management singleton (gameStore)
├── managers/       Business logic (Game, HR, Finance, Product, Market, CEO, Document, Achievement, Tutorial, Visitor)
├── ui/             Rendering (renderers, modals, charts, deskView)
├── animation/      Character animation (legacy Phaser-based; current path is the lightweight cssCharacterManager)
└── game.ts         Entry point (responsible for window bindings for HTML onclick compatibility)
```

**Dependency direction**: `types/` → `config/` → `store/` → `managers/` → `ui/` → `game.ts`

## Game Modes

| Mode | Description |
|------|-------------|
| **Management Mode** | Employee hiring & development, product development, marketing, loans & repayment |
| **CEO Mode** | Document approval, policy setting, visitor handling, quarterly reviews |

## Management Theory Encyclopedia (v2.3.0)

A learning layer that unlocks real-world management theories tied to what you actually do in the game. Design principle: "**act first, name the theory afterward**" (no lecturing up front).

- **Experience-linked unlocks**: first profitable turn → break-even point, 3rd employee hired → Herzberg's two-factor theory, cash reaches a danger zone → cash-flow management, and 11 theories in total
- **CEO decision tags**: CEO-mode document approvals are tagged with "this decision was theory X" plus a one-line lesson — trade-off approvals → opportunity cost, gambling-style approvals → expected-value thinking, well-researched approvals → sunk cost
- Each theory entry = a 3-line explanation + one real-company example + one in-game hint (a character-count ceiling is pinned by tests to prevent over-explaining)

## Security

- Sanitization of LocalStorage input (escapeHtml, allowlist approach)
- Prototype-pollution countermeasures (Object.assign → restore only allowed keys)
- Lit html auto-escaping (incremental migration)
- crypto.subtle fallback for HTTP environments

## Testing

```bash
npm test           # Run all tests
npm test -- --run  # For CI (no watch mode)
```

7 test files / 125 test cases:
- DocumentManager — regression test for the F4 operator-precedence bug
- HRManager — promotion decisions, growth multipliers, team compatibility, monthly stress (added in v2.2.0)
- qualificationGenerator — qualification assignment, prerequisite checks, monthly-salary scaling (added in v2.2.0)
- storage — checksum and metadata validation
- gameStore — I-1/I-3/I-6 save-data corruption-prevention regression tests (added in v2.1.0)
- coachmark — tutorial v2 state machine and position calculations (added in v2.2.0)
- theory — theory-encyclopedia unlock conditions, CEO decision tags, definition consistency (added in v2.3.0)

## Changelog

### v2.3.0 (2026-07)

Management-theory learning layer + UI/UX improvements — PR #27-#29

- **Management Theory Encyclopedia Phase A**: experience-linked unlocking of 11 theories + unlock toast + encyclopedia UI (overview panel / list / detail)
- **Management Theory Encyclopedia Phase B**: theory tags on CEO decision results + 3 added decision theories (opportunity cost / expected-value thinking / sunk cost), bringing the total to 14
- **Achievement notification fix**: fixed a real bug where achievement-unlock effects and reward granting had never actually fired
- **UI/UX (8 items)**: fixed ranking-bar double-display bug / turn-advance FAB (with a settlement-week warning) / cash count-up + danger-zone warning / revived the qualifications tab / monthly income/expense forecast display / stronger achievement-unlock effects
- **Accessibility**: suppressed infinite animations under `prefers-reduced-motion`
- **Tests**: 98 → 125 tests (26 new theory tests + excluded a worktree double-execution issue)

### v2.2.0 (2026-07)

Tutorial overhaul + fundamental game-balance fixes — PR #18-#25

- **Coachmark tutorial**: replaced the full-screen overlay (action-type steps could get stuck incomplete) with a context-aware Coachmark that no longer blocks page interaction. 11 step definitions, a priority queue, modal suspend/resume, and save-state restoration support
- **Fixed the "unwinnable normal mode" bug at its root**: candidate salaries were generated on an annual scale but treated as monthly (hiring impossible → development impossible → no legal path forward). Converting to monthly salaries restores the economic loop
- **Balance-structure fixes**: removed the positive bias in competitor market share / capped infinite stacking of charisma-driven sales / resolved the contradiction between share/brand caps and achievement requirements / made quality growth curve-based / wired up Tier-3 skill special effects that were previously disconnected
- **UX**: desktop-responsive layout (fixed 400px → 560/640px) / funds-insufficient guard on the hire button / automatic product-name generation
- **Quality**: `tsc --noEmit` 89 errors → 0 (resolved `types.d.ts` name collisions + removed ~1,900 lines of leftover Phaser code), fixed 2 runtime crashes, swept away 20 legacy files
- **Tests**: 67 → 98 tests (coachmark state machine/position calculations, salary scaling, monthly stress)

### v2.1.0 (2026-04)

Full debugging pass — FIRE: F=6, I=6, R=2/3 all resolved, 17 commits

- **CEO mode stabilization**: fixed mode-degradation bug on tab switch, mode-linked tab visibility (`applyTabVisibilityForMode`)
- **Tutorial mutual exclusion**: resolved modal/Tutorial DOM contention, auto-suppressed during CEO mode
- **Structural cleanup**: removed `windowBridge.ts` (dead code), extracted `escape.ts` into its own module
- **XSS hardening**: input-side escapeHtml strategy, fixed 9 places missing showModal isHtml=true
- **State management**: prevented save corruption of `_pendingCausalEffects`, added type validation for tutorialCompleted/wasLowMoney
- **Calculation unification**: consolidated `nextTurn` monthly calculation into FinanceManager.calculateMonthlyRevenue
- **Observability**: turned silent failures in initialization into warnings via the `invokeWindowCritical` helper
- **Regression tests**: 57 → 67 tests (new gameStore.test.ts covering I-1/I-3/I-6)
- **Dependency updates**: resolved 3 HIGH vite vulnerabilities (CVE-2025 Path Traversal / fs.deny bypass / WebSocket file read), `npm audit` reports 0 vulnerabilities

### v2.0.2 (2026-03)

- Strengthened XSS countermeasures: unified escapeHtml + innerHTML→Lit render migration
- npm audit: resolved 5 HIGH vulnerabilities (serialize-javascript RCE, picomatch ReDoS)
- Enabled noUnusedLocals/noUnusedParameters (90 fixes)
- Code reduction: 22 files -163 lines / +67 lines

### v2.0.1 (2026-03)

- Fixed showModal HTML-escaping bug (added isHtml=true in 12 places)
- Modal UI improvements (header/body/footer separation, × button, background click, Esc key support)

### v2.0 (2026-02)

- game.ts 4,406 lines → split into modules (86% reduction)
- Added CEO mode
- Completed all 18 CTO technical-audit fixes (F4/I7/R4/E3)
- Fully enabled TypeScript `strict: true`
- Introduced vitest (57 tests)
- Started incremental Lit html migration

### v1.0 (2025-12)

- Initial release

## License

MIT
