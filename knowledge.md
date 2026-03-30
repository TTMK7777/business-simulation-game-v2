# Business Simulation Game v2 — 知見・技術判断

## 技術判断
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
- windowBridge.ts に46関数をバインドすることで HTML onclick 互換性を維持しつつモジュール分離を実現
- CTO監査 FIRE分類: Fatal(即修正) > Important(次Sprint) > Recommended(推奨) > Enhancement(改善)
- Vitest: 4テストファイル / 57テストケースで F4演算子優先度バグ回帰テスト、HRManager昇進判定等をカバー
- コールバック未使用パラメータは `_` プレフィックス付与で TS6133 解消
- npm audit の moderate は workbox-build/brace-expansion 起因で対応不要と判断

## 外部リソース
- Lit: https://lit.dev/
- Vite: https://vitejs.dev/
- Vitest: https://vitest.dev/
- Tauri: https://tauri.app/

## FAQ
- (TODO)
