# 🎮 経営シミュレーション - 実装引継ぎ資料

**作成日**: 2025年10月9日
**作成者**: Claude Code
**プロジェクト**: ビジネスエンパイア v2.0 → v2.1アップグレード

---

## 📋 プロジェクト概要

### 現在の状態
- **バージョン**: v2.0 (Premium UI)
- **メインファイル**: `enhanced-game.html` (2,002行)
- **機能**:
  - ✅ 従業員管理（性格・スキル・メンタルヘルス）
  - ✅ 部署管理（開発・営業・企画）
  - ✅ 採用システム（面接・評価）
  - ✅ 製品開発・マーケティング
  - ✅ 財務管理・融資
  - ✅ PWA対応・レスポンシブデザイン

### 次期バージョン (v2.1)
Phase 1の新機能実装予定:
1. **デイリーミッションシステム** - 毎日3つのミッション
2. **成長ダッシュボード** - Chart.jsでビジュアル化
3. **従業員ストーリーカード** - 背景ストーリー・個性強化

---

## 🎯 実装タスク詳細

### 1. デイリーミッションシステム

#### 仕様
- **ミッション数**: 毎日3つランダム生成
- **種類**: 採用/研修/製品開発/売上目標/節約など
- **報酬**: 資金・評判ポイント・研究ポイント
- **リセット**: 毎月1日にリセット

#### 実装箇所
```javascript
// js/enhanced-business-game.js に追加
class DailyMissionSystem {
    constructor(game) {
        this.game = game;
        this.missions = [];
    }

    generateDailyMissions() {
        const missionPool = [
            { id: 'hire_1', name: '人材採用', desc: '従業員を1人採用する', reward: 50000, type: 'hire', target: 1 },
            { id: 'train_3', name: '研修実施', desc: '3人に研修を実施する', reward: 30000, type: 'train', target: 3 },
            { id: 'develop_product', name: '製品開発', desc: '新製品を1つ開発する', reward: 80000, type: 'develop', target: 1 },
            { id: 'revenue_100', name: '売上目標', desc: '月間売上100万円達成', reward: 100000, type: 'revenue', target: 100 },
            { id: 'save_costs', name: '経費削減', desc: '今月の経費を前月比10%削減', reward: 60000, type: 'cost', target: 10 }
        ];

        // ランダムに3つ選択
        this.missions = this.shuffleArray(missionPool).slice(0, 3).map(m => ({
            ...m,
            progress: 0,
            completed: false
        }));
    }

    checkProgress(actionType, value) {
        this.missions.forEach(mission => {
            if (mission.type === actionType && !mission.completed) {
                mission.progress += value;
                if (mission.progress >= mission.target) {
                    mission.completed = true;
                    this.game.money += mission.reward;
                    return { completed: true, reward: mission.reward };
                }
            }
        });
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}
```

#### UI追加箇所 (enhanced-game.html)
```html
<!-- 概要パネル内に追加 -->
<div class="daily-missions card">
    <div class="card-header">📋 デイリーミッション</div>
    <div class="card-body" id="dailyMissionsContainer"></div>
</div>
```

#### CSS追加
```css
.mission-item {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 12px;
    margin: 8px 0;
    border-radius: 8px;
    border-left: 4px solid #667eea;
}

.mission-completed {
    background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
    border-left-color: #28a745;
    opacity: 0.8;
}

.mission-progress {
    width: 100%;
    height: 6px;
    background: #e0e0e0;
    border-radius: 3px;
    margin-top: 8px;
    overflow: hidden;
}

.mission-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s ease;
}
```

---

### 2. 成長ダッシュボード (Chart.js)

#### CDN追加
```html
<!-- head内に追加 -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

#### 実装コード
```javascript
// js/enhanced-ui.js に追加
class GrowthDashboard {
    constructor(game) {
        this.game = game;
        this.charts = {};
        this.historyData = {
            revenue: [],
            employees: [],
            marketShare: [],
            labels: []
        };
    }

    updateHistory() {
        const state = this.game.getGameState();
        this.historyData.revenue.push(state.monthlyRevenue);
        this.historyData.employees.push(state.employees.length);
        this.historyData.marketShare.push(state.marketShare);
        this.historyData.labels.push(`${state.year}年${state.month}月`);

        // 最新12ヶ月分のみ保持
        if (this.historyData.labels.length > 12) {
            Object.keys(this.historyData).forEach(key => {
                this.historyData[key].shift();
            });
        }
    }

    renderRevenueChart(canvasId) {
        const ctx = document.getElementById(canvasId).getContext('2d');

        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.historyData.labels,
                datasets: [{
                    label: '売上推移',
                    data: this.historyData.revenue,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    tooltip: {
                        callbacks: {
                            label: (context) => `売上: ${context.parsed.y}万円`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => value + '万'
                        }
                    }
                }
            }
        });
    }

    renderEmployeeChart(canvasId) {
        const ctx = document.getElementById(canvasId).getContext('2d');

        if (this.charts.employees) {
            this.charts.employees.destroy();
        }

        this.charts.employees = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.historyData.labels,
                datasets: [{
                    label: '従業員数',
                    data: this.historyData.employees,
                    backgroundColor: 'rgba(76, 175, 80, 0.6)',
                    borderColor: '#4caf50',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
}
```

#### HTML追加
```html
<!-- 新しいタブ「📊 成長」を追加 -->
<button class="tab" data-panel="growth">📊 成長</button>

<!-- パネル追加 -->
<div id="growth" class="panel">
    <h3>📊 会社成長ダッシュボード</h3>
    <div class="chart-container">
        <canvas id="revenueChart" style="max-height: 300px;"></canvas>
    </div>
    <div class="chart-container" style="margin-top: 20px;">
        <canvas id="employeeChart" style="max-height: 300px;"></canvas>
    </div>
</div>
```

---

### 3. 従業員ストーリーカード

#### データ拡張 (js/enhanced-game-data.js)
```javascript
const EMPLOYEE_BACKSTORIES = {
    tech_genius: [
        "幼少期からプログラミングに夢中。大学時代にハッカソンで優勝経験あり。",
        "元フリーランス。大手企業の案件を複数こなした実績を持つ。",
        "独学でAIを学び、個人プロジェクトでバズった経験がある。"
    ],
    business_expert: [
        "MBA取得後、コンサルティングファームで5年勤務。",
        "スタートアップでCOOを務めた経験があり、組織づくりに精通。",
        "営業成績トップを3年連続で獲得した実力者。"
    ],
    creative_mind: [
        "デザインコンテストで受賞歴あり。美的センス抜群。",
        "広告代理店でクリエイティブディレクターとして活躍。",
        "UXデザインの専門家。ユーザー心理を深く理解している。"
    ],
    // ... 他の性格タイプ用ストーリー
};

// EnhancedEmployee クラスに追加
constructor(options = {}) {
    // 既存コード...

    // ストーリー追加
    this.backstory = this.generateBackstory();
    this.quirks = this.generateQuirks(); // 癖・特徴
}

generateBackstory() {
    const personality = ENHANCED_PERSONALITIES[this.personalityId];
    const storyType = this.getStoryType(personality);
    const stories = EMPLOYEE_BACKSTORIES[storyType] || EMPLOYEE_BACKSTORIES.tech_genius;
    return stories[Math.floor(Math.random() * stories.length)];
}

generateQuirks() {
    const quirkPool = [
        '☕ コーヒー中毒',
        '🎮 ゲーム好き',
        '📚 読書家',
        '🏃 健康志向',
        '🎵 音楽マニア',
        '🍜 ラーメン通',
        '🌙 夜型人間',
        '☀️ 朝型人間'
    ];

    const count = Math.floor(Math.random() * 2) + 1; // 1-2個
    return this.shuffleArray(quirkPool).slice(0, count);
}
```

#### UI表示 (js/enhanced-ui.js)
```javascript
showEmployeeDetail(employeeId) {
    const employee = this.game.employees.find(e => e.id === employeeId);
    if (!employee) return;

    const html = `
        <div class="employee-profile-card">
            <div class="profile-header">
                <h3>${employee.name}</h3>
                <span class="badge primary">${employee.getPersonality().name}</span>
            </div>

            <!-- 背景ストーリー -->
            <div class="story-section card">
                <h4>📖 背景</h4>
                <p style="font-size: 14px; line-height: 1.6; color: #666;">
                    ${employee.backstory}
                </p>
            </div>

            <!-- 個性・癖 -->
            <div class="quirks-section">
                <h4>✨ 個性</h4>
                <div class="quirk-tags">
                    ${employee.quirks.map(q => `<span class="skill-tag secondary">${q}</span>`).join('')}
                </div>
            </div>

            <!-- 既存のスキル・メンタル表示... -->
        </div>
    `;

    this.showModal(`👤 ${employee.name}の詳細`, html);
}
```

---

## 📁 ファイル構成

```
経営シミュレーション/
├── enhanced-game.html (v2.0 - 現在)
├── enhanced-game-v2.1.html (実装予定)
├── js/
│   ├── game-constants.js
│   ├── game-data.js
│   ├── enhanced-game-data.js ← ストーリーデータ追加
│   ├── game-models.js
│   ├── enhanced-employee.js ← ストーリー機能追加
│   ├── interview-system.js
│   ├── business-game.js
│   ├── enhanced-business-game.js ← ミッション機能追加
│   ├── game-ui.js
│   └── enhanced-ui.js ← ダッシュボード機能追加
├── manifest.json
├── sw.js
├── GAME-IMPROVEMENT-ROADMAP.md
└── IMPLEMENTATION-HANDOVER.md (このファイル)
```

---

## 🔧 実装手順

### ステップ1: デイリーミッション
1. `js/enhanced-business-game.js` に `DailyMissionSystem` クラス追加
2. `EnhancedBusinessGame.constructor()` でミッションシステム初期化
3. `enhanced-game.html` の概要パネルにUI追加
4. CSS追加
5. `nextTurn()` で月初にミッション生成

### ステップ2: 成長ダッシュボード
1. `<head>` に Chart.js CDN追加
2. `js/enhanced-ui.js` に `GrowthDashboard` クラス追加
3. 新タブ「📊 成長」を追加
4. `nextTurn()` で履歴データ更新
5. グラフレンダリング

### ステップ3: 従業員ストーリー
1. `js/enhanced-game-data.js` に `EMPLOYEE_BACKSTORIES` 追加
2. `EnhancedEmployee` クラスに `backstory` と `quirks` 追加
3. `enhanced-ui.js` の従業員詳細表示を拡張
4. CSS でストーリーカードスタイル追加

### ステップ4: テスト
- [ ] ミッション生成・進捗・報酬が正常動作
- [ ] グラフが正しく描画・更新
- [ ] 従業員詳細にストーリーが表示
- [ ] モバイルでレスポンシブ動作
- [ ] localStorage保存・読込が正常

---

## 🐛 既知の問題

### Codex MCP タイムアウト問題
**症状**: `mcp__gpt-codex__codex` ツール呼び出しが無応答
**原因**:
- タイムアウト設定 (120秒でも不十分な可能性)
- 長いプロンプト・複雑なタスクで応答なし

**対策済み**:
- ✅ Node.js v22に切り替え
- ✅ `~/.codex/config.toml` 最適化
  - `model = "o3"`
  - `agent_response = 120`
  - フルディスクアクセス権限

**推奨される使い方**:
1. **簡単なタスク**: Codex利用可能
   ```javascript
   mcp__gpt-codex__codex({
       prompt: "test.txt作成",
       cwd: "/path/to/dir",
       sandbox: "workspace-write"
   })
   ```

2. **複雑なタスク**: Claude Code が直接実装
   - ファイル読込・編集は Read/Edit ツール使用
   - Codexは補助的に利用

---

## 💡 開発のヒント

### localStorage活用
```javascript
// ミッションデータ保存
saveGame() {
    const state = this.getGameState();
    state.dailyMissions = this.missionSystem.missions;
    state.growthHistory = this.dashboard.historyData;
    localStorage.setItem('businessGame', JSON.stringify(state));
}

// 読込
loadGame() {
    const saved = JSON.parse(localStorage.getItem('businessGame'));
    if (saved.dailyMissions) {
        this.missionSystem.missions = saved.dailyMissions;
    }
    if (saved.growthHistory) {
        this.dashboard.historyData = saved.growthHistory;
    }
}
```

### パフォーマンス最適化
- Chart.js: `destroy()` してから再作成で メモリリーク防止
- 履歴データ: 最新12ヶ月のみ保持
- ミッション: 月初のみ生成

### レスポンシブ対応
```css
@media (max-width: 768px) {
    .chart-container canvas {
        max-height: 200px !important;
    }
}
```

---

## 📊 期待される成果

### プレイヤー体験向上
- **エンゲージメント**: デイリーミッションで毎日ログインの動機
- **可視化**: グラフで成長実感
- **愛着**: 従業員ストーリーで感情移入

### ゲーム性向上
- **マイクロループ**: 日次ミッション達成
- **ミドルループ**: 月次成長確認
- **マクロループ**: 業界1位達成

---

## 🚀 次のステップ (Phase 2)

Phase 1完了後、ROADMAPのPhase 2へ:
- 会社DNAシステム
- タイムライン機能
- 性格マトリクス詳細表示

---

## 📞 引継ぎ事項

### 環境
- **Node.js**: v22.20.0 (必須)
- **npm**: v10.9.3
- **MCPサーバー**: gpt-codex, gemini, perplexity-mcp

### 注意点
- Codexは簡単なタスクのみ利用
- 複雑な実装はClaude Codeが直接実行
- Chart.js は CDN から読込（オフライン不可）

### テストアカウント
デバッグ用:
```javascript
window.debugEnhancedGame.addMoney(1000000); // 資金追加
window.debugEnhancedGame.addEmployee(); // 従業員追加
```

---

**作成者**: Claude Code
**最終更新**: 2025年10月9日 深夜
**次回作業**: 明日 Phase 1実装開始

おやすみなさい！🌙
