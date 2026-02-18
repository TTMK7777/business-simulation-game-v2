# 次回実装タスク - 経営シミュレーションゲーム

**最終更新日**: 2025-10-15
**セッション**: 従業員詳細・採用UI・部署タブ実装完了後

---

## 📋 今回実装した内容（2025-10-15）

### ✅ 完了した機能

1. **従業員詳細モーダル強化**
   - 性格効果の数値表示（例: 開発速度 +20%、バグ発生率 -30%）
   - 特性効果の説明文を枠付きで表示
   - ポジティブ/ネガティブ効果を色分け（緑/赤）
   - 相性の良い/悪い性格の表示

2. **採用UI完全リニューアル**
   - 3候補を横並びカード式で表示
   - 能力値・特性・給与を一覧比較可能
   - グラスモーフィズムデザイン統一
   - hover時の浮き上がりエフェクト
   - `generateCandidate()`ヘルパー関数でコード再利用性向上

3. **部署タブ新設**
   - 4部署（開発・営業・企画・管理）の状況を可視化
   - 各部署の人数・平均能力値・効率性を表示
   - 責任者（最高役職者）を自動抽出・表示
   - 効率性を色付きプログレスバーで視覚化
   - メンバーの絵文字アイコン表示（最大8名+残り人数）

4. **AIチーム協働**
   - **Perplexity**: 2025年ゲームUIトレンド調査（Glassmorphism, Micro-interactions）
   - **Gemini**: 組織図ライブラリ調査・効率性計算アルゴリズム提案
   - **Claude**: 統合実装・XSS対策維持・テスト

---

## 🎯 次回実装すべき機能

### 優先度: 高🔥

#### 1. 採用UIのCSSリファクタリング

**現在の問題点:**
- 採用候補カードにインラインstyle属性が多数残存
- 保守性・可読性が低下している

**改善案:**
```javascript
// ❌ 現在（インラインstyle多用）
<div style="font-size: 32px; margin-bottom: 8px;">${personality.emoji}</div>

// ✅ 理想（CSSクラス化）
<div class="candidate-emoji">${personality.emoji}</div>
```

**修正箇所:**
- `index.html:2538-2601` (showHiring関数内のHTML生成部分)
- CSSに`.candidate-emoji`, `.candidate-abilities-grid`などを追加

**優先度理由:** ユーザーからの指摘があり、コード品質向上のため

---

#### 2. 部署異動機能の追加

**設計案:**
従業員詳細モーダルに「部署異動」ボタンを追加

```javascript
function changeDepartment(employee, newDepartmentKey) {
    employee.department = newDepartmentKey;
    employee.growthHistory.push({
        turn: game.turn,
        event: '部署異動',
        description: `${DEPARTMENTS[newDepartmentKey].emoji} ${DEPARTMENTS[newDepartmentKey].name}に異動しました`
    });
    closeModal();
    renderActivePanel(); // 部署タブを更新
    showModal('異動完了', `${employee.name}を${DEPARTMENTS[newDepartmentKey].name}に異動させました`);
}
```

**追加UI:**
- 従業員詳細モーダルに部署選択ドロップダウン
- 現在の部署を強調表示
- 異動ボタン追加

---

#### 3. ゲームバランス調整（研修効果逓減）

**現在の問題点:**
```javascript
// 研修効果が大きすぎる
baseIncrease = 10;  // 研修1回で+10（5回で+50）
// → 誰でも5回研修すれば全能力100に到達してしまう
```

**改善案:**
能力値に応じて成長率を逓減

```javascript
function calculateTrainingGrowth(currentAbility, baseIncrease) {
    if (currentAbility >= 90) return Math.floor(baseIncrease * 0.2); // 90+は20%
    if (currentAbility >= 80) return Math.floor(baseIncrease * 0.4); // 80-89は40%
    if (currentAbility >= 70) return Math.floor(baseIncrease * 0.6); // 70-79は60%
    return baseIncrease; // 69以下は100%
}
```

**修正ファイル**: `index.html` (trainEmployees関数)

---

### 優先度: 中🔶

#### 4. 昇進機能の実装

**設計案:**
従業員の能力値に応じて昇進を提案

```javascript
function checkPromotionEligibility(employee) {
    const avgAbility = (employee.abilities.technical + employee.abilities.sales +
                       employee.abilities.planning + employee.abilities.management) / 4;

    const currentPosition = POSITIONS[employee.position];
    const nextPositions = Object.entries(POSITIONS).filter(([key, pos]) =>
        pos.requiredAbility > currentPosition.requiredAbility &&
        avgAbility >= pos.requiredAbility
    );

    return nextPositions.length > 0 ? nextPositions[0] : null;
}
```

**追加UI:**
- 従業員詳細モーダルに「昇進させる」ボタン（条件達成時のみ表示）
- 昇進時の給与増加額を事前表示
- 昇進履歴を成長履歴に記録

---

#### 5. 部署バランスボーナス

**設計案:**
全部署に従業員が配置されている場合、売上にボーナス

```javascript
function calculateDepartmentBalanceBonus() {
    const departmentCounts = {};
    Object.keys(DEPARTMENTS).forEach(deptKey => {
        departmentCounts[deptKey] = game.employees.filter(emp => emp.department === deptKey).length;
    });

    const allDepartmentsFilled = Object.values(departmentCounts).every(count => count > 0);
    return allDepartmentsFilled ? 1.2 : 1.0; // 全部署揃っている場合+20%
}
```

**表示:**
- 概要タブに「部署バランスボーナス: +20%」を表示
- 部署タブに「全部署配置完了！」バッジ表示

---

#### 6. 給与交渉システム

**現在の問題:**
- 給与は採用時に固定（モチベーション低下要因がない）

**実装案:**
- ターン経過で給与交渉イベント発生
- 昇給を拒否すると退職リスク
- 業績が良いと自動昇給でモチベーションUP

---

### 優先度: 低⚪

#### 7. プロジェクト管理システム

**設計案:**
- 大規模プロジェクトを追加（複数ターンかかる）
- 従業員をアサインして進捗管理
- プロジェクト成功で大きな売上

#### 8. ランダムイベント強化

**追加イベント案:**
- ヘッドハンティング（優秀な従業員が引き抜かれる）
- 業界カンファレンス（スキルアップチャンス）
- 大型案件受注（期限付き高額案件）

#### 9. 実績・トロフィーシステム

**実装案:**
- 「初めての従業員100名」などの実績
- ゲーム終了後に表示

---

## 📁 ファイル構造

```
経営シミュレーション/
├── index.html              # メインゲーム（単一ファイル、159KB）
├── docs/
│   ├── CLAUDE.md          # プロジェクト固有AI設定
│   ├── NEXT_TASKS.md      # このファイル（次回タスク）
│   └── CHANGELOG.md       # 変更履歴（作成推奨）
├── archive/               # 旧バージョン保管
├── js/                    # 旧JS分割ファイル（現在未使用）
├── .claude/               # Claude Code設定
├── README.md              # プロジェクト説明
└── HANDOVER.md            # 前回の引継ぎドキュメント
```

---

## 🛠️ 技術スタック

- **フロントエンド**: Vanilla JavaScript（ES6+）
- **グラフ**: Chart.js 4.4.0（CDN）
- **スタイル**: CSS3（グラスモーフィズム）
- **データ保存**: localStorage
- **構成**: Single HTML file（デプロイが簡単）

---

## 🎨 デザイン原則（2025年トレンド準拠）

1. **Glassmorphism**: backdrop-filter: blur(10px)
2. **Micro-interactions**: hover/active状態でフィードバック
3. **Visual Growth**: レーダーチャート・タイムライン
4. **Seamless Experience**: モーダル遷移、メニュー最小化

---

## 🐛 既知の問題

1. **採用UI**: インラインstyle属性が多数残存（要CSSリファクタリング）★
2. **ゲームバランス**: 研修効果が大きすぎる（要修正）
3. **部署異動**: UI未実装（部署タブは表示のみ）
4. **昇進システム**: 未実装
5. **モバイル対応**: タブスクロールは対応済みだが、細かい調整が必要

---

## 💡 実装のヒント

### 採用UIのCSSリファクタリング

```css
/* 追加推奨CSSクラス */
.candidate-emoji {
    font-size: 32px;
    margin-bottom: 8px;
}

.candidate-abilities-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    font-size: 12px;
}

.candidate-ability-item {
    /* 能力値表示項目のスタイル */
}
```

### ゲームバランス調整のコツ

```javascript
// 能力値成長の黄金比
// - 初期: 30-80（バラつき）
// - 中盤: 50-85（研修で成長）
// - 終盤: 70-95（優秀な人材のみ90+）
// - 最終: 80-100（ごく一部の天才のみ100到達）

// 推奨成長曲線
const GROWTH_CURVE = {
    "0-69": 1.0,    // 通常成長
    "70-79": 0.6,   // 成長鈍化
    "80-89": 0.4,   // かなり鈍化
    "90-100": 0.2   // ほぼ成長しない
};
```

### 部署異動の統合ポイント

```javascript
// showEmployeeDetail関数内に追加
const departmentSelectHtml = `
    <div class="detail-section">
        <h4>🏢 部署異動</h4>
        <select id="deptSelect" class="form-select">
            ${Object.entries(DEPARTMENTS).map(([key, dept]) => `
                <option value="${key}" ${employee.department === key ? 'selected' : ''}>
                    ${dept.emoji} ${dept.name}
                </option>
            `).join('')}
        </select>
        <button class="btn-primary" onclick="changeDepartment(employee, document.getElementById('deptSelect').value)">
            異動する
        </button>
    </div>
`;
```

---

## 📞 次回開始時の確認事項

1. ✅ index.htmlをブラウザで開いて動作確認
2. ✅ 採用タブで3候補がカード式で表示されるか
3. ✅ 部署タブで4部署の状況が可視化されているか
4. ✅ 従業員詳細モーダルで性格効果が数値表示されているか
5. 🔲 採用UIのインラインstyleを確認（次回リファクタリング対象）

---

## 🚀 次回のゴール

**最低限:**
- 採用UIのCSSリファクタリング

**理想:**
- 採用UIのCSSリファクタリング
- 部署異動機能実装
- ゲームバランス調整（研修効果逓減）

**ストレッチゴール:**
- 昇進機能実装
- 部署バランスボーナス実装

---

## 📈 実装済み機能の詳細

### 従業員詳細モーダル (index.html:3415-3569)
- 性格効果の数値表示（+20%形式）
- 特性効果の説明文表示
- 相性表示（良い/悪い性格）

### 採用UI (index.html:2460-2621, 1049-1171)
- 3候補グリッド表示
- generateCandidate()ヘルパー関数
- グラスモーフィズムデザイン

### 部署タブ (index.html:1369-1377, 2590-2708, 1173-1258)
- 4部署の状況可視化
- 責任者自動抽出
- 効率性計算（平均能力値 × 1.2）

---

**作成者**: Claude (Sonnet 4.5)
**AI協力**: Perplexity (トレンド調査), Gemini (アルゴリズム提案)
**作成日**: 2025-10-15
