# Business Empire 2.0 - IT Industry Management Simulation

[日本語](./README.md) | **English**

![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat&logo=typescript&logoColor=white)
![Lit](https://img.shields.io/badge/Lit-3.3-324FFF?style=flat&logo=lit&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-67%20tests-6E9F18?style=flat&logo=vitest&logoColor=white)

> A full-fledged management simulation game where you run an IT company and aim for success through hiring and developing employees, product development, and market competition.

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
| Build | Vite 7, PWA support |
| Charts | Chart.js 4 (lazy initialization) |
| Storage | LocalForage + Zod validation |
| Testing | Vitest (67 tests) |

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

5 test files / 67 test cases:
- DocumentManager — regression test for the F4 operator-precedence bug
- HRManager — promotion decisions, growth multipliers, team compatibility
- qualificationGenerator — qualification assignment, prerequisite checks
- storage — checksum and metadata validation
- gameStore — I-1/I-3/I-6 save-data corruption-prevention regression tests (added in v2.1.0)

## Changelog

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
