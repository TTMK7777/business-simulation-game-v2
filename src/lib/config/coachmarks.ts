// Sprint E: チュートリアル v2 - Coachmark 定義表
// 旧 TUTORIAL_STEPS (gameConfig.ts) の後継。順序進行はモーダル被り・別タブ
// targetElement で詰まるため、コンテキスト型 Coachmark に刷新 (plan.md 決定事項 2026-05-04)。
//
// 完了条件 (action):
//   - 'panel:<panelId>'   : 該当タブを開いた時 (renderers.showPanel が発火)
//   - 'hire_employee' 等  : ゲーム内アクション (旧 advanceTutorialByAction と同一の語彙)
//   - 未指定              : 「次へ」ボタンで進む
// targetSelector 未指定のものは中央カード (集中モード = backdrop あり)。

export interface CoachmarkReward {
    type: 'money' | 'brandPower'
    value: number
}

export interface CoachmarkDef {
    id: string
    emoji: string
    title: string
    description: string
    /** 指し示す要素。未指定なら中央カード (集中モード) */
    targetSelector?: string
    /** 完了条件。未指定なら「次へ」ボタン */
    action?: string
    reward?: CoachmarkReward
    /** 大きいほど優先 (既定 0)。条件発火型が割込むために使う */
    priority?: number
    /** 完了時に自動で enqueue する次の coachmark */
    next?: string
}

/** チュートリアル開始時の先頭 coachmark */
export const COACHMARK_ENTRY_ID = 'welcome'

/** 11 coachmark 定義 (welcome / 5タブ / 3+1アクション / cond_first_profit / complete) */
export const COACHMARKS: Record<string, CoachmarkDef> = {
    welcome: {
        id: 'welcome',
        emoji: '👋',
        title: 'ようこそ！',
        description: 'ビジネスエンパイアへようこそ！IT企業の経営者として成功を目指しましょう。',
        next: 'tab_hr',
    },
    tab_hr: {
        id: 'tab_hr',
        emoji: '👥',
        title: '人事タブを開こう',
        description: 'まずは人事タブへ。従業員がいないと製品を開発できません。',
        targetSelector: '.tab[data-panel="employees"]',
        action: 'panel:employees',
        next: 'action_hire',
    },
    action_hire: {
        id: 'action_hire',
        emoji: '🤝',
        title: '従業員を採用しよう',
        description: '「採用活動」から候補者を選んで採用しましょう。給与3ヶ月分が必要です。',
        // onclick 属性でなく data 属性で参照 (イベント配線の変更・Lit 化に耐性を持たせる)
        targetSelector: '[data-coachmark="hire"]',
        action: 'hire_employee',
        reward: { type: 'money', value: 100000 },
        next: 'tab_products',
    },
    tab_products: {
        id: 'tab_products',
        emoji: '📦',
        title: '製品タブを開こう',
        description: '製品タブでは新しい製品を開発できます。製品が売上の源泉です。',
        targetSelector: '.tab[data-panel="products"]',
        action: 'panel:products',
        next: 'action_develop',
    },
    action_develop: {
        id: 'action_develop',
        emoji: '🔧',
        title: '製品を開発しよう',
        description: '「新製品開発」で開発スタート。開発部の従業員2名以上が必要です。',
        targetSelector: '[data-coachmark="develop"]',
        action: 'develop_product',
        reward: { type: 'money', value: 200000 },
        next: 'tab_market',
    },
    tab_market: {
        id: 'tab_market',
        emoji: '📈',
        title: '市場を確認しよう',
        description: '市場タブでは競合の動向と自社シェアを確認できます。',
        targetSelector: '.tab[data-panel="market"]',
        action: 'panel:market',
        next: 'tab_finance',
    },
    tab_finance: {
        id: 'tab_finance',
        emoji: '💰',
        title: '財務を確認しよう',
        description: '財務タブで毎月の収支をチェック。資金がマイナスになると倒産です。',
        targetSelector: '.tab[data-panel="finance"]',
        action: 'panel:finance',
        next: 'action_end_turn',
    },
    action_end_turn: {
        id: 'action_end_turn',
        emoji: '⏩',
        title: 'ターンを進めよう',
        description: '「次のターンへ」で1週間が経過します。第4週の終わりに月次決算があります。',
        targetSelector: '#endTurnBtn',
        action: 'end_turn',
        reward: { type: 'brandPower', value: 1 },
        next: 'tab_certifications',
    },
    tab_certifications: {
        id: 'tab_certifications',
        emoji: '🎓',
        title: '資格を活用しよう',
        description: '資格タブでは従業員に資格を取らせて能力を伸ばせます。',
        targetSelector: '.tab[data-panel="certifications"]',
        action: 'panel:certifications',
        next: 'complete',
    },
    cond_first_profit: {
        id: 'cond_first_profit',
        emoji: '🎊',
        title: '初黒字達成！',
        description: '月次決算が黒字になりました！この調子で事業を拡大しましょう。',
        priority: 5,
        reward: { type: 'money', value: 300000 },
    },
    complete: {
        id: 'complete',
        emoji: '🎉',
        title: 'チュートリアル完了！',
        description: 'これで基本操作は完了です。市場シェアを拡大し、業界トップを目指しましょう！',
        reward: { type: 'money', value: 500000 },
    },
}
