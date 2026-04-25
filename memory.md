# Business Simulation Game v2 — 教訓・フィードバック

## 失敗と教訓
- F4 演算子優先順位バグ: `abilities.technical || 0 + abilities.sales || 0` で `+` が `||` より優先。能力値平均が57.5→20に誤算。教訓: 複数の `||` と算術演算子を混在させる場合は必ず `()` で明示
- pruneHistory 二重カウント: processVerdict と pruneHistory で同じ統計を二重にカウント。長期プレイで統計2倍化。教訓: 統計処理は一元化
- prototype pollution: `Object.assign(this, data)` でLocalStorage由来の任意データを復元していた。教訓: 外部入力の復元は許可リスト方式に限定
- 格納型XSS: innerHTML内でLocalStorage由来のユーザーデータを未サニタイズで埋め込み。教訓: ユーザーデータは常にescapeHtml()を通す
- showModal XSS: body引数のデフォルトが未エスケープだった。isHtml=false時のみエスケープに修正。教訓: デフォルトは安全側（エスケープあり）にする
- window未バインド関数のsilent fail: `(window as any).fn?.()` で48箇所がエラーを見せずに失敗。教訓: Optional chainingは便利だが、クリティカルな呼び出しには不適切
- 大量import削除（game.ts ~50件）は安全だがミスのリスクあり。教訓: コードドクターで MEDIUM 判定されたように、変更後のビルド+テスト必須
- v2.1.0 F-1 CEOモードタブ切替バグ: showPanel/renderActivePanel が game.gameMode を参照しないため、CEOモード中に通常タブをクリックすると管理モードに退化。教訓: モードに応じた状態保護は描画層・遷移層の両方で実装
- v2.1.0 F-2 チュートリアル重畳: tutorialOverlay を document.body 直下に挿入していたため、app.innerHTML リセット後も DOM に残留。教訓: ライフサイクル管理する DOM は #app 内に置くか、明示的に remove
- v2.1.0 F-3 windowBridge dead code: 当初の並列構想が未 import のまま放置され、game.ts と関数定義の差異が二重化リスクとして残っていた。教訓: import チェーンは定期的に grep で確認、dead code は速やかに削除
- v2.1.0 CISO MEDIUM (executeTraining bonusMessages): grep "showModal.*true" 単位の sweep では「中間変数に HTML 文字列を push してから join」パターンが捕捉漏れ。教訓: escape sweep は semantic 単位で実施、中間変数も探す
- v2.1.0 I-5 二重実装: GameManager.nextTurn と FinanceManager.calculateMonthlyRevenue が同一ロジックを二重実装。教訓: Manager の純粋関数を呼び出し側で消費する設計に統一
- v2.1.0 取締役会指摘 (game.ts:540): B2-b sweep が GameManager.ts 限定で game.ts 内の verdictDocument を見逃した。教訓: file 横断の semantic sweep を計画に組み込む

## 不採用記録
- Gemini盲点対応（CI/CD構築、エラーロギング強化、A11y評価）はバックログに積んだが未着手

## フィードバック
- CTO監査のFIRE分類 + Sprint計画方式が効果的。体系的に品質改善を進められた
- コードドクター + 取締役会の二段階品質ゲートが有効（CRITICAL 0, HIGH 0 を確認）
