# Business Simulation Game v2 — 知見・技術判断

## 技術判断
- **Sprint E (v2.2.0): チュートリアル刷新 = Coachmark 方式** (2026-05-04 取締役会 🟡条件付きGo / 内部F0I4R5E1 + 外部F0I4R4E2)
  - 旧画面下部固定オーバーレイ → コンテキスト型ポップアップ吹き出し
  - トリガー3種: visit_tab:* / action:* / cond:*
  - state: `tutorialV2 = { enabled, disabled, shownIds[], pendingId, queue[], version: 1 }`
  - 旧 `tutorialStep` / `tutorialCompleted` は互換維持、`tutorialCompleted=true` → `enabled=false` 同期
  - 必須条件: MutationObserver + IntersectionObserver target 待機 / ResizeObserver 追従 / トリガー優先度・キュー / Zod 検証 / Vitest 12-15ケース
  - 推奨: ロールバックフラグ / 位置計算独立 / z-index CSS変数 / pointer-events 集中モード
  - 11 Coachmarks (welcome / 5タブ / 4アクション / cond_first_profit / complete)
  - layer z-index 8000 / modal z-index 9000 で固定
  - 工数 4人日 (チュート 3.5 + 軽微バグ 0.5)
- アーキテクチャ: `types/` → `config/` → `store/` → `managers/` → `ui/` → `game.ts` の依存方向
- Manager = 純粋ビジネスロジック（DOM非依存）でテスタビリティ確保
- TypeScript `strict: true` + `noUnusedLocals` + `noUnusedParameters` + `noImplicitAny` + `noFallthroughCasesInSwitch` を全て有効化
- Lit 3 への段階的移行: まず unsafeHTML ディレクティブ（中間ステップ）→ 最終的に Lit html テンプレート完全移行
- Chart.js は `Chart.register()` を遅延初期化 `ensureRegistered()` に変更してパフォーマンス改善
- npm audit overrides で serialize-javascript >=7.0.3, ejs >=3.1.10 を強制
- LocalForage + Zod バリデーション + チェックサムでストレージの安全性確保
- calculateTeamCompatibility にキャッシュ追加で O(n^2) 問題を緩和

## 知見
- `||` vs `+` の演算子優先順位: `+` が先に評価されるため `(abilities.technical || 0) + (abilities.sales || 0)` と括弧必須
- pruneHistory で統計を processVerdict とは別に再カウントすると長期プレイで統計2倍化
- game.ts (entry point) で HTML onclick 互換のため window バインディングを集約。windowBridge.ts は当初並列構想として作成されたが import されず dead code となっていたため v2.1.0 で削除し、game.ts 一本化に統一
- CTO監査 FIRE分類: Fatal(即修正) > Important(次Sprint) > Recommended(推奨) > Enhancement(改善)
- Vitest: 5テストファイル / 67テストケース（v2.1.0 で gameStore.test.ts 10件追加、I-1/I-3/I-6 回帰カバー）
- コールバック未使用パラメータは `_` プレフィックス付与で TS6133 解消
- npm audit の moderate は workbox-build/brace-expansion 起因で対応不要と判断
- v2.1.0 知見: showModal isHtml=true は呼出側責任契約。escape sweep は file/grep 単位ではなく semantic 単位（中間変数 push パターンも対象）
- CEOモードと管理モードの状態結合: showPanel に gameMode ガード + applyTabVisibilityForMode の DOM 不可視化で二重防御
- escape.ts 独立モジュール化で modals.ts ⇄ deskView/documentDetail/visitorDialog の循環依存を回避
- CEO モード選択時は tutorial を即抑制（tutorialCompleted=true）。管理モード前提の TUTORIAL_STEPS が CEO モードで進行不能になる対策
- レガシー js/business-game.js, js/game-ui.js は archive HTML 用 dead code、本番 (vite) は src/lib/* のみ使用
- I-5 教訓: 同一ロジックを 2 ファイルに二重実装すると片方の修正が他方に反映されない。FinanceManager/GameManager.nextTurn のように Manager に集約

## 外部リソース
- Lit: https://lit.dev/
- Vite: https://vitejs.dev/
- Vitest: https://vitest.dev/
- Tauri: https://tauri.app/

## FAQ
- (TODO)
