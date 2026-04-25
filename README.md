# ビジネスエンパイア 2.0 - IT業界経営シミュレーション

![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat&logo=typescript&logoColor=white)
![Lit](https://img.shields.io/badge/Lit-3.3-324FFF?style=flat&logo=lit&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-67%20tests-6E9F18?style=flat&logo=vitest&logoColor=white)

> IT企業を経営し、従業員の採用・育成、製品開発、市場競争を通じて成功を目指す本格的な経営シミュレーションゲーム。

## クイックスタート

```bash
npm install
npm run dev        # 開発サーバー起動
npm run dev:sp     # LAN公開モード（スマホ確認用）
npm run build      # 本番ビルド
npm test           # テスト実行
```

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| 言語 | TypeScript 5.9 (`strict: true`, `noUnusedLocals`) |
| UI | Lit 3 (段階移行中) + テンプレートリテラル |
| ビルド | Vite 7, PWA対応 |
| チャート | Chart.js 4 (遅延初期化) |
| ストレージ | LocalForage + Zod バリデーション |
| テスト | Vitest (67テスト) |

## アーキテクチャ

```
src/lib/
├── types/          型定義 (GameState, Employee, Product 等)
├── config/         設定・定数 (personalities, departments, skills, ceo)
├── store/          状態管理シングルトン (gameStore)
├── managers/       ビジネスロジック (Game, HR, Finance, Product, Market, CEO, Document, Achievement, Tutorial, Visitor)
├── ui/             描画 (renderers, modals, charts, deskView)
├── animation/      キャラクターアニメーション (Phaser)
└── game.ts         エントリポイント (HTML onclick 互換の window バインディング担当)
```

**依存方向**: `types/` → `config/` → `store/` → `managers/` → `ui/` → `game.ts`

## ゲームモード

| モード | 説明 |
|--------|------|
| **管理モード** | 従業員採用・育成、製品開発、マーケティング、融資・返済 |
| **社長モード (CEO)** | 書類決裁、方針設定、訪問者対応、四半期レビュー |

## セキュリティ

- LocalStorage入力のサニタイズ (escapeHtml, 許可リスト方式)
- prototype pollution対策 (Object.assign → 許可キーのみ復元)
- Lit html自動エスケープ (段階移行中)
- crypto.subtle HTTP環境フォールバック

## テスト

```bash
npm test           # 全テスト実行
npm test -- --run  # CI用 (watchなし)
```

5テストファイル / 67テストケース:
- DocumentManager — F4演算子優先度バグ回帰テスト
- HRManager — 昇進判定・成長倍率・チーム相性
- qualificationGenerator — 資格割当・前提条件チェック
- storage — チェックサム・メタデータバリデーション
- gameStore — I-1/I-3/I-6 セーブデータ汚染防止回帰テスト (v2.1.0で追加)

## 変更履歴

### v2.1.0 (2026-04)

全面デバッグ実施 — FIRE: F=6, I=6, R=2/3 全件解消、17コミット

- **CEOモード安定化**: タブ切替時のモード退化バグ修正、タブ可視性のモード連動 (`applyTabVisibilityForMode`)
- **チュートリアル排他制御**: モーダル/Tutorial の DOM 競合解消、CEOモード時は自動抑制
- **構造整理**: `windowBridge.ts` 削除 (dead code)、`escape.ts` 独立モジュール化
- **XSS強化**: 入力側 escapeHtml 戦略、showModal isHtml=true 漏れ9箇所修正
- **状態管理**: `_pendingCausalEffects` のセーブ汚染防止、tutorialCompleted/wasLowMoney 型バリデーション
- **計算統一**: `nextTurn` 月次計算を FinanceManager.calculateMonthlyRevenue に集約
- **観測性**: 初期化系の silent fail を `invokeWindowCritical` ヘルパーで警告化
- **回帰テスト**: 57 → 67 tests (gameStore.test.ts 新設、I-1/I-3/I-6 カバー)
- **依存更新**: vite HIGH脆弱性3件解消 (CVE-2025 Path Traversal/fs.deny bypass/WebSocket file read)、`npm audit` 0 vulnerabilities

### v2.0.2 (2026-03)

- XSS対策強化: escapeHtml統一 + innerHTML→Lit render移行
- npm audit: HIGH脆弱性5件解消（serialize-javascript RCE, picomatch ReDoS）
- noUnusedLocals/noUnusedParameters有効化（90件修正）
- コード削減: 22ファイル -163行/+67行

### v2.0.1 (2026-03)

- showModal HTMLエスケープバグ修正（12箇所に isHtml=true 追加）
- モーダルUI改善（header/body/footer分離、×ボタン、背景クリック、Escキー対応）

### v2.0 (2026-02)

- game.ts 4,406行 → モジュール分割 (86%削減)
- 社長モード (CEOモード) 追加
- CTO技術監査 全18件修正完了 (F4/I7/R4/E3)
- TypeScript `strict: true` 完全有効化
- vitest 導入 (57テスト)
- Lit html 段階移行開始

### v1.0 (2025-12)

- Initial release

## License

ISC
