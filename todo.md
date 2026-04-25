# Business Simulation Game v2 — タスク管理

## 進行中
- [ ] ブラウザ動作確認（v2.0.2変更の目視チェック — ユーザーが実施中）

## 未着手
- [ ] unsafeHTML → Lit html テンプレート完全移行（showEmployeeDetail等の大規模HTML構築をLitコンポーネント化）
- [ ] tsc --noEmit の既存エラー ~120件対応（TS2305 型export不足、TS2307 Phaser型定義未導入、TS2339 Phaser property等）
- [ ] マルチプラットフォーム戦略（Tauri 2.x デスクトップ + モバイル）
- [ ] 収益化戦略の策定（広告/IAP/プレミアム等）
- [ ] ポートフォリオ展開・ランディングページ
- [ ] E1残り: innerHTML→Lit html移行（残9関数: renderMarket, renderFinance, showAllAchievements等）

## 完了
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
