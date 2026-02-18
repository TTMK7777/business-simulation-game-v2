/**
 * 経営シミュレーションゲーム - 定数定義
 */

const GAME_CONSTANTS = {
    // コスト関連
    COSTS: {
        HIRING_BASE: 200000,        // 採用基本コスト (20万)
        HIRING_MULTIPLIER: 3,       // 採用時給与倍率
        TRAINING_PER_EMPLOYEE: 300000, // 研修コスト (30万/人)
        PRODUCT_DEVELOPMENT: 2000000,  // 製品開発コスト (200万)
        MARKETING: 1000000,         // マーケティングコスト (100万)
        PRODUCT_IMPROVEMENT: 1000000, // 製品改良コスト (100万)
        LOAN_AMOUNT: 5000000,       // 融資額 (500万)
        LOAN_WITH_INTEREST: 5500000 // 利息込み返済額 (550万)
    },

    // 制限値
    LIMITS: {
        MAX_BRAND_POWER: 5,         // 最大ブランド力
        MAX_MARKET_SHARE: 50,       // 最大市場シェア
        MAX_REPUTATION: 100,        // 最大評判
        MAX_ABILITY: 100,           // 最大能力値
        MIN_EMPLOYEES_FOR_DEVELOPMENT: 2, // 製品開発最低人数
        WEEKS_PER_MONTH: 4          // 月あたりの週数
    },

    // 初期値
    INITIAL_VALUES: {
        MONEY: 10000000,            // 初期資金 (1000万)
        MARKET_SHARE: 0.1,          // 初期市場シェア
        BRAND_POWER: 1,             // 初期ブランド力
        REPUTATION: 50,             // 初期評判
        EMPLOYEE_MOTIVATION: 70,    // 初期モチベーション
        YEAR: 2025,                 // 開始年
        MONTH: 1,                   // 開始月
        WEEK: 1                     // 開始週
    },

    // 成長・変化率
    RATES: {
        MARKETING_SHARE_INCREASE: 0.3,  // マーケティングシェア増加率
        MARKETING_BRAND_INCREASE: 1,    // マーケティングブランド増加率
        TRAINING_ABILITY_INCREASE: 10,  // 研修能力向上値
        PRODUCT_QUALITY_IMPROVEMENT: 15, // 製品改良品質向上値
        RESEARCH_POINTS_PER_PRODUCT: 10  // 製品開発時のR&Pポイント
    },

    // 確率
    PROBABILITIES: {
        PRODUCT_DEVELOPMENT_SUCCESS: 0.8,  // 製品開発成功率
        PRODUCT_REVIVAL_FROM_DECLINE: 0.3, // 衰退期からの復活率
        BIG_CONTRACT_SUCCESS_BASE: 0.4,    // 大口契約基本成功率
        BRAND_POWER_BONUS: 0.1             // ブランド力ボーナス率
    },

    // 給与範囲
    SALARY_RANGE: {
        MIN: 300000,                // 最低給与 (30万)
        MAX: 500000,                // 最高給与 (50万)
        VARIATION: 200000           // 給与幅 (20万)
    },

    // 能力値範囲
    ABILITY_RANGE: {
        MIN: 30,                    // 最低能力値
        MAX: 80,                    // 最高能力値 (MIN + RANGE)
        RANGE: 50                   // 能力値幅
    },

    // 表示用単位
    DISPLAY: {
        YEN_UNIT: 10000,            // 円表示単位 (万円)
        PERCENTAGE_DECIMAL: 1       // パーセント小数点桁数
    }
};

// ゲーム内で使用される名前のデータ
const GAME_DATA = {
    EMPLOYEE_NAMES: {
        FAMILY: ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '中村', '小林', '山田', '松本'],
        GIVEN: ['太郎', '花子', '一郎', '美咲', '健太', '愛', '翔', '結衣', '大輔', '優子']
    },

    PERSONALITIES: ['すなお', 'まじめ', 'お調子者', '野心家', '協調的'],

    PRODUCT_NAMES: {
        PREFIXES: ['スマート', 'デジタル', 'AI', 'クラウド', 'モバイル', 'ウルトラ', 'プロ', 'エクスプレス'],
        BASES: ['マネージャー', 'システム', 'ツール', 'プラットフォーム', 'ソリューション', 'アプリ', 'サービス'],
        VERSIONS: ['X', 'Pro', '2025', 'Plus', 'Max', 'One', 'Go']
    },

    DEPARTMENTS: ['開発部', '営業部', '企画部', '管理部'],

    NEWS_TEMPLATES: [
        '${company}が新製品を発表！業界に衝撃',
        '${company}の売上が${percent}%増加',
        'IT業界の成長率が${percent}%に',
        '${company}が大型買収を検討中',
        '新技術の登場で市場が活性化',
        '${company}のCEOが今後の戦略を語る',
        'スタートアップ企業の参入が相次ぐ',
        '${company}が優秀人材の引き抜きを開始',
        '${company}が価格競争を仕掛ける',
        '${company}が大規模マーケティングを展開'
    ]
};

// 読み取り専用にするため、オブジェクトを凍結
Object.freeze(GAME_CONSTANTS);
Object.freeze(GAME_DATA);