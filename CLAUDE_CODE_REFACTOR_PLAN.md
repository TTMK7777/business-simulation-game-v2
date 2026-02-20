# ビジネスエンパイア - Claude Code向けリファクタリング計画書

このドキュメントは、巨大化した `game.ts` ファイルを段階的にリファクタリングするための手順書です。以下の指示（プロンプト）をコピーして、そのままClaude Codeに入力することで、安全にコード整理を進めることができます。

## 🎯 目的
4000行を超える `src/lib/game.ts` をモジュール構成に分割し、保守性を高め、バグの温床を取り除きます。また、将来的なマルチプレイ機能やAI拡張に備えます。

## 📂 提案ディレクトリ構成

```text
src/
  lib/
    config/           # 定数・設定ファイル（静的データ）
      personalities.ts
      skills.ts
      achievements.ts
      departments.ts
    types/            # 型定義
      index.ts
    managers/         # ゲームロジック（純粋なTypeScriptクラス）
      GameManager.ts  # 全体の調整役
      HRManager.ts    # 人事・採用・給与計算
      ProductManager.ts
      FinanceManager.ts
    ui/               # UI描画ヘルパー（フレームワーク非依存の場合）
      renderers.ts
    store/            # 状態管理（グローバル変数の廃止）
      gameState.ts
```

---

## 🛠️ Claude Code 実行手順

### 手順1: 設定と定数の切り出し
**目的**: 静的なデータを `game.ts` から追い出し、ファイルサイズを削減する。

**Claude Codeへの指示プロンプト:**
```text
`src/lib/game.ts` のリファクタリングを行います。
新しく `src/lib/config` ディレクトリを作成し、`game.ts` 内の以下の定数を各ファイルに移動してください：

1. `src/lib/config/personalities.ts`:
   - `PERSONALITIES`, `SUB_TRAITS`, `TEMPERAMENT_TRAITS`, `HIDDEN_TRAITS` を移動
   - 可能であればヘルパー関数 `generateTemperament` もここに移動（またはutilsへ）

2. `src/lib/config/positions.ts`:
   - `POSITIONS`, `DEPARTMENTS` を移動

3. `src/lib/config/skills.ts`:
   - `SKILL_TREE`, `SKILL_EFFECTS` を移動

4. `src/lib/config/achievements.ts`:
   - `ACHIEVEMENTS`, `ACHIEVEMENT_RARITIES` を移動

5. `src/lib/config/gameConfig.ts`:
   - `OFFICE_LEVELS` やその他の静的設定を移動

移動した定数は適切にexportし、`game.ts` 側でimportするように修正してください。
```

---

### 手順2: 型定義の集約
**目的**: 循環参照を防ぎ、型の利用を統一する。

**Claude Codeへの指示プロンプト:**
```text
`game.ts`（および関連する場合は `types.d.ts`）にあるすべてのインターフェースと型定義を、`src/lib/types/index.ts` に移動・集約してください。
特に以下の型を確認してください：
- `GameState`
- `Employee`
- `Product`
- `Achievement`
- `CompetitorConfig`

その後、`src/lib/game.ts` や手順1で作ったconfigファイルが、この共通ファイルから型をimportするように更新してください。
```

---

### 手順3: ドメインロジックの抽出（Managerパターン）
**目的**: 人事や財務など特定のロジックを分離し、バグの影響範囲を限定する。

**Claude Codeへの指示プロンプト:**
```text
Managerパターンを導入して `game.ts` を分割したいです。
まず `src/lib/managers/HRManager.ts` を作成してください。

1. `game.ts` から以下の関数・ロジックを `HRManager` クラスに移動してください：
   - `calculateTeamCompatibility`（チーム相性計算）
   - `generateTemperament`（性格生成、もしconfigに移動していなければ）
   - その他、採用・解雇・給与計算に関するロジック

2. `HRManager` はメソッドの引数として `GameState`（または必要なデータの一部）を受け取るか、自身の状態として管理できるように設計してください。
```

---

### 手順4: UI描画の分離
**目的**: ゲームロジックの中にHTML文字列生成コードが混ざるのを防ぐ。

**Claude Codeへの指示プロンプト:**
```text
`game.ts` 内で HTML文字列を生成したり DOM操作を行っている関数を特定してください。
例:
- `renderAchievements`
- `showModal`（HTML生成部分）
- `checkOfficeUpgrade`（通知HTML部分）

これらの関数を `src/lib/ui/renderer.ts` または `src/lib/ui/AchievementView.ts` などの別ファイルに移動してください。
ゲームロジックは「イベントの発火」のみを行い、UI層がそれを「検知して描画」する形を目指してください。
```

---

### 🐛 具体的なバグ修正と改善提案

**人事タブの表示不具合の修正:**
手順3（HRManagerの抽出）が終わった後、以下のプロンプトを実行してください：

**Claude Codeへの指示プロンプト:**
```text
作成した `src/lib/managers/HRManager.ts` をレビューしてください。
現在、人事タブの表示がおかしくなるバグが報告されています。
特に `calculateTeamCompatibility` 関数を重点的にチェックし、従業員が削除された場合などのエッジケースでエラーにならないか確認してください。
従業員リストが変更された際、確実に相性が再計算されているかを検証するログ、または単体テストを追加してください。
```

**パフォーマンス最適化:**
**Claude Codeへの指示プロンプト:**
```text
`game.ts` のメインループを確認してください。現在は毎フレーム（または毎ターン）全従業員の計算を行っていませんか？
「ダーティフラグ（変更検知フラグ）」パターンを導入し、チーム構成に変更があった場合のみ `calculateTeamCompatibility` などの重い計算を実行するように最適化してください。
```
