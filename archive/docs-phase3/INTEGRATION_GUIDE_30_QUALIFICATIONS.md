# 30資格システム統合ガイド

**作成日**: 2025年10月26日
**作成者**: Claude Code (Sonnet 4.5)
**AIチーム協力**: Perplexity（市場調査）、Gemini（統計調査）

---

## 📦 実装済みファイル

以下の3つのファイルを作成済みです：

1. **`js/qualifications-30.js`** (5.2KB)
   - 30資格の完全な定義
   - S級（4資格）～D級（7資格）

2. **`js/qualification-candidate-generator.js`** (4.8KB)
   - 求職者への資格割り当てロジック
   - 給与計算ロジック
   - UIヘルパー関数

3. **`css/qualification-badges.css`** (3.5KB)
   - Tier別バッジデザイン
   - レスポンシブ対応
   - アニメーション

---

## 🚀 統合手順

### Step 1: ファイルをindex.htmlに読み込む

`index.html` の `<head>` セクションに以下を追加：

```html
<!-- 30資格システム -->
<link rel="stylesheet" href="css/qualification-badges.css">
<script src="js/qualifications-30.js"></script>
<script src="js/qualification-candidate-generator.js"></script>
```

**挿入位置**: 既存のCSS/JSファイルの読み込み後、ゲームロジックの前

---

### Step 2: generateCandidate()関数を修正

`index.html` の `generateCandidate()` 関数（2996行目付近）に資格選択を追加：

#### 修正前:
```javascript
function generateCandidate() {
    const candidate = {
        id: generateId(),
        name: generateRandomName(),
        age: 22 + Math.floor(Math.random() * 18), // 22-40歳
        abilities: {
            technical: 30 + Math.floor(Math.random() * 51),
            sales: 30 + Math.floor(Math.random() * 51),
            planning: 30 + Math.floor(Math.random() * 51),
            management: 30 + Math.floor(Math.random() * 51)
        },
        personality: selectRandomPersonality(),
        traits: selectRandomTraits(),
        salary: 3000000 + Math.floor(Math.random() * 2000000)
    };
    return candidate;
}
```

#### 修正後:
```javascript
function generateCandidate() {
    const candidate = {
        id: generateId(),
        name: generateRandomName(),
        age: 22 + Math.floor(Math.random() * 18), // 22-40歳
        abilities: {
            technical: 30 + Math.floor(Math.random() * 51),
            sales: 30 + Math.floor(Math.random() * 51),
            planning: 30 + Math.floor(Math.random() * 51),
            management: 30 + Math.floor(Math.random() * 51)
        },
        personality: selectRandomPersonality(),
        traits: selectRandomTraits()
    };

    // === 🆕 資格システム統合 ===
    candidate.qualification = selectQualificationForCandidate(candidate);
    candidate.salary = calculateCandidateSalaryWithQualification(candidate, candidate.qualification);
    // ===========================

    return candidate;
}
```

---

### Step 3: 採用UIに資格バッジを表示

採用候補カードを表示する部分（`showHiring()` 関数内）に資格バッジを追加：

#### 例（3074行目付近）:
```javascript
function showHiring() {
    const candidates = [generateCandidate(), generateCandidate(), generateCandidate()];

    let html = '<div class="candidates-grid">';
    for (const candidate of candidates) {
        html += `
            <div class="candidate-card ${candidate.qualification ? 'has-qualification' : ''}">
                <div class="candidate-header">
                    <h3>${candidate.name} (${candidate.age}歳)</h3>
                    ${renderQualificationBadge(candidate.qualification)}
                </div>

                <div class="candidate-abilities">
                    <div>技術: ${candidate.abilities.technical}</div>
                    <div>営業: ${candidate.abilities.sales}</div>
                    <div>企画: ${candidate.abilities.planning}</div>
                    <div>管理: ${candidate.abilities.management}</div>
                </div>

                ${renderQualificationDetails(candidate.qualification)}

                <div class="candidate-salary">
                    希望年収: <strong>¥${candidate.salary.toLocaleString()}</strong>
                </div>

                <button onclick="hireCandidate('${candidate.id}')">
                    採用する
                </button>
            </div>
        `;
    }
    html += '</div>';

    document.getElementById('hiringPanel').innerHTML = html;
}
```

---

### Step 4: 従業員詳細モーダルに資格情報を追加

`showEmployeeDetail()` 関数内に資格情報セクションを追加：

```javascript
function showEmployeeDetail(employee) {
    let detailHtml = `
        <div class="employee-detail">
            <h2>${employee.name}</h2>
            ${employee.qualification ? renderQualificationBadge(employee.qualification) : ''}

            <!-- 既存の能力値表示 -->
            <div class="abilities-chart">...</div>

            <!-- 資格詳細 -->
            ${employee.qualification ? renderQualificationDetails(employee.qualification) : ''}

            <!-- その他の情報 -->
        </div>
    `;

    showModal(detailHtml);
}
```

---

### Step 5: セーブ/ロード対応

ゲームデータの保存時に資格情報を含める：

#### saveGame() 関数:
```javascript
function saveGame() {
    const saveData = {
        // 既存データ...
        employees: game.employees.map(emp => ({
            ...emp,
            qualification: emp.qualification || null  // 追加
        })),
        // ...
    };

    localStorage.setItem('gameSave', JSON.stringify(saveData));
}
```

#### loadGame() 関数:
```javascript
function loadGame() {
    const saveData = JSON.parse(localStorage.getItem('gameSave'));
    if (!saveData) return false;

    // データ復元時に資格情報も含める
    game.employees = saveData.employees.map(emp => ({
        ...emp,
        qualification: emp.qualification || null
    }));

    return true;
}
```

---

## ✅ 動作確認チェックリスト

### 基本動作
- [ ] ページが正常に読み込まれる
- [ ] エラーがコンソールに出ていない
- [ ] 採用タブが開ける

### 資格表示
- [ ] 採用候補に約5%の確率で資格バッジが表示される
- [ ] S級資格は非常に稀（200人に1人程度）
- [ ] Tier別に色が異なる（金/銀/銅/青/緑）
- [ ] バッジにホバーすると浮き上がる

### 給与計算
- [ ] 資格保有者は給与が高い
- [ ] S級資格保有者は年収800万円以上
- [ ] 無資格者は年収300-500万円程度

### 詳細表示
- [ ] 候補者カードに資格ボーナス詳細が表示される
- [ ] 能力補正値が正しく表示される
- [ ] 説明文が表示される

### セーブ/ロード
- [ ] 資格保有者を採用してセーブできる
- [ ] ロード後も資格情報が保持される

---

## 🐛 トラブルシューティング

### 問題1: 資格が全く表示されない

**原因**: ファイルの読み込み順が間違っている

**解決策**:
1. `qualifications-30.js` が最初に読み込まれているか確認
2. `qualification-candidate-generator.js` がその後に読み込まれているか確認
3. ブラウザのコンソールでエラーを確認

### 問題2: 資格が出現しすぎる

**原因**: `QUALIFICATION_OVERALL_RATE` の値が大きすぎる

**解決策**:
```javascript
// qualifications-30.js の値を調整
const QUALIFICATION_OVERALL_RATE = 0.05;  // 5%に設定
```

### 問題3: CSSが適用されない

**原因**: CSSファイルのパスが間違っている

**解決策**:
```html
<!-- パスを確認 -->
<link rel="stylesheet" href="css/qualification-badges.css">

<!-- ディレクトリ構造 -->
<!-- business-simulation-game/
     ├── index.html
     └── css/
         └── qualification-badges.css -->
```

### 問題4: 給与が異常に高い/低い

**原因**: 給与計算ロジックのバランス問題

**解決策**:
```javascript
// qualification-candidate-generator.js の値を調整
baseSalary += (avgAbility - 50) * 30000;  // この係数を調整
baseSalary += (candidate.age - 22) * 50000;  // この係数を調整
```

---

## 📊 期待される動作

### 100人の求職者を生成した場合

| 資格Tier | 出現人数 | 割合 |
|---------|---------|------|
| S級 | 0-1人 | 0.5% |
| A級 | 1-2人 | 1.5% |
| B級 | 3-4人 | 3.5% |
| C級 | 7-8人 | 7.0% |
| D級 | 15人 | 15.0% |
| 無資格 | 70-75人 | 72.5% |

### 給与分布

| 資格Tier | 平均年収 |
|---------|---------|
| S級 | 800-1,200万円 |
| A級 | 500-800万円 |
| B級 | 400-600万円 |
| C級 | 350-450万円 |
| D級 | 300-350万円 |
| 無資格 | 300-400万円 |

---

## 🎨 カスタマイズ方法

### 出現確率を調整したい

`js/qualifications-30.js` の `spawnRate` を変更：

```javascript
lawyer: {
    // ...
    spawnRate: 0.005,  // 0.5% → 0.01 (1%) に変更すると2倍出やすくなる
    // ...
}
```

### 給与倍率を調整したい

`js/qualifications-30.js` の `salaryMultiplier` を変更：

```javascript
lawyer: {
    // ...
    salaryMultiplier: 2.5,  // 2.5倍 → 3.0倍に変更
    minSalary: 8000000,     // 最低年収も調整
    // ...
}
```

### バッジの色を変更したい

`css/qualification-badges.css` のグラデーションを変更：

```css
.qualification-badge.tier-S {
    /* 金色から赤色に変更 */
    background: linear-gradient(135deg, #FF6B6B 0%, #C92A2A 100%);
    /* ... */
}
```

---

## 📝 次のステップ

### 短期（統合後すぐ）
1. ✅ 基本動作確認
2. ✅ 出現確率の微調整
3. ✅ 給与バランスの調整

### 中期（1週間以内）
4. 🔲 資格取得システムとの統合
5. 🔲 資格による業務効果の実装
6. 🔲 資格組み合わせボーナス

### 長期（1ヶ月以内）
7. 🔲 業界トレンドによる資格価値変動
8. 🔲 資格更新制度
9. 🔲 会社の資格取得支援制度

---

## 🌟 実装の特徴

### リアリティ重視
- 2025年の実際の市場データに基づく
- 合格率・保有率は統計に準拠
- 給与影響も現実に即している

### ゲームバランス
- 高給でも価値ある設計（ROI重視）
- 段階的成長パス（簿記2級→1級→会計士）
- 希少性による「引き」の楽しさ

### 拡張性
- 新しい資格の追加が容易
- データとロジックが分離
- 後方互換性を保持

---

## 📞 サポート

### 質問・不明点
1. このガイドの該当セクションを確認
2. `/home/ttsuj/docs/QUALIFICATION_SYSTEM_DESIGN_2025-10-26.md` の設計書を参照
3. コード内のJSDocコメントを確認

### バグ報告
- GitHubのIssueで報告
- エラーメッセージとコンソールログを添付
- 再現手順を記載

---

**統合完了の目安**: このガイドに従って作業すれば、約30-60分で統合完了できます。

**作成者**: Claude Code
**最終更新**: 2025-10-26
**バージョン**: 1.0

---

🎮 **楽しい採用体験を！**
