# Codex (OpenAI o1) 確実な利用ガイド

**作成日**: 2025-10-28
**目的**: Codexのタイムアウトや画面明滅を防ぎ、確実に動作させる

---

## ❌ 避けるべき使い方（今回の失敗例）

### 失敗例：大きなタスクを一括依頼
```typescript
mcp__gpt-codex__codex({
  prompt: `
    ## タスク: 30資格システムのTypeScript変換と統合

    ### 具体的な作業
    1. 型定義を作成
    2. qualifications.ts作成
    3. qualificationGenerator.ts作成
    4. CSS作成
    5. game.ts統合
    6. main.ts修正

    すべて実装してください！
  `,
  config: {"approval-policy": "on-request"}  // ← 画面明滅の原因
})
```

**問題点:**
- ✗ タスクが大きすぎて5分でタイムアウト
- ✗ `approval-policy: "on-request"` で承認ダイアログが繰り返し表示
- ✗ 出力がないまま失敗
- ✗ ロールバック不可（どこまで進んだか不明）

---

## ✅ 推奨される使い方

### 原則1: **タスクを小さく分割する**

#### 良い例：段階的実装
```typescript
// Step 1: 型定義のみ
mcp__gpt-codex__codex({
  prompt: `
    src/lib/types.d.tsに以下の型定義を追加してください：

    export interface Qualification {
      id: string;
      name: string;
      tier: 'S' | 'A' | 'B' | 'C' | 'D';
      // ... 他のフィールド
    }

    既存コードは変更せず、追加のみ。
  `,
  sandbox: "workspace-write"
})

// Step 2: 成功したら次のファイル
mcp__gpt-codex__codex({
  prompt: `
    js/qualifications-30.jsを参考に、
    src/lib/qualifications.tsを作成してください。

    以下の内容を含める：
    - QUALIFICATIONS_30オブジェクト（30資格）
    - TIER_EMOJIS
    - QUALIFICATION_OVERALL_RATE

    ファイル作成のみ、他は触らない。
  `,
  sandbox: "workspace-write"
})

// ... 以降も1ファイルずつ
```

**メリット:**
- ✓ 各ステップ2-3分で完了
- ✓ 問題が起きても影響範囲が小さい
- ✓ 進捗が明確

---

### 原則2: **approval-policy を適切に設定**

#### 推奨設定
```typescript
// ケース1: 信頼できるタスク（ファイル作成・編集のみ）
mcp__gpt-codex__codex({
  prompt: "...",
  // approval-policyを指定しない（デフォルト: untrusted）
  sandbox: "workspace-write"
})

// ケース2: シェルコマンド実行が必要
mcp__gpt-codex__codex({
  prompt: "...",
  "approval-policy": "on-failure",  // 失敗時のみ承認
  sandbox: "workspace-write"
})

// ケース3: 危険な操作（削除・本番環境変更）
mcp__gpt-codex__codex({
  prompt: "...",
  "approval-policy": "on-request",  // 毎回承認
  sandbox: "danger-full-access"
})
```

**重要:** `on-request`は最小限に！繰り返し承認ダイアログが出ると画面が明滅します。

---

### 原則3: **sandboxモードを明示**

```typescript
// 読み取り専用（分析・レポート生成）
sandbox: "read-only"

// ファイル編集のみ（推奨）
sandbox: "workspace-write"

// フルアクセス（慎重に）
sandbox: "danger-full-access"
```

---

### 原則4: **タイムアウトを考慮**

Codexの設定タイムアウト: **10分**（`~/.codex/config.toml`で設定）

**複雑度別の目安:**
- 🟢 単純（型定義追加、小さなファイル作成）: 1-2分
- 🟡 中程度（1ファイル変換、関数追加）: 2-5分
- 🟠 やや複雑（2-3ファイル変換、中規模リファクタ）: 5-8分
- 🔴 複雑（複数ファイル統合、大規模リファクタ）: 8分以上 → **分割推奨**

**10分を超えそうなタスク:**
- ✗ 5ファイル以上の一括生成
- ✗ 非常に大きなファイル（1000行以上）の全書き換え
- ✗ 複雑な依存関係の解決

→ これらは**Claude Code自身**か**複数のCodex呼び出し**で対応

---

## 📋 実践的な使い分け

### Claude Code vs Codex

| タスク | 推奨 | 理由 |
|--------|------|------|
| 単純なファイルコピー | Claude Code | 確実、速い |
| 型定義追加 | Claude Code | 小さい変更 |
| JavaScript → TypeScript変換 | Codex（1ファイルずつ） | 複雑なロジック変換 |
| 複数ファイル統合 | Claude Code | 全体把握が必要 |
| 深い論理的思考が必要 | Codex | o1の強み |
| バグの根本原因分析 | Codex | 深い推論 |

---

## 🎯 今回のタスクの正しいアプローチ

### ❌ 失敗した方法（1回のCodex呼び出し）
```
Codex → 6ファイル一括生成 → タイムアウト
```

### ✅ 成功する方法（分割実行）

**Option A: Claude Codeが主導**
```
Claude Code:
  1. 型定義追加（直接編集）
  2. qualifications.ts作成（コピー＋変換）
  3. qualificationGenerator.ts作成（コピー＋変換）
  4. CSS作成（コピー）
  5. game.ts統合（インポート追加＋関数修正）
  6. テスト＆ビルド
```
→ **今回採用した方法（成功）** ✅

**Option B: Codexを小分けに使う**
```
1. Claude Code: 型定義作成（1分）
2. Codex: qualifications.ts生成（3分）
   mcp__gpt-codex__codex({
     prompt: "js/qualifications-30.jsをTypeScriptに変換",
     sandbox: "workspace-write"
   })
3. Codex: qualificationGenerator.ts生成（3分）
4. Claude Code: CSS作成（1分）
5. Codex: game.ts統合（4分）
6. Claude Code: テスト＆ビルド（5分）
```
→ 各ステップ5分以内、確実

---

## 🚨 トラブルシューティング

### 症状1: 画面が明滅する
**原因:** `approval-policy: "on-request"` で承認ダイアログが繰り返し表示
**対策:** `on-failure` または指定なしに変更

### 症状2: Codexが何も出力せず終了
**原因:** タイムアウト（5分超過）
**対策:** タスクを分割、1ステップ3分以内に収める

### 症状3: "Tool ran without output or errors"
**原因:**
- タイムアウト
- 内部エラー
- タスクが大きすぎて処理できない

**対策:**
1. タスクを1/2または1/3に分割
2. `model: "haiku"` を試す（速いが精度低）
3. Claude Code自身で実装

### 症状4: Codexが途中で止まる
**原因:**
- ファイルが大きすぎる（1000行以上）
- 依存関係が複雑

**対策:**
1. ファイルを部分的に処理（上半分→下半分）
2. 依存関係を事前整理

---

## 📝 テンプレート集

### テンプレート1: ファイル変換
```typescript
mcp__gpt-codex__codex({
  prompt: `
    以下のJavaScriptファイルをTypeScriptに変換してください：

    入力: js/example.js
    出力: src/lib/example.ts

    要件:
    - ESMインポート形式
    - 型定義を追加
    - 既存機能は保持

    他のファイルは変更しないでください。
  `,
  sandbox: "workspace-write"
})
```

### テンプレート2: 関数追加
```typescript
mcp__gpt-codex__codex({
  prompt: `
    src/lib/game.tsに以下の関数を追加してください：

    export function newFunction(param: Type): ReturnType {
      // 実装...
    }

    既存コードは変更せず、ファイル末尾に追加。
  `,
  sandbox: "workspace-write"
})
```

### テンプレート3: デバッグ・分析（読み取り専用）
```typescript
mcp__gpt-codex__codex({
  prompt: `
    src/lib/game.tsを分析し、
    以下の問題の原因を特定してください：

    エラー: TypeError: Cannot read property 'x' of undefined

    修正は不要、原因の説明のみ。
  `,
  sandbox: "read-only"
})
```

---

## 🎓 まとめ

### Codexを使うべき時
✓ 複雑なロジック変換
✓ 深い推論が必要なバグ分析
✓ アルゴリズム実装
✓ 大規模コードのリファクタリング（**小分け**にして）

### Claude Codeを使うべき時
✓ 単純なファイル操作
✓ 複数ファイルの統合
✓ 全体の流れ管理
✓ ビルド＆テスト
✓ 5分以内に終わらないタスク

### 黄金律
**「1つのCodex呼び出しは8分以内で完結するタスクに限定」**
（10分タイムアウト設定、余裕を持って8分目安）

---

**作成者**: Claude Code
**参考**: 実際のエラー事例から学習
**更新**: 必要に応じて追記してください

---

## 🧪 テスト履歴

### 2025-10-28 - 設定最適化後のテスト
- **タイムアウト**: 120秒 → 600秒（10分）に延長
- **結果**: テスト成功 ✅
- **確認項目**:
  - ファイル編集が正常に完了
  - 画面明滅なし
  - エラーなし

**結論**: 設定最適化により、Codexが安定して動作することを確認。
**10分タイムアウト**により、より複雑なタスク（複数ファイル変換など）も可能に。
