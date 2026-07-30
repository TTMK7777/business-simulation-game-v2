// シナリオ「起業1年目」のバランス測定（Wave 3-D）
//
// specs/002-phase2-core-loop.md の検証項目
//   「起業1年目を実プレイ相当の自動進行で N 回走らせ、クリア率が極端(<10% / >90%)でないことを確認」
// を実測するためのスクリプト。CI には載せない（時間がかかるため手動実行）。
//
// 実行手順:
//   1. npm run build && npm run preview
//   2. Chrome headless を CDP ポート 9333 で起動（e2e-wave1.mjs と同じ）
//   3. node scripts/balance-scenario.mjs [試行回数]
//
// 自動プレイの方針（「そこそこ考えるが最適ではない」プレイヤーを模す）:
//   - 従業員が2名未満なら採用（開発の前提条件）
//   - 資金に余裕があれば製品を開発（売上源。上限3本）
//   - 週次ミニイベントは常に最初の選択肢を選ぶ
//   - それ以外はターンを送るだけ
// この方針は「上手いプレイ」ではないので、ここでのクリア率は下限寄りの目安として読む。

const CDP = 'http://127.0.0.1:9333'
const APP = 'http://127.0.0.1:4173/'
const RUNS = Number(process.argv[2] || 12)
const MAX_TURNS = 60

let msgId = 0
const pending = new Map()
const targets = await (await fetch(`${CDP}/json/list`)).json()
const page = targets.find(t => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id)
    pending.delete(m.id)
    m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result)
  }
}
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++msgId
  pending.set(id, { resolve, reject })
  ws.send(JSON.stringify({ id, method, params }))
})
const evaljs = async (e) => {
  const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })
  if (r.exceptionDetails) throw new Error('eval failed: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text))
  return r.result.value
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function waitFor(desc, expr, timeoutMs = 20000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try { if (await evaljs(expr)) return true } catch { /* retry */ }
    await sleep(200)
  }
  throw new Error(`timeout waiting: ${desc}`)
}

await send('Runtime.enable')
await send('Page.enable')

async function playOnce() {
  await send('Page.navigate', { url: APP })
  await waitFor('first load', `!!document.querySelector('#menuSlot1')`)
  try {
    await send('Storage.clearDataForOrigin', { origin: 'http://127.0.0.1:4173', storageTypes: 'all' })
  } catch { /* ignore */ }
  await send('Page.navigate', { url: APP })
  await waitFor('menu', `!!document.querySelector('#menuSlot1')`)

  await evaljs(`document.querySelector('#menuSlot1').click()`)
  await waitFor('mode modal', `document.querySelector('#modeSelectModal')?.style.display !== 'none'`)
  await evaljs(`document.querySelector('#modeScenario').click(); document.querySelector('#confirmModeBtn').click()`)
  await waitFor('difficulty modal', `document.querySelector('#difficultyModal')?.style.display !== 'none'`)
  await evaljs(`document.querySelector('[data-difficulty="normal"]').click(); document.querySelector('#startWithDifficultyBtn').click()`)
  await waitFor('game screen', `!!document.querySelector('#endTurnBtn')`)
  await sleep(1200)

  // チュートリアルを閉じる
  await evaljs(`(() => {
    const s = [...document.querySelectorAll('button, a, span')].find(el => /スキップ/.test(el.textContent || ''))
    if (s) s.click()
    return true
  })()`)
  await sleep(400)
  await evaljs(`(() => {
    const o = [...document.querySelectorAll('button')].find(el => /スキップ|OK|はい/.test(el.textContent || ''))
    if (o) o.click()
    window.closeModal?.()
    return true
  })()`)
  await sleep(400)
  await waitFor('scenario started', `window.game.scenarioId === 'startup_year_one'`)

  // 参入市場の選び方をページ側に用意する (成長率が最も高いセグメント)
  await evaljs(`(() => {
    window.__pickBestSegment = () => {
      const g = window.game
      const ids = Object.keys(g.segmentShares || {})
      if (ids.length === 0) return 'smb'
      // 成長率は UI に出ている値と同じものを使いたいが、ページからは直接呼べないため
      // セグメント定義の序列 (ai > consumer > smb > enterprise) を初期成長率の代理にする
      const order = ['ai', 'consumer', 'smb', 'enterprise']
      return order.find(id => ids.includes(id)) || ids[0]
    }
    return true
  })()`)

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const settled = await evaljs(`window.game.scenarioResult`)
    if (settled) break

    // --- 方針の実行 ---
    await evaljs(`(() => {
      const g = window.game
      // 1) 開発に必要な2名を確保する
      if (g.employees.length < 2) {
        const c = window.generateCandidate()
        if (c && g.money >= c.salary * 3) window.hireEmployee(c)
      }
      // 2) 資金に余裕があれば製品を作る (売上源)。
      //    Phase 3: 参入市場は「今いちばん成長率が高いところ」を選ぶ素朴な方針
      if (g.employees.length >= 2 && g.products.length < 3 && g.money >= 3500000) {
        const best = window.__pickBestSegment ? window.__pickBestSegment() : 'smb'
        window.developProduct(best)
      }
      window.closeModal?.()
      return true
    })()`)
    await sleep(120)

    await evaljs(`document.querySelector('#turnFab').click()`)
    await sleep(320)

    // 週次ミニイベントが出ていれば最初の選択肢を選ぶ
    await evaljs(`(() => {
      const opt = document.querySelector('.weekly-event-option')
      if (opt) { opt.click(); return 'resolved' }
      return 'none'
    })()`)
    await sleep(160)
    await evaljs(`window.closeModal?.(); true`)
    await sleep(80)
  }

  return await evaljs(`(() => {
    const g = window.game
    return {
      result: g.scenarioResult,
      months: (g.year - g.scenarioStartYear) * 12 + (g.month - g.scenarioStartMonth),
      money: g.money,
      products: g.products.length,
      employees: g.employees.length
    }
  })()`)
}

const results = []
for (let i = 0; i < RUNS; i++) {
  try {
    const r = await playOnce()
    results.push(r)
    console.log(`run ${i + 1}/${RUNS}: ${r.result ?? 'unfinished'} (${r.months}ヶ月, 資金${Math.floor(r.money / 10000)}万, 製品${r.products}本, 社員${r.employees}名)`)
  } catch (e) {
    console.log(`run ${i + 1}/${RUNS}: ERROR ${e.message}`)
    results.push({ result: 'error' })
  }
}

const clears = results.filter(r => r.result === 'clear').length
const gameovers = results.filter(r => r.result === 'gameover').length
const others = results.length - clears - gameovers
const rate = Math.round((clears / results.length) * 100)

console.log('')
console.log(`=== 起業1年目 バランス測定 (${results.length}回) ===`)
console.log(`クリア: ${clears} / ゲームオーバー: ${gameovers} / 未決着・エラー: ${others}`)
console.log(`クリア率: ${rate}%`)
console.log(rate < 10 ? '⚠️ 難しすぎる (<10%)' : rate > 90 ? '⚠️ 易しすぎる (>90%)' : '✅ 極端ではない (10-90%)')
process.exit(0)
