// ビジネスエンパイア 2.0 - 性格・特性定義
// game.ts:42-317 から抽出

import type { PersonalityDef, SubTraitDef, TemperamentTraitDef, HiddenTraitDef, Temperament } from '../types'

// Phase 1: 15種類の基本性格定義
export const PERSONALITIES: Record<string, PersonalityDef> = {
    passionate: {
        name: '情熱家',
        emoji: '🔥',
        effects: { developmentSpeed: 1.2 },
        compatible: ['optimist', 'charismatic'],
        incompatible: ['cautious']
    },
    logical: {
        name: '論理思考型',
        emoji: '🧠',
        effects: { bugRate: 0.7 },
        compatible: ['perfectionist', 'researcher'],
        incompatible: ['intuitive']
    },
    cooperative: {
        name: '協調性重視',
        emoji: '🤝',
        effects: { teamEfficiency: 1.15 },
        compatible: ['passionate', 'optimist'],
        incompatible: ['lone_genius']
    },
    ambitious: {
        name: '野心家',
        emoji: '💼',
        effects: { promotionDesire: 1.3 },
        compatible: ['strategist'],
        incompatible: ['cooperative']
    },
    charismatic: {
        name: 'カリスマ',
        emoji: '🌟',
        effects: { salesPower: 1.25 },
        compatible: ['passionate', 'optimist'],
        incompatible: ['introverted']
    },
    perfectionist: {
        name: '完璧主義者',
        emoji: '🎯',
        effects: { quality: 1.2, speed: 0.9 },
        compatible: ['logical', 'researcher'],
        incompatible: ['optimist']
    },
    action_oriented: {
        name: '行動派',
        emoji: '🚀',
        effects: { decisionSpeed: 1.2 },
        compatible: ['intuitive'],
        incompatible: ['cautious']
    },
    researcher: {
        name: '研究者気質',
        emoji: '📚',
        effects: { learningSpeed: 1.3 },
        compatible: ['logical', 'introverted'],
        incompatible: ['action_oriented']
    },
    optimist: {
        name: '楽観主義者',
        emoji: '😊',
        effects: { stressResistance: 1.2 },
        compatible: ['passionate', 'charismatic'],
        incompatible: ['perfectionist']
    },
    cautious: {
        name: '慎重派',
        emoji: '🔒',
        effects: { riskManagement: 1.25 },
        compatible: ['strategist', 'perfectionist'],
        incompatible: ['action_oriented', 'passionate']
    },
    creative: {
        name: 'クリエイター',
        emoji: '🎨',
        effects: { creativity: 1.3 },
        compatible: ['intuitive'],
        incompatible: ['logical']
    },
    intuitive: {
        name: '直感型',
        emoji: '⚡',
        effects: { inspirationRate: 1.2 },
        compatible: ['creative', 'action_oriented'],
        incompatible: ['logical', 'cautious']
    },
    introverted: {
        name: '内向的',
        emoji: '🧘',
        effects: { soloWork: 1.25 },
        compatible: ['researcher'],
        incompatible: ['charismatic', 'cooperative']
    },
    lone_genius: {
        name: '孤高の天才',
        emoji: '🏔️',
        effects: { ability: 1.4, cooperation: 0.5 },
        compatible: [],
        incompatible: ['cooperative', 'charismatic']
    },
    strategist: {
        name: '戦略家',
        emoji: '🗺️',
        effects: { projectSuccess: 1.15 },
        compatible: ['cautious', 'ambitious'],
        incompatible: ['intuitive']
    }
}

// Phase 2: サブ特性20種類定義
export const SUB_TRAITS: Record<string, SubTraitDef> = {
    // 開発系
    code_reviewer: { name: 'コードレビュアー', emoji: '🔍', effect: 'バグ発見率+40%' },
    debugger: { name: 'デバッガー', emoji: '🐛', effect: 'バグ修正速度+50%' },
    architect: { name: 'アーキテクト', emoji: '🏗️', effect: '大規模開発で能力1.5倍' },
    rapid_dev: { name: '速攻開発', emoji: '⚡', effect: '小規模開発を1ターンで完了' },

    // アイデア系
    inspiration: { name: 'ひらめき', emoji: '💡', effect: '月1回、画期的機能を思いつく' },
    trend_catcher: { name: 'トレンドキャッチャー', emoji: '📡', effect: '市場ニーズ予測+30%' },
    tech_foresight: { name: '技術先読み', emoji: '🔮', effect: '新技術登場を2ターン前に察知' },

    // 対人系
    mentor: { name: 'メンター', emoji: '👨‍🏫', effect: '新人育成速度+50%' },
    mediator: { name: '調停者', emoji: '⚖️', effect: 'チーム対立を解消' },
    networker: { name: 'ネットワーカー', emoji: '🌐', effect: '外部人脈で情報入手' },

    // 精神系
    steel_mind: { name: '鋼のメンタル', emoji: '🛡️', effect: 'デスマーチでも能力低下なし' },
    crunch_resistant: { name: 'クランチ耐性', emoji: '💪', effect: '残業続きでも健康維持' },
    pressure_converter: { name: 'プレッシャー変換', emoji: '⚡', effect: '締切直前に能力+30%' },

    // ネガティブ特性
    easily_bored: { name: '飽き性', emoji: '😑', effect: '3ヶ月で能力-20%', negative: true },
    morning_weak: { name: '朝が苦手', emoji: '😴', effect: '午前中の作業効率-30%', negative: true },
    over_perfectionist: { name: '完璧主義すぎる', emoji: '⏰', effect: '納期遅延リスク+20%', negative: true },

    // その他
    fast_learner: { name: '早習得', emoji: '📖', effect: '研修効果+50%' },
    cost_conscious: { name: 'コスト意識', emoji: '💰', effect: '無駄な支出を15%削減' },
    health_conscious: { name: '健康志向', emoji: '🥗', effect: '病欠リスク-50%' },
    night_owl: { name: '夜型人間', emoji: '🦉', effect: '深夜作業で能力+20%' }
}

// Phase 2.5: 気質パラメータ定義（8項目）
export const TEMPERAMENT_TRAITS: Record<string, TemperamentTraitDef> = {
    boldness: {
        name: '大胆さ',
        emoji: '🎲',
        description: '新しい挑戦やリスクを恐れない度合い',
        effects: '新製品開発時のボーナス、失敗時のダメージ軽減'
    },
    bravery: {
        name: '勇敢さ',
        emoji: '⚔️',
        description: '困難や危機に立ち向かう力',
        effects: 'プレッシャー下でのパフォーマンス向上、納期間近の効率UP'
    },
    cooperation: {
        name: '協調性',
        emoji: '🤝',
        description: 'チームワークや他者との協力を重視',
        effects: 'チームボーナス増加、部署効率UP、相性判定に影響'
    },
    creativity: {
        name: '創造性',
        emoji: '💡',
        description: '斬新な発想やアイデアを生み出す力',
        effects: '企画職・開発職での効率ボーナス、イノベーション確率UP'
    },
    conscientiousness: {
        name: '誠実性',
        emoji: '📝',
        description: '責任感・真面目さ・コツコツ努力する傾向',
        effects: '品質向上、バグ率低減、長期プロジェクトでのボーナス'
    },
    emotionalStability: {
        name: '感情安定性',
        emoji: '🧘',
        description: 'ストレス耐性、情緒の安定',
        effects: '残業時の効率低下を軽減、長期勤務でのモチベーション維持'
    },
    sociability: {
        name: '社交性',
        emoji: '🗣️',
        description: '他者との交流やコミュニケーション能力',
        effects: '営業職での効率ボーナス、顧客満足度UP、採用活動補助'
    },
    cautiousness: {
        name: '慎重さ',
        emoji: '🔍',
        description: 'リスク回避、計画的な行動',
        effects: 'バグ率低減、プロジェクト失敗率減少、管理職向き'
    }
}

// 気質パラメータ生成関数
export function generateTemperament(personalityKey: string | null = null): Temperament {
    // 基本値（0-100でランダム）
    const base: Temperament = {
        boldness: 30 + Math.floor(Math.random() * 50),
        bravery: 30 + Math.floor(Math.random() * 50),
        cooperation: 30 + Math.floor(Math.random() * 50),
        creativity: 30 + Math.floor(Math.random() * 50),
        conscientiousness: 30 + Math.floor(Math.random() * 50),
        emotionalStability: 30 + Math.floor(Math.random() * 50),
        sociability: 30 + Math.floor(Math.random() * 50),
        cautiousness: 30 + Math.floor(Math.random() * 50)
    }

    // 性格タイプによる補正
    if (personalityKey && PERSONALITIES[personalityKey]) {
        const adjustments: Record<string, Record<string, number>> = {
            passionate: { boldness: 20, cautiousness: -15, emotionalStability: -10 },
            logical: { creativity: -10, conscientiousness: 15, cautiousness: 20 },
            cooperative: { cooperation: 25, sociability: 15 },
            ambitious: { boldness: 25, cooperation: -15 },
            charismatic: { sociability: 25, bravery: 15 },
            perfectionist: { conscientiousness: 25, cautiousness: 20, boldness: -10 },
            action_oriented: { boldness: 20, cautiousness: -20, bravery: 15 },
            researcher: { creativity: 15, sociability: -15, cautiousness: 10 },
            optimist: { emotionalStability: 20, bravery: 10 },
            cautious: { cautiousness: 25, boldness: -20 },
            creative: { creativity: 30, conscientiousness: -10 },
            intuitive: { creativity: 20, cautiousness: -15 },
            introverted: { sociability: -25, emotionalStability: 10 },
            lone_genius: { sociability: -30, cooperation: -20, creativity: 25 },
            strategist: { cautiousness: 20, conscientiousness: 15 }
        }

        const adjustment = adjustments[personalityKey]
        if (adjustment) {
            Object.keys(adjustment).forEach(key => {
                (base as any)[key] = Math.max(0, Math.min(100, (base as any)[key] + adjustment[key]))
            })
        }
    }

    return base
}

// Phase 2: 隠れ特性5種類定義
export const HIDDEN_TRAITS: Record<string, HiddenTraitDef> = {
    latent_leader: {
        name: '潜在リーダー',
        emoji: '🔥',
        effect: '6ヶ月後、突然マネジメント能力開花',
        revealTurn: 24
    },
    late_bloomer: {
        name: '大器晩成',
        emoji: '💎',
        effect: '1年後に能力+50%',
        revealTurn: 48
    },
    burnout_prone: {
        name: '燃え尽き症候群',
        emoji: '🔥➡️💨',
        effect: '成功後に突然退職リスク',
        revealTurn: 36,
        negative: true
    },
    self_taught: {
        name: '独学の天才',
        emoji: '🎓',
        effect: '研修なしで勝手にスキルアップ',
        revealTurn: 12
    },
    inconsistent: {
        name: 'ムラがある',
        emoji: '🌊',
        effect: '月ごとに能力が20-120%で変動',
        revealTurn: 8,
        negative: true
    }
}
