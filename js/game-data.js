/**
 * 経営シミュレーションゲーム - ゲームデータ設定
 */

// 従業員の特性システム
const EMPLOYEE_TRAITS = {
    // ポジティブトレイト
    innovative: {
        name: '💡 革新的',
        description: '創造力+20、新製品開発時ボーナス',
        effects: { creativeBonus: 20, developmentBonus: 1.3 },
        probability: 0.15
    },
    leadership: {
        name: '👑 リーダーシップ',
        description: 'チーム全体の生産性+15%、給与+30%',
        effects: { teamBoost: 0.15, salaryMultiplier: 1.3 },
        probability: 0.1
    },
    efficient: {
        name: '⚡ 効率的',
        description: '作業効率+25%、残業少ない',
        effects: { efficiencyBonus: 0.25, overtimeReduction: 0.2 },
        probability: 0.2
    },
    loyal: {
        name: '🤝 忠実',
        description: '離職リスク-50%、モチベーション安定',
        effects: { loyaltyBonus: 0.5, motivationStability: 0.3 },
        probability: 0.25
    },
    
    // ネガティブトレイト
    burnout_prone: {
        name: '😰 燃え尽き症候群',
        description: 'モチベーション-20、生産性-30%',
        effects: { motivationPenalty: -20, productivityPenalty: -0.3 },
        probability: 0.1
    },
    perfectionist: {
        name: '🎯 完璧主義者',
        description: '品質+15%だが作業速度-20%',
        effects: { qualityBonus: 0.15, speedPenalty: -0.2 },
        probability: 0.15
    },
    social: {
        name: '🗣️ 社交的',
        description: 'チーム雰囲気+10%、集中力-10%',
        effects: { teamMoraleBonus: 0.1, focusPenalty: -0.1 },
        probability: 0.2
    }
};

// 製品ライフサイクルシステム
const PRODUCT_LIFECYCLE = {
    introduction: {
        name: '導入期',
        duration: 3,
        revenueMultiplier: 0.5,
        description: '市場認知度が低く売上は控えめ'
    },
    growth: {
        name: '成長期', 
        duration: 4,
        revenueMultiplier: 1.5,
        description: '急速に売上が伸びる黄金期'
    },
    maturity: {
        name: '成熟期',
        duration: 6,
        revenueMultiplier: 1.0,
        description: '安定した収益だが競合が増加'
    },
    decline: {
        name: '衰退期',
        duration: -1, // 無制限
        revenueMultiplier: 0.3,
        description: '売上低迷、改良やマーケティングが必要'
    }
};

// 会社戦略システム
const COMPANY_STRATEGIES = {
    niche: {
        name: '🎯 ニッチ戦略',
        description: '特定分野に特化。利益率+50%、市場拡大-30%',
        effects: { profitMargin: 1.5, marketExpansion: 0.7, employeeCost: 1.2 }
    },
    scale: {
        name: '📈 規模戦略', 
        description: '大量採用で市場シェア拡大。採用コスト-20%、利益率-10%',
        effects: { hiringCostReduction: 0.8, profitMargin: 0.9, marketExpansion: 1.4 }
    },
    tech_focus: {
        name: '🔬 技術特化',
        description: 'R&D重視。開発成功率+30%、人件費+20%',
        effects: { developmentSuccess: 1.3, salaryMultiplier: 1.2, innovationBonus: 0.3 }
    },
    balanced: {
        name: '⚖️ バランス型',
        description: 'バランス重視の安定戦略',
        effects: { stability: 0.2 }
    }
};

// ランダムイベントシステム
const RANDOM_EVENTS = [
    {
        id: 'tech_boom',
        name: '🤖 AI技術ブーム到来',
        description: '生成AI市場が急拡大！技術系従業員の価値が上昇',
        probability: 0.15,
        effects: { marketTrend: 'boom', techSalaryMultiplier: 1.3 },
        duration: 3
    },
    {
        id: 'economic_recession',
        name: '📉 景気減速の兆し',
        description: 'IT投資に慎重ムード。売上に影響の可能性',
        probability: 0.1,
        effects: { marketTrend: 'recession', revenueMultiplier: 0.8 },
        duration: 4
    },
    {
        id: 'talent_war',
        name: '💼 人材争奪戦激化',
        description: '大手企業が高給で人材を狙っている',
        probability: 0.2,
        effects: { poachingRisk: 0.3, hiringSalaryMultiplier: 1.2 },
        duration: 2
    },
    {
        id: 'big_contract',
        name: '🎯 大口契約のチャンス',
        description: '政府系の大型プロジェクトの入札が開始',
        probability: 0.12,
        effects: { contractOpportunity: true },
        duration: 1
    },
    {
        id: 'tech_revolution',
        name: '⚡ 技術革新の波',
        description: '新技術の登場で市場が活性化',
        probability: 0.08,
        effects: { innovationBonus: 1.5 },
        duration: 2
    }
];

// 実績システム
const ACHIEVEMENTS = [
    {
        id: 'first_profit',
        name: '💰 初回黒字達成',
        description: '初めて月次で黒字を達成した',
        condition: (game) => game.monthlyRevenue > 0 && !game.achievements.includes('first_profit'),
        reward: { money: 500000, brandPower: 1 }
    },
    {
        id: 'big_company',
        name: '👥 大企業への道',
        description: '従業員数が10人に到達した',
        condition: (game) => game.employees.length >= 10 && !game.achievements.includes('big_company'),
        reward: { reputation: 20, brandPower: 1 }
    },
    {
        id: 'market_leader',
        name: '🏆 市場リーダー',
        description: '市場シェア15%以上を獲得した',
        condition: (game) => game.marketShare >= 15 && !game.achievements.includes('market_leader'),
        reward: { money: 2000000, reputation: 30 }
    },
    {
        id: 'debt_free',
        name: '💎 無借金経営',
        description: '借金を完済して健全経営を達成',
        condition: (game) => game.debt === 0 && game.money > 5000000 && !game.achievements.includes('debt_free'),
        reward: { reputation: 25, brandPower: 2 }
    },
    {
        id: 'innovation_master',
        name: '🚀 イノベーター',
        description: '5つ以上の製品を開発した',
        condition: (game) => game.products.length >= 5 && !game.achievements.includes('innovation_master'),
        reward: { money: 1000000, reputation: 15 }
    },
    {
        id: 'trait_collector',
        name: '🏷️ トレイトコレクター',
        description: '特別なトレイトを持つ従業員を5人採用',
        condition: (game) => game.employees.filter(e => e.traits && e.traits.length > 0).length >= 5 && !game.achievements.includes('trait_collector'),
        reward: { money: 800000, reputation: 10 }
    },
    {
        id: 'product_lifecycle_master',
        name: '📊 ライフサイクルマスター',
        description: '製品を成長期から成熟期まで育て上げた',
        condition: (game) => game.products.some(p => p.lifecycle === 'maturity') && !game.achievements.includes('product_lifecycle_master'),
        reward: { brandPower: 2, reputation: 15 }
    }
];

// 競合AI企業の初期設定
const INITIAL_COMPETITORS = [
    {
        name: 'テックコープ',
        share: 35,
        strategy: 'aggressive',
        power: 100,
        ceo: '田中 剛',
        aggressiveness: 0.8,
        lastAction: null,
        alertLevel: 'normal'
    },
    {
        name: 'デジタルワークス',
        share: 29,
        strategy: 'balanced',
        power: 85,
        ceo: '鈴木 智子',
        aggressiveness: 0.5,
        lastAction: null,
        alertLevel: 'normal'
    },
    {
        name: 'サイバーソフト',
        share: 22,
        strategy: 'defensive',
        power: 70,
        ceo: '山田 孝志',
        aggressiveness: 0.3,
        lastAction: null,
        alertLevel: 'normal'
    }
];

// 読み取り専用にするため、すべてのオブジェクトを凍結
Object.freeze(EMPLOYEE_TRAITS);
Object.freeze(PRODUCT_LIFECYCLE);
Object.freeze(COMPANY_STRATEGIES);
Object.freeze(RANDOM_EVENTS);
Object.freeze(ACHIEVEMENTS);
Object.freeze(INITIAL_COMPETITORS);