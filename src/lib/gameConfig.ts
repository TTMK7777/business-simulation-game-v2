// ゲーム設定ファイル - フェーズ1実装
// 難易度設定、競合AI、ニューステンプレートを集約

// ============================================
// 難易度設定
// ============================================
export type DifficultyLevel = 'easy' | 'normal' | 'hard';

export interface DifficultyConfig {
    name: string;
    emoji: string;
    description: string;
    startingMoney: number;
    competitorAggressiveness: number; // 0.5 = 穏やか, 1.0 = 通常, 1.5 = 激しい
    marketGrowthRate: number;
    eventFrequency: number; // ランダムイベント発生頻度
    poachingRisk: number; // 引き抜きリスク
}

export const DIFFICULTY_SETTINGS: Record<DifficultyLevel, DifficultyConfig> = {
    easy: {
        name: 'イージー',
        emoji: '😊',
        description: '初心者向け。資金2倍、競合は穏やか',
        startingMoney: 20000000,
        competitorAggressiveness: 0.5,
        marketGrowthRate: 1.2,
        eventFrequency: 0.7,
        poachingRisk: 0.3
    },
    normal: {
        name: 'ノーマル',
        emoji: '💼',
        description: '標準的な難易度。バランスの取れた挑戦',
        startingMoney: 10000000,
        competitorAggressiveness: 1.0,
        marketGrowthRate: 1.0,
        eventFrequency: 1.0,
        poachingRisk: 0.6
    },
    hard: {
        name: 'ハード',
        emoji: '🔥',
        description: '上級者向け。資金半分、競合は攻撃的',
        startingMoney: 5000000,
        competitorAggressiveness: 1.5,
        marketGrowthRate: 0.8,
        eventFrequency: 1.3,
        poachingRisk: 0.9
    }
};

// ============================================
// 競合AI企業の詳細設定
// ============================================
export type CompetitorStrategy = 'aggressive' | 'balanced' | 'defensive' | 'innovative';

export interface CompetitorCEO {
    name: string;
    emoji: string;
    quote: string;
}

export interface CompetitorConfig {
    id: string;
    name: string;
    ceo: CompetitorCEO;
    strategy: CompetitorStrategy;
    initialShare: number;
    power: number;
    speciality: string;
    color: string;
    // 動的状態
    alertLevel: number; // 0-100: プレイヤーへの警戒度
    lastAction: string;
    actionCooldown: number;
    share?: number; // 現在の市場シェア（実行時に動的に設定される）
}

export const COMPETITOR_STRATEGIES: Record<CompetitorStrategy, {
    name: string;
    emoji: string;
    description: string;
    shareGrowthRate: number;
    poachingChance: number;
    priceWarChance: number;
    marketingChance: number;
}> = {
    aggressive: {
        name: '攻撃的',
        emoji: '⚔️',
        description: '積極的にシェア拡大を狙う',
        shareGrowthRate: 1.5,
        poachingChance: 0.3,
        priceWarChance: 0.4,
        marketingChance: 0.2
    },
    balanced: {
        name: 'バランス型',
        emoji: '⚖️',
        description: '状況に応じた柔軟な戦略',
        shareGrowthRate: 1.0,
        poachingChance: 0.15,
        priceWarChance: 0.2,
        marketingChance: 0.3
    },
    defensive: {
        name: '守備的',
        emoji: '🛡️',
        description: '既存シェアの維持を重視',
        shareGrowthRate: 0.7,
        poachingChance: 0.05,
        priceWarChance: 0.1,
        marketingChance: 0.15
    },
    innovative: {
        name: '革新的',
        emoji: '🚀',
        description: '技術革新で市場を切り拓く',
        shareGrowthRate: 1.2,
        poachingChance: 0.2,
        priceWarChance: 0.1,
        marketingChance: 0.4
    }
};

export const DEFAULT_COMPETITORS: CompetitorConfig[] = [
    {
        id: 'techcorp',
        name: 'テックコープ',
        ceo: {
            name: '田中 剛志',
            emoji: '👔',
            quote: '勝つためには手段を選ばない'
        },
        strategy: 'aggressive',
        initialShare: 35,
        power: 100,
        speciality: '大規模システム開発',
        color: '#e74c3c',
        alertLevel: 0,
        lastAction: '',
        actionCooldown: 0
    },
    {
        id: 'digitalworks',
        name: 'デジタルワークス',
        ceo: {
            name: '鈴木 智子',
            emoji: '👩‍💼',
            quote: 'バランスこそが成功の鍵'
        },
        strategy: 'balanced',
        initialShare: 29,
        power: 85,
        speciality: 'Web・モバイル開発',
        color: '#3498db',
        alertLevel: 0,
        lastAction: '',
        actionCooldown: 0
    },
    {
        id: 'cybersoft',
        name: 'サイバーソフト',
        ceo: {
            name: '山田 孝志',
            emoji: '🧓',
            quote: '堅実な経営が一番だ'
        },
        strategy: 'defensive',
        initialShare: 22,
        power: 70,
        speciality: '業務システム保守',
        color: '#2ecc71',
        alertLevel: 0,
        lastAction: '',
        actionCooldown: 0
    },
    {
        id: 'innovatech',
        name: 'イノバテック',
        ceo: {
            name: '佐藤 未来',
            emoji: '👨‍🔬',
            quote: '技術で世界を変える'
        },
        strategy: 'innovative',
        initialShare: 10,
        power: 60,
        speciality: 'AI・先端技術',
        color: '#9b59b6',
        alertLevel: 0,
        lastAction: '',
        actionCooldown: 0
    }
];

// ============================================
// 業界ニュースシステム（強化版）
// ============================================
export type NewsCategory = 'market' | 'competitor' | 'technology' | 'economy' | 'player' | 'event';

export interface NewsTemplate {
    category: NewsCategory;
    emoji: string;
    template: string;
    impact: 'positive' | 'negative' | 'neutral';
    conditions?: {
        minPlayerShare?: number;
        maxPlayerShare?: number;
        minTurn?: number;
        competitorStrategy?: CompetitorStrategy;
    };
}

export const NEWS_TEMPLATES: NewsTemplate[] = [
    // 市場ニュース
    { category: 'market', emoji: '📈', template: 'IT業界に追い風！政府のDX推進で市場拡大', impact: 'positive' },
    { category: 'market', emoji: '📉', template: '景気減速の兆し、IT投資に慎重ムード広がる', impact: 'negative' },
    { category: 'market', emoji: '🔥', template: 'スタートアップブーム到来！新規参入が相次ぐ', impact: 'neutral' },
    { category: 'market', emoji: '💹', template: 'IT人材の需要が過去最高を記録', impact: 'positive' },
    { category: 'market', emoji: '⚠️', template: '円安の影響でIT機器のコストが上昇', impact: 'negative' },

    // 競合ニュース
    { category: 'competitor', emoji: '🏢', template: '${company}が新製品を発表！業界に衝撃', impact: 'neutral' },
    { category: 'competitor', emoji: '📊', template: '${company}の売上が${percent}%増加', impact: 'neutral' },
    { category: 'competitor', emoji: '💼', template: '${company}が大型買収を検討中', impact: 'neutral' },
    { category: 'competitor', emoji: '🎯', template: '${company}のCEO「市場シェア拡大を目指す」', impact: 'neutral' },
    { category: 'competitor', emoji: '⚔️', template: '${company}が価格競争を仕掛ける！', impact: 'negative', conditions: { competitorStrategy: 'aggressive' } },
    { category: 'competitor', emoji: '🎖️', template: '${company}が業界表彰を受賞', impact: 'neutral' },

    // 技術ニュース
    { category: 'technology', emoji: '🤖', template: 'AI技術革命！生成AI市場が急拡大', impact: 'positive' },
    { category: 'technology', emoji: '☁️', template: 'クラウドサービスの需要が急増中', impact: 'positive' },
    { category: 'technology', emoji: '🔒', template: 'サイバーセキュリティの重要性が高まる', impact: 'neutral' },
    { category: 'technology', emoji: '📱', template: 'モバイルファースト時代、アプリ開発が活況', impact: 'positive' },
    { category: 'technology', emoji: '⚡', template: '新技術の登場で市場が活性化', impact: 'positive' },

    // 経済ニュース
    { category: 'economy', emoji: '💰', template: 'ベンチャー投資が活発化、資金調達しやすい環境に', impact: 'positive' },
    { category: 'economy', emoji: '📉', template: '金利上昇で企業の借入コスト増加', impact: 'negative' },
    { category: 'economy', emoji: '🏛️', template: '政府がIT産業支援策を発表', impact: 'positive' },
    { category: 'economy', emoji: '🌍', template: '海外IT企業の日本市場参入が加速', impact: 'negative' },

    // プレイヤー関連（条件付き）
    { category: 'player', emoji: '🌟', template: '新興企業が急成長！業界の注目を集める', impact: 'positive', conditions: { minPlayerShare: 5 } },
    { category: 'player', emoji: '🚀', template: '躍進するスタートアップ、大手も警戒', impact: 'positive', conditions: { minPlayerShare: 10 } },
    { category: 'player', emoji: '👀', template: '${company}が新興企業の動向を注視', impact: 'neutral', conditions: { minPlayerShare: 15 } },
    { category: 'player', emoji: '⚠️', template: '大手企業が新興勢力への対抗策を検討', impact: 'negative', conditions: { minPlayerShare: 20 } },

    // イベントニュース
    { category: 'event', emoji: '🏆', template: 'IT企業ランキング発表！上位は大きく変動', impact: 'neutral' },
    { category: 'event', emoji: '📰', template: '業界専門誌が今年のトレンドを予測', impact: 'neutral' },
    { category: 'event', emoji: '🎓', template: 'IT人材育成のための産学連携が活発化', impact: 'positive' }
];

// 競合からの攻撃アクション
export const COMPETITOR_ACTIONS = {
    poaching: {
        name: '引き抜き攻勢',
        emoji: '🎯',
        description: '${company}があなたの優秀な社員に接触しています！',
        effect: 'employee_risk'
    },
    priceWar: {
        name: '価格競争',
        emoji: '💸',
        description: '${company}が大幅値下げを開始！市場シェアに影響',
        effect: 'share_decrease'
    },
    marketing: {
        name: 'マーケティング攻勢',
        emoji: '📺',
        description: '${company}が大規模広告キャンペーンを展開',
        effect: 'brand_decrease'
    },
    partnership: {
        name: '提携戦略',
        emoji: '🤝',
        description: '${company}が有力企業との提携を発表',
        effect: 'competitor_boost'
    }
};

// ============================================
// ゲーム定数
// ============================================
export const GAME_CONSTANTS = {
    MAX_SAVE_SLOTS: 3,
    LOAN_AMOUNT: 5000000,
    LOAN_INTEREST_RATE: 0.02,
    BASE_SALARY: 300000,
    MIN_EMPLOYEES_FOR_PRODUCT: 2,
    PRODUCT_DEVELOPMENT_COST: 2000000,
    SAVE_KEY: 'businessEmpire'
};

// 旧形式ニューステンプレート（互換性のため）
export const legacyNewsTemplates = [
    '${company}が新製品を発表！業界に衝撃',
    '${company}の売上が${percent}%増加',
    'IT業界の成長率が${percent}%に',
    '${company}が大型買収を検討中',
    '新技術の登場で市場が活性化',
    '${company}のCEOが今後の戦略を語る',
    'スタートアップ企業の参入が相次ぐ'
];

// ============================================
// ゲームバランス調整パラメータ（Phase 2）
// ============================================
export const BALANCE_CONFIG = {
    // === 経済バランス ===
    economy: {
        // 製品売上計算
        productRevenueMultiplier: 10000,      // 品質1あたりの売上（デフォルト: 10000）
        productRevenueBase: 50000,            // 製品の最低売上保証
        marketShareRevenueBonus: 0.02,        // 市場シェア1%あたりの売上ボーナス率
        brandPowerRevenueBonus: 0.05,         // ブランド力1あたりの売上ボーナス率

        // 給与関連
        baseSalary: 300000,                   // 基本給（新人）
        salaryGrowthRate: 0.15,               // 昇進時の給与上昇率
        qualificationSalaryBonus: 0.1,        // 資格1つあたりの給与ボーナス率

        // 融資
        loanAmount: 5000000,                  // 1回の融資額
        loanInterestRate: 0.02,               // 月利
        maxLoans: 5,                          // 最大借入回数

        // 製品開発
        productDevelopmentCost: 2000000,      // 製品開発コスト
        productQualityBase: 30,               // 品質の基準値
        productQualityVariance: 20,           // 品質のばらつき
    },

    // === 採用バランス ===
    recruitment: {
        normalBudget: 300000,                 // 通常採用予算
        aggressiveBudget: 600000,             // 積極採用予算
        headhuntBudget: 1000000,              // ヘッドハント予算
        interviewCost: 50000,                 // 面接コスト/人

        // 候補者生成
        candidatesPerBudget: {
            normal: 3,
            aggressive: 5,
            headhunt: 4
        },
        eliteCandidateChance: {
            normal: 0.05,
            aggressive: 0.1,
            headhunt: 0.25
        },
        eliteAbilityBonus: 20,                // エリート候補者の能力ボーナス
    },

    // === 成長バランス ===
    growth: {
        // 経験値と成長
        expPerTurn: 10,                       // 1ターンあたりの基本経験値
        expForPromotion: 100,                 // 昇進に必要な経験値
        skillGrowthRate: 0.5,                 // スキル成長率

        // 市場シェア
        baseShareGrowth: 0.1,                 // 基本シェア成長率
        productShareBonus: 0.5,               // 製品1つあたりのシェアボーナス
        maxPlayerShare: 60,                   // プレイヤーの最大シェア

        // ブランド力
        brandGrowthFromProduct: 1,            // 製品開発時のブランド上昇
        brandGrowthFromMarketing: 2,          // マーケティング時のブランド上昇
        maxBrandPower: 100,                   // ブランド力上限
    },

    // === 難易度別調整係数 ===
    difficultyMultipliers: {
        easy: {
            revenueMultiplier: 1.3,           // 売上1.3倍
            costMultiplier: 0.8,              // コスト0.8倍
            growthMultiplier: 1.2,            // 成長1.2倍
            competitorStrength: 0.7           // 競合の強さ0.7倍
        },
        normal: {
            revenueMultiplier: 1.0,
            costMultiplier: 1.0,
            growthMultiplier: 1.0,
            competitorStrength: 1.0
        },
        hard: {
            revenueMultiplier: 0.8,           // 売上0.8倍
            costMultiplier: 1.2,              // コスト1.2倍
            growthMultiplier: 0.8,            // 成長0.8倍
            competitorStrength: 1.3           // 競合の強さ1.3倍
        }
    },

    // === イベント発生率 ===
    events: {
        positiveEventChance: 0.15,            // ポジティブイベント発生率
        negativeEventChance: 0.1,             // ネガティブイベント発生率
        bigContractChance: 0.05,              // 大口契約の発生率
        techBreakthroughChance: 0.03,         // 技術革新の発生率
        employeeResignChance: 0.02,           // 従業員退職の基本確率（モチベーション連動）
    },

    // === 従業員モチベーション ===
    motivation: {
        baseMotivation: 80,                   // 初期モチベーション
        minMotivation: 10,                    // 最低モチベーション
        maxMotivation: 100,                   // 最高モチベーション
        salaryImpact: 0.1,                    // 給与のモチベーション影響度
        overworkPenalty: 5,                   // 残業時のモチベーション低下
        promotionBonus: 15,                   // 昇進時のモチベーション上昇
        praiseBonus: 10,                      // 称賛時のモチベーション上昇
    }
};

// バランス調整のヘルパー関数
export function getBalanceValue(path: string, difficulty: DifficultyLevel = 'normal'): number {
    const parts = path.split('.');
    let value: any = BALANCE_CONFIG;

    for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
            value = value[part];
        } else {
            console.warn(`[Balance] Unknown path: ${path}`);
            return 0;
        }
    }

    // 難易度別調整を適用
    const multipliers = BALANCE_CONFIG.difficultyMultipliers[difficulty];
    if (path.includes('revenue') || path.includes('Revenue')) {
        return value * multipliers.revenueMultiplier;
    }
    if (path.includes('cost') || path.includes('Cost') || path.includes('salary') || path.includes('Salary')) {
        return value * multipliers.costMultiplier;
    }
    if (path.includes('growth') || path.includes('Growth')) {
        return value * multipliers.growthMultiplier;
    }

    return value;
}

// ============================================
// デバッグ・調整用機能（Phase 2）
// ============================================
export const DEBUG_CONFIG = {
    enabled: false,                           // デバッグモード
    showBalanceLog: false,                    // バランス計算ログ表示
    showEventLog: true,                       // イベントログ表示
    showCompetitorLog: false,                 // 競合動向ログ表示
    fastMode: false,                          // 高速モード（アニメーションスキップ）
    unlimitedMoney: false,                    // 無限資金モード
    noCompetitorAttacks: false,               // 競合攻撃無効化
};

// デバッグログ出力
export function debugLog(category: string, message: string, data?: any) {
    if (!DEBUG_CONFIG.enabled) return;

    const categoryConfigs: Record<string, boolean> = {
        balance: DEBUG_CONFIG.showBalanceLog,
        event: DEBUG_CONFIG.showEventLog,
        competitor: DEBUG_CONFIG.showCompetitorLog,
    };

    if (categoryConfigs[category] !== false) {
        console.log(`[${category.toUpperCase()}] ${message}`, data || '');
    }
}

// ============================================
// 実績・トロフィーシステム（Phase 2）
// ============================================
export type AchievementCategory = 'money' | 'employees' | 'products' | 'market' | 'special';
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    emoji: string;
    category: AchievementCategory;
    rarity: AchievementRarity;
    condition: {
        type: string;
        value: number;
        comparison?: 'gte' | 'lte' | 'eq';
    };
    reward?: {
        type: 'money' | 'brandPower' | 'motivation';
        value: number;
    };
    hidden?: boolean; // 隠し実績
}

export const ACHIEVEMENT_RARITIES: Record<AchievementRarity, {
    name: string;
    color: string;
    bgColor: string;
}> = {
    common: { name: 'コモン', color: '#6c757d', bgColor: '#f8f9fa' },
    uncommon: { name: 'アンコモン', color: '#28a745', bgColor: '#e8f5e9' },
    rare: { name: 'レア', color: '#007bff', bgColor: '#e3f2fd' },
    epic: { name: 'エピック', color: '#6f42c1', bgColor: '#f3e5f5' },
    legendary: { name: 'レジェンダリー', color: '#fd7e14', bgColor: '#fff3e0' }
};

export const ACHIEVEMENTS: Achievement[] = [
    // === 資金系 ===
    {
        id: 'first_profit',
        name: '初めての黒字',
        description: '月次決算で初めて黒字を達成',
        emoji: '💰',
        category: 'money',
        rarity: 'common',
        condition: { type: 'monthly_profit', value: 1, comparison: 'gte' },
        reward: { type: 'brandPower', value: 1 }
    },
    {
        id: 'millionaire',
        name: '1000万円達成',
        description: '資金が1000万円を超えた',
        emoji: '💵',
        category: 'money',
        rarity: 'common',
        condition: { type: 'money', value: 10000000, comparison: 'gte' }
    },
    {
        id: 'ten_millionaire',
        name: '1億円達成',
        description: '資金が1億円を超えた',
        emoji: '💎',
        category: 'money',
        rarity: 'rare',
        condition: { type: 'money', value: 100000000, comparison: 'gte' },
        reward: { type: 'brandPower', value: 5 }
    },
    {
        id: 'debt_free',
        name: '無借金経営',
        description: '借金なしで資金5000万円以上',
        emoji: '🏦',
        category: 'money',
        rarity: 'epic',
        condition: { type: 'debt_free_rich', value: 50000000, comparison: 'gte' },
        reward: { type: 'brandPower', value: 10 }
    },

    // === 従業員系 ===
    {
        id: 'first_hire',
        name: '初めての採用',
        description: '最初の従業員を採用した',
        emoji: '👤',
        category: 'employees',
        rarity: 'common',
        condition: { type: 'employees', value: 2, comparison: 'gte' }
    },
    {
        id: 'team_of_ten',
        name: '10人のチーム',
        description: '従業員が10人になった',
        emoji: '👥',
        category: 'employees',
        rarity: 'uncommon',
        condition: { type: 'employees', value: 10, comparison: 'gte' },
        reward: { type: 'motivation', value: 5 }
    },
    {
        id: 'large_company',
        name: '大企業への道',
        description: '従業員が50人になった',
        emoji: '🏢',
        category: 'employees',
        rarity: 'rare',
        condition: { type: 'employees', value: 50, comparison: 'gte' },
        reward: { type: 'brandPower', value: 5 }
    },
    {
        id: 'elite_team',
        name: 'エリート集団',
        description: '全従業員の平均能力が80以上',
        emoji: '⭐',
        category: 'employees',
        rarity: 'epic',
        condition: { type: 'avg_ability', value: 80, comparison: 'gte' },
        reward: { type: 'brandPower', value: 10 }
    },

    // === 製品系 ===
    {
        id: 'first_product',
        name: '初めての製品',
        description: '最初の製品を開発した',
        emoji: '📦',
        category: 'products',
        rarity: 'common',
        condition: { type: 'products', value: 1, comparison: 'gte' }
    },
    {
        id: 'product_lineup',
        name: '製品ラインナップ',
        description: '5つの製品を開発した',
        emoji: '📚',
        category: 'products',
        rarity: 'uncommon',
        condition: { type: 'products', value: 5, comparison: 'gte' }
    },
    {
        id: 'quality_master',
        name: '品質マスター',
        description: '品質100の製品を開発',
        emoji: '🏆',
        category: 'products',
        rarity: 'rare',
        condition: { type: 'max_quality', value: 100, comparison: 'gte' },
        reward: { type: 'brandPower', value: 5 }
    },
    {
        id: 'bestseller',
        name: 'ベストセラー',
        description: '1つの製品で売上1億円達成',
        emoji: '🎯',
        category: 'products',
        rarity: 'epic',
        condition: { type: 'product_sales', value: 100000000, comparison: 'gte' },
        reward: { type: 'money', value: 5000000 }
    },

    // === 市場系 ===
    {
        id: 'market_entry',
        name: '市場参入',
        description: '市場シェア1%達成',
        emoji: '📊',
        category: 'market',
        rarity: 'common',
        condition: { type: 'marketShare', value: 1, comparison: 'gte' }
    },
    {
        id: 'rising_star',
        name: 'ライジングスター',
        description: '市場シェア10%達成',
        emoji: '🌟',
        category: 'market',
        rarity: 'uncommon',
        condition: { type: 'marketShare', value: 10, comparison: 'gte' },
        reward: { type: 'brandPower', value: 3 }
    },
    {
        id: 'market_leader',
        name: 'マーケットリーダー',
        description: '市場シェア30%達成',
        emoji: '👑',
        category: 'market',
        rarity: 'rare',
        condition: { type: 'marketShare', value: 30, comparison: 'gte' },
        reward: { type: 'brandPower', value: 10 }
    },
    {
        id: 'market_dominator',
        name: '市場支配者',
        description: '市場シェア50%達成',
        emoji: '🏰',
        category: 'market',
        rarity: 'legendary',
        condition: { type: 'marketShare', value: 50, comparison: 'gte' },
        reward: { type: 'money', value: 10000000 }
    },

    // === 特殊系 ===
    {
        id: 'survivor',
        name: 'サバイバー',
        description: '12ヶ月（12ターン）生き残った',
        emoji: '🎖️',
        category: 'special',
        rarity: 'uncommon',
        condition: { type: 'turns', value: 12, comparison: 'gte' }
    },
    {
        id: 'veteran',
        name: 'ベテラン経営者',
        description: '36ヶ月（36ターン）経営を続けた',
        emoji: '🎗️',
        category: 'special',
        rarity: 'rare',
        condition: { type: 'turns', value: 36, comparison: 'gte' },
        reward: { type: 'brandPower', value: 5 }
    },
    {
        id: 'brand_master',
        name: 'ブランドマスター',
        description: 'ブランド力50達成',
        emoji: '✨',
        category: 'special',
        rarity: 'rare',
        condition: { type: 'brandPower', value: 50, comparison: 'gte' }
    },
    {
        id: 'office_max',
        name: '本社ビル',
        description: 'オフィスレベル5達成',
        emoji: '🏙️',
        category: 'special',
        rarity: 'legendary',
        condition: { type: 'officeLevel', value: 5, comparison: 'gte' },
        reward: { type: 'money', value: 20000000 }
    },

    // === 隠し実績 ===
    {
        id: 'comeback',
        name: 'カムバック',
        description: '資金が100万円以下から1000万円に復活',
        emoji: '🔥',
        category: 'special',
        rarity: 'epic',
        condition: { type: 'comeback', value: 10000000, comparison: 'gte' },
        hidden: true,
        reward: { type: 'brandPower', value: 10 }
    },
    {
        id: 'speed_runner',
        name: 'スピードランナー',
        description: '6ターン以内に市場シェア10%達成',
        emoji: '⚡',
        category: 'special',
        rarity: 'legendary',
        condition: { type: 'speed_share', value: 10, comparison: 'gte' },
        hidden: true,
        reward: { type: 'money', value: 5000000 }
    }
];

// ============================================
// チュートリアルシステム（Phase 2）
// ============================================
export interface TutorialStep {
    id: string;
    title: string;
    description: string;
    emoji: string;
    targetElement?: string; // ハイライトする要素のセレクター
    action?: string; // 完了条件のアクション
    reward?: {
        type: 'money' | 'brandPower';
        value: number;
    };
}

export const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 'welcome',
        title: 'ようこそ！',
        description: 'ビジネスエンパイアへようこそ！IT企業の経営者として成功を目指しましょう。',
        emoji: '👋'
    },
    {
        id: 'overview',
        title: '概要タブ',
        description: '概要タブでは、会社の現在の状態を確認できます。資金、従業員数、売上などが表示されています。',
        emoji: '📊',
        targetElement: '.tab[data-panel="overview"]'
    },
    {
        id: 'hire_first',
        title: '従業員を採用しよう',
        description: '人事タブで従業員を採用しましょう。従業員がいないと製品を開発できません。',
        emoji: '👥',
        targetElement: '.tab[data-panel="employees"]',
        action: 'hire_employee',
        reward: { type: 'money', value: 100000 }
    },
    {
        id: 'develop_product',
        title: '製品を開発しよう',
        description: '製品タブで新しい製品を開発しましょう。製品を販売することで売上が発生します。',
        emoji: '📦',
        targetElement: '.tab[data-panel="products"]',
        action: 'develop_product',
        reward: { type: 'money', value: 200000 }
    },
    {
        id: 'check_market',
        title: '市場を確認しよう',
        description: '市場タブでは競合企業の状況や自社の市場シェアを確認できます。',
        emoji: '📈',
        targetElement: '.tab[data-panel="market"]'
    },
    {
        id: 'next_turn',
        title: 'ターンを進めよう',
        description: '「ターン終了」ボタンを押すと時間が進み、売上が発生します。経営を続けて会社を成長させましょう！',
        emoji: '⏩',
        targetElement: '#endTurnBtn',
        action: 'end_turn',
        reward: { type: 'brandPower', value: 1 }
    },
    {
        id: 'complete',
        title: 'チュートリアル完了！',
        description: 'これで基本操作は完了です。市場シェアを拡大し、業界トップを目指しましょう！',
        emoji: '🎉',
        reward: { type: 'money', value: 500000 }
    }
];

// ============================================
// 社長モード設定
// ============================================
export type GameMode = 'management' | 'ceo';

export const GAME_MODE_SETTINGS = {
    management: {
        name: '管理モード',
        emoji: '📋',
        description: '従来通り全てを直接操作するモード'
    },
    ceo: {
        name: '社長モード',
        emoji: '🏢',
        description: '決裁書類と部下対応で経営するモード'
    }
};
