# Business Simulation Game v2

## 仕様駆動ワークフロー
このプロジェクトは仕様駆動で管理します。
1. `spec.md` でスコープ・機能一覧を定義
2. `specs/NNN-機能名.md` に個別仕様を記述
3. `plan.md` のフェーズに紐付け
4. `todo.md` でタスク管理
5. `src/` に実装、`tests/` でテスト
6. `knowledge.md` に知見、`memory.md` に教訓を蓄積

## プロジェクト構造
| ファイル | 役割 |
|---------|------|
| spec.md | 仕様概要・機能一覧・非機能要件・用語定義 |
| plan.md | 計画・ロードマップ・フェーズ管理・決定事項ログ |
| todo.md | タスク管理（進行中/未着手/完了/保留） |
| knowledge.md | 技術判断・知見・外部リソース・FAQ |
| memory.md | 失敗と教訓・不採用記録・フィードバック |
| specs/ | 個別仕様書 |

## コード規約
- TypeScript: `strict: true`, `noUnusedLocals`, `noUnusedParameters`
- UI: Lit 3 (段階移行中) + テンプレートリテラル
- ビルド: Vite 8 (rolldown。manualChunks は関数形式、minify は oxc)
- テスト: Vitest (`npm test -- --run`。件数は増え続けるためここに固定値を書かない)
- ESLint 準拠

## 検証コマンド (proof)
- テスト: `npm test -- --run`
- 型チェック: `node ./node_modules/typescript/bin/tsc --noEmit` (npx は環境 deny のため不使用)
- ビルド: `npm run build`
- UI 変更は実ブラウザ検証必須 (Chrome headless + CDP。HTTP テスト緑だけでは不可)
