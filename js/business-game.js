/**
 * 経営シミュレーションゲーム - メインゲームクラス
 */

class BusinessGame {
    constructor() {
        this.initialize();
    }

    /**
     * ゲーム初期化
     */
    initialize() {
        this.money = GAME_CONSTANTS.INITIAL_VALUES.MONEY;
        this.employees = [];
        this.products = [];
        this.turn = 1;
        this.year = GAME_CONSTANTS.INITIAL_VALUES.YEAR;
        this.month = GAME_CONSTANTS.INITIAL_VALUES.MONTH;
        this.week = GAME_CONSTANTS.INITIAL_VALUES.WEEK;
        this.marketShare = GAME_CONSTANTS.INITIAL_VALUES.MARKET_SHARE;
        this.brandPower = GAME_CONSTANTS.INITIAL_VALUES.BRAND_POWER;
        this.monthlyRevenue = 0;
        this.debt = 0;
        this.achievements = [];
        this.lastPlayerAction = null;
        this.reputation = GAME_CONSTANTS.INITIAL_VALUES.REPUTATION;
        this.marketTrend = 'stable';
        this.eventHistory = [];
        this.companyStrategy = null;
        this.researchPoints = 0;

        // 競合企業の初期化
        this.competitors = INITIAL_COMPETITORS.map(comp => new AICompetitor(comp));

        // 初期従業員の作成
        const initialEmployee = new Employee({
            id: 1,
            name: '山田 太郎',
            personality: 'まじめ',
            abilities: { technical: 65, sales: 45, planning: 55, management: 50 },
            motivation: 75,
            salary: 400000,
            department: '開発部'
        });
        this.employees.push(initialEmployee);
    }

    /**
     * エラーハンドリング
     */
    handleError(error) {
        console.error('Game Error:', error);
        this.showModal('エラー', 'ゲーム処理中にエラーが発生しました。');
    }

    /**
     * 資金チェック
     */
    canAfford(amount) {
        return this.money >= amount;
    }

    /**
     * 資金消費
     */
    spendMoney(amount, purpose = '不明な支出') {
        if (!this.canAfford(amount)) {
            throw new Error(`資金不足: ${purpose}に${GameUtils.formatMoney(amount)}万円が必要です`);
        }
        this.money -= amount;
    }

    /**
     * 従業員採用
     */
    hireEmployee() {
        try {
            if (!this.canAfford(GAME_CONSTANTS.COSTS.HIRING_BASE)) {
                throw new Error('採用活動には最低20万円が必要です');
            }

            const candidate = this.generateCandidate();
            const totalCost = candidate.salary * GAME_CONSTANTS.COSTS.HIRING_MULTIPLIER;
            
            this.spendMoney(totalCost, '従業員採用');
            this.employees.push(candidate);
            this.lastPlayerAction = 'hiring';
            
            return { success: true, employee: candidate };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 候補者生成
     */
    generateCandidate() {
        const traits = this.generateEmployeeTraits();
        let baseSalary = GameUtils.generateRandomSalary();
        
        // トレイトによる給与調整
        traits.forEach(traitKey => {
            const trait = EMPLOYEE_TRAITS[traitKey];
            if (trait?.effects?.salaryMultiplier) {
                baseSalary *= trait.effects.salaryMultiplier;
            }
        });

        return new Employee({
            id: Date.now(),
            name: GameUtils.generateEmployeeName(),
            personality: GAME_DATA.PERSONALITIES[Math.floor(Math.random() * GAME_DATA.PERSONALITIES.length)],
            abilities: {
                technical: GameUtils.generateRandomAbility(),
                sales: GameUtils.generateRandomAbility(),
                planning: GameUtils.generateRandomAbility(),
                management: GameUtils.generateRandomAbility()
            },
            motivation: GAME_CONSTANTS.INITIAL_VALUES.EMPLOYEE_MOTIVATION,
            salary: Math.floor(baseSalary),
            department: GAME_DATA.DEPARTMENTS[0],
            traits: traits
        });
    }

    /**
     * 従業員トレイト生成
     */
    generateEmployeeTraits() {
        const traits = [];
        
        Object.entries(EMPLOYEE_TRAITS).forEach(([key, trait]) => {
            if (Math.random() < trait.probability) {
                traits.push(key);
            }
        });
        
        return traits.slice(0, 2); // 最大2つのトレイト
    }

    /**
     * 研修実施
     */
    trainEmployees() {
        try {
            if (this.employees.length === 0) {
                throw new Error('従業員がいません');
            }

            const totalCost = GAME_CONSTANTS.COSTS.TRAINING_PER_EMPLOYEE * this.employees.length;
            this.spendMoney(totalCost, '従業員研修');
            
            this.employees.forEach(emp => emp.train());
            
            return { success: true, cost: totalCost };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 製品開発
     */
    developProduct() {
        try {
            if (this.employees.length < GAME_CONSTANTS.LIMITS.MIN_EMPLOYEES_FOR_DEVELOPMENT) {
                throw new Error('製品開発には最低2名の従業員が必要です');
            }

            let developmentCost = GAME_CONSTANTS.COSTS.PRODUCT_DEVELOPMENT;
            let successRate = GAME_CONSTANTS.PROBABILITIES.PRODUCT_DEVELOPMENT_SUCCESS;
            let qualityBonus = 0;

            // 戦略効果の適用
            const strategyEffects = this.getStrategyEffects();
            if (strategyEffects.developmentSuccess) {
                successRate *= strategyEffects.developmentSuccess;
            }
            if (strategyEffects.innovationBonus) {
                qualityBonus += strategyEffects.innovationBonus * 20;
            }

            // 従業員のトレイト効果
            const innovativeCount = this.employees.filter(e => 
                e.traits && e.traits.includes('innovative')).length;
            if (innovativeCount > 0) {
                successRate *= (1 + innovativeCount * 0.1);
                qualityBonus += innovativeCount * 10;
            }

            this.spendMoney(developmentCost, '製品開発');

            if (Math.random() < successRate) {
                const baseQuality = 50 + Math.floor(Math.random() * 30);
                const finalQuality = Math.min(100, baseQuality + qualityBonus);
                
                const product = new Product({
                    id: Date.now(),
                    name: GameUtils.generateProductName(),
                    quality: finalQuality
                });
                
                this.products.push(product);
                this.researchPoints += GAME_CONSTANTS.RATES.RESEARCH_POINTS_PER_PRODUCT;
                this.lastPlayerAction = 'product_development';
                
                return { success: true, product: product };
            } else {
                return { success: false, error: '開発に失敗しました' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * マーケティング実施
     */
    doMarketing() {
        try {
            this.spendMoney(GAME_CONSTANTS.COSTS.MARKETING, 'マーケティング');
            
            this.marketShare = Math.min(
                GAME_CONSTANTS.LIMITS.MAX_MARKET_SHARE,
                this.marketShare + GAME_CONSTANTS.RATES.MARKETING_SHARE_INCREASE
            );
            this.brandPower = Math.min(
                GAME_CONSTANTS.LIMITS.MAX_BRAND_POWER,
                this.brandPower + GAME_CONSTANTS.RATES.MARKETING_BRAND_INCREASE
            );
            this.lastPlayerAction = 'marketing';
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 融資取得
     */
    getLoan() {
        this.money += GAME_CONSTANTS.COSTS.LOAN_AMOUNT;
        this.debt += GAME_CONSTANTS.COSTS.LOAN_WITH_INTEREST;
        return { success: true, amount: GAME_CONSTANTS.COSTS.LOAN_AMOUNT };
    }

    /**
     * 戦略選択
     */
    selectStrategy(strategyKey) {
        if (this.week !== 1) {
            return { success: false, error: '戦略変更は月初（第1週）にのみ可能です' };
        }
        
        if (!COMPANY_STRATEGIES[strategyKey]) {
            return { success: false, error: '無効な戦略です' };
        }
        
        this.companyStrategy = strategyKey;
        return { success: true, strategy: COMPANY_STRATEGIES[strategyKey] };
    }

    /**
     * 戦略効果取得
     */
    getStrategyEffects() {
        let effects = {
            profitMargin: 1,
            hiringCostMultiplier: 1,
            marketExpansionRate: 1,
            salaryMultiplier: 1
        };
        
        if (this.companyStrategy && COMPANY_STRATEGIES[this.companyStrategy]) {
            const strategy = COMPANY_STRATEGIES[this.companyStrategy];
            Object.assign(effects, strategy.effects);
        }
        
        return effects;
    }

    /**
     * ターン進行
     */
    nextTurn() {
        try {
            this.turn++;
            this.week++;
            
            // 製品ライフサイクル更新
            this.updateProductLifecycles();
            
            // ランダムイベント処理
            this.processRandomEvents();
            
            if (this.week > GAME_CONSTANTS.LIMITS.WEEKS_PER_MONTH) {
                this.processMonthlyUpdate();
            }
            
            return { success: true };
        } catch (error) {
            this.handleError(error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 製品ライフサイクル更新
     */
    updateProductLifecycles() {
        this.products.forEach(product => {
            product.advanceLifecycle();
            product.calculateRevenue();
        });
    }

    /**
     * ランダムイベント処理
     */
    processRandomEvents() {
        // 既存イベントの更新
        this.eventHistory = this.eventHistory.filter(event => event.advanceTurn());
        
        // 新イベントの発生
        RANDOM_EVENTS.forEach(eventTemplate => {
            if (Math.random() < eventTemplate.probability) {
                const event = new GameEvent({
                    ...eventTemplate,
                    remainingTurns: eventTemplate.duration,
                    triggeredTurn: this.turn
                });
                
                this.eventHistory.push(event);
                this.handleSpecialEvent(event);
            }
        });
    }

    /**
     * 特別イベントの処理
     */
    handleSpecialEvent(event) {
        if (event.id === 'big_contract') {
            this.triggerBigContractEvent();
        }
    }

    /**
     * 大口契約イベント
     */
    triggerBigContractEvent() {
        const contractValue = 5000000 + Math.random() * 10000000;
        const requirements = Math.floor(3 + Math.random() * 5);
        
        // この処理は UI 側で処理される予定
        return { contractValue, requirements };
    }

    /**
     * 月次処理
     */
    processMonthlyUpdate() {
        this.week = 1;
        this.month++;
        if (this.month > 12) {
            this.month = 1;
            this.year++;
        }
        
        // 売上計算
        const revenue = this.calculateMonthlyRevenue();
        const costs = this.calculateMonthlyCosts();
        
        this.monthlyRevenue = revenue;
        this.money += revenue - costs;
        
        // 実績チェック
        this.checkAchievements();
        
        // 倒産チェック
        if (this.money < 0) {
            throw new Error('資金不足で倒産しました');
        }
        
        // 競合企業更新
        this.updateCompetitors();
        
        return { revenue, costs, profit: revenue - costs };
    }

    /**
     * 月次売上計算
     */
    calculateMonthlyRevenue() {
        let totalRevenue = 0;
        
        this.products.forEach(product => {
            totalRevenue += product.calculateRevenue();
        });
        
        // イベント効果とストラテジー効果を適用
        const eventEffects = this.getEventEffects();
        const strategyEffects = this.getStrategyEffects();
        
        return totalRevenue * eventEffects.revenueMultiplier * strategyEffects.profitMargin;
    }

    /**
     * 月次コスト計算
     */
    calculateMonthlyCosts() {
        const baseCosts = this.employees.reduce((sum, emp) => sum + emp.salary, 0);
        
        // イベント効果とストラテジー効果を適用
        const eventEffects = this.getEventEffects();
        const strategyEffects = this.getStrategyEffects();
        
        return baseCosts * eventEffects.salaryMultiplier * strategyEffects.salaryMultiplier;
    }

    /**
     * イベント効果取得
     */
    getEventEffects() {
        let effects = {
            revenueMultiplier: 1,
            salaryMultiplier: 1
        };
        
        this.eventHistory.forEach(event => {
            const eventEffects = event.applyEffects(this);
            if (eventEffects.revenueMultiplier) {
                effects.revenueMultiplier *= eventEffects.revenueMultiplier;
            }
            if (eventEffects.salaryMultiplier) {
                effects.salaryMultiplier *= eventEffects.salaryMultiplier;
            }
        });
        
        return effects;
    }

    /**
     * 競合企業更新
     */
    updateCompetitors() {
        this.competitors.forEach(competitor => {
            // プレイヤーアクションへの反応
            if (this.lastPlayerAction) {
                const reaction = competitor.reactToPlayerAction(this.lastPlayerAction);
                if (reaction) {
                    // UI側に通知（実際の実装では GameUI クラスが処理）
                    console.log('Competitor Reaction:', reaction);
                }
            }
            
            // 警戒レベル更新
            competitor.updateAlertLevel(this.marketShare);
            
            // 自律的行動
            const action = competitor.performAutonomousAction();
            if (action) {
                console.log('Competitor Action:', action);
            }
            
            // 市場シェア更新
            competitor.updateMarketShare();
        });
        
        this.normalizeMarketShares();
        this.lastPlayerAction = null;
    }

    /**
     * 市場シェア正規化
     */
    normalizeMarketShares() {
        const totalCompetitorShare = this.competitors.reduce((sum, comp) => sum + comp.share, 0);
        const availableShare = 100 - this.marketShare;
        
        if (totalCompetitorShare > availableShare) {
            const ratio = availableShare / totalCompetitorShare;
            this.competitors.forEach(comp => {
                comp.share *= ratio;
            });
        }
    }

    /**
     * 実績チェック
     */
    checkAchievements() {
        ACHIEVEMENTS.forEach(achievement => {
            if (achievement.condition(this)) {
                this.achievements.push(achievement.id);
                this.applyAchievementReward(achievement.reward);
            }
        });
    }

    /**
     * 実績報酬適用
     */
    applyAchievementReward(reward) {
        if (reward.money) {
            this.money += reward.money;
        }
        if (reward.brandPower) {
            this.brandPower = Math.min(
                GAME_CONSTANTS.LIMITS.MAX_BRAND_POWER,
                this.brandPower + reward.brandPower
            );
        }
        if (reward.reputation) {
            this.reputation = Math.min(
                GAME_CONSTANTS.LIMITS.MAX_REPUTATION,
                this.reputation + reward.reputation
            );
        }
    }

    /**
     * ゲーム保存
     */
    saveGame() {
        try {
            const saveData = {
                money: this.money,
                employees: this.employees.map(emp => ({...emp})),
                products: this.products.map(prod => ({...prod})),
                turn: this.turn,
                year: this.year,
                month: this.month,
                week: this.week,
                marketShare: this.marketShare,
                brandPower: this.brandPower,
                monthlyRevenue: this.monthlyRevenue,
                debt: this.debt,
                achievements: [...this.achievements],
                reputation: this.reputation,
                marketTrend: this.marketTrend,
                eventHistory: this.eventHistory.map(event => ({...event})),
                companyStrategy: this.companyStrategy,
                researchPoints: this.researchPoints,
                competitors: this.competitors.map(comp => ({...comp}))
            };
            
            localStorage.setItem('businessEmpire', JSON.stringify(saveData));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * ゲーム読み込み
     */
    loadGame() {
        try {
            const saveData = localStorage.getItem('businessEmpire');
            if (!saveData) {
                throw new Error('保存データが見つかりません');
            }
            
            const data = JSON.parse(saveData);
            
            // 基本データの復元
            Object.assign(this, data);
            
            // オブジェクトの再構築
            this.employees = data.employees.map(emp => new Employee(emp));
            this.products = data.products.map(prod => new Product(prod));
            this.competitors = data.competitors.map(comp => new AICompetitor(comp));
            this.eventHistory = data.eventHistory.map(event => new GameEvent(event));
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * ゲーム状態取得
     */
    getGameState() {
        return {
            money: this.money,
            employees: this.employees,
            products: this.products,
            turn: this.turn,
            year: this.year,
            month: this.month,
            week: this.week,
            marketShare: this.marketShare,
            brandPower: this.brandPower,
            monthlyRevenue: this.monthlyRevenue,
            debt: this.debt,
            achievements: this.achievements,
            reputation: this.reputation,
            marketTrend: this.marketTrend,
            eventHistory: this.eventHistory,
            companyStrategy: this.companyStrategy,
            researchPoints: this.researchPoints,
            competitors: this.competitors
        };
    }
}