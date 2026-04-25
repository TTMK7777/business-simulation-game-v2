# Business Simulation Game v2 — 計画

## 現在のステータス
v2.1.0 全面デバッグ実施中。Sprint A-D 完了（FIRE: F=6, I=6, R=3 全件解消）。
最終取締役会レビュー → push 承認待ち。vitest 67/67 pass、vite build 成功。

## フェーズ
### Phase 0: 基盤レイヤー (完了)
- types/index.ts に全型定義
- config/ に性格・部署・スキル・オフィス定義
- store/gameStore.ts に状態管理シングルトン

### Phase 1: モジュール分割 (完了)
- game.ts 4,406行 → 630行（86%削減）
- Manager並列抽出（Game, HR, Achievement, Market, Finance, Product, Tutorial）
- UI分割（renderers.ts, modals.ts, charts.integration.ts）

### Phase 2: CEOモード統合 (完了)
- 型定義 + 設定 + ロジック + UI（14ファイル新規 + 7ファイル変更）

### Phase 3: CTO監査修正 (完了)
- Sprint 1: Fatal 4件（prototype pollution, XSS x2, 演算子優先度バグ）
- Sprint 2: Important 5件（pruneHistory, windowBridge, crypto.subtle, executeGameAction, 実績重複）
- Sprint 3: Important 2件 + Recommended 2件（資格スキップ, modals TODO, 相性キャッシュ, 未使用依存）
- Sprint 4: Recommended 2件（noImplicitAny, Chart.js遅延初期化）
- Sprint 5: Enhancement 3件（Lit html変換, vitest導入57テスト, strict完全有効化）

### Phase 4: セキュリティ強化 (完了)
- v2.0.1: showModal HTMLエスケープバグ修正、モーダルUI改善
- v2.0.2: escapeHtml統一 + innerHTML→Lit render移行、npm audit HIGH 0件、noUnusedLocals有効化

### Phase 5: v2.1.0 全面デバッグ (完了 2026-04-25)
- Sprint A: 体感バグ即時解消 (F-1, F-2, F-4, F-6) — 5コミット
- Sprint B: 構造整理 + XSS強化 (F-3, F-5, I-2, I-4) — 3コミット + CISO修正2件
- Sprint C: 状態汚染防止 + 計算統一 (I-1, I-3, I-5, I-6) — 3コミット
- Sprint D: 観測性改善 + ドキュメント (R-1, R-3) — D1完了
- 全体: 14+コミット、vitest 57→67、tag: v2.1.0-sprintA/B/C-*

### Phase 6: 次フェーズ (未着手)
- unsafeHTML → Lit html テンプレート完全移行（B2-a で部分対応済）
- tsc --noEmit 既存エラー ~120件対応
- マルチプラットフォーム戦略（Tauri 2.x デスクトップ + モバイル）
- 収益化戦略の策定（広告/IAP/プレミアム等）
- ポートフォリオ展開・ランディングページ
- Zod GameState スキーマ拡張（CISO 推奨、Defense in Depth 完成）

## 決定事項ログ
| 日付 | 決定 | 理由 |
|------|------|------|
| 2026-02-11 | game.ts モジュール分割 | 4,406行の巨大ファイルの保守性向上 |
| 2026-02-11 | Manager = 純粋ビジネスロジック(DOM非依存) | テスタビリティ確保 |
| 2026-02-14 | CEOモードを分割後コードベースに統合 | 新機能追加 |
| 2026-02-23 | CTO監査実施 → Sprint 1-5で全18件修正 | 品質・セキュリティ向上 |
| 2026-02-23 | vitest導入（57テスト） | 回帰検知の確立 |
| 2026-02-23 | strict: true完全有効化 | 型安全性の確保 |
| 2026-03-09 | showModal isHtml=true追加 | HTMLエスケープバグ修正 |
| 2026-03-27 | escapeHtml統一 + Lit render移行 | XSS対策の一貫性 |
| 2026-03-27 | npm audit overrides追加 | HIGH脆弱性解消 |
