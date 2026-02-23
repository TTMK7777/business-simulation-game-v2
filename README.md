# ビジネスエンパイア 2.0 - IT業界経営シミュレーション

![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat&logo=typescript&logoColor=white)
![Lit](https://img.shields.io/badge/Lit-3.3-324FFF?style=flat&logo=lit&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-57%20tests-6E9F18?style=flat&logo=vitest&logoColor=white)

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
| 言語 | TypeScript 5.9 (`strict: true`) |
| UI | Lit 3 (段階移行中) + テンプレートリテラル |
| ビルド | Vite 7, PWA対応 |
| チャート | Chart.js 4 (遅延初期化) |
| ストレージ | LocalForage + Zod バリデーション |
| テスト | Vitest (57テスト) |

## アーキテクチャ

```
src/lib/
├── types/          型定義 (GameState, Employee, Product 等)
├── config/         設定・定数 (personalities, departments, skills, ceo)
├── store/          状態管理シングルトン (gameStore)
├── managers/       ビジネスロジック (Game, HR, Finance, Product, Market, CEO, Document, Achievement, Tutorial, Visitor)
├── ui/             描画 (renderers, modals, charts, deskView)
├── animation/      キャラクターアニメーション (Phaser)
└── windowBridge.ts HTML onclick互換ブリッジ (46関数)
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

4テストファイル / 57テストケース:
- DocumentManager — F4演算子優先度バグ回帰テスト
- HRManager — 昇進判定・成長倍率・チーム相性
- qualificationGenerator — 資格割当・前提条件チェック
- storage — チェックサム・メタデータバリデーション

## 変更履歴

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
