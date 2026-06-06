# 利用ガイド / Usage Guide

ビジネスエンパイア 2.0 — IT業界経営シミュレーション の導入と遊び方です。
Installation and how to play Business Empire 2.0 — IT Industry Management Simulation.

---

## 日本語

### 必要なもの

- Node.js（npm が使えること）
- モダンブラウザ（Chrome / Edge / Firefox など）

> リポジトリに `engines` の指定はありません。Vite 7 / TypeScript 5.9 が動作する新しめの Node.js（LTS 推奨）を用意してください。

### インストール

```bash
git clone https://github.com/TTMK7777/business-simulation-game-v2.git
cd business-simulation-game-v2
npm install
```

### 起動

```bash
npm run dev
```

開発サーバーが起動します（Vite の既定ポートは `5173`、`strictPort: false` のため使用中なら自動で別ポートに切り替わります）。表示された URL をブラウザで開いてください。

スマートフォンなど LAN 内の別端末で試遊したい場合は、LAN 公開モードを使います。

```bash
npm run dev:sp
```

ターミナルに表示される Network の URL（同一 Wi-Fi 内の端末からアクセス可能）を開いてください。

### 本番ビルドと確認

```bash
npm run build      # dist/ に本番ビルドを出力
npm run preview    # ビルド成果物をローカルで確認（--host 付き）
```

本アプリは PWA 対応（`vite-plugin-pwa`、`registerType: 'autoUpdate'`）です。ビルド版はオフラインキャッシュが効きます。

### 遊び方の基本

IT 企業を経営し、従業員の採用・育成、製品開発、市場競争を通じて成功を目指すターン制シミュレーションです。2 つのモードがあります。

| モード | できること |
|--------|-----------|
| **管理モード** | 従業員の採用・育成（性格・気質・スキルツリー・資格システム）、製品開発、マーケティング、融資・返済、月次収益計算、競合 AI・ニュース・ランキング、実績、チュートリアル |
| **社長モード (CEO)** | 書類決裁、方針設定、訪問者対応、四半期レビュー |

進行の流れ:

1. ターンを進める（`nextTurn`）と月次の収益・費用が計算されます。
2. 管理モードで従業員を採用・育成し、製品を開発・マーケティングします。
3. 必要に応じて融資を受け、返済を管理します。
4. 社長モードでは書類を決裁し、方針や訪問者対応で会社の進路を決めます。

### セーブ / ロード

ゲームの状態はブラウザのストレージ（LocalForage）に保存され、Zod バリデーションとチェックサムで破損・改ざんを検出します。同じブラウザで再度開くと続きから遊べます。

> セーブデータはブラウザのプロファイルに紐づきます。別のブラウザ・別の端末・シークレットウィンドウでは引き継がれません。

### テストの実行（任意）

開発者向けですが、回帰テストは次のコマンドで実行できます。

```bash
npm test           # 全テスト実行（watch モード）
npm test -- --run  # CI 用（watch なし、1 回だけ実行）
```

### 困ったときは

- ポート競合: `5173` が使用中でも自動で別ポートに切り替わります。表示された URL を確認してください。
- 画面が真っ白: ブラウザのコンソールを確認し、`npm install` が成功しているか、Node.js のバージョンが新しいかを確認してください。
- 不具合報告は [GitHub Issues](https://github.com/TTMK7777/business-simulation-game-v2/issues) へお願いします。

---

## English

### Prerequisites

- Node.js (with npm)
- A modern browser (Chrome / Edge / Firefox, etc.)

> The repository does not pin an `engines` version. Use a reasonably recent Node.js (LTS recommended) that can run Vite 7 / TypeScript 5.9.

### Installation

```bash
git clone https://github.com/TTMK7777/business-simulation-game-v2.git
cd business-simulation-game-v2
npm install
```

### Running

```bash
npm run dev
```

This starts the dev server (Vite's default port is `5173`; with `strictPort: false` it automatically falls back to another port if that one is busy). Open the printed URL in your browser.

To play on another device on your LAN (e.g. a smartphone), use LAN-exposed mode:

```bash
npm run dev:sp
```

Open the Network URL printed in the terminal (reachable from devices on the same Wi-Fi).

### Production build and preview

```bash
npm run build      # Outputs a production build to dist/
npm run preview    # Serves the built output locally (with --host)
```

The app is a PWA (`vite-plugin-pwa`, `registerType: 'autoUpdate'`), so the built version supports offline caching.

### How to play (basics)

This is a turn-based simulation where you run an IT company and aim for success through hiring and developing employees, product development, and market competition. There are two modes:

| Mode | What you can do |
|------|-----------------|
| **Management Mode** | Hire & develop employees (personalities, temperaments, skill trees, qualification system), develop products, run marketing, take/repay loans, monthly revenue calculation, rival AI / news / rankings, achievements, tutorial |
| **CEO Mode** | Document approval, policy setting, visitor handling, quarterly reviews |

Flow:

1. Advance a turn (`nextTurn`) to calculate monthly revenue and costs.
2. In Management Mode, hire and develop employees and develop/market products.
3. Take loans as needed and manage repayments.
4. In CEO Mode, approve documents and steer the company through policies and visitor handling.

### Save / Load

Game state is stored in the browser (LocalForage) and protected by Zod validation and a checksum to detect corruption or tampering. Reopening in the same browser resumes your progress.

> Save data is tied to the browser profile. It does not carry over to a different browser, a different device, or a private/incognito window.

### Running tests (optional)

For developers, the regression tests can be run with:

```bash
npm test           # Run all tests (watch mode)
npm test -- --run  # For CI (no watch; runs once)
```

### Troubleshooting

- Port conflict: if `5173` is busy, Vite automatically switches to another port. Check the printed URL.
- Blank screen: check the browser console, confirm `npm install` succeeded, and ensure your Node.js is recent enough.
- For bug reports, please use [GitHub Issues](https://github.com/TTMK7777/business-simulation-game-v2/issues).
