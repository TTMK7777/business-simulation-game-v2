// 経営力ドリル: ゲームの決算データから訓練問題を生成する
//
// 通常の学習アプリとの違いは1点だけ。
//   罠（誤答の選択肢）を人が書くのではなく、**エンジンの中間計算値から導出する**。
//
// FinanceManager の profit は
//   revenue - salaryTotal - interest - fixedCost - attritionCost
// という減算チェーンで求まる。この途中で止めた値こそが、実際に人が落とす場所であり、
// それはコードから機械的に取り出せる。人力で罠を列挙する必要がないため、
// 問題数はプレイした月数だけ増える。
//
// 問題文の主語は常に「あなたの会社」。試験の設問番号は出さない。
// 受験生には結果的に試験対策になり、それ以外の人には経営の訓練になる。

import { DRAWERS, DRAWER_KEYS, type DrawerKey } from '../config/drawers'
import type { FinanceSnapshot, GameState } from '../types/index'

/** 採点の許容誤差（比率）。%問題の小数入力や端数処理の差を吸収する */
export const DRILL_TOLERANCE_RATIO = 0.002
/** 答えが 0 付近のとき比率だと許容幅が消えるため、最低限の絶対許容を置く */
const DRILL_TOLERANCE_MIN = 0.5

/** 生成できる問題の種類 */
export type DrillKind = 'profit' | 'equityRatio' | 'breakeven'

export interface DrillTrap {
    /** 途中で止まったときに出てくる値 */
    value: number
    /** その値が「何なのか」 */
    label: string
    /** どこで止まったのか、次に何をすれば完走できるのか */
    hint: string
}

export interface DrillProblem {
    id: string
    kind: DrillKind
    /** 開けるべき引き出し */
    drawer: DrawerKey
    /** STEP1 で提示する4択（正解を必ず含む） */
    drawerChoices: DrawerKey[]
    title: string
    stem: string
    answer: number
    unit: string
    traps: DrillTrap[]
    solution: string
    source: { turn: number; year: number; month: number }
}

export type DrillVerdict = 'correct' | 'trap' | 'wrong'

export interface DrillJudgement {
    verdict: DrillVerdict
    /** verdict === 'trap' のときだけ入る */
    trap?: DrillTrap
}

const yen = (n: number) => `${Math.round(n).toLocaleString()}円`

/** 採点と同じ物差しで「実質的に同じ値か」を判定する */
function withinTolerance(a: number, b: number): boolean {
    const tol = Math.max(Math.abs(b) * DRILL_TOLERANCE_RATIO, DRILL_TOLERANCE_MIN)
    return Math.abs(a - b) <= tol
}

/**
 * 正解と区別が付かない罠を落とす。
 *
 * ゲーム由来の数値は割り切れないため、罠と正解が偶然接近することがある
 * （実測: 自己資本比率 50.02% に対し他人資本比率 49.98%）。
 * 除外の物差しを採点と揃えないと、正解を入れたのに罠として説教される／
 * 罠を入れたのに正解になる、という反転が起きる。
 */
function usableTraps(traps: DrillTrap[], answer: number): DrillTrap[] {
    const kept: DrillTrap[] = []
    for (const t of traps) {
        if (withinTolerance(t.value, answer)) continue
        // 罠どうしが潰し合う場合も先勝ちで1つに寄せる（どちらの指摘が出るか不定になるため）
        if (kept.some(k => withinTolerance(t.value, k.value))) continue
        kept.push(t)
    }
    return kept
}

/**
 * 引き出しの4択を組む。
 *
 * ランダムにすると同じ決算から作った問題でも選択肢が毎回変わり、テストも UI も不安定になる。
 * 決算の turn と問題種別から決定的に選ぶ（プレイヤーから見れば毎月違う組み合わせになる）。
 */
function buildDrawerChoices(correct: DrawerKey, seed: number): DrawerKey[] {
    const others = DRAWER_KEYS.filter(k => k !== correct)
    const picked: DrawerKey[] = []
    // seed を起点に等間隔で拾う。others.length と互いに素な歩幅を使い、重複を避ける
    const stride = 3
    for (let i = 0; i < 3; i++) {
        const idx = Math.abs(seed + i * stride) % others.length
        let candidate = others[idx]
        let guard = 0
        while (picked.includes(candidate) && guard < others.length) {
            candidate = others[(others.indexOf(candidate) + 1) % others.length]
            guard++
        }
        picked.push(candidate)
    }
    // 正解の差し込み位置も決定的にする（毎回1番目だと位置で覚えてしまう）
    const insertAt = Math.abs(seed) % 4
    const result = [...picked]
    result.splice(insertAt, 0, correct)
    return result
}

// ============================================
// 個別ジェネレータ
// ============================================

/**
 * 当月利益。
 * 罠は FinanceManager の減算チェーンをそのまま途中で止めた値。
 */
function generateProfitProblem(s: FinanceSnapshot): DrillProblem {
    const afterSalary = s.revenue - s.salaryTotal
    const afterInterest = afterSalary - s.interest
    const afterFixed = afterInterest - s.fixedCost

    return {
        id: `t${s.turn}-profit`,
        kind: 'profit',
        drawer: 'difference',
        drawerChoices: buildDrawerChoices('difference', s.turn),
        title: '当月利益',
        stem:
            `あなたの会社の${s.year}年${s.month}月の月次実績です。` +
            `売上 ${yen(s.revenue)}、人件費 ${yen(s.salaryTotal)}、支払利息 ${yen(s.interest)}、` +
            `オフィス維持費 ${yen(s.fixedCost)}、退職に伴う再採用コスト ${yen(s.attritionCost)}。` +
            `この月の利益はいくらですか。`,
        answer: s.profit,
        unit: '円',
        traps: usableTraps([
            {
                value: s.revenue,
                label: '売上高',
                hint: 'まだ1つも費用を引いていません。手元に残る金額を聞かれています。',
            },
            {
                value: afterSalary,
                label: '売上から人件費だけを引いた値',
                hint: '人件費で止まっています。残りの3つ（利息・オフィス維持費・再採用コスト）を引いて完走してください。',
            },
            {
                value: afterInterest,
                label: '人件費と利息まで引いた値',
                hint: 'オフィス維持費と再採用コストが残っています。規模を上げると増える固定費こそ効きます。',
            },
            {
                value: afterFixed,
                label: '再採用コストだけを引き忘れた値',
                hint: '退職が出た月は採用し直す費用がかかります。人が辞めたコストは、辞めた月に効きます。',
            },
        ], s.profit),
        solution:
            `${yen(s.revenue)} − ${yen(s.salaryTotal)} − ${yen(s.interest)} − ${yen(s.fixedCost)} − ` +
            `${yen(s.attritionCost)} ＝ ${yen(s.profit)}。` +
            `費用は4種類あります。式を全部書いてから数字を入れると、引き忘れが起きません。`,
        source: { turn: s.turn, year: s.year, month: s.month },
    }
}

/**
 * 自己資本比率。
 * 罠は「分母に何を置くか」を取り違えた実際の値。
 */
function generateEquityRatioProblem(s: FinanceSnapshot): DrillProblem {
    const answer = (s.netWorth / s.cash) * 100
    const wrongDenominator = (s.netWorth / s.debt) * 100
    const debtRatio = (s.debt / s.cash) * 100

    return {
        id: `t${s.turn}-equity-ratio`,
        kind: 'equityRatio',
        drawer: 'denominator',
        drawerChoices: buildDrawerChoices('denominator', s.turn + 1),
        title: '自己資本比率',
        stem:
            `${s.year}年${s.month}月末のあなたの会社は、資産（現預金）${yen(s.cash)}、` +
            `借入金 ${yen(s.debt)}、純資産 ${yen(s.netWorth)} です。自己資本比率は何%ですか。`,
        answer,
        unit: '%',
        traps: usableTraps([
            {
                value: wrongDenominator,
                label: '純資産 ÷ 借入金',
                hint: '分母が借入金になっています。自己資本比率は「全体のうち返さなくていい金がどれだけか」なので、分母は総資産です。',
            },
            {
                value: debtRatio,
                label: '借入金 ÷ 総資産（他人資本比率）',
                hint: '分子が逆です。これは他人資本の割合で、100からこれを引くと自己資本比率になります。',
            },
        ], answer),
        solution:
            `自己資本比率 ＝ 純資産 ÷ 総資産 × 100 ＝ ${yen(s.netWorth)} ÷ ${yen(s.cash)} × 100 ` +
            `＝ ${answer.toFixed(1)}%。比率は必ず「何と何を対応させる概念か」を言葉にしてから式を書いてください。`,
        source: { turn: s.turn, year: s.year, month: s.month },
    }
}

/**
 * 損益分岐点売上高。
 * このゲームの費用は売上に連動しない（全額が固定的な性格）ため、損益分岐点＝総費用になる。
 * 罠は「引き忘れた費用」の組み合わせ。
 */
function generateBreakevenProblem(s: FinanceSnapshot): DrillProblem {
    const answer = s.salaryTotal + s.interest + s.fixedCost + s.attritionCost
    const gap = s.revenue - answer

    return {
        id: `t${s.turn}-breakeven`,
        kind: 'breakeven',
        drawer: 'formula',
        drawerChoices: buildDrawerChoices('formula', s.turn + 2),
        title: '損益分岐点売上高',
        stem:
            `${s.year}年${s.month}月のあなたの会社の費用は、人件費 ${yen(s.salaryTotal)}、` +
            `支払利息 ${yen(s.interest)}、オフィス維持費 ${yen(s.fixedCost)}、` +
            `再採用コスト ${yen(s.attritionCost)} でした。これらが変わらないとして、` +
            `赤字にならないために最低限必要な月間売上はいくらですか。`,
        answer,
        unit: '円',
        traps: usableTraps([
            {
                value: s.salaryTotal,
                label: '人件費だけ',
                hint: '人件費だけでは足りません。売上がゼロでも出ていく金を全部数えてください。',
            },
            {
                value: s.salaryTotal + s.fixedCost,
                label: '人件費 ＋ オフィス維持費',
                hint: '借入があれば利息も毎月出ていきます。退職者が出た月は再採用コストも乗ります。',
            },
            {
                value: s.revenue,
                label: '実際の売上高',
                hint: '実績ではなく「最低限いくら必要か」を聞かれています。',
            },
        ], answer),
        solution:
            `${yen(s.salaryTotal)} ＋ ${yen(s.interest)} ＋ ${yen(s.fixedCost)} ＋ ${yen(s.attritionCost)} ` +
            `＝ ${yen(answer)}。実際の売上は ${yen(s.revenue)} だったので、` +
            (gap >= 0 ? `${yen(gap)} の余裕がありました。` : `${yen(-gap)} 足りていませんでした。`) +
            `この線を毎月頭に置いておくと、採用や増床の判断が変わります。`,
        source: { turn: s.turn, year: s.year, month: s.month },
    }
}

// ============================================
// 公開 API
// ============================================

/** 1つの決算スナップショットから問題一式を作る */
export function generateProblemsFromSnapshot(snapshot: FinanceSnapshot): DrillProblem[] {
    return [
        generateProfitProblem(snapshot),
        generateEquityRatioProblem(snapshot),
        generateBreakevenProblem(snapshot),
    ]
}

/**
 * ゲーム状態から最新の決算をもとにドリルを作る。
 * 決算がまだ無ければ空を返す（UI 側で「まず1ヶ月経営する」を出せる）。
 */
export function generateDrill(game: GameState): DrillProblem[] {
    const history = game.financeHistory
    if (!history || history.length === 0) return []
    return generateProblemsFromSnapshot(history[history.length - 1])
}

/** 入力値を採点する。中間値なら「どこで止まったか」を返す */
export function judgeAnswer(problem: DrillProblem, input: number): DrillJudgement {
    const tolerance = Math.max(Math.abs(problem.answer) * DRILL_TOLERANCE_RATIO, DRILL_TOLERANCE_MIN)
    if (Math.abs(input - problem.answer) <= tolerance) {
        return { verdict: 'correct' }
    }

    const trap = problem.traps.find(t => {
        const tol = Math.max(Math.abs(t.value) * DRILL_TOLERANCE_RATIO, DRILL_TOLERANCE_MIN)
        return Math.abs(input - t.value) <= tol
    })
    if (trap) return { verdict: 'trap', trap }

    return { verdict: 'wrong' }
}

/** 引き出しの表示名（UI 用の再エクスポート） */
export { DRAWERS }
