# 🚀 Tauri移行プロジェクト - 詳細実装計画

**プロジェクト**: ビジネスエンパイア 経営シミュレーションゲーム
**目標**: ブラウザゲームをデスクトップ・モバイルアプリ化
**技術スタック**: Tauri 2.x + Vite + TypeScript
**作成日**: 2025-10-28
**AIチーム**: Claude Code (統括), Codex (設計), Perplexity (調査), Gemini (技術検証)

---

## 📊 プロジェクト概要

### 現状
- **構成**: 単一HTMLファイル (index.html: 197KB)
- **技術**: Vanilla JavaScript, Chart.js 4.4.0, LocalStorage
- **PWA対応**: manifest.json, sw.js実装済み
- **配布**: Webブラウザのみ

### 目標
- **デスクトップ**: Windows, macOS, Linux対応
- **モバイル**: iOS, Android対応 (Phase 4以降)
- **アプリサイズ**: 3-10MB (Electronの80-120MBと比較)
- **パフォーマンス**: ネイティブ並みの起動速度・メモリ効率

---

## 🎯 技術選定: Tauri 2.x

### 選定理由
| 項目 | Electron | Tauri | Capacitor |
|------|----------|-------|-----------|
| **アプリサイズ** | 80-120MB | 3-10MB ✅ | 中 |
| **起動速度** | 遅い | 高速 ✅ | 中 |
| **デスクトップ対応** | ✅ | ✅ | △ |
| **モバイル対応** | ✗ | ✅ | ✅ |
| **既存コード再利用** | ✅ | ✅ | ✅ |
| **学習コスト** | 低 | 中 (Rust) | 低 |
| **PWA資産活用** | △ | ✅ | ✅ |

**結論**: Tauri 2.xが最適
- OS標準WebViewで軽量化
- デスクトップ＆モバイル両対応
- Rustは最小限（初期は不要）

---

## 🛡️ バックアップ戦略

### 1. Git戦略

#### ブランチ構成
```
main (保護ブランチ)
├── develop (開発ブランチ)
│   ├── feature/tauri-phase1
│   ├── feature/tauri-phase2
│   └── hotfix/*
└── backup/web-legacy (完全バックアップ・読み取り専用)
```

#### ブランチ保護ルール
- `main`: 直接push禁止、PRレビュー必須、CI通過必須
- `develop`: 開発用、テスト通過必須
- `backup/web-legacy`: 読み取り専用、緊急時のみ使用

### 2. タグ戦略

#### セマンティックバージョニング + マイルストーン
```bash
v1.9.5-web               # 現在のWeb版（移行前）
v2.0.0-pre-tauri         # Tauri化開始時点
v2.0.0-phase1-complete   # Phase 1完了
v2.0.0-phase2-complete   # Phase 2完了
v2.0.0-desktop-beta      # デスクトップβ版
v2.0.0-desktop-rc1       # リリース候補1
v2.0.0-release           # 正式リリース
```

#### タグ作成ルール
- 署名付きタグ推奨: `git tag -s v2.0.0-phase1-complete -m "Phase 1: Code split completed"`
- 各Phase完了時に必須
- リリース前に署名検証

### 3. バックアップ実行手順

#### 初回バックアップ (実行必須)
```bash
# 1. バックアップブランチ作成
git checkout -b backup/web-legacy

# 2. 現行版を archive に保存
mkdir -p archive/web-legacy
cp index.html archive/web-legacy/index-v1.9.5.html
git add archive/web-legacy/
git commit -m "🔒 Backup: Web version before Tauri migration"

# 3. タグ作成
git tag -a v1.9.5-web -m "Web version before Tauri migration"

# 4. リモートにプッシュ
git push origin backup/web-legacy
git push origin v1.9.5-web

# 5. mainに戻る
git checkout main
```

#### 日次バックアップ (自動化推奨)
```bash
# Gitバンドル作成 (オフラインバックアップ)
git bundle create backup/$(date +%Y%m%d)-tauri-migration.bundle HEAD

# 別リモートへミラーリング (オプション)
git push --mirror backup-remote
```

### 4. .gitattributes 設定 (ファイル保護)
```gitattributes
# archive/ 内のファイルは diff/merge 禁止
archive/** -diff -merge
```

---

## 📋 Phase 1: コード分割・モジュール化

**所要時間**: 約11時間
**前提条件**: Node.js 18以上、npm 9以上

### タスク一覧

#### タスク 1-1: Node.js環境確認
- **所要時間**: 30分
- **コマンド**:
  ```bash
  node --version   # 期待: v18.x 以上
  npm --version    # 期待: 9.x 以上
  ```
- **成功基準**: Node.js ≥18 かつ npm存在
- **失敗時対処**:
  ```bash
  # nvmを使う場合
  nvm install 20
  nvm use 20

  # 公式インストーラの場合
  # https://nodejs.org/ からLTS版をダウンロード
  ```

#### タスク 1-2: プロジェクト依存関係調査
- **所要時間**: 45分
- **目的**: 既存コードのCDN依存を特定
- **コマンド**:
  ```bash
  cd tauri-migration-workspace
  grep -n "cdn\|https://" index.html | grep -i "script\|link"
  ```
- **成功基準**: Chart.js等のCDN使用箇所をリスト化
- **出力例**:
  ```
  Chart.js 4.4.0: https://cdn.jsdelivr.net/npm/chart.js
  ```

#### タスク 1-3: package.json 初期化
- **所要時間**: 30分
- **コマンド**:
  ```bash
  npm init -y
  ```
- **編集内容**:
  ```json
  {
    "name": "business-simulation-game",
    "version": "2.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview"
    }
  }
  ```
- **成功基準**: package.jsonが生成される
- **失敗時対処**: ファイル削除して再実行

#### タスク 1-4: Vite + 関連パッケージインストール
- **所要時間**: 45分
- **コマンド**:
  ```bash
  npm install -D vite @vitejs/plugin-legacy
  npm install chart.js localforage
  ```
- **成功基準**: `npx vite --version` が表示される
- **失敗時対処**:
  ```bash
  rm -rf node_modules package-lock.json
  npm cache clean --force
  npm install
  ```

#### タスク 1-5: Viteプロジェクト構成作成
- **所要時間**: 60分
- **ディレクトリ構成**:
  ```
  src/
  ├── main.ts              # エントリーポイント
  ├── app/
  │   ├── index.html       # HTMLテンプレート
  │   └── App.ts          # ルートコンポーネント
  ├── styles/
  │   └── main.css        # 既存CSSを移行
  └── lib/
      └── placeholder.ts  # 一時ファイル
  ```
- **vite.config.ts 作成**:
  ```typescript
  import { defineConfig } from 'vite'

  export default defineConfig({
    root: 'src',
    build: {
      outDir: '../dist',
      emptyOutDir: true
    }
  })
  ```
- **成功基準**: `npm run dev` でVite開発サーバー起動
- **失敗時対処**: vite.config.ts の構文確認

#### タスク 1-6: TypeScript設定
- **所要時間**: 60分
- **コマンド**:
  ```bash
  npm install -D typescript @types/node
  npx tsc --init
  ```
- **tsconfig.json 編集**:
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "module": "ESNext",
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "moduleResolution": "bundler",
      "strict": false,  // 初期は緩く、段階的にtrue化
      "esModuleInterop": true,
      "skipLibCheck": true,
      "resolveJsonModule": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
  }
  ```
- **成功基準**: `tsc --noEmit` がエラーなし
- **失敗時対処**: `"strict": false` に設定

#### タスク 1-7: 既存HTMLをViteに移行
- **所要時間**: 90分
- **手順**:
  1. `index.html` のHTML部分を `src/app/index.html` にコピー
  2. `<script>` タグを削除
  3. `src/main.ts` でモジュール読み込み
- **src/app/index.html (簡易版)**:
  ```html
  <!DOCTYPE html>
  <html lang="ja">
  <head>
    <meta charset="UTF-8">
    <title>ビジネスエンパイア 2.0</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="../main.ts"></script>
  </body>
  </html>
  ```
- **成功基準**: `npm run dev` で同じDOM構造が表示される
- **失敗時対処**: 元のindex.htmlと見比べて差分確認

#### タスク 1-8: CSS分割
- **所要時間**: 60分
- **手順**:
  1. `index.html` 内の `<style>` を抽出
  2. `src/styles/main.css` に保存
  3. `src/main.ts` で `import './styles/main.css'`
- **成功基準**: 見た目が完全一致
- **失敗時対処**: Chrome DevTools でCSSが読み込まれているか確認

#### タスク 1-9: JavaScriptをTypeScriptモジュール化
- **所要時間**: 120分
- **戦略**: 段階的移行
  1. まず全体を `src/legacy.js` にコピー
  2. 関数ごとに `src/lib/` 配下のTSファイルに移行
  3. 型定義は後回し（`any` 使用OK）
- **ディレクトリ例**:
  ```
  src/lib/
  ├── game-state.ts        # ゲーム状態管理
  ├── employees.ts         # 従業員管理
  ├── products.ts          # 製品開発
  └── charts.ts            # Chart.js関連
  ```
- **成功基準**: `npm run dev` でランタイムエラーなし
- **失敗時対処**: 1関数ずつ移行、問題箇所を特定

#### タスク 1-10: Chart.jsのnpm化
- **所要時間**: 60分
- **手順**:
  1. CDN削除
  2. `import { Chart } from 'chart.js'` に置換
- **src/lib/charts.ts**:
  ```typescript
  import { Chart, registerables } from 'chart.js'
  Chart.register(...registerables)

  export function initCharts() {
    // 既存のChart.js初期化コード
  }
  ```
- **成功基準**: グラフが正常に描画される
- **失敗時対処**: Chart.js公式ドキュメント参照

#### タスク 1-11: LocalStorageアダプタ実装
- **所要時間**: 90分
- **目的**: 将来的なストレージ変更に対応
- **src/lib/storage.ts**:
  ```typescript
  import localforage from 'localforage'

  export interface StorageAdapter {
    get(key: string): Promise<any>
    set(key: string, value: any): Promise<void>
    remove(key: string): Promise<void>
  }

  class LocalForageAdapter implements StorageAdapter {
    async get(key: string) {
      return await localforage.getItem(key)
    }

    async set(key: string, value: any) {
      await localforage.setItem(key, value)
    }

    async remove(key: string) {
      await localforage.removeItem(key)
    }
  }

  export const storage = new LocalForageAdapter()
  ```
- **テスト作成** (Vitest):
  ```bash
  npm install -D vitest @vitest/ui
  ```
  ```typescript
  // src/lib/storage.test.ts
  import { describe, it, expect } from 'vitest'
  import { storage } from './storage'

  describe('Storage Adapter', () => {
    it('should save and load data', async () => {
      await storage.set('test', { value: 123 })
      const result = await storage.get('test')
      expect(result.value).toBe(123)
    })
  })
  ```
- **実行**:
  ```bash
  npx vitest
  ```
- **成功基準**: `npm run test` がパス
- **失敗時対処**: console.log でデバッグ

#### タスク 1-12: クロスブラウザ動作確認
- **所要時間**: 60分
- **確認項目**:
  - ✅ Chrome: 従業員採用、製品開発、セーブ/ロード
  - ✅ Firefox: 同上
  - ✅ Edge (オプション): 同上
- **成功基準**: すべてのブラウザで主要機能が動作
- **失敗時対処**: ブラウザコンソールでエラーログ確認

### Phase 1 完了チェックリスト
```
[ ] Node.js 18以上インストール済み
[ ] package.json作成済み
[ ] Vite開発サーバー起動成功
[ ] TypeScriptコンパイル成功
[ ] 既存HTMLがViteで表示される
[ ] CSSが正しく適用される
[ ] JavaScriptがTSモジュール化済み
[ ] Chart.jsがnpm経由で動作
[ ] StorageアダプタのVitestテストパス
[ ] Chrome/Firefoxで動作確認済み
[ ] Git コミット済み (タグ: v2.0.0-phase1-complete)
```

---

## 🖥️ Phase 2: デスクトップ版構築

**所要時間**: 約8時間
**前提条件**: Phase 1完了、Rust環境

### タスク一覧

#### タスク 2-1: Rust環境構築
- **所要時間**:
  - Windows: 60分
  - macOS/Linux: 45分
- **Windows手順**:
  ```powershell
  # Visual Studio Build Tools インストール (必須)
  # https://visualstudio.microsoft.com/downloads/
  # "C++ によるデスクトップ開発" を選択

  # Rustup インストール
  # https://rustup.rs/
  # ダウンロードして実行

  # 確認
  rustc --version
  cargo --version
  ```
- **macOS手順**:
  ```bash
  # Xcode Command Line Tools
  xcode-select --install

  # Rustup
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

  # 確認
  rustc --version
  cargo --version
  ```
- **Linux (Ubuntu/Debian)手順**:
  ```bash
  # 依存パッケージ
  sudo apt update
  sudo apt install -y libgtk-3-dev libwebkit2gtk-4.0-dev \
    libappindicator3-dev librsvg2-dev patchelf

  # Rustup
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

  # 確認
  rustc --version
  cargo --version
  ```
- **成功基準**: `cargo --version` が表示される
- **失敗時対処**:
  - Windows: Visual Studio Build Tools 再インストール
  - macOS: `sudo xcode-select --reset`
  - Linux: 依存パッケージを個別インストール

#### タスク 2-2: Tauri CLI導入
- **所要時間**: 30分
- **コマンド**:
  ```bash
  npm install -D @tauri-apps/cli
  ```
  または
  ```bash
  cargo install tauri-cli
  ```
- **成功基準**: `npx tauri --help` または `cargo tauri --help`
- **失敗時対処**: Rust再インストール後にリトライ

#### タスク 2-3: tauri init 実行
- **所要時間**: 90分
- **コマンド**:
  ```bash
  npx tauri init
  ```
- **対話式入力**:
  ```
  App name: ビジネスエンパイア
  Window title: ビジネスエンパイア 2.0
  Web assets location: ../dist
  Dev server URL: http://localhost:5173
  Frontend dev command: npm run dev
  Frontend build command: npm run build
  ```
- **生成されるファイル**:
  ```
  src-tauri/
  ├── Cargo.toml
  ├── tauri.conf.json
  ├── build.rs
  └── src/
      └── main.rs
  ```
- **成功基準**: `src-tauri/` ディレクトリが生成される
- **失敗時対処**: `src-tauri/` 削除して再実行

#### タスク 2-4: Vite統合
- **所要時間**: 60分
- **package.json にスクリプト追加**:
  ```json
  {
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "tauri:dev": "tauri dev",
      "tauri:build": "tauri build"
    }
  }
  ```
- **tauri.conf.json 確認**:
  ```json
  {
    "build": {
      "beforeDevCommand": "npm run dev",
      "beforeBuildCommand": "npm run build",
      "devPath": "http://localhost:5173",
      "distDir": "../dist"
    }
  }
  ```
- **テスト起動**:
  ```bash
  npm run tauri:dev
  ```
- **成功基準**: デスクトップウィンドウが開いてゲームが表示される
- **失敗時対処**:
  - ポート5173が使用中: `vite.config.ts` でポート変更
  - ビルドエラー: `npm run build` で個別確認

#### タスク 2-5: OS別ビルド確認
- **所要時間**: 90-120分 / OS
- **Windows**:
  ```bash
  npm run tauri:build

  # 生成物
  # src-tauri/target/release/bundle/msi/ビジネスエンパイア_2.0.0_x64_en-US.msi
  ```
- **macOS**:
  ```bash
  npm run tauri:build

  # 生成物
  # src-tauri/target/release/bundle/dmg/ビジネスエンパイア_2.0.0_x64.dmg
  ```
- **Linux**:
  ```bash
  npm run tauri:build

  # 生成物
  # src-tauri/target/release/bundle/appimage/business-empire_2.0.0_amd64.AppImage
  # src-tauri/target/release/bundle/deb/business-empire_2.0.0_amd64.deb
  ```
- **成功基準**: 各OS用のインストーラが生成される
- **失敗時対処**: ビルドログを確認、不足パッケージをインストール

#### タスク 2-6: パッケージング設定
- **所要時間**: 60分 / OS
- **tauri.conf.json 設定**:
  ```json
  {
    "tauri": {
      "bundle": {
        "identifier": "com.ttmk7777.business-empire",
        "icon": [
          "icons/32x32.png",
          "icons/128x128.png",
          "icons/icon.icns",
          "icons/icon.ico"
        ],
        "active": true,
        "targets": ["msi", "dmg", "appimage", "deb"],
        "resources": [],
        "copyright": "Copyright © 2025 TTMK7777",
        "category": "Game",
        "shortDescription": "経営シミュレーションゲーム",
        "longDescription": "IT業界で成功を目指す本格的な経営シミュレーションゲーム"
      }
    }
  }
  ```
- **アイコン生成**:
  ```bash
  npm install -D @tauri-apps/cli
  npx tauri icon path/to/source-icon.png
  ```
- **署名設定 (オプション)**:
  - Windows: コード署名証明書
  - macOS: Apple Developer証明書 + 公証
- **成功基準**: インストーラが正常に動作する
- **失敗時対処**: デバッグビルドで先行確認

### Phase 2 完了チェックリスト
```
[ ] Rust環境構築完了 (cargo --version 確認)
[ ] Tauri CLI インストール済み
[ ] tauri init 成功 (src-tauri/ 生成)
[ ] npm run tauri:dev でアプリ起動
[ ] Windows/Mac/Linux でビルド成功
[ ] インストーラが正常動作
[ ] 既存機能すべて動作確認
[ ] Git コミット済み (タグ: v2.0.0-phase2-complete)
```

---

## 🧪 Phase 3: 機能パリティ・ネイティブAPI統合

**所要時間**: 約6人日
**前提条件**: Phase 2完了

### 主要タスク

1. **デスクトップ固有API統合** (2人日)
   - ファイルダイアログ (セーブ/ロード)
   - システム通知
   - メニューバー/トレイアイコン

2. **オフラインストレージ検証** (1人日)
   - LocalForage → Tauri Store移行検討
   - データ暗号化

3. **パフォーマンス最適化** (2人日)
   - Chart.js描画最適化
   - メモリリーク検証
   - 起動時間計測

4. **E2Eテスト** (1人日)
   - Playwright/Tauri Webdriver導入
   - 主要フロー自動化

---

## ✅ Phase 4: QA・自動化・CI/CD

**所要時間**: 約8人日
**前提条件**: 機能凍結

### 主要タスク

1. **自動テストスイート** (3人日)
   - Vitest (ユニット)
   - Playwright (E2E)
   - カバレッジ80%以上

2. **CI/CD構築** (3人日)
   - GitHub Actions
   - マルチOS並列ビルド
   - 自動リリース

3. **バグトリアージ** (2人日)
   - OS別QA
   - クラッシュレポート収集

---

## 🚀 Phase 5: β版リリース

**所要時間**: 約5人日
**前提条件**: 署名済みビルド

### 主要タスク

1. **β配布準備** (2人日)
   - GitHub Releases
   - 更新メカニズム (Tauri Updater)

2. **フィードバック収集** (2人日)
   - テレメトリ (オプトイン)
   - Discordコミュニティ

3. **バグ修正サイクル** (1人日)
   - 週次更新

---

## 📦 Phase 6: 正式リリース・運用

**所要時間**: 約4人日

### 主要タスク

1. **マーケティング資産** (1人日)
   - スクリーンショット
   - プロモーション動画

2. **ドキュメント** (2人日)
   - ユーザーガイド
   - FAQ

3. **サポート体制** (1人日)
   - GitHub Issues運用
   - 保守計画

---

## ⚠️ リスク管理

### リスクマトリクス

| Phase | リスク | 発生確率 | 影響度 | 対策 |
|-------|--------|----------|--------|------|
| 1 | Viteビルドエラー | 🟡 中 | 🟡 中 | `vite --debug`、コミュニティ参照 |
| 1 | TypeScript型エラー爆発 | 🟢 低 | 🔴 高 | tsconfig緩和→段階的strict化 |
| 2 | Rustツールチェーン問題 | 🟡 中 | 🟡 中 | OS別セットアップガイド事前配布 |
| 2 | Tauriビルド署名失敗 | 🟡 中 | 🔴 高 | デバッグビルドで先行確認 |
| 3 | デスクトップ固有バグ | 🟡 中 | 🔴 高 | OS別QA、テレメトリ導入 |
| 4 | テスト不足 | 🟡 中 | 🟡 中 | カバレッジ監視、レビュー必須 |
| 5 | βフィードバック遅延 | 🟢 低 | 🟡 中 | 週次レビュー、連絡チャネル整備 |
| 6 | サポート過負荷 | 🟡 中 | 🟡 中 | FAQ先行作成、担当者割当 |

### 緩和策
- **予防**: 事前チェックリスト、環境構築ガイド
- **検知**: 各タスクに明確な成功判定基準
- **復旧**: ロールバック手順を事前文書化

---

## 🔄 ロールバック手順

### Phase 1 問題発生時
```bash
# タグに戻る
git checkout v1.9.5-web

# index.html復元
git checkout backup/web-legacy -- index.html

# Vite関連削除
rm -rf src/ node_modules/ package.json package-lock.json vite.config.ts tsconfig.json

# クリーンな状態
git status
```

### Phase 2 問題発生時
```bash
# Tauri初期化を戻す
git revert <tauri-init-commit-hash>
rm -rf src-tauri/

# Phase 1完了時点に戻る
git checkout v2.0.0-phase1-complete

# Viteは保持、Tauriのみ削除
```

### データ移行の巻き戻し
- **LocalStorage**: ブラウザ側で自動保持
- **Tauri Store**: `scripts/migrations/down/` の逆マイグレーションスクリプト実行

---

## 📊 工数見積もり総括

| Phase | 内容 | 所要時間 | 累計 |
|-------|------|----------|------|
| Phase 1 | コード分割 | 11時間 | 1.4日 |
| Phase 2 | デスクトップ版 | 8時間 | 2.4日 |
| Phase 3 | 機能パリティ | 6人日 | 8.4日 |
| Phase 4 | QA・CI/CD | 8人日 | 16.4日 |
| Phase 5 | β版 | 5人日 | 21.4日 |
| Phase 6 | 正式リリース | 4人日 | 25.4日 |

**合計**: 約1ヶ月 (1人フルタイム作業の場合)
**推奨**: 2-3ヶ月 (週末作業、品質重視)

---

## ✅ 各Phase完了時チェックリスト

### 全Phase共通
```
[ ] ビルド成功 (npm run build / tauri build)
[ ] 既存機能動作
    [ ] 従業員採用
    [ ] 製品開発
    [ ] マーケティング
    [ ] 財務管理
    [ ] 月次決算
[ ] セーブ/ロード動作
[ ] Chart.js描画正常
[ ] パフォーマンス劣化なし
[ ] Gitコミット (タグ付き)
[ ] ドキュメント更新
```

---

## 🔗 関連ドキュメント

- [Tauri 公式ドキュメント](https://tauri.app/v1/guides/)
- [Vite 公式ドキュメント](https://vitejs.dev/)
- [Chart.js 公式ドキュメント](https://www.chartjs.org/)
- [LocalForage GitHub](https://github.com/localForage/localForage)

---

## 📞 サポート・連絡先

- **GitHub Issues**: [business-simulation-game/issues](https://github.com/TTMK7777/business-simulation-game/issues)
- **プロジェクトオーナー**: TTMK7777

---

## 📝 変更履歴

| 日付 | バージョン | 変更内容 | 担当 |
|------|-----------|----------|------|
| 2025-10-28 | 1.0.0 | 初版作成 | Claude Code + Codex |

---

**🎯 次のアクション: オプションB（バックアップ実行）へ進む**
