# HANDOVER

## セッション: 2026-04-25 (v2.1.0 全面デバッグ Sprint A-D)

### 作業サマリー
| 項目 | 内容 |
|------|------|
| **作業内容** | ユーザー報告バグの根本原因解消 + FIRE 全件対応 (F=6, I=6, R=2/3) |
| **変更ファイル** | 17コミット (Sprint A:5, B:5, C:3, D:3) / ~20ファイル / +400/-340行 |
| **テスト** | vitest 57→**67全パス** (gameStore.test.ts 新設10件)、vite build 成功、npm audit **0 vulnerabilities** |
| **ステータス** | コミット済み（最新 `3f2ea90`）、push未実施、v2.1.0タグ未付与 |

### ユーザー報告バグの解消（5件）
1. ✅ CEOモードでタブ切替→管理モードに退化（F-1, 二重防御: showPanel ガード + applyTabVisibilityForMode）
2. ✅ チュートリアルが他UIに重畳（F-2, 排他制御 + tutorialOverlay.remove()）
3. ✅ CEOモードでチュートリアル進行不能（CEO選択時 tutorialCompleted=true で抑制）
4. ✅ 「🔍 調査結果報告」HTML文字列表示（GameManager.ts showModal isHtml=true 9箇所一括修正）
5. ✅ CEOモードで通常モードのタブが機能しない（applyTabVisibilityForMode で desk以外を非表示）

### Sprint 別コミット

#### Sprint A (体感バグ即時解消) - tag: `v2.1.0-sprintA-bugfix`
- `8022697` fix(ceo): モード状態保護とdesk描画整合性 (F-1, F-6)
- `0694bad` fix(tutorial): 排他制御とDOM残留防止 (F-2)
- `1f13fff` fix(training): executeTraining 資金チェック復活 (F-4)
- `b1ae7e0` fix(tutorial): CEOモード選択時にチュートリアル抑制（追加）
- `649e953` fix(ceo): タブ可視性のモード連動 + showModal isHtml漏れ9箇所（追加）

#### Sprint B (構造整理 + XSS) - tag: `v2.1.0-sprintB-structure`
- `953b00b` chore: windowBridge.ts 削除 (F-3 dead code整理)
- `119c359` fix(xss): CEOモード文字列の入力側 escapeHtml (F-5縮小版)
- `2d1635a` fix(xss/dedup): I-2 escape + I-4 calculateTeamCompatibility 一本化
- `40a7bde` fix(xss): game.ts:540 outcome.description escape (取締役会指摘 I-CTO1)
- `f4075a1` fix(xss): executeTraining bonusMessages escape (CISO MEDIUM)

#### Sprint C (状態汚染防止) - tag: `v2.1.0-sprintC-state-safety`
- `7506524` fix(storage): I-1 + I-3 セーブデータ汚染防止
- `2b29002` refactor(finance): I-5 nextTurn 統一 + I-6 tutorialCompleted バリデーション
- `646726c` test(gameStore): I-1/I-3/I-6 回帰テスト10件追加 (57→67)

#### Sprint D (品質仕上げ) - tag 未
- `bf5c227` fix(observability): R-1 critical な silent fail 警告化（invokeWindowCritical ヘルパー）
- `a65d6ba` chore: ドキュメント更新 + R-3 tutorial step escape
- `3f2ea90` chore(deps): npm audit fix で vite HIGH脆弱性3件解消（CVE-2025 系）

### 品質ゲート結果
- A0 Finding突合: 全 F-1〜F-6, I-1〜I-6, R-1〜R-3 の file:LINE 実在確認済（行ズレ2件は内容一致で許容）
- Sprint B末 /取締役会: CONDITIONAL (game.ts:540 outcome.description 漏れ) → 修正後 Go
- Sprint B末 /ciso Code Review: ⚠️ MEDIUM 1件 (executeTraining bonusMessages) → 修正後 ✅ Approved
- Sprint C末 回帰テスト追加で 67/67
- Sprint D末 /取締役会: ✅ **Go 判定**（無条件）

### 主要アーキ変更
- `src/lib/ui/escape.ts` 新設（escapeHtml 独立化、循環依存回避）
- `src/lib/windowBridge.ts` 削除（dead code、main.ts は game.ts のみ import）
- `applyTabVisibilityForMode(mode)` 新設（renderers.ts、CEO/管理モードのタブDOM切替）
- `renderEmployeesForDesk(state)` 新設（deskView.ts、CEO社員タブ用）
- `removeTutorialOverlay()` 新設（TutorialManager.ts、DOM残留防止）
- `invokeWindowCritical(fnName, ...args)` 新設（GameManager.ts、silent fail警告化）
- `FinanceManager.calculateMonthlyRevenue()` を nextTurn から呼び出し（二重実装解消）
- showModal/closeModal にチュートリアル排他制御 (`_tutorialHiddenByModal`)

### 次回やること / 残課題
- [ ] **v2.1.0 タグ打ち + push origin main + push origin v2.1.0**（ユーザー判断、明示確認必須）
- [ ] Sprint C/D 後のブラウザ最終目視（月次決算挙動・調査結果報告HTML表示確認）
- [ ] **Phase 6 候補**:
  - unsafeHTML 完全排除（Lit テンプレート全面化、B2-aで部分対応）
  - tsc --noEmit 既存エラー ~120件対応
  - Tauri 2.x マルチプラットフォーム化
  - **Zod GameState スキーマ拡張**（CISO推奨、Defense in Depth完成）
  - レガシー `js/business-game.js` / `js/game-ui.js` の最終削除判断
  - 収益化戦略（広告/IAP/プレミアム）
  - ポートフォリオ展開・ランディングページ

### 学んだ知見（重要）
- **escape sweep は semantic 単位で実施**（中間変数 push パターンも捕捉）— Sprint B末 CISO 指摘経由
- **二重実装はManager 側で集約**（FinanceManager.calculateMonthlyRevenue 教訓）
- **CEOモード等のモード分岐は描画層・遷移層・DOM層の三重防御**で堅牢化
- **dead code は早期削除**（windowBridge 1年放置で関数定義差異の二重化リスク蓄積）
- **CISO/取締役会フィードバックループ**が品質ゲートとして機能（漏れ2件捕捉）

---

## セッション: 2026-03-27

### 作業サマリー
| 項目 | 内容 |
|------|------|
| **作業内容** | XSS対策強化 + npm audit修正 + noUnusedLocals有効化（Sentinel バッチ処理） |
| **変更ファイル** | 22ファイル（+67/-163行） |
| **テスト** | vitest 57テスト全パス、npm run build 成功 |
| **ステータス** | コミット済み（`3afb2b6`）、ブラウザ動作確認はユーザー側で実施中 |

### 変更詳細

#### 1. escapeHtml統一 + innerHTML→Lit移行
- `js/game-ui.js`: updateStrategyDisplay の strategy.name/description に escapeHtml() 追加
- `src/lib/ui/renderers.ts`: deskView連携の innerHTML → Lit render + unsafeHTML に変換
- `src/lib/ui/modals.ts`: showEmployeeDetail の modalBody → Lit render + unsafeHTML に変換
- Lit `unsafeHTML` ディレクティブ導入（段階的移行の中間ステップ）

#### 2. npm audit 脆弱性修正
- HIGH 5件 → 0件（picomatch ReDoS + serialize-javascript RCE）
- `package.json` に overrides セクション追加（serialize-javascript >=7.0.3, ejs >=3.1.10）
- 残存 moderate 8件は workbox-build/brace-expansion 起因（対応不要）

#### 3. noUnusedLocals / noUnusedParameters 有効化
- `tsconfig.json`: 両フラグを true に設定
- 18ファイルで90件の TS6133/TS6192/TS6196 エラーを修正
- 主な修正: game.ts（~50件の未使用import削除）、modals.ts/renderers.ts/managers各種の未使用import・変数削除
- コールバックの未使用パラメータは `_` プレフィックス付与

### 品質ゲート結果
- **コードドクター**: CRITICAL 0 / HIGH 0 / MEDIUM 2（unsafeHTML暫定利用、大量import削除の安全性 — 両方許容）
- **取締役会**: **Go** — F:0 I:0 R:2 E:1

### 次回やること / 残課題
- [ ] ブラウザ動作確認（今回の変更の目視チェック — ユーザーが実施中）
- [ ] unsafeHTML → Lit html テンプレート完全移行（showEmployeeDetail等の大規模HTML構築を Lit コンポーネント化）
- [ ] tsc --noEmit の既存エラー ~120件対応（TS2305 型export不足、TS2307 Phaser型定義未導入、TS2339 Phaser property等）
- [ ] マルチプラットフォーム戦略（Tauri 2.x デスクトップ + モバイル）
- [ ] 収益化戦略の策定（広告/IAP/プレミアム等）
- [ ] ポートフォリオ展開・ランディングページ
- [ ] git push（origin/main より1コミット先行中）

---

## セッション: 2026-03-09

### 作業サマリー
| 項目 | 内容 |
|------|------|
| **作業内容** | showModal HTMLエスケープバグ修正 + モーダルUI改善 |
| **変更ファイル** | `src/lib/game.ts`(9箇所), `src/lib/ui/modals.ts`(3箇所+Esc+nullガード), `src/main.ts`, `src/styles/main.css` |
| **テスト** | TypeScript型チェック通過、コードレビュー済み |
| **ステータス** | 完了 |

### 変更詳細
- **Fix 1: isHtml=true 追加（12箇所）** — game.ts 9箇所（研修完了、開発成功、マーケティング完了、融資実行、書類詳細、決裁結果x2、訪問者対応、社長就任）+ modals.ts 3箇所（実績解除、採用上限、部署異動）
- **Fix 2: モーダルUI改善** — HTML構造を header/body/footer に3分割、右上×ボタン追加、背景クリック・Escキーで閉じる、CSS flex レイアウトで閉じるボタンを常に可視化
- **Fix 3: closeModal null ガード追加** — メニュー画面でEsc押下時のTypeError防止

### 次回やること / 残課題
- [ ] ブラウザ動作確認（モーダルUI改善の目視チェック）
- [ ] HTMLテンプレート内で `employee.name` を `escapeHtml()` なしで埋め込んでいる箇所の統一
- [ ] Vite ビルドが日本語パス（WSL環境）の PWA プラグインでエラーになる既知問題の対応

---

## セッション: 2026-02-23 (Sprint 2-5 全完了)

### 作業サマリー
| 項目 | 内容 |
|------|------|
| **作業内容** | CTO監査全18件(F4/I7/R4/E3)の修正完了 — Sprint 2-5実装 |
| **変更ファイル** | 28ファイル変更、4テストファイル新規作成 |
| **テスト** | vitest 57テスト全パス、`npm run build` 成功 |
| **ステータス** | 全Sprint完了・ブラウザ動作確認未実施 |

### 変更詳細

#### Sprint 2 (I1,I2,I5,I6,I7) — `d87f094`
- I1: pruneHistory二重計上を除去（DocumentManager.ts）
- I2: windowBridge.tsに12関数追加（34→46バインド、showModal含む）
- I5: crypto.subtle HTTP環境フォールバック追加（storage.ts）
- I6: executeGameAction許可リスト追加（game-ui.js）
- I7: 実績重複付与防止includes()チェック（business-game.js）

#### Sprint 3 (I3,I4,R1,R2) — `d87f094`
- I3: 前提資格付きqualificationのスキップ（qualificationGenerator.ts）
- I4: modals.ts 6 TODOをHRManager直接import接続に解消
- R1: calculateTeamCompatibilityキャッシュ追加（HRManager.ts）
- R2: 未使用依存4件削除（markdown-it, @lit-labs/signals, signal-utils, @lit/context）

#### Sprint 4 (R3,R4) — `d91e21d`
- R3: `noImplicitAny: true` 有効化 + 46箇所型注釈追加（13 TSファイル）
- R4: Chart.js `Chart.register()` を遅延初期化 `ensureRegistered()` に変更

#### Sprint 5 (E1,E2,E3) — `0aca8d6`
- E1: renderAchievements/renderEmployees/renderProductsをLit `html`に変換（自動エスケープ）
- E2: vitest導入 + 4テストファイル57テスト作成（F4/I3/I5回帰テスト含む）
- E3: `strict: true` + `noFallthroughCasesInSwitch: true` 完全有効化（追加エラー0件）

### 次回やること / 残課題
- [ ] `npm run dev` ブラウザ動作確認（2/17以降未実施）
- [ ] npm audit（依存パッケージ脆弱性チェック）
- [ ] E1残り: innerHTML→Lit html移行（残9関数: renderMarket, renderFinance, showAllAchievements等）
- [ ] CTO-AUDIT-REPORT.md の完了ステータス更新
- [ ] `noUnusedLocals: true` 有効化（+103件、段階対応）

---

## セッション: 2026-02-23 (Sprint 1実装)

### 作業サマリー
| 項目 | 内容 |
|------|------|
| **作業内容** | Sprint 1 — Fatal 4件（F1-F4）のセキュリティ+バグ修正 |
| **変更ファイル** | `js/business-game.js`, `js/game-ui.js`, `src/lib/ui/modals.ts`, `src/lib/managers/DocumentManager.ts` |
| **テスト** | `npm run build` (vite build) 成功確認済み / ブラウザ動作確認未実施 |
| **ステータス** | Sprint 1完了・ブラウザテスト要 |

### 変更詳細

#### F1: prototype pollution修正 (`js/business-game.js:570-588`)
- `Object.assign(this, data)` を許可リスト方式に置換
- プリミティブ値14キーのみ復元、配列は`Array.isArray`ガード付き
- LocalStorage JSON経由の任意プロパティ/メソッド上書きを防止

#### F2: 格納型XSS修正 (`js/game-ui.js`)
- `escapeHtml()` ユーティリティ関数を追加（ファイル先頭）
- innerHTML内のユーザーデータ6箇所をエスケープ: `emp.name`, `emp.personality`, `product.name`, `comp.name`, `comp.ceo`, `event.name`, `event.description`, ランキング`company.name`
- 数値フィールドは`Number() || 0`で型強制

#### F3: showModal XSS修正 (`js/game-ui.js:389`, `src/lib/ui/modals.ts:47`)
- `isHtml=false`（デフォルト）時にbodyを`escapeHtml()`でエスケープしてから改行変換
- `isHtml=true`は呼び出し元がコード内で安全なHTMLを構築済みと想定（変更なし）

#### F4: 演算子優先度バグ修正 (`src/lib/managers/DocumentManager.ts:292`)
- `abilities.technical || 0 + abilities.sales || 0 + ...` → `(abilities.technical || 0) + (abilities.sales || 0) + ...`
- `+`が`||`より優先されるため能力値平均が誤算（57.5→20）していた問題を修正

### 次回やること / 残課題
- [ ] **即時**: `npm run dev` でブラウザ動作確認（F1-F4修正の回帰テスト）
- [ ] **Sprint 2**: I1(pruneHistory二重計上), I2(window未バインド8関数), I5(crypto.subtle HTTP), I6(executeGameAction任意メソッド), I7(実績重複付与)
- [ ] **Sprint 3**: I3(S級資格不正), I4(modals 6 TODO), R1(O(n²)相性計算), R2(未使用依存)
- [ ] **Sprint 4**: R3(tsconfig strict化), R4(Chart.js初期化), テスト導入(vitest)
- [ ] **Sprint 5**: E1(innerHTML→Lit移行), E2(vitest本格導入), E3(strict完全移行)
- [ ] **レポート補完**: renderers.ts innerHTML全行番号追記、npm audit実施

---

## セッション: 2026-02-23 (CTO監査)

### 作業サマリー
| 項目 | 内容 |
|------|------|
| **作業内容** | CTO技術監査 + 複数AI並列監査（code-reviewer + debugger + WebSearch + Gemini） |
| **変更ファイル** | `CTO-AUDIT-REPORT.md`（新規、595行） |
| **テスト** | 該当なし（監査レポート作成のみ） |
| **ステータス** | 監査完了・取締役会CONDITIONAL判定 |

### 変更詳細
- CTO 3レンズ分析（偵察・査閲・策定）を4ゾーン並列で実施
- Phase 1: code-reviewer（Legacy JS 3ファイル）+ debugger（DocumentManager 2バグ）+ WebSearch（XSS/prototype pollution防御知見）を並列実行
- Phase 2: 4ゾーン（セキュリティ/コアロジック/UI・XSS/インフラ）を分析
- Phase 3: WebSearch（O(n²)最適化、TypeScript strict移行リスク）
- Phase 4: 統合レポート `CTO-AUDIT-REPORT.md` 生成

### 監査結果（FIRE: F=4, I=7, R=4, E=3）

#### [F] Fatal — 即時修正必須 4件
1. **F1: prototype pollution** — `js/business-game.js:571` の `Object.assign(this, data)` → 許可リスト方式に置換
2. **F2: 格納型XSS** — `js/game-ui.js:193-296` innerHTML × LocalStorage由来未サニタイズデータ
3. **F3: showModal XSS** — `js/game-ui.js:379`, `modals.ts:46` body引数の未エスケープinnerHTML
4. **F4: 演算子優先度バグ** — `DocumentManager.ts:292` `||`vs`+`で能力値平均が完全に誤り（57.5→20）

#### [I] Important — 次スプリント 7件
1. I1: pruneHistory二重計上（DocumentManager.ts:635-643）
2. I2: window未バインド8関数のサイレント失敗（GameManager.ts 38箇所）
3. I3: 前提資格スキップでS級不正出現（qualificationGenerator.ts:54）
4. I4: modals.ts 6 TODO HRManager未接続
5. I5: crypto.subtle HTTP環境クラッシュ（storage.ts:154）
6. I6: executeGameAction任意メソッド呼び出し（game-ui.js:439）
7. I7: 実績重複付与（business-game.js:495）

### 取締役会判定: CONDITIONAL
- COO: YELLOW（Gemini失敗時フォールバック計画未定義）
- CTO: GREEN（レポート品質良好）
- トレーサビリティ: 充足率82%（充足14/部分3/未実装0）
- Gemini検証: FIRE分類5/5、Sprint計画5/5、見落としリスク3/5
- APPROVED昇格条件: renderers.ts詳細追記、未使用依存確定、F4 diff統合、npm audit追記

### 次回やること / 残課題
- [ ] **即時**: Sprint 1 — F1-F4セキュリティ+バグ修正（CTO-AUDIT-REPORT.md参照）
- [ ] **1週**: Sprint 2 — I1,I2,I5-I7ロジック修正
- [ ] **2-3週**: Sprint 3 — I3,I4,R1,R2構造改善
- [ ] **レポート補完**: renderers.ts innerHTML全行番号追記、npm audit実施
- [ ] **継続**: `npm run dev` ブラウザ動作確認（2/17から未実施）
- [ ] **Gemini盲点対応**: CI/CD構築、エラーロギング強化、A11y評価（バックログ）

---

## セッション: 2026-02-17

### 作業サマリー
| 項目 | 内容 |
|------|------|
| **作業内容** | リモートからpull + /技術参謀による全体コード品質分析 |
| **変更ファイル** | なし（pullのみ、コード変更なし） |
| **テスト** | 該当なし |
| **ステータス** | 分析完了・要修正箇所あり |

### 変更詳細
- `git pull origin main` — Fast-Forward で 2 コミット取得（`3770f74` リファクタ + `65d2002` CEOモード統合）
- /技術参謀 3レンズ分析（偵察・査閲・策定）を実施 → **🟡 CONDITIONAL**

### /技術参謀 分析結果（FIRE: F=0, I=5, R=6, E=1）

#### [I] Important — 要対応 5件
1. **演算子優先順位バグ** — `DocumentManager.ts:292` の `abilities.technical || 0 + abilities.sales || 0` が意図通りに動作しない。各項に `()` 必要
2. **pruneHistory 二重カウント** — `DocumentManager.ts:635-643` で `processVerdict` でカウント済みの統計を再カウント。長期プレイで統計2倍化
3. **`any` 型 280箇所** — 型定義は充実しているのに managers/UI 層で `any` 多用。特に GameManager(67), game.ts(80), modals(30)
4. **テスト 0件** — Manager 層の純粋ロジックにテストなし。回帰検知不可
5. **game.ts / windowBridge.ts 二重バインディング** — 同一関数が両ファイルで window に登録され、上書き競合リスク

#### [R] Recommended — 推奨 6件
- `promoteEmployee` 戻り値の `oldPosition` が昇進後の値になるバグ
- `(window as any).fn?.()` による silent fail（GameManager 48箇所）
- innerHTML 25箇所（XSS リスク低だが改善余地あり）
- `pickRandom` / `fillTemplate` の重複（DocumentManager, VisitorManager）
- UI ファイル巨大化（modals.ts 1,147行、renderers.ts 838行）
- TODO 22件の棚卸し（Phase 2 中間状態の残り）

#### 良い点
- game.ts 分割（4,406→630行, 86%削減）は優秀
- types/index.ts に 36 型定義、config/ 分離も適切
- CEOモードの書類→判定→因果チェーン→訪問者連動の設計は明確

### 次回やること / 残課題
- [ ] **即時**: #1 演算子優先順位バグ修正（DocumentManager.ts:292）
- [ ] **即時**: #2 pruneHistory 二重カウント修正（DocumentManager.ts:635-643）
- [ ] **高**: #5 game.ts/windowBridge.ts 二重バインディング整理
- [ ] **中**: Manager 層ユニットテスト追加（vitest）
- [ ] **中**: `any` → 具体型への段階的置換（`strict: true` 移行）
- [ ] **継続**: `npm run dev` ブラウザ動作確認（前回から未実施）

---

## セッション: 2026-02-14

### 作業サマリー
| 項目 | 内容 |
|------|------|
| **作業内容** | 社長決裁モード（CEOモード）をリファクタ後コードベースに統合 |
| **変更ファイル** | 新規14ファイル + 既存7ファイル変更 |
| **テスト** | ビルド成功確認済み（`npx vite build`）/ ブラウザ動作確認未実施 |
| **ステータス** | 実装完了・動作テスト未実施 |

### 変更詳細

前回セッション(2026-02-11)でgame.tsのモジュール分割リファクタリングが実施済み。
今回はCEOモードを分割後のコードベースに統合。

#### 新規ファイル（14件）
- `src/lib/types/document.ts`, `visitor.ts`, `ceo.ts` — 型定義
- `src/lib/config/documents.ts`, `visitors.ts`, `ceo.ts` — 設定・テンプレート
- `src/lib/managers/DocumentManager.ts`, `VisitorManager.ts`, `CEOManager.ts` — ロジック
- `src/lib/ui/deskView.ts`, `documentDetail.ts`, `visitorDialog.ts`, `ceoStatus.ts` — UI
- `src/styles/desk.css` — スタイル

#### 既存ファイル変更（7件）
- `types/index.ts` — GameStateにCEOフィールド追加、CEO型re-export
- `store/gameStore.ts` — defaultGameState/normalizeGameStateにCEO対応
- `managers/GameManager.ts` — nextTurnにCEOモード分岐、initWithSlotにデスクタブ設定
- `game.ts` — CEOモードimport、操作関数(8個)、windowバインディング
- `ui/renderers.ts` — renderActivePanelにdeskパネル
- `main.ts` — desk.css import、モード選択UI、CEO特性選択
- `gameConfig.ts` — GameMode型、GAME_MODE_SETTINGS

### 次回やること / 残課題
- `npm run dev` でブラウザ動作確認（必須）
- ゲームバランス調整
- セーブ/ロードのCEOモード互換性テスト
- 管理モードとの回帰テスト

---

## セッション: 2026-02-11

### 作業サマリー
| 項目 | 内容 |
|------|------|
| **作業内容** | game.ts (4,406行) のモジュール分割リファクタリング |
| **変更ファイル** | game.ts, gameConfig.ts + 新規18ファイル (config/, store/, managers/, ui/, windowBridge.ts) |
| **テスト** | ビルド検証済み (`npx vite build` 成功)、ブラウザ動作確認は未実施 |
| **ステータス** | 要動作確認 |

### 変更詳細

**Phase 0: 基盤レイヤー**
- `src/lib/types/index.ts` — 全型定義 (GameState, Employee, Product 等)
- `src/lib/config/personalities.ts` — 性格・気質定義 (PERSONALITIES, SUB_TRAITS, TEMPERAMENT_TRAITS, HIDDEN_TRAITS, generateTemperament)
- `src/lib/config/departments.ts` — 部署・役職定義 (DEPARTMENTS, POSITIONS)
- `src/lib/config/skills.ts` — スキルツリー定義 (SKILL_TREE, SKILL_EFFECTS)
- `src/lib/config/offices.ts` — オフィスレベル定義 (OFFICE_LEVELS)
- `src/lib/config/index.ts` — バレル再エクスポート
- `src/lib/store/gameStore.ts` — 状態管理シングルトン (getGame, setActivePanel, cloneDefaults, normalizeGameState 等)
- `src/lib/gameConfig.ts` — legacyNewsTemplates 追加、GAME_CONSTANTS に LOAN_AMOUNT/LOAN_INTEREST_RATE/SAVE_KEY 追加

**Phase 1: Manager並列抽出 (Agent Teams: 3 teammates)**
- `src/lib/managers/GameManager.ts` — ゲーム制御オーケストレーター (init, nextTurn, saveGame, restartGame, アニメーション)
- `src/lib/managers/HRManager.ts` — 人事ロジック (採用計算, 育成, 昇進, スキル, 相性)
- `src/lib/managers/AchievementManager.ts` — 実績条件判定
- `src/lib/managers/MarketManager.ts` — 競合AI, ニュース生成, ランキング
- `src/lib/managers/FinanceManager.ts` — 融資・返済・月次収益計算
- `src/lib/managers/ProductManager.ts` — 製品開発・マーケティング
- `src/lib/managers/TutorialManager.ts` — チュートリアル状態制御
- `src/lib/ui/renderers.ts` — パネル描画 (概要, 従業員, 製品, 市場, 財務, 部署)
- `src/lib/ui/modals.ts` — 全モーダルUI
- `src/lib/ui/charts.integration.ts` — Chart.js インスタンス管理

**Phase 2: 統合**
- `src/lib/game.ts` — 4,406行 → 630行 (86%削減)。モジュールインポート + UI混合関数10個 + window バインディング
- `src/lib/windowBridge.ts` — 準備済み (現在は game.ts がバインディング担当)

### アーキテクチャ
```
依存方向: types/ → config/ → store/ → managers/ → ui/ → game.ts (エントリ)
```
- Manager = 純粋ビジネスロジック (DOM非依存、結果オブジェクトを返す)
- UI = renderers / modals (DOM操作、Manager呼び出しは window経由)
- game.ts = エントリポイント (window バインディング + UI混合ラッパー10関数)

### 次回やること / 残課題
- **ブラウザ動作確認**: `npm run dev` → 新規ゲーム、セーブ/ロード、全機能テスト
- **game.ts の残り10関数を modals.ts に移行**: hireEmployee, promoteEmployee, changeDepartment, unlockSkill, executeTraining, developProduct, executeMarketing, getLoan, repayLoan
- **windowBridge.ts の有効化**: game.ts のバインディングを windowBridge.ts に移行、game.ts を完全削除
- **テスト追加**: 各Manager の単体テスト (vitest)
