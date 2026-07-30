// テキストコントラスト監査（ダーク/ライト両テーマ）
//
// 背景色だけをハードコードし文字色をテーマ追従にした要素は、
// 逆テーマで「白背景に白文字」になって読めなくなる。
// 目視では見落とすため、実ブラウザで全パネルを走査してコントラスト比を実測する。
//
// 判定: WCAG AA（通常文字 4.5:1 / 18.66px以上 または 14px以上かつ太字は 3:1）
//
// 実行手順:
//   1. npm run build && npm run preview
//   2. Chrome headless を CDP ポート 9333 で起動（e2e-wave1.mjs と同じ）
//   3. node scripts/contrast-audit.mjs
// 判定: 違反0で exit 0

const CDP = 'http://127.0.0.1:9333'
const APP = 'http://127.0.0.1:4173/'

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

// ページ側に仕込む監査関数（コントラスト比の計算は WCAG 2.x の定義どおり）
const AUDIT_FN = String.raw`
window.__auditContrast = function () {
  function parseColor(str) {
    const m = String(str).match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const parts = m[1].split(',').map(s => parseFloat(s.trim()))
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 }
  }
  function luminance(c) {
    const f = v => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b)
  }
  // source-over 合成。半透明同士でも alpha を保つ
  // (単純に a=1 に潰すと「半透明を重ねただけで不透明」と誤判定し、
  //  同色の重なりを「背景=文字色」と読んで偽の違反を出す)
  function blend(fg, bg) {
    const aF = fg.a, aB = bg.a
    const outA = aF + aB * (1 - aF)
    if (outA === 0) return { r: 0, g: 0, b: 0, a: 0 }
    return {
      r: (fg.r * aF + bg.r * aB * (1 - aF)) / outA,
      g: (fg.g * aF + bg.g * aB * (1 - aF)) / outA,
      b: (fg.b * aF + bg.b * aB * (1 - aF)) / outA,
      a: outA
    }
  }
  // 祖先をたどって不透明な実効背景色を求める。
  // グラデーション (background-image) は単色に還元できないため、
  // 途中で見つけたら「判定不能」として null を返す (誤検知の元になる)
  function effectiveBg(el) {
    let acc = null
    let node = el
    while (node && node !== document.documentElement.parentNode) {
      const cs = getComputedStyle(node)
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null
      const c = parseColor(cs.backgroundColor)
      if (c && c.a > 0) {
        acc = acc ? blend(acc, c) : c
        if (acc.a >= 1) return acc
      }
      node = node.parentElement
    }
    // 不透明な背景を最後まで見つけられなかった = 判定不能。
    // 既定を白と決め打つと、実際は色つき背景の要素を誤検知する
    return acc && acc.a >= 0.99 ? acc : null
  }
  function ratio(fg, bg) {
    const l1 = luminance(fg), l2 = luminance(bg)
    const hi = Math.max(l1, l2), lo = Math.min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)
  }

  const results = []
  const nodes = document.querySelectorAll('body *')
  for (const el of nodes) {
    // 直接の文字ノードを持つ要素だけを見る（親の重複計上を避ける）
    const ownText = [...el.childNodes]
      .filter(n => n.nodeType === 3)
      .map(n => n.textContent.trim())
      .join('')
    if (!ownText) continue
    // 記号だけ・絵文字だけは対象外（判読性の議論が別）
    if (!/[\p{L}\p{N}]/u.test(ownText)) continue

    const rect = el.getBoundingClientRect()
    if (rect.width < 1 || rect.height < 1) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.1) continue
    if (!el.offsetParent && cs.position !== 'fixed') continue

    const fg = parseColor(cs.color)
    if (!fg) continue
    const bg = effectiveBg(el)
    if (!bg) continue // グラデーション配下は判定不能 (別途スクリーンショットで目視)
    const fgSolid = fg.a < 1 ? blend(fg, bg) : fg
    const r = ratio(fgSolid, bg)

    const size = parseFloat(cs.fontSize)
    const weight = parseInt(cs.fontWeight, 10) || 400
    const isLarge = size >= 24 || (size >= 18.66 && weight >= 700)
    const required = isLarge ? 3 : 4.5

    if (r < required) {
      results.push({
        text: ownText.slice(0, 32),
        tag: el.tagName.toLowerCase(),
        cls: (el.className && typeof el.className === 'string' ? el.className : '').slice(0, 40),
        color: cs.color,
        bg: 'rgb(' + Math.round(bg.r) + ',' + Math.round(bg.g) + ',' + Math.round(bg.b) + ')',
        ratio: Math.round(r * 100) / 100,
        required
      })
    }
  }
  return results
}
`

async function setupGame() {
  await send('Page.navigate', { url: APP })
  await waitFor('first load', `!!document.querySelector('#menuSlot1')`)
  try {
    await send('Storage.clearDataForOrigin', { origin: 'http://127.0.0.1:4173', storageTypes: 'all' })
  } catch { /* ignore */ }
  await send('Page.navigate', { url: APP })
  await waitFor('menu', `!!document.querySelector('#menuSlot1')`)
  await evaljs(`document.querySelector('#menuSlot1').click()`)
  await waitFor('mode modal', `document.querySelector('#modeSelectModal')?.style.display !== 'none'`)
  await evaljs(`document.querySelector('#modeManagement').click(); document.querySelector('#confirmModeBtn').click()`)
  await waitFor('difficulty', `document.querySelector('#difficultyModal')?.style.display !== 'none'`)
  await evaljs(`document.querySelector('[data-difficulty="normal"]').click(); document.querySelector('#startWithDifficultyBtn').click()`)
  await waitFor('game screen', `!!document.querySelector('#endTurnBtn')`)
  await sleep(1500)
  await evaljs(`(() => {
    const s = [...document.querySelectorAll('button, a, span')].find(el => /スキップ/.test(el.textContent || ''))
    if (s) s.click()
    return true
  })()`)
  await sleep(500)
  await evaljs(`(() => {
    const o = [...document.querySelectorAll('button')].find(el => /スキップ|OK|はい/.test(el.textContent || ''))
    if (o) o.click()
    window.closeModal?.()
    return true
  })()`)
  await sleep(500)
  // 各パネルに中身が出る状態を作る
  await evaljs(`(() => {
    const g = window.game
    g.money = 30000000
    g.marketShare = 8
    g.brandPower = 12
    g.monthlyRevenue = 2500000
    g.segmentShares = { enterprise: 2, smb: 3, consumer: 0.5, ai: 20 }
    g.products = [
      { id: 601, name: 'AIアナリティクス', quality: 62, sales: 1200000, segmentId: 'ai' },
      { id: 602, name: 'ライフログ', quality: 40, sales: 300000, segmentId: 'consumer' },
      { id: 603, name: '基幹連携', quality: 55, sales: 800000, segmentId: 'enterprise' }
    ]
    g.competitorAttacks = ['テックコープが大型契約を獲得']
    g.unlockedTheories = ['ppm', 'sunk_cost']
    window.updateDisplay?.()
    return true
  })()`)
  await sleep(400)
  await evaljs(AUDIT_FN)
}

const PANELS = ['overview', 'hr', 'departments', 'products', 'market', 'finance', 'qualifications']

async function auditTheme(theme) {
  await evaljs(`(() => {
    document.documentElement.setAttribute('data-theme', '${theme}')
    try { localStorage.setItem('theme', '${theme}') } catch {}
    window.updateDisplay?.()
    return true
  })()`)
  await sleep(500)

  const all = []
  for (const panel of PANELS) {
    const ok = await evaljs(`(() => {
      const btn = document.querySelector('button[data-panel="${panel}"]')
      if (!btn) return false
      window.showPanel(btn, '${panel}')
      return true
    })()`)
    if (!ok) continue
    await sleep(450)
    const found = await evaljs(`window.__auditContrast()`)
    for (const f of found) all.push({ ...f, panel, theme })
  }
  return all
}

await setupGame()

const violations = []
for (const theme of ['dark', 'light']) {
  const found = await auditTheme(theme)
  violations.push(...found)
}

// 同じ (theme, class, text) の重複をまとめる
const seen = new Map()
for (const v of violations) {
  const key = `${v.theme}|${v.cls}|${v.color}|${v.bg}`
  if (!seen.has(key)) seen.set(key, { ...v, count: 1 })
  else seen.get(key).count++
}
const unique = [...seen.values()].sort((a, b) => a.ratio - b.ratio)

console.log('')
console.log('=== テキストコントラスト監査 (WCAG AA) ===')
if (unique.length === 0) {
  console.log('✅ 違反なし')
} else {
  for (const v of unique) {
    console.log(`[${v.theme}/${v.panel}] ${v.ratio} < ${v.required}  "${v.text}"  .${v.cls || '(no class)'}  色=${v.color} 背景=${v.bg} (${v.count}件)`)
  }
  console.log('')
  console.log(`違反: ${unique.length} パターン / 実要素 ${violations.length} 件`)
}
process.exit(unique.length === 0 ? 0 : 1)
