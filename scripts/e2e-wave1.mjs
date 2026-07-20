// Wave 1 実ブラウザ E2E: 財務3表グラフ / キャラ日課 / a2ui カード
// Chrome headless + CDP 直叩き (Node 22 組込 WebSocket/fetch、追加依存なし)
//
// 実行手順:
//   1. npm run build && npm run preview       (http://127.0.0.1:4173 で配信)
//   2. Chrome headless を CDP ポート 9333 で起動:
//      "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new \
//        --remote-debugging-port=9333 --user-data-dir=<一時dir> about:blank
//      (ポート 9333 は worktree 並行エージェントとの衝突回避用の専用ポート)
//   3. node scripts/e2e-wave1.mjs <スクショ出力dir>
//      ダークモード検証込みは E2E_DARK=1 を付与
// 判定: 全チェック PASS + コンソールエラー 0 で exit 0。結果は <出力dir>/e2e-results.json
import { writeFileSync } from 'node:fs'

const CDP = 'http://127.0.0.1:9333'
const APP = 'http://127.0.0.1:4173/'
const OUT = process.argv[2] || '.'

const results = []
const consoleErrors = []
let msgId = 0
const pending = new Map()

function record(name, ok, detail) {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`)
}

// --- CDP 接続 ---
const targets = await (await fetch(`${CDP}/json/list`)).json()
let page = targets.find(t => t.type === 'page')
if (!page) {
  page = await (await fetch(`${CDP}/json/new?about:blank`, { method: 'PUT' })).json()
}
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })

ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data)
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id)
    pending.delete(msg.id)
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
  } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    consoleErrors.push(msg.params.args.map(a => a.value ?? a.description ?? '').join(' '))
  } else if (msg.method === 'Runtime.exceptionThrown') {
    consoleErrors.push('EXCEPTION: ' + (msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text))
  }
}

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function evaljs(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (r.exceptionDetails) throw new Error('eval failed: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) + ' :: ' + expression.slice(0, 120))
  return r.result.value
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function waitFor(desc, expression, timeoutMs = 15000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try { if (await evaljs(expression)) return true } catch { /* retry */ }
    await sleep(250)
  }
  throw new Error(`timeout waiting: ${desc}`)
}

async function shot(name, fullPage = false) {
  const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: fullPage })
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, 'base64'))
  console.log(`shot: ${name}.png`)
}

await send('Runtime.enable')
await send('Page.enable')

// --- 1. 起動 → ストレージ全消去 → 再読込 (決定的な新規ゲーム開始のため) ---
await send('Page.navigate', { url: APP })
await waitFor('first load', `!!document.querySelector('#menuSlot1')`)
try {
  await send('Storage.clearDataForOrigin', { origin: 'http://127.0.0.1:4173', storageTypes: 'all' })
} catch {
  await evaljs(`(async () => { localStorage.clear(); const dbs = await indexedDB.databases(); for (const d of dbs) indexedDB.deleteDatabase(d.name); return true })()`)
}
await send('Page.navigate', { url: APP })
await waitFor('menu slot', `!!document.querySelector('#menuSlot1')`)
record('menu-visible', true)

// --- 2. 新規ゲーム開始 (スロット1 → 管理モード → ノーマル) ---
await evaljs(`document.querySelector('#menuSlot1').click()`)
await waitFor('mode modal', `document.querySelector('#modeSelectModal')?.style.display !== 'none'`)
await evaljs(`document.querySelector('#modeManagement').click()`)
await evaljs(`document.querySelector('#confirmModeBtn').click()`)
await waitFor('difficulty modal', `document.querySelector('#difficultyModal')?.style.display !== 'none'`)
await evaljs(`document.querySelector('[data-difficulty="normal"]').click()`)
await evaljs(`document.querySelector('#startWithDifficultyBtn').click()`)
await waitFor('game screen', `!!document.querySelector('#endTurnBtn')`, 20000)
record('game-started', true)
await sleep(1500) // 初期化・入場アニメ待ち

// --- 2.5 チュートリアルをスキップ (歓迎カードが画面を覆うため) ---
await evaljs(`(() => {
  const skip = [...document.querySelectorAll('button, a, span')].find(el => /スキップ/.test(el.textContent || ''))
  if (skip) { skip.click(); return 'skipped' }
  return 'no-skip-button'
})()`)
await sleep(600)
// 確認ダイアログが出る場合に備えもう一度スキップ/OK系を押す
await evaljs(`(() => {
  const ok = [...document.querySelectorAll('button')].find(el => /スキップ|OK|はい/.test(el.textContent || ''))
  if (ok) ok.click()
  return true
})()`)
await sleep(600)

// --- 3. キャラクター日課 v1 ---
const charInfo = await evaljs(`(() => {
  const chars = [...document.querySelectorAll('.office-characters .character')]
  return { count: chars.length,
           jobs: chars.map(c => c.dataset.job),
           desks: document.querySelectorAll('.office-desk').length }
})()`)
record('characters-present', charInfo.count >= 1, JSON.stringify(charInfo))
await shot('01-overview-characters')

// --- 4. 財務タブ: 3チャート + ドライバー ---
await evaljs(`document.querySelector('button[data-panel="finance"]').click()`)
await sleep(800)
const canvasInfo = await evaljs(`(() => {
  return ['financePlChart','financeCfChart','financeBsChart'].map(id => {
    const c = document.getElementById(id)
    return { id, exists: !!c, w: c?.width ?? 0, h: c?.height ?? 0 }
  })
})()`)
const allCanvasOk = canvasInfo.every(c => c.exists && c.w > 10 && c.h > 10)
record('finance-canvas-nonzero', allCanvasOk, JSON.stringify(canvasInfo))
await shot('02-finance-initial')

// --- 5. 4ターン送り → 月次決算 ---
for (let i = 0; i < 4; i++) {
  await evaljs(`document.querySelector('#turnFab').click()`)
  await sleep(900)
  // 決算モーダル等が開いていたら閉じる (汎用 #modal)
  await evaljs(`(() => {
    const m = document.getElementById('modal')
    if (m && getComputedStyle(m).display !== 'none') {
      const btn = m.querySelector('button, .close, .modal-close')
      if (btn) btn.click(); else m.style.display = 'none'
    }
    return true
  })()`)
  await sleep(300)
}
const week = await evaljs(`document.getElementById('gameDate')?.textContent || ''`)
record('turns-advanced', /2月|第1週/.test(week), week)

// --- 6. a2ui カード (月次決算で発火) ---
const a2uiInfo = await evaljs(`(() => ({
  news: !!document.querySelector('a2ui-news-card'),
  finance: [...document.querySelectorAll('body > div')].some(d => (d.textContent || '').includes('今月の決算')),
  advisor: !!document.querySelector('a2ui-advisor-card')
}))()`)
record('a2ui-cards-fired', a2uiInfo.news || a2uiInfo.finance || a2uiInfo.advisor, JSON.stringify(a2uiInfo))
await shot('03-after-settlement')

// --- 7. 財務タブ再訪: 履歴データ入りチャート + ドライバー分解 ---
await evaljs(`document.querySelector('button[data-panel="finance"]').click()`)
await sleep(800)
const finData = await evaljs(`(() => {
  const drivers = document.getElementById('financeDrivers')
  const hist = (window.game || {}).financeHistory
  return { driversHasContent: !!drivers && drivers.innerHTML.trim().length > 20,
           historyLen: Array.isArray(hist) ? hist.length : 'n/a' }
})()`)
record('finance-history-and-drivers', finData.driversHasContent, JSON.stringify(finData))
await evaljs(`document.getElementById('financePlChart')?.scrollIntoView({ block: 'center' })`)
await sleep(400)
await shot('04-finance-with-data')
await shot('05-finance-fullpage', true)

// --- 7.5 ダークモード検証 (tokens-theme マージ後に有効。トグル未実装なら SKIP 扱い) ---
if (process.env.E2E_DARK === '1') {
  const clickToggle = `(() => {
    const btn = [...document.querySelectorAll('button')].find(b => /🌙|☀/.test(b.textContent || '') || b.id?.toLowerCase().includes('theme'))
    if (btn) { btn.click(); return true }
    return false
  })()`
  const readTheme = `document.documentElement.dataset.theme || null`
  const initial = await evaljs(readTheme)
  const flipped = initial === 'dark' ? 'light' : 'dark'
  const toggleFound = await evaljs(clickToggle)
  await sleep(600)
  const state1 = await evaljs(`(() => ({ dataTheme: ${readTheme}, stored: localStorage.getItem('theme') }))()`)
  record('theme-toggle-flips', toggleFound && state1.dataTheme === flipped && state1.stored === flipped,
    `initial=${initial} → ${JSON.stringify(state1)}`)
  await shot(`06-theme-${flipped}-overview`)
  await evaljs(`document.querySelector('button[data-panel="finance"]').click()`)
  await sleep(800)
  await evaljs(`document.getElementById('financePlChart')?.scrollIntoView({ block: 'center' })`)
  await sleep(400)
  await shot(`07-theme-${flipped}-finance`)
  // 元のテーマへ復帰（明示選択が media query に勝つ方向の確認）
  await evaljs(clickToggle)
  await sleep(600)
  const state2 = await evaljs(readTheme)
  record('theme-toggle-back', state2 === initial, `back to ${state2} (expected ${initial})`)
  await shot(`08-theme-${initial}-restored`)
}

// --- 8. コンソールエラー集計 ---
const realErrors = consoleErrors.filter(e => !/favicon|sw\.js|workbox|manifest/i.test(e))
record('no-console-errors', realErrors.length === 0, realErrors.slice(0, 5).join(' | ') || 'clean')

writeFileSync(`${OUT}/e2e-results.json`, JSON.stringify({ results, consoleErrors: realErrors }, null, 2))
const failed = results.filter(r => !r.ok)
console.log(`\n=== E2E ${failed.length === 0 ? 'ALL PASS' : failed.length + ' FAILED'} (${results.length} checks) ===`)
ws.close()
process.exit(failed.length === 0 ? 0 : 1)
