# Business Simulation Game v2 — タスク管理

## 進行中
- [ ] v2.1.0 最終取締役会レビュー + push 承認

## 未着手 (Phase 6 候補)
- [ ] unsafeHTML → Lit html テンプレート完全移行（B2-a で部分対応済、根本対応は将来）
- [ ] tsc --noEmit の既存エラー ~120件対応
- [ ] マルチプラットフォーム戦略（Tauri 2.x デスクトップ + モバイル）
- [ ] 収益化戦略の策定（広告/IAP/プレミアム等）
- [ ] ポートフォリオ展開・ランディングページ
- [ ] Zod GameState スキーマ拡張（CISO推奨、Defense in Depth）
- [ ] レガシー js/business-game.js, js/game-ui.js の最終削除判断

## 完了
- [x] **v2.1.0 全面デバッグ Sprint A-D 完了** (2026-04-25)
  - Sprint A: F-1/F-2/F-4/F-6 + 追加2件（CEO抑制・タブ可視性）
  - Sprint B: F-3/F-5/I-2/I-4 + 取締役会指摘1件 + CISO MEDIUM 1件
  - Sprint C: I-1/I-3/I-5/I-6 + 回帰テスト10件
  - Sprint D: R-1 silent fail 警告化、R-3 tutorial step escape
- [x] game.ts モジュール分割（4,406行 → 630行、86%削減）
- [x] CEOモード統合（14ファイル新規 + 7ファイル変更）
- [x] CTO監査全18件修正完了（F4/I7/R4/E3）
  - [x] F1: prototype pollution修正（許可リスト方式）
  - [x] F2: 格納型XSS修正（escapeHtml追加）
  - [x] F3: showModal XSS修正（isHtml=false時エスケープ）
  - [x] F4: 演算子優先度バグ修正（DocumentManager.ts:292）
  - [x] I1-I7: pruneHistory, windowBridge, 資格スキップ, modals TODO等
  - [x] R1-R4: 相性キャッシュ, 未使用依存削除, noImplicitAny, Chart.js遅延初期化
  - [x] E1-E3: Lit html変換, vitest 57テスト, strict完全有効化
- [x] v2.0.1: showModal HTMLエスケープバグ修正 + モーダルUI改善
- [x] v2.0.2: escapeHtml統一 + npm audit HIGH 0件 + noUnusedLocals有効化

## 保留
- [ ] npm audit moderate 8件（workbox-build/brace-expansion起因 — 対応不要）
