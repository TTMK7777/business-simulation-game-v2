# Business Simulation Game v2 — 仕様書

## 概要
「ビジネスエンパイア 2.0」はIT業界の本格的な経営シミュレーションゲーム。IT企業を経営し、従業員の採用・育成、製品開発、市場競争を通じて成功を目指す。v1からの大幅な品質改善を実施し、TypeScript `strict: true` 完全有効化、CTO技術監査全18件（F4/I7/R4/E3）修正完了、Vitest 67テスト導入、Lit html段階移行を実現。

v2.0.2でXSS対策強化（escapeHtml統一 + innerHTML→Lit render移行）、npm audit HIGH脆弱性5件解消、noUnusedLocals/noUnusedParameters有効化を完了。

v2.1.0で全面デバッグ実施（Sprint A-D / FIRE: F=6, I=6, R=3 の全件解消）。CEOモード状態保護、チュートリアル排他制御、windowBridge dead code整理、入力側 escapeHtml 戦略、セーブデータ汚染防止、月次計算統一、観測性改善を達成。

## 機能一覧

### 管理モード
- [x] 従業員採用・育成（性格・気質・スキルツリー・資格システム付き）
- [x] 製品開発・マーケティング
- [x] 融資・返済・月次収益計算
- [x] 競合AI・ニュース生成・ランキング
- [x] 実績システム（重複付与防止付き）
- [x] チュートリアル
- [x] セーブ/ロード（LocalForage + Zod バリデーション + チェックサム）

### 社長モード (CEO)
- [x] 書類決裁
- [x] 方針設定
- [x] 訪問者対応
- [x] 四半期レビュー

### セキュリティ
- [x] prototype pollution対策（Object.assign → 許可キーのみ復元）
- [x] XSS対策（escapeHtml統一、innerHTML→Lit render移行）
- [x] LocalStorage入力サニタイズ
- [x] crypto.subtle HTTP環境フォールバック
- [x] executeGameAction許可リスト

### 品質
- [x] TypeScript `strict: true` 完全有効化
- [x] noUnusedLocals / noUnusedParameters 有効化
- [x] Vitest 57テスト（DocumentManager, HRManager, qualificationGenerator, storage）
- [x] CTO監査全18件修正完了（F4/I7/R4/E3）
- [x] npm audit HIGH脆弱性0件

### v2.1.0 全面デバッグ完了 (2026-04-25)
- [x] F-1: CEOモード状態保護（showPanel/renderActivePanel に gameMode ガード）
- [x] F-2: チュートリアル排他制御 + DOM残留防止
- [x] F-3: windowBridge.ts 削除（dead code整理）
- [x] F-4: executeTraining 資金チェック復活
- [x] F-5: unsafeHTML 入力側 escapeHtml 戦略
- [x] F-6: switchDeskTab('employees') desk内描画統一
- [x] I-1: _pendingCausalEffects シリアライズ除外
- [x] I-2: GameManager 動的データ escape 適用
- [x] I-3: wasLowMoney as any キャスト削除
- [x] I-4: calculateTeamCompatibility HRManager 一本化
- [x] I-5: nextTurn 月次計算 FinanceManager 統一
- [x] I-6: tutorialCompleted/wasLowMoney 型バリデーション
- [x] R-1: critical な silent fail 警告化
- [x] R-3: TutorialManager step.* escapeHtml 防御適用
- [x] CEOモード タブ可視性連動（applyTabVisibilityForMode）
- [x] showModal isHtml=true 漏れ9箇所一括修正
- [x] gameStore I-1/I-3/I-6 回帰テスト10件追加（57→67）

### 未対応
- [ ] unsafeHTML → Lit html テンプレート完全移行（B2-aで縮小実施、根本対応は将来）
- [ ] tsc --noEmit 既存エラー ~120件対応
- [ ] マルチプラットフォーム戦略（Tauri 2.x）
- [ ] 収益化戦略
- [ ] ポートフォリオ展開・ランディングページ
- [ ] レガシー js/business-game.js, js/game-ui.js は archive HTML 用 dead code、将来削除検討
- [ ] R-2: レガシー executeGameAction 許可リスト（dead code のため対応不要と判定）

## 技術スタック
- 言語: TypeScript 5.9 (`strict: true`, `noUnusedLocals`)
- UI: Lit 3 (段階移行中) + テンプレートリテラル
- ビルド: Vite 7, PWA対応
- チャート: Chart.js 4 (遅延初期化)
- ストレージ: LocalForage + Zod バリデーション
- テスト: Vitest (57テスト)

## アーキテクチャ
```
src/lib/
  types/          型定義 (GameState, Employee, Product 等)
  config/         設定・定数 (personalities, departments, skills, ceo)
  store/          状態管理シングルトン (gameStore)
  managers/       ビジネスロジック (Game, HR, Finance, Product, Market, CEO, Document, Achievement, Tutorial, Visitor)
  ui/             描画 (renderers, modals, charts, deskView)
  animation/      キャラクターアニメーション (Phaser)
  game.ts         エントリポイント (HTML onclick 互換のため window バインディング担当)
```
依存方向: `types/` → `config/` → `store/` → `managers/` → `ui/` → `game.ts`

## 非機能要件
- セキュリティ: prototype pollution対策、XSS対策、入力サニタイズ
- テストカバレッジ: 4テストファイル / 57テストケース
- ビルド: npm run build 成功

## 用語定義
| 用語 | 定義 |
|------|------|
| CEOモード | 社長決裁モード。書類→判定→因果チェーン→訪問者連動 |
| Manager | 純粋ビジネスロジック（DOM非依存、結果オブジェクトを返す） |
| FIRE | Fatal/Important/Recommended/Enhancement の品質分類 |
| escapeHtml | XSS防止のためのHTMLエスケープユーティリティ |
| unsafeHTML | Lit の段階的移行に使う中間ステップのディレクティブ |
