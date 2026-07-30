// Wave 1 実ブラウザ E2E: 財務3表グラフ / キャラ日課 / a2ui カード
//   + Phase 2 Wave 1 (オフィス固定費 / 労働力ドライバー / 退職発生)
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
    // showModal は .active クラスで表示する。インライン display:none を付けると
    // 以降 showModal しても表示されなくなるため必ず closeModal() を使う
    window.closeModal?.()
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

// --- 7.1 Wave 1-E: オフィス維持費が P/L に計上され、UI にも出ている ---
const fixedCostInfo = await evaljs(`(() => {
  const snapshot = ((window.game || {}).financeHistory || []).slice(-1)[0] || {}
  const infoText = document.getElementById('financeInfo')?.textContent || ''
  return {
    snapshotFixedCost: snapshot.fixedCost,
    profitMatchesFormula: snapshot.profit ===
      snapshot.revenue - snapshot.salaryTotal - snapshot.interest - snapshot.fixedCost - snapshot.attritionCost,
    infoShowsFixedCost: infoText.includes('オフィス維持費')
  }
})()`)
record('wave1-fixed-cost-in-pl',
  fixedCostInfo.snapshotFixedCost > 0 && fixedCostInfo.profitMatchesFormula && fixedCostInfo.infoShowsFixedCost,
  JSON.stringify(fixedCostInfo))

// --- 7.2 Wave 1-B: 売上ドライバーに労働力（モチベーション）寄与が出ている ---
const workforceDriver = await evaljs(`(() => {
  const snapshot = ((window.game || {}).financeHistory || []).slice(-1)[0] || {}
  const keys = (snapshot.revenueDrivers?.contributions || []).map(c => c.key)
  const driversText = document.getElementById('financeDrivers')?.textContent || ''
  return { keys, uiShowsLabel: driversText.includes('モチベーション') }
})()`)
record('wave1-workforce-driver',
  workforceDriver.keys.includes('workforce') && workforceDriver.uiShowsLabel,
  JSON.stringify(workforceDriver))

// --- 7.3 Wave 1-B: モチベーションを枯らすと退職が発生し、人員と資金に反映される ---
const beforeAttrition = await evaljs(`(() => {
  const g = window.game
  // 全員を退職圏まで追い込む (最低1名は残る仕様なので採用も行わず2名構成にする)
  g.employees.forEach(e => { e.motivation = 10; e.stress = 100; e.lastTrainingTurn = 1 })
  if (g.employees.length < 2) {
    const clone = JSON.parse(JSON.stringify(g.employees[0]))
    clone.id = 9001; clone.name = 'E2E 退職候補'
    g.employees.push(clone)
  }
  return { count: g.employees.length, money: g.money }
})()`)
// 決算週まで進める (退職判定は月次)。
// 退職はモチベーション連動の確率判定 (最悪でも月12%) のため、決算ターンだけ
// Math.random を固定して決定的にする。確率そのものはユニットテスト側で検証済み。
for (let i = 0; i < 4; i++) {
  if (i === 3) {
    await evaljs(`(() => { window.__origRandom = Math.random; Math.random = () => 0; return true })()`)
  }
  await evaljs(`document.querySelector('#turnFab').click()`)
  await sleep(900)
  if (i === 3) {
    await evaljs(`(() => { if (window.__origRandom) Math.random = window.__origRandom; return true })()`)
  }
  await evaljs(`(() => {
    // showModal は .active クラスで表示する。インライン display:none を付けると
    // 以降 showModal しても表示されなくなるため必ず closeModal() を使う
    window.closeModal?.()
    return true
  })()`)
  await sleep(300)
}
const afterAttrition = await evaljs(`(() => {
  const g = window.game
  const snapshot = (g.financeHistory || []).slice(-1)[0] || {}
  return { count: g.employees.length, attritionCost: snapshot.attritionCost }
})()`)
record('wave1-resignation-occurs',
  afterAttrition.count < beforeAttrition.count && afterAttrition.attritionCost > 0,
  JSON.stringify({ before: beforeAttrition.count, after: afterAttrition.count, attritionCost: afterAttrition.attritionCost }))
await shot('09-after-resignation')

// --- 7.4 Wave 2-A/C: 週次ミニイベント (決算週以外に1件) + 決裁カード注入 ---
// 種別抽選も乱数なので、決裁カード (Wave 2-C の主眼) が出るよう Math.random を固定する
await evaljs(`(() => {
  const g = window.game
  // 直前までのターン送りで積み残した書類ごとリセットする
  // (currentWeeklyEvent だけ null にすると書類がキューに残り件数の期待値がずれる)
  g.currentWeeklyEvent = null
  g.documentQueue = []
  g.money = 20000000
  window.__origRandom = Math.random
  Math.random = () => 0
  return true
})()`)
await evaljs(`document.querySelector('#turnFab').click()`)
await sleep(1200)
const weeklyEventInfo = await evaljs(`(() => {
  const g = window.game
  const modal = document.getElementById('modal')
  const el = document.querySelector('.weekly-event')
  const opts = [...document.querySelectorAll('.weekly-event-option')]
  return {
    stateKind: g.currentWeeklyEvent?.kind ?? null,
    queuedDocs: g.documentQueue.length,
    modalOpen: !!modal && getComputedStyle(modal).display !== 'none',
    cardRendered: !!el,
    optionCount: opts.length,
    // 設計制約: 全選択肢に「数字への影響」が併記されていること
    allOptionsHaveImpact: opts.length > 0 && opts.every(o =>
      (o.querySelector('.weekly-event-option-impact')?.textContent || '').trim().length > 0)
  }
})()`)
record('wave2-weekly-event-offered',
  weeklyEventInfo.stateKind === 'decision' && weeklyEventInfo.queuedDocs === 1 &&
  weeklyEventInfo.modalOpen && weeklyEventInfo.cardRendered &&
  weeklyEventInfo.optionCount === 2 && weeklyEventInfo.allOptionsHaveImpact,
  JSON.stringify(weeklyEventInfo))
await shot('10-weekly-event-decision')

// モーダルが他の通知（実績解除など）に上書きされても、概要タブのバナーから復帰できること
const bannerInfo = await evaljs(`(() => {
  // 実績モーダル等に奪われた状況を再現する
  window.showModal('🏆 実績解除！', '<p>横取りモーダル</p>', true)
  window.renderActivePanel()
  const banner = document.querySelector('.weekly-event-banner')
  const bannerVisible = !!banner
  if (banner) banner.click()
  return {
    bannerVisible,
    reopened: !!document.querySelector('.weekly-event'),
    optionCount: document.querySelectorAll('.weekly-event-option').length
  }
})()`)
record('wave2-event-recoverable-from-banner',
  bannerInfo.bannerVisible && bannerInfo.reopened && bannerInfo.optionCount === 2,
  JSON.stringify(bannerInfo))

// 承認して決裁が処理されること + 結果に数字が出ること
const historyBefore = await evaljs(`(window.game.documentHistory || []).length`)
await evaljs(`[...document.querySelectorAll('.weekly-event-option')][0].click()`)
await sleep(900)
const resolveInfo = await evaljs(`(() => {
  const g = window.game
  return {
    historyLen: (g.documentHistory || []).length,
    queuedDocs: g.documentQueue.length,
    eventCleared: g.currentWeeklyEvent === null,
    resultRendered: !!document.querySelector('.weekly-event-result'),
    impactsShown: (document.querySelector('.weekly-event-impacts')?.textContent || '').trim().length > 0,
    unlockedTheories: (g.unlockedTheories || []).length
  }
})()`)
record('wave2-decision-resolved',
  resolveInfo.historyLen === historyBefore + 1 && resolveInfo.queuedDocs === 0 &&
  resolveInfo.eventCleared && resolveInfo.resultRendered && resolveInfo.impactsShown,
  JSON.stringify(resolveInfo))
await shot('11-weekly-event-result')

// 決算週にはミニイベントを出さない (月次決算に集中させる)
await evaljs(`(() => {
  const g = window.game
  window.closeModal?.()
  g.currentWeeklyEvent = null
  g.week = 3
  return true
})()`)
await evaljs(`document.querySelector('#turnFab').click()`)
await sleep(1200)
const settlementWeekInfo = await evaljs(`(() => ({
  week: window.game.week,
  weeklyEvent: window.game.currentWeeklyEvent
}))()`)
record('wave2-no-event-on-settlement-week',
  settlementWeekInfo.week === 4 && settlementWeekInfo.weeklyEvent === null,
  JSON.stringify(settlementWeekInfo))
await evaljs(`(() => { if (window.__origRandom) Math.random = window.__origRandom; return true })()`)
await evaljs(`(() => { window.closeModal?.(); return true })()`)
await sleep(400)

// --- 7.6 Wave 3-D: シナリオ「起業1年目」のクリア / ゲームオーバー + 事後講評 ---
// 12ヶ月を実プレイで進めるのは E2E として長すぎるため、シナリオ状態を注入して
// 決着判定と結果画面 (指標 + 体験した理論) が実ブラウザで出ることを確認する。
// 判定ロジックそのものはユニットテストで網羅済み。
await evaljs(`(() => {
  const g = window.game
  g.scenarioId = 'startup_year_one'
  g.scenarioStartYear = 2025
  g.scenarioStartMonth = 1
  g.scenarioResult = null
  g.isBankrupt = false
  g.isGameOver = false
  g.money = 8000000
  g.year = 2025
  g.month = 12
  g.week = 4
  g.currentWeeklyEvent = null
  g.documentQueue = []
  window.updateDisplay()
  return true
})()`)
const scenarioProgress = await evaljs(`(document.querySelector('.scenario-progress-value')?.textContent || '').trim()`)
record('wave3-scenario-progress-visible', scenarioProgress.includes('残り 1ヶ月'), scenarioProgress)

// 決算週を1回送る → 12ヶ月到達でクリア
await evaljs(`document.querySelector('#turnFab').click()`)
await sleep(1600)
const clearInfo = await evaljs(`(() => {
  const g = window.game
  const el = document.querySelector('.scenario-result')
  return {
    scenarioResult: g.scenarioResult,
    year: g.year, month: g.month,
    isClear: !!document.querySelector('.scenario-result-head.is-clear'),
    metricCount: document.querySelectorAll('.scenario-metric').length,
    hasComment: (document.querySelector('.scenario-comment')?.textContent || '').trim().length > 0,
    hasTheorySection: !!document.querySelector('.scenario-theories'),
    rendered: !!el,
    // DOM に在るだけでは不十分 (非表示でも querySelector は当たる)。実際に見えているかを見る
    visible: !!el && el.getBoundingClientRect().height > 0 && !!el.offsetParent
  }
})()`)
record('wave3-scenario-clear',
  clearInfo.scenarioResult === 'clear' && clearInfo.rendered && clearInfo.visible && clearInfo.isClear &&
  clearInfo.metricCount >= 4 && clearInfo.hasComment && clearInfo.hasTheorySection,
  JSON.stringify(clearInfo))
await shot('12-scenario-clear')

// 決着画面が他のモーダル (実績解除など) に奪われても概要タブから復帰できること
const scenarioBannerInfo = await evaljs(`(() => {
  window.showModal('横取りモーダル', '<p>実績解除など</p>', true)
  window.updateDisplay()
  const banner = document.querySelector('#scenarioProgress button')
  const bannerVisible = !!banner
  if (banner) banner.click()
  const el = document.querySelector('.scenario-result')
  return {
    bannerVisible,
    reopened: !!el && el.getBoundingClientRect().height > 0 && !!el.offsetParent,
    stillClear: !!document.querySelector('.scenario-result-head.is-clear')
  }
})()`)
record('wave3-result-recoverable-from-banner',
  scenarioBannerInfo.bannerVisible && scenarioBannerInfo.reopened && scenarioBannerInfo.stillClear,
  JSON.stringify(scenarioBannerInfo))

// ゲームオーバー: 資金ショートで決着し、講評が敗因に触れること
await evaljs(`(() => {
  window.closeModal?.()
  const g = window.game
  g.scenarioResult = null
  g.isBankrupt = false
  g.isGameOver = false
  g.year = 2025
  g.month = 4
  g.week = 4
  g.money = 100000
  g.debt = 0
  g.products = []
  g.currentWeeklyEvent = null
  g.documentQueue = []
  return true
})()`)
await evaljs(`document.querySelector('#turnFab').click()`)
await sleep(1600)
const overInfo = await evaljs(`(() => {
  const g = window.game
  return {
    scenarioResult: g.scenarioResult,
    isGameOver: g.isGameOver,
    isGameoverCard: !!document.querySelector('.scenario-result-head.is-gameover'),
    visible: (() => { const el = document.querySelector('.scenario-result'); return !!el && el.getBoundingClientRect().height > 0 && !!el.offsetParent })(),
    comment: (document.querySelector('.scenario-comment')?.textContent || '').trim()
  }
})()`)
record('wave3-scenario-gameover',
  overInfo.scenarioResult === 'gameover' && overInfo.isGameOver && overInfo.visible &&
  overInfo.isGameoverCard && overInfo.comment.includes('資金'),
  JSON.stringify({ ...overInfo, comment: overInfo.comment.slice(0, 40) }))
await shot('13-scenario-gameover')

// 後片付け: 以降のチェック (テーマ) にシナリオ状態を持ち込まない
await evaljs(`(() => {
  window.closeModal?.()
  const g = window.game
  g.scenarioId = null
  g.scenarioResult = null
  g.isBankrupt = false
  g.isGameOver = false
  g.money = 10000000
  window.renderActivePanel()
  return true
})()`)
await sleep(300)

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
