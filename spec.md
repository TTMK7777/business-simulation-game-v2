# Business Simulation Game v2 — 仕様書

## 概要
「ビジネスエンパイア 2.0」はIT業界の本格的な経営シミュレーションゲーム。IT企業を経営し、従業員の採用・育成、製品開発、市場競争を通じて成功を目指す。v1からの大幅な品質改善を実施し、TypeScript `strict: true` 完全有効化、CTO技術監査全18件（F4/I7/R4/E3）修正完了、Vitest 57テスト導入、Lit html段階移行を実現。

v2.0.2でXSS対策強化（escapeHtml統一 + innerHTML→Lit render移行）、npm audit HIGH脆弱性5件解消、noUnusedLocals/noUnusedParameters有効化を完了。

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

### 未対応
- [ ] unsafeHTML → Lit html テンプレート完全移行
- [ ] tsc --noEmit 既存エラー ~120件対応
- [ ] マルチプラットフォーム戦略（Tauri 2.x）
- [ ] 収益化戦略
- [ ] ポートフォリオ展開・ランディングページ

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
