# AIチーム タイムアウト設定ガイド

**作成日**: 2025-10-28
**目的**: すべてのAI（Codex, Gemini, Perplexity, AI Orchestrator）のタイムアウトを統一

---

## 📊 現在の設定

すべてのAIのタイムアウトを **10分（600秒）** に統一しました。

| AI | 設定ファイル | タイムアウト | 備考 |
|---|---|---|---|
| **Codex (o3)** | `~/.codex/config.toml` | 600秒 | agent_response |
| **Gemini** | `~/.mcp.json` | 600秒 | MCP経由 |
| **Perplexity** | `~/.mcp.json` | 600秒 | MCP経由 |
| **AI Orchestrator** | `~/.mcp.json` | 600秒 | MCP経由 |

---

## 🔧 設定ファイル詳細

### 1. Codex設定（`~/.codex/config.toml`）

```toml
# Model configuration
model = "o3"

# Timeout settings for long-running operations
[timeouts]
agent_response = 600  # seconds (10分に延長 - より複雑なタスク対応)

# Sandbox permissions for full access
[sandbox]
permissions = ["disk-full-read-access", "disk-full-write-access"]
```

**設定方法:**
```bash
# 直接編集
nano ~/.codex/config.toml
```

---

### 2. MCP設定（`~/.mcp.json`）

```json
{
  "mcpServers": {
    "gemini": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@eyycheev/gemini-mcp"],
      "env": {
        "GEMINI_API_KEY": "YOUR_API_KEY",
        "MCP_TIMEOUT": "600000",
        "REQUEST_TIMEOUT": "600000",
        "GEMINI_TIMEOUT": "600"
      }
    },
    "ai-orchestrator": {
      "type": "stdio",
      "command": "/home/ttsuj/Desktop/01_AI-Agents/mcp-ai-orchestrator/venv/bin/python3",
      "args": ["/home/ttsuj/Desktop/01_AI-Agents/mcp-ai-orchestrator/mcp_server.py"],
      "env": {
        "MCP_TIMEOUT": "600000",
        "REQUEST_TIMEOUT": "600000"
      }
    },
    "perplexity-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "perplexity-mcp"],
      "env": {
        "MCP_TIMEOUT": "600000",
        "REQUEST_TIMEOUT": "600000"
      }
    }
  }
}
```

**設定方法:**
```bash
# 直接編集
nano ~/.mcp.json
```

**環境変数の意味:**
- `MCP_TIMEOUT`: MCPサーバー全体のタイムアウト（ミリ秒）
- `REQUEST_TIMEOUT`: 個別リクエストのタイムアウト（ミリ秒）
- `GEMINI_TIMEOUT`: Gemini API固有のタイムアウト（秒）

---

## 📋 タイムアウト時間の単位に注意

| 設定 | 単位 | 10分の値 |
|------|------|----------|
| Codex `agent_response` | **秒** | `600` |
| MCP `MCP_TIMEOUT` | **ミリ秒** | `600000` |
| MCP `REQUEST_TIMEOUT` | **ミリ秒** | `600000` |
| MCP `GEMINI_TIMEOUT` | **秒** | `600` |

---

## ⚠️ タイムアウト変更後の注意点

### 1. Claude Code再起動が必要

設定変更後は、Claude Codeを再起動してください：

```bash
# Claude Codeを終了して再起動
# （VSCode拡張の場合は、VSCodeを再起動）
```

### 2. MCPサーバーの自動再接続

MCPサーバー（Gemini, Perplexity, AI Orchestrator）は、次回使用時に自動的に新しい設定で起動します。

### 3. 設定の確認方法

#### Codex
```bash
# 設定ファイルを確認
cat ~/.codex/config.toml | grep agent_response
# 出力: agent_response = 600
```

#### MCP
```bash
# 設定ファイルを確認
cat ~/.mcp.json | grep TIMEOUT
# 出力: "MCP_TIMEOUT": "600000", など
```

---

## 🎯 10分タイムアウトで対応可能なタスク

### ✅ Codex（o3モデル）
- 2-3ファイルの同時TypeScript変換
- 中規模リファクタリング（500行程度）
- 複雑なロジック実装
- 統合作業（複数箇所の修正）

### ✅ Gemini
- 詳細なコードレビュー（複数ファイル）
- 深いデバッグ分析
- Web検索を含むリサーチ
- 複雑なエラー原因特定

### ✅ Perplexity
- 詳細な技術調査
- 複数キーワードの比較調査
- 長文レポート生成

### ✅ AI Orchestrator
- 複数AIの協調タスク
- 品質パイプライン実行
- 複雑なワークフロー

---

## 🚨 それでもタイムアウトする場合

### 症状
- 10分経過してもタスクが完了しない
- "Timeout"エラーが発生

### 対処法

#### 1. タスクをさらに分割
```typescript
// ❌ 大きすぎるタスク（10分超える）
"5ファイルを一括変換してください"

// ✅ 分割したタスク
"file1.jsをTypeScriptに変換"  // 3分
"file2.jsをTypeScriptに変換"  // 3分
...（順次実行）
```

#### 2. タイムアウトをさらに延長（非推奨）
```toml
# ~/.codex/config.toml
[timeouts]
agent_response = 900  # 15分（最後の手段）
```

```json
// ~/.mcp.json
"env": {
  "MCP_TIMEOUT": "900000",  // 15分（最後の手段）
  "REQUEST_TIMEOUT": "900000"
}
```

**注意**: 15分以上はお勧めしません。ネットワーク切断のリスクが高まります。

#### 3. 別のAIに変更
- 非常に複雑なタスク → Codex（深い推論）
- 大量の調査 → Gemini（Web検索統合）
- シンプルな実装 → Claude Code自身（確実）

---

## 📝 トラブルシューティング

### 問題1: 設定変更したのにタイムアウトする

**原因**: 設定が反映されていない

**対処**:
1. Claude Code再起動
2. 設定ファイルの保存確認
3. JSONフォーマットエラーチェック
```bash
# JSON構文確認
cat ~/.mcp.json | python3 -m json.tool
```

### 問題2: Geminiだけタイムアウトする

**原因**: Gemini API側の制限

**対処**:
- Gemini APIキーの割り当て上限確認
- リクエストサイズを小さくする
- `GEMINI_TIMEOUT`を個別に延長

### 問題3: すべてのAIがタイムアウトする

**原因**: ネットワーク接続問題

**対処**:
1. インターネット接続確認
2. プロキシ設定確認
3. VPN接続確認

---

## 🎓 ベストプラクティス

### 1. タスクサイズの目安
- **1-3分**: 単純タスク（型定義、小さなファイル）
- **3-5分**: 中程度タスク（1ファイル変換）
- **5-8分**: 複雑タスク（2-3ファイル統合）
- **8分以上**: 分割推奨

### 2. AIの使い分け
- **速度優先**: Claude Code（即座）
- **深い推論**: Codex（2-10分）
- **Web情報**: Gemini/Perplexity（1-5分）

### 3. タイムアウト時の対応
1. まずタスクを分割
2. それでもダメなら別のAI
3. 最後の手段でタイムアウト延長

---

## 📊 変更履歴

| 日付 | 変更内容 | 理由 |
|------|---------|------|
| 2025-10-28 | Codex: 120秒 → 600秒 | 複雑タスク対応 |
| 2025-10-28 | Gemini/Perplexity/AI Orchestrator: タイムアウト設定追加 | 統一管理 |

---

## 🔗 関連ドキュメント

- [CODEX_BEST_PRACTICES.md](./CODEX_BEST_PRACTICES.md) - Codex利用ガイド
- [CLAUDE.md](/home/ttsuj/CLAUDE.md) - AIチーム構成
- [TAURI_MIGRATION_PLAN.md](./TAURI_MIGRATION_PLAN.md) - プロジェクト計画

---

**作成者**: Claude Code
**最終更新**: 2025-10-28
**バージョン**: 1.0
