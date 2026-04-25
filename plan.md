# Business Simulation Game v2 — 計画

## 現在のステータス
v2.0.2 コミット済み（最新コミット `f7239b3`）。CTO監査全18件修正完了。origin/main と同期済み。

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

### Phase 5: 次フェーズ (未着手)
- unsafeHTML → Lit html テンプレート完全移行
- tsc --noEmit 既存エラー ~120件対応
- マルチプラットフォーム戦略（Tauri 2.x デスクトップ + モバイル）
- 収益化戦略の策定（広告/IAP/プレミアム等）
- ポートフォリオ展開・ランディングページ

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
