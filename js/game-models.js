/**
 * 経営シミュレーションゲーム - データモデル定義
 */

/**
 * 従業員クラス
 */
class Employee {
    constructor({
        id = Date.now(),
        name = '',
        personality = 'まじめ',
        abilities = { technical: 65, sales: 45, planning: 55, management: 50 },
        motivation = GAME_CONSTANTS.INITIAL_VALUES.EMPLOYEE_MOTIVATION,
        salary = GAME_CONSTANTS.SALARY_RANGE.MIN,
        department = GAME_DATA.DEPARTMENTS[0],
        traits = [],
        experience = 0,
        burnoutLevel = 0
    } = {}) {
        this.id = id;
        this.name = name;
        this.personality = personality;
        this.abilities = { ...abilities };
        this.motivation = motivation;
        this.salary = salary;
        this.department = department;
        this.traits = [...traits];
        this.experience = experience;
        this.burnoutLevel = burnoutLevel;
    }

    /**
     * 従業員の総合能力値を計算
     */
    getTotalAbility() {
        return Object.values(this.abilities).reduce((sum, ability) => sum + ability, 0);
    }

    /**
     * モチベーションに基づく生産性を計算
     */
    getProductivity() {
        return this.motivation / 100;
    }

    /**
     * 研修による能力向上
     */
    train() {
        Object.keys(this.abilities).forEach(key => {
            this.abilities[key] = Math.min(
                GAME_CONSTANTS.LIMITS.MAX_ABILITY,
                this.abilities[key] + GAME_CONSTANTS.RATES.TRAINING_ABILITY_INCREASE
            );
        });
        this.experience++;
    }

    /**
     * 特性による効果を取得
     */
    getTraitEffects() {
        let effects = {
            productivityBonus: 1,
            salaryMultiplier: 1,
            loyaltyBonus: 0,
            burnoutResistance: 0
        };

        this.traits.forEach(traitKey => {
            const trait = EMPLOYEE_TRAITS[traitKey];
            if (trait && trait.effects) {
                if (trait.effects.efficiencyBonus) {
                    effects.productivityBonus += trait.effects.efficiencyBonus;
                }
                if (trait.effects.salaryMultiplier) {
                    effects.salaryMultiplier *= trait.effects.salaryMultiplier;
                }
                if (trait.effects.loyaltyBonus) {
                    effects.loyaltyBonus += trait.effects.loyaltyBonus;
                }
            }
        });

        return effects;
    }
}

/**
 * 製品クラス
 */
class Product {
    constructor({
        id = Date.now(),
        name = '',
        quality = 50,
        sales = 0,
        lifecycle = 'introduction',
        lifecycleTurn = 0,
        currentRevenue = 0,
        totalRevenue = 0
    } = {}) {
        this.id = id;
        this.name = name;
        this.quality = quality;
        this.sales = sales;
        this.lifecycle = lifecycle;
        this.lifecycleTurn = lifecycleTurn;
        this.currentRevenue = currentRevenue;
        this.totalRevenue = totalRevenue;
    }

    /**
     * ライフサイクルステージの進行
     */
    advanceLifecycle() {
        this.lifecycleTurn++;
        const currentStage = PRODUCT_LIFECYCLE[this.lifecycle];
        
        // 次の段階への移行チェック
        if (currentStage.duration > 0 && this.lifecycleTurn >= currentStage.duration) {
            switch(this.lifecycle) {
                case 'introduction':
                    this.lifecycle = 'growth';
                    break;
                case 'growth':
                    this.lifecycle = 'maturity';
                    break;
                case 'maturity':
                    this.lifecycle = 'decline';
                    break;
            }
            this.lifecycleTurn = 0;
        }
    }

    /**
     * 現在の売上を計算
     */
    calculateRevenue() {
        const stageInfo = PRODUCT_LIFECYCLE[this.lifecycle];
        const baseRevenue = this.quality * GAME_CONSTANTS.DISPLAY.YEN_UNIT;
        this.currentRevenue = baseRevenue * stageInfo.revenueMultiplier;
        this.totalRevenue += this.currentRevenue;
        return this.currentRevenue;
    }

    /**
     * 製品の改良
     */
    improve() {
        this.quality = Math.min(
            GAME_CONSTANTS.LIMITS.MAX_ABILITY,
            this.quality + GAME_CONSTANTS.RATES.PRODUCT_QUALITY_IMPROVEMENT
        );

        // 衰退期の製品は成熟期に戻る可能性
        if (this.lifecycle === 'decline' && 
            Math.random() < GAME_CONSTANTS.PROBABILITIES.PRODUCT_REVIVAL_FROM_DECLINE) {
            this.lifecycle = 'maturity';
            this.lifecycleTurn = 0;
            return true; // 復活成功
        }
        return false; // 通常の改良
    }

    /**
     * ライフサイクルステージ情報を取得
     */
    getStageInfo() {
        return PRODUCT_LIFECYCLE[this.lifecycle];
    }
}

/**
 * 競合AI企業クラス
 */
class AICompetitor {
    constructor({
        name = '',
        share = 10,
        strategy = 'balanced',
        power = 50,
        ceo = '',
        aggressiveness = 0.5,
        lastAction = null,
        alertLevel = 'normal'
    } = {}) {
        this.name = name;
        this.share = share;
        this.strategy = strategy;
        this.power = power;
        this.ceo = ceo;
        this.aggressiveness = aggressiveness;
        this.lastAction = lastAction;
        this.alertLevel = alertLevel;
    }

    /**
     * 警戒レベルの更新
     */
    updateAlertLevel(playerMarketShare) {
        if (playerMarketShare > this.share * 0.3) {
            this.alertLevel = 'aggressive';
            this.aggressiveness = Math.min(1.0, this.aggressiveness + 0.1);
        } else if (playerMarketShare < this.share * 0.1) {
            this.alertLevel = 'normal';
            this.aggressiveness = Math.max(0.2, this.aggressiveness - 0.05);
        }
    }

    /**
     * プレイヤーの行動に対する反応
     */
    reactToPlayerAction(playerAction) {
        const reactionChance = this.aggressiveness * 0.6;
        if (Math.random() > reactionChance) return null;

        switch(playerAction) {
            case 'hiring':
                if (this.strategy === 'aggressive' && Math.random() < 0.4) {
                    this.lastAction = 'counter_hiring';
                    return `${this.name}の${this.ceo}CEOが「優秀な人材確保を強化する」と発表`;
                }
                break;
            case 'marketing':
                if (Math.random() < this.aggressiveness * 0.6) {
                    this.lastAction = 'counter_marketing';
                    this.share += 0.5;
                    return `${this.name}が大規模マーケティング攻勢を開始！`;
                }
                break;
            case 'product_development':
                if (this.strategy !== 'defensive' && Math.random() < 0.3) {
                    this.lastAction = 'product_rush';
                    return `${this.name}が対抗製品の開発を急いでいる模様`;
                }
                break;
        }
        return null;
    }

    /**
     * AI独自の行動を実行
     */
    performAutonomousAction() {
        const actionChance = this.aggressiveness * 0.3;
        
        if (Math.random() < actionChance) {
            const actions = ['innovation', 'expansion', 'acquisition'];
            const action = actions[Math.floor(Math.random() * actions.length)];
            
            switch(action) {
                case 'innovation':
                    this.power += 5;
                    return { action: 'innovation', message: `${this.name}が革新的な技術を発表！` };
                case 'expansion':
                    this.share += 1;
                    return { action: 'expansion', message: `${this.name}が事業を拡大中` };
                case 'acquisition':
                    this.power += 10;
                    this.share += 2;
                    return { action: 'acquisition', message: `${this.name}が他社を買収！` };
            }
        }
        return null;
    }

    /**
     * 市場シェアの変動
     */
    updateMarketShare() {
        let change = (Math.random() - 0.5) * this.aggressiveness * 3;
        if (this.alertLevel === 'aggressive') change *= 1.5;
        
        this.share = Math.max(5, Math.min(60, this.share + change));
    }
}

/**
 * ゲームイベントクラス
 */
class GameEvent {
    constructor({
        id = '',
        name = '',
        description = '',
        effects = {},
        remainingTurns = 0,
        triggeredTurn = 0
    } = {}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.effects = { ...effects };
        this.remainingTurns = remainingTurns;
        this.triggeredTurn = triggeredTurn;
    }

    /**
     * イベント効果の適用
     */
    applyEffects(game) {
        let appliedEffects = {
            revenueMultiplier: 1,
            salaryMultiplier: 1
        };

        if (this.effects.revenueMultiplier) {
            appliedEffects.revenueMultiplier = this.effects.revenueMultiplier;
        }
        if (this.effects.techSalaryMultiplier) {
            appliedEffects.salaryMultiplier = this.effects.techSalaryMultiplier;
        }
        if (this.effects.marketTrend) {
            game.marketTrend = this.effects.marketTrend;
        }

        return appliedEffects;
    }

    /**
     * ターン経過処理
     */
    advanceTurn() {
        this.remainingTurns--;
        return this.remainingTurns > 0;
    }
}

/**
 * ユーティリティ関数
 */
class GameUtils {
    /**
     * ランダムな従業員名を生成
     */
    static generateEmployeeName() {
        const familyNames = GAME_DATA.EMPLOYEE_NAMES.FAMILY;
        const givenNames = GAME_DATA.EMPLOYEE_NAMES.GIVEN;
        
        const family = familyNames[Math.floor(Math.random() * familyNames.length)];
        const given = givenNames[Math.floor(Math.random() * givenNames.length)];
        
        return `${family} ${given}`;
    }

    /**
     * ランダムな製品名を生成
     */
    static generateProductName() {
        const { PREFIXES, BASES, VERSIONS } = GAME_DATA.PRODUCT_NAMES;
        
        const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
        const base = BASES[Math.floor(Math.random() * BASES.length)];
        const version = VERSIONS[Math.floor(Math.random() * VERSIONS.length)];
        
        return `${prefix}${base} ${version}`;
    }

    /**
     * 金額を万円単位で表示
     */
    static formatMoney(amount) {
        return Math.floor(amount / GAME_CONSTANTS.DISPLAY.YEN_UNIT);
    }

    /**
     * パーセンテージを表示用にフォーマット
     */
    static formatPercentage(value) {
        return value.toFixed(GAME_CONSTANTS.DISPLAY.PERCENTAGE_DECIMAL);
    }

    /**
     * 範囲内のランダム整数を生成
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 範囲内のランダム能力値を生成
     */
    static generateRandomAbility() {
        return GameUtils.randomInt(
            GAME_CONSTANTS.ABILITY_RANGE.MIN,
            GAME_CONSTANTS.ABILITY_RANGE.MIN + GAME_CONSTANTS.ABILITY_RANGE.RANGE
        );
    }

    /**
     * ランダム給与を生成
     */
    static generateRandomSalary() {
        return GameUtils.randomInt(
            GAME_CONSTANTS.SALARY_RANGE.MIN,
            GAME_CONSTANTS.SALARY_RANGE.MAX
        );
    }
}