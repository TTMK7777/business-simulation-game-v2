# A2UI for Business Empire

Google A2UI（Agent-to-User Interface）の設計思想を取り入れたリッチUIコンポーネントシステム。

## 概要

A2UIは、AIエージェントからユーザーへのリッチなUI生成を可能にするフレームワークです。
本実装では、Litベースのカスタムエレメントとして提供しています。

## 使い方

### グローバルマネージャーからの利用

```typescript
// ゲームコードから
const a2ui = (window as any).a2ui

// 通知を表示
a2ui.notifySuccess('契約獲得！', '大口契約を獲得しました！売上+500万円')
a2ui.notifyWarning('従業員不足', '人手が足りません。採用を検討してください。')
a2ui.notifyDanger('資金危機', '資金が危険水準です！')
a2ui.notifyAchievement('初めての黒字達成！', 'おめでとうございます！')

// AIアドバイザーを表示
a2ui.showAdvisor({
  category: 'finance',
  sentiment: 'warning',
  message: '資金繰りに注意が必要です。',
  suggestions: ['銀行融資を検討', 'コスト削減を実施']
})

// ニュースカードを表示
a2ui.showNews({
  headline: 'IT業界に追い風！',
  content: '政府のDX推進により市場が拡大しています。',
  category: 'industry',
  impact: 'positive'
})

// 財務ダッシュボードを表示
a2ui.showFinanceDashboard({
  revenue: 5000000,
  expenses: 3000000,
  profit: 2000000,
  cash: 10000000,
  debt: 2000000
}, 'financeContainer')

// 従業員カードを表示
a2ui.showEmployee({
  name: '田中太郎',
  position: '一般',
  department: '開発部',
  personality: '情熱家',
  motivation: 85,
  skills: { 技術力: 75, 営業力: 40, 企画力: 60 },
  certifications: ['基本情報技術者']
}, 'employeeContainer')
```

### HTMLでの直接利用

```html
<a2ui-card cardType="info" elevation="medium">
  <a2ui-text variant="h3">カードタイトル</a2ui-text>
  <a2ui-text variant="body">カードの内容</a2ui-text>
</a2ui-card>

<a2ui-advisor-card
  category="finance"
  sentiment="positive"
  message="経営状態は良好です！"
></a2ui-advisor-card>

<a2ui-news-card
  headline="業界ニュース"
  content="市場が拡大しています"
  category="industry"
  impact="positive"
></a2ui-news-card>

<a2ui-event-notification
  title="達成！"
  message="初めての黒字を達成しました"
  eventType="achievement"
></a2ui-event-notification>
```

## コンポーネント一覧

### 基本コンポーネント

| コンポーネント | 説明 |
|--------------|------|
| `<a2ui-card>` | 汎用カード |
| `<a2ui-text>` | テキスト（h1-h5, body, caption） |
| `<a2ui-button>` | ボタン |
| `<a2ui-icon>` | アイコン |
| `<a2ui-row>` | 水平レイアウト |
| `<a2ui-column>` | 垂直レイアウト |
| `<a2ui-badge>` | バッジ |
| `<a2ui-progress>` | プログレスバー |
| `<a2ui-divider>` | 区切り線 |
| `<a2ui-avatar>` | アバター |

### ゲーム専用コンポーネント

| コンポーネント | 説明 |
|--------------|------|
| `<a2ui-advisor-card>` | AIアドバイザーカード |
| `<a2ui-news-card>` | ニュースカード |
| `<a2ui-employee-card>` | 従業員カード |
| `<a2ui-event-notification>` | イベント通知 |
| `<a2ui-finance-dashboard>` | 財務ダッシュボード |

## ファイル構成

```
src/lib/a2ui/
├── index.ts          # エントリーポイント
├── components.ts     # 基本コンポーネント
├── game-components.ts # ゲーム専用コンポーネント
├── manager.ts        # A2UIマネージャー
└── README.md         # このドキュメント
```

## 今後の拡張予定

- [ ] チャート統合（Chart.jsとの連携）
- [ ] アニメーション強化
- [ ] テーマカスタマイズ
- [ ] モバイル最適化
