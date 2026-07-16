# 001 — Phase 1 見える化スプリント

策定日: 2026-07-16 ｜ 対応ペルソナ: `docs/PERSONAS.md` の3類型共通核「打ち手→数字の因果の体感」
背景: 売上の因果チェーン（品質×シェア×ブランド×カリスマ×難易度×スキル）は `FinanceManager` 内部に実装済みだが、UI には純利益1行に圧縮されて出力される。財務3表のうち B/S・CF は未実装（`ゲーム内容.txt` の公約未達）。a2ui コンポーネント群は構築済み・未接続。

## スコープ

### A. 財務3表の可視化（担当: finance-viz）
- `FinanceManager` に月次決算スナップショット履歴を追加（P/L: 売上/人件費/利息/純利益、簡易B/S: 現金/借入残高/純資産、CF: 営業CF/財務CF）
- 財務タブを刷新: P/L 構成グラフ + CF 推移折れ線 + 簡易B/S 積上げ棒（Chart.js、`src/lib/charts.ts` に必要コントローラを追加登録）
- 既存の5行テキスト情報は維持しつつグラフを主役に

### B. 売上ドライバー分解（担当: finance-viz）
- 月次決算時に売上乗算チェーンの寄与内訳を記録
- 財務タブに「今月の売上ドライバー」表示（どの要素が売上をいくら動かしたか）

### C. a2ui 死蔵コンポーネントの接続（担当: a2ui-wiring）
- 月次決算 → 財務ダッシュボード更新、ゲームイベント → ニュースカード、資金危機 → アドバイザーカード
- 既存 toast（実績/理論解禁）と二重通知にならないよう役割分担を整理

### D. キャラクター日課 v1（担当: characters）
- `docs/CHARACTER_DAILY_ROUTINE_RESEARCH.md` 構想の最小実装: 出勤→デスク→働く/休憩→退勤 のサイクル（ターン進行連動）
- 職種別の見た目差別化（現状 sales/manager が同一絵文字）、状態（idle/working/stressed）をモチベーション連動に

### E. デザイントークン + ダークモード（Wave 2、A-D 統合後に実施）
- `main.css`（3295行）に CSS 変数トークン層（色/余白/角丸）を導入し、主要色のハードコードをトークン参照へ
- `prefers-color-scheme` + `data-theme` 切替のダークモード、テーマトグル UI

## ファイル所有権（並行作業の競合防止）

| teammate | 所有（書き込み可） |
|---|---|
| finance-viz | `managers/FinanceManager.ts`, `ui/renderers.ts`, `ui/charts.integration.ts`, `lib/charts.ts`, `src/main.ts`, `src/styles/finance.css`(新規), 対応テスト |
| characters | `lib/cssCharacterManager.ts`, `styles/main.css` のキャラクターブロック（1803-1957行付近）のみ, 対応テスト |
| a2ui-wiring | `lib/a2ui/**`, `managers/GameManager.ts`, `lib/game.ts`, 対応テスト |

- 所有外ファイルは読み取りのみ。他領域への変更が必要になったら Lead に報告（自分で書かない）
- `GameManager` への新規フックが必要な finance-viz / characters は、公開 API を用意して呼び出し箇所を Lead に報告する

## 受け入れ条件（proof）
- `npm test -- --run` 全緑 / `node ./node_modules/typescript/bin/tsc --noEmit` 0件 / `npm run build` 成功
- 実ブラウザ（Chrome headless + CDP）で: 財務タブに3グラフ描画・ドライバー分解表示・a2ui カード発火・キャラ日課の状態遷移・ダークモード切替をスクリーンショット確認（Lead が統合後に実施）
