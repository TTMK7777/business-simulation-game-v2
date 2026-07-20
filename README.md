# ビジネスエンパイア 2.0 - IT業界経営シミュレーション

**日本語** | [English](./README.en.md)

![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat&logo=typescript&logoColor=white)
![Lit](https://img.shields.io/badge/Lit-3.3-324FFF?style=flat&logo=lit&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-192%20tests-6E9F18?style=flat&logo=vitest&logoColor=white)

> IT企業を経営し、従業員の採用・育成、製品開発、市場競争を通じて成功を目指す本格的な経営シミュレーションゲーム。プレイヤーの行動に対応する実在の経営理論 (PPM・アンゾフ・二要因理論など14本) が図鑑として解禁され、**遊びながら経営を学べる**。

## クイックスタート

```bash
npm install
npm run dev        # 開発サーバー起動
npm run dev:sp     # LAN公開モード（スマホ確認用）
npm run build      # 本番ビルド
npm test           # テスト実行
```

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| 言語 | TypeScript 5.9 (`strict: true`, `noUnusedLocals`) |
| UI | Lit 3 (段階移行中) + テンプレートリテラル |
| ビルド | Vite 8 (rolldown), PWA対応 |
| チャート | Chart.js 4 (遅延初期化) |
| ストレージ | LocalForage + Zod バリデーション |
| テスト | Vitest (192テスト) |

## アーキテクチャ

```
src/lib/
├── types/          型定義 (GameState, Employee, Product 等)
├── config/         設定・定数 (personalities, departments, skills, ceo)
├── store/          状態管理シングルトン (gameStore)
├── managers/       ビジネスロジック (Game, HR, Finance, Product, Market, CEO, Document, Achievement, Tutorial, Visitor)
├── ui/             描画 (renderers, modals, charts, deskView)
├── animation/      キャラクターアニメーション (Phaser ベースの旧実装。現行は軽量な cssCharacterManager)
└── game.ts         エントリポイント (HTML onclick 互換の window バインディング担当)
```

**依存方向**: `types/` → `config/` → `store/` → `managers/` → `ui/` → `game.ts`

## ゲームモード

| モード | 説明 |
|--------|------|
| **管理モード** | 従業員採用・育成、製品開発、マーケティング、融資・返済 |
| **社長モード (CEO)** | 書類決裁、方針設定、訪問者対応、四半期レビュー |

## 経営理論図鑑 (v2.3.0)

プレイ中の行動に対応する実在の経営理論が解禁されていく学習レイヤー。設計原則は「**行動 → 後から理論で命名**」(先に講義しない)。

- **体験連動アンロック**: 初黒字 → 損益分岐点、従業員3人 → ハーズバーグ二要因理論、資金危険水域 → キャッシュフロー経営 など 11 本
- **CEO 決裁タグ**: 社長モードの決裁結果に「今の判断は○○理論」+1行レッスン。トレードオフ稟議 → 機会費用、ギャンブル稟議 → 期待値思考、調査済み稟議 → サンクコスト
- 各理論 = 3行説明 + 実在企業の実例1社 + ゲーム内ヒント1行 (読ませすぎ防止の文字数上限をテストで固定)

## 財務の見える化 + ビジュアル (v2.4.0)

ターゲットペルソナ3類型 ([docs/PERSONAS.md](./docs/PERSONAS.md)) の共通ニーズ「**打ち手→数字の因果を体感したい**」に応える可視化レイヤー。

- **財務3表グラフ**: P/L 構成・キャッシュフロー推移・簡易貸借対照表を財務タブに表示 (月次決算スナップショット5年分)
- **売上ドライバー分解**: カリスマ×スキル×シェア×ブランド×難易度の寄与額を「今月の売上ドライバー」として毎月表示
- **ライブ通知カード**: 月次決算サマリー / 市況・競合ニュース (影響ラベル付き) / 資金危機アドバイザー
- **キャラクター日課**: 従業員が出勤→職種別モーションで働く→休憩→退勤する生きたオフィス
- **ダークモード**: 🌙/☀️ トグル + OS 設定追従 (CSS 変数トークン層、Chart.js も追随)

## セキュリティ

- LocalStorage入力のサニタイズ (escapeHtml, 許可リスト方式)
- prototype pollution対策 (Object.assign → 許可キーのみ復元)
- Lit html自動エスケープ (段階移行中)
- crypto.subtle HTTP環境フォールバック

## テスト

```bash
npm test           # 全テスト実行
npm test -- --run  # CI用 (watchなし)
```

12テストファイル / 192テストケース:
- DocumentManager — F4演算子優先度バグ回帰テスト
- HRManager — 昇進判定・成長倍率・チーム相性・月次ストレス (v2.2.0で追加)
- qualificationGenerator — 資格割当・前提条件チェック・給与月給スケール (v2.2.0で追加)
- storage — チェックサム・メタデータバリデーション
- gameStore — I-1/I-3/I-6 セーブデータ汚染防止回帰テスト (v2.1.0で追加)
- coachmark — チュートリアル v2 状態機械・位置計算 (v2.2.0で新設)
- theory — 理論図鑑の解禁条件・CEO決裁タグ・定義整合性 (v2.3.0で新設)
- FinanceManager — 月次スナップショット・ドライバー分解・旧セーブ後方互換 (Phase 1 で新設)
- characterRoutine — 日課状態機械・座席割当・デスク位置 (Phase 1 で新設)
- eventMapping — a2ui 発火条件・二重通知防止 (Phase 1 で新設)
- GameManager — アニメ状態決定の純関数 (Phase 1 で新設)
- theme — テーマ解決・トグルの純関数 (Phase 1 で新設)

## 変更履歴

### Unreleased (main, 2026-07)

Phase 1 見える化スプリント — PR #32

- **財務3表グラフ + 売上ドライバー分解**: 財務タブを Chart.js グラフ主体に刷新、FinanceManager に月次決算スナップショット履歴 (60件キャップ・旧セーブ後方互換)
- **a2ui 死蔵コンポーネント接続**: 月次決算カード / 市況・競合ニュースカード (影響ラベル実値化) / 資金危機アドバイザー (危険水域への状態遷移時のみ)
- **キャラクター日課 v1**: 出勤→働く (職種別モーション4種)→休憩→退勤。sales/manager の絵文字重複を解消
- **デザイントークン + ダークモード**: CSS 変数トークン層、prefers-color-scheme + data-theme 両対応 (color-scheme 明示宣言が要点)、Chart.js テーマ追随
- **ターゲットペルソナ正本化**: docs/PERSONAS.md (3類型) + specs/001-phase1-visualization.md
- **テスト**: 125 → 192 tests

### v2.3.0 (2026-07)

経営理論学習レイヤー + UI/UX 改善 — PR #27-#29

- **経営理論図鑑 Phase A**: 理論11本の体験連動アンロック + 解禁 toast + 図鑑 UI (概要パネル/一覧/詳細)
- **経営理論図鑑 Phase B**: CEO 決裁結果に理論タグ + 意思決定理論3本追加 (機会費用/期待値思考/サンクコスト) で計14本
- **実績通知の断線修復**: 実績解除の演出と報酬付与が一度も発火していなかった実バグを修復
- **UI/UX 8件**: ランキングバー二重表示バグ修正 / ターン送りFAB (決算週予告付き) / 資金カウントアップ+危険水域警告 / 資格タブ蘇生 / 月次収支見込み表示 / 実績解除演出強化
- **アクセシビリティ**: prefers-reduced-motion で無限アニメーション抑制
- **テスト**: 98 → 125 tests (theory 新設27 + worktree 二重実行 exclude)

### v2.2.0 (2026-07)

チュートリアル刷新 + ゲームバランス根本修正 — PR #18-#25

- **Coachmark チュートリアル**: 全画面オーバーレイ (アクション型ステップが完了不能だった) を、ページ操作をブロックしないコンテキスト型 Coachmark に全面刷新。11定義、priority キュー、モーダル退避/復帰、セーブ復元対応
- **ノーマル詰みバグ根治**: 候補者給与が年収スケールで生成され月給として扱われていた (採用不能→開発不能→合法手なし)。月給化により経済ループが成立
- **バランス構造修正**: 競合シェアの正バイアス除去 / カリスマ売上の無限スタック抑制 / シェア・ブランド上限と実績要求の矛盾解消 / 品質成長曲線化 / Tier3 スキル特殊効果の実接続
- **UX**: デスクトップレスポンシブ (400px固定→560/640px) / 採用ボタンの資金不足ガード / 製品名自動生成
- **品質**: tsc --noEmit 89件→0 (types.d.ts 同名衝突解消 + Phaser 残骸約1,900行削除)、実行時クラッシュ2件修正、レガシー20ファイル一掃
- **テスト**: 67 → 98 tests (coachmark 状態機械/位置計算、給与スケール、月次ストレス)

### v2.1.0 (2026-04)

全面デバッグ実施 — FIRE: F=6, I=6, R=2/3 全件解消、17コミット

- **CEOモード安定化**: タブ切替時のモード退化バグ修正、タブ可視性のモード連動 (`applyTabVisibilityForMode`)
- **チュートリアル排他制御**: モーダル/Tutorial の DOM 競合解消、CEOモード時は自動抑制
- **構造整理**: `windowBridge.ts` 削除 (dead code)、`escape.ts` 独立モジュール化
- **XSS強化**: 入力側 escapeHtml 戦略、showModal isHtml=true 漏れ9箇所修正
- **状態管理**: `_pendingCausalEffects` のセーブ汚染防止、tutorialCompleted/wasLowMoney 型バリデーション
- **計算統一**: `nextTurn` 月次計算を FinanceManager.calculateMonthlyRevenue に集約
- **観測性**: 初期化系の silent fail を `invokeWindowCritical` ヘルパーで警告化
- **回帰テスト**: 57 → 67 tests (gameStore.test.ts 新設、I-1/I-3/I-6 カバー)
- **依存更新**: vite HIGH脆弱性3件解消 (CVE-2025 Path Traversal/fs.deny bypass/WebSocket file read)、`npm audit` 0 vulnerabilities

### v2.0.2 (2026-03)

- XSS対策強化: escapeHtml統一 + innerHTML→Lit render移行
- npm audit: HIGH脆弱性5件解消（serialize-javascript RCE, picomatch ReDoS）
- noUnusedLocals/noUnusedParameters有効化（90件修正）
- コード削減: 22ファイル -163行/+67行

### v2.0.1 (2026-03)

- showModal HTMLエスケープバグ修正（12箇所に isHtml=true 追加）
- モーダルUI改善（header/body/footer分離、×ボタン、背景クリック、Escキー対応）

### v2.0 (2026-02)

- game.ts 4,406行 → モジュール分割 (86%削減)
- 社長モード (CEOモード) 追加
- CTO技術監査 全18件修正完了 (F4/I7/R4/E3)
- TypeScript `strict: true` 完全有効化
- vitest 導入 (57テスト)
- Lit html 段階移行開始

### v1.0 (2025-12)

- Initial release

## License

MIT
