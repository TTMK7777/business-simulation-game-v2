/**
 * 経営シミュレーションゲーム - 拡張ビジネスゲームクラス
 */

class EnhancedBusinessGame extends BusinessGame {
    constructor() {
        super();
        this.initializeEnhancements();
    }

    /**
     * 拡張機能の初期化
     */
    initializeEnhancements() {
        // 業界選択
        this.businessSector = 'it_services'; // デフォルトはITサービス
        
        // 面接システム
        this.interviewSystem = new InterviewSystem(this);
        
        // 部署システム
        this.departments = {
            development: { employees: [], manager: null, budget: 0 },
            sales: { employees: [], manager: null, budget: 0 },
            planning: { employees: [], manager: null, budget: 0 },
            quality: { employees: [], manager: null, budget: 0 },
            hr: { employees: [], manager: null, budget: 0 }
        };
        
        // 労働環境設定
        this.workEnvironment = {
            facilities: WORK_ENVIRONMENT.office_facilities.basic,
            welfare: [],
            workStyle: WORK_ENVIRONMENT.work_styles.traditional
        };
        
        // 人間関係マトリックス
        this.relationshipMatrix = {};
        
        // チーム統計
        this.teamStats = {
            averageSkillLevel: 0,
            teamMorale: 0,
            departmentEfficiency: {},
            conflictLevel: 0
        };
        
        // 社内制度
        this.policies = {
            salarySystem: 'standard',
            evaluationSystem: 'basic',
            trainingPrograms: [],
            benefitPackages: []
        };

        // デイリーミッションシステム
        this.dailyMissionSystem = new DailyMissionSystem(this);
        this.dailyMissionSystem.generateDailyMissions();

        // 成長ダッシュボード
        this.growthDashboard = new GrowthDashboard(this);

        // 初期従業員を拡張従業員に変更
        this.employees = [];
        const initialEmployee = new EnhancedEmployee({
            id: 1,
            name: '山田 太郎',
            personalityId: 'serious',
            baseAbilities: { 
                technical: 65, business: 45, planning: 55, management: 50,
                communication: 60, creativity: 50, analytical: 58, leadership: 45
            },
            experience: 12,
            department: 'development'
        });
        
        this.employees.push(initialEmployee);
        this.assignEmployeeToDepartment(initialEmployee.id, 'development');
    }

    /**
     * 業界選択
     */
    selectBusinessSector(sectorId) {
        if (!BUSINESS_SECTORS[sectorId]) {
            return { success: false, error: '無効な業界です' };
        }
        
        const oldSector = this.businessSector;
        this.businessSector = sectorId;
        const sector = BUSINESS_SECTORS[sectorId];
        
        // 業界変更に伴うコスト
        const switchCost = oldSector === sectorId ? 0 : 5000000; // 500万円
        
        if (switchCost > 0) {
            if (!this.canAfford(switchCost)) {
                this.businessSector = oldSector; // 元に戻す
                return { success: false, error: `業界転換費用${GameUtils.formatMoney(switchCost)}万円が不足しています` };
            }
            this.spendMoney(switchCost, '業界転換費用');
        }
        
        return { 
            success: true, 
            sector: sector,
            switchCost: switchCost
        };
    }

    /**
     * 従業員を部署に配属
     */
    assignEmployeeToDepartment(employeeId, departmentId) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee || !ENHANCED_DEPARTMENTS[departmentId]) {
            return { success: false, error: '従業員または部署が見つかりません' };
        }
        
        // 現在の部署から削除
        if (employee.department && this.departments[employee.department]) {
            this.departments[employee.department].employees = 
                this.departments[employee.department].employees.filter(id => id !== employeeId);
        }
        
        // 新しい部署に追加
        employee.department = departmentId;
        if (!this.departments[departmentId].employees.includes(employeeId)) {
            this.departments[departmentId].employees.push(employeeId);
        }
        
        // 満足度への影響計算
        const fitness = employee.getDepartmentFitness(departmentId);
        if (fitness > 70) {
            employee.satisfaction = Math.min(100, employee.satisfaction + 10);
        } else if (fitness < 40) {
            employee.satisfaction = Math.max(0, employee.satisfaction - 10);
        }
        
        return { success: true, departmentFitness: fitness };
    }

    /**
     * 部署長任命
     */
    appointDepartmentManager(employeeId, departmentId) {
        const employee = this.employees.find(e => e.id === employeeId);
        const department = this.departments[departmentId];
        
        if (!employee || !department) {
            return { success: false, error: '従業員または部署が見つかりません' };
        }
        
        // リーダーシップ要件チェック
        const promotionReadiness = employee.getPromotionReadiness();
        if (promotionReadiness.manager.readiness < 0.6) {
            return { 
                success: false, 
                error: '管理職の要件を満たしていません',
                blockers: promotionReadiness.manager.blockers
            };
        }
        
        // 現在の部署長解任
        if (department.manager) {
            const currentManager = this.employees.find(e => e.id === department.manager);
            if (currentManager) {
                currentManager.position = 'member';
                currentManager.satisfaction -= 15; // 降格による不満
            }
        }
        
        // 新部署長任命
        department.manager = employeeId;
        employee.position = 'manager';
        employee.department = departmentId;
        
        // 給与調整（+30%）
        employee.salary = Math.round(employee.salary * 1.3);
        
        // 満足度向上
        employee.satisfaction = Math.min(100, employee.satisfaction + 20);
        employee.loyaltyLevel = Math.min(100, employee.loyaltyLevel + 15);
        
        return { success: true, newSalary: employee.salary };
    }

    /**
     * 従業員研修（拡張版）
     */
    conductTraining(trainingType, targetEmployees = [], budget = 500000) {
        if (!this.canAfford(budget)) {
            return { success: false, error: '研修予算が不足しています' };
        }

        const trainingPrograms = {
            technical: {
                name: '技術研修',
                cost: 300000,
                duration: 2,
                effects: { technical: 15, analytical: 10 },
                targetSkills: ['development', 'system_design']
            },
            business: {
                name: 'ビジネス研修',
                cost: 250000,
                duration: 2,
                effects: { business: 15, communication: 10 },
                targetSkills: ['sales', 'negotiation']
            },
            leadership: {
                name: 'リーダーシップ研修',
                cost: 400000,
                duration: 3,
                effects: { leadership: 20, management: 15 },
                targetSkills: ['people_management', 'team_leadership']
            },
            comprehensive: {
                name: '総合研修',
                cost: 500000,
                duration: 4,
                effects: { 
                    technical: 10, business: 10, leadership: 10, 
                    communication: 10, planning: 10
                },
                targetSkills: ['all']
            }
        };

        const program = trainingPrograms[trainingType];
        if (!program) {
            return { success: false, error: '無効な研修タイプです' };
        }

        const employees = targetEmployees.length > 0 ? 
            this.employees.filter(e => targetEmployees.includes(e.id)) :
            this.employees;

        const totalCost = program.cost * employees.length;
        if (totalCost > budget) {
            return { success: false, error: '予算が足りません' };
        }

        this.spendMoney(totalCost, `${program.name}費用`);

        // 研修効果適用
        const results = [];
        employees.forEach(employee => {
            const personality = employee.getPersonality();
            const learningMultiplier = personality.effects.learningBonus || 1.0;
            
            // 基本能力向上
            Object.keys(program.effects).forEach(abilityKey => {
                if (employee.baseAbilities[abilityKey] !== undefined) {
                    const improvement = Math.round(program.effects[abilityKey] * learningMultiplier);
                    employee.baseAbilities[abilityKey] = Math.min(100, 
                        employee.baseAbilities[abilityKey] + improvement);
                }
            });
            
            // スキル向上
            if (program.targetSkills.includes('all')) {
                Object.keys(employee.skills).forEach(skillKey => {
                    employee.skills[skillKey] = Math.min(100, 
                        employee.skills[skillKey] + Math.round(5 * learningMultiplier));
                });
            } else {
                program.targetSkills.forEach(skillCategory => {
                    Object.keys(SKILL_CATEGORIES).forEach(mainCategoryKey => {
                        const mainCategory = SKILL_CATEGORIES[mainCategoryKey];
                        if (mainCategory.subcategories[skillCategory]) {
                            const subcategory = mainCategory.subcategories[skillCategory];
                            Object.keys(subcategory.skills).forEach(skillKey => {
                                employee.skills[skillKey] = Math.min(100, 
                                    employee.skills[skillKey] + Math.round(10 * learningMultiplier));
                            });
                        }
                    });
                });
            }
            
            // 満足度・モチベーション向上
            employee.satisfaction = Math.min(100, employee.satisfaction + 10);
            employee.motivation = Math.min(100, employee.motivation + 5);
            employee.experience += program.duration;
            
            results.push({
                employeeId: employee.id,
                name: employee.name,
                improvements: program.effects
            });
        });

        return {
            success: true,
            program: program.name,
            participantCount: employees.length,
            totalCost: totalCost,
            results: results
        };
    }

    /**
     * 労働環境改善
     */
    improveWorkEnvironment(improvementType, budget = 1000000) {
        const improvements = {
            office_upgrade: {
                name: 'オフィス改装',
                options: [
                    { level: 'comfortable', cost: 2000000, facility: WORK_ENVIRONMENT.office_facilities.comfortable },
                    { level: 'luxury', cost: 5000000, facility: WORK_ENVIRONMENT.office_facilities.luxury }
                ]
            },
            welfare_expansion: {
                name: '福利厚生拡充',
                options: [
                    { type: 'cafeteria', cost: 3000000, program: WORK_ENVIRONMENT.welfare_programs.cafeteria },
                    { type: 'gym', cost: 1500000, program: WORK_ENVIRONMENT.welfare_programs.gym },
                    { type: 'learning', cost: 0, program: WORK_ENVIRONMENT.welfare_programs.learning_support }
                ]
            },
            work_style: {
                name: '働き方改革',
                options: [
                    { style: 'flexible', cost: 200000, workStyle: WORK_ENVIRONMENT.work_styles.flexible },
                    { style: 'remote', cost: 1000000, workStyle: WORK_ENVIRONMENT.work_styles.remote_friendly }
                ]
            }
        };

        const improvement = improvements[improvementType];
        if (!improvement) {
            return { success: false, error: '無効な改善タイプです' };
        }

        // 予算に応じた最適なオプションを選択
        const affordableOptions = improvement.options.filter(option => option.cost <= budget);
        if (affordableOptions.length === 0) {
            return { success: false, error: '予算が不足しています' };
        }

        // 最も高価なオプションを選択
        const selectedOption = affordableOptions.reduce((best, current) => 
            current.cost > best.cost ? current : best
        );

        this.spendMoney(selectedOption.cost, `${improvement.name}費用`);

        // 改善効果適用
        let effectMessage = '';
        if (selectedOption.facility) {
            this.workEnvironment.facilities = selectedOption.facility;
            effectMessage = `オフィス環境が${selectedOption.level}レベルに向上`;
        } else if (selectedOption.program) {
            if (!this.workEnvironment.welfare.includes(selectedOption.type)) {
                this.workEnvironment.welfare.push(selectedOption.type);
            }
            effectMessage = `${selectedOption.program.name}を導入`;
        } else if (selectedOption.workStyle) {
            this.workEnvironment.workStyle = selectedOption.workStyle;
            effectMessage = `働き方を${selectedOption.style}に変更`;
        }

        // 全従業員の満足度向上
        this.employees.forEach(employee => {
            employee.satisfaction = Math.min(100, employee.satisfaction + 15);
            if (selectedOption.workStyle && selectedOption.style === 'remote') {
                const personality = employee.getPersonality();
                if (personality.workPreference === 'flexibility') {
                    employee.satisfaction = Math.min(100, employee.satisfaction + 10);
                }
            }
        });

        return {
            success: true,
            improvement: improvement.name,
            option: selectedOption,
            effect: effectMessage,
            cost: selectedOption.cost
        };
    }

    /**
     * 人間関係の更新
     */
    updateRelationships() {
        // 全従業員間の関係性を計算・更新
        this.employees.forEach(employee1 => {
            this.employees.forEach(employee2 => {
                if (employee1.id !== employee2.id) {
                    const relationshipKey = `${employee1.id}-${employee2.id}`;
                    
                    // 基本相性
                    const compatibility = employee1.getCompatibilityWith(employee2);
                    
                    // 既存関係値
                    let currentRelation = this.relationshipMatrix[relationshipKey] || 0;
                    
                    // 同じ部署で働いているかどうか
                    const sameDepartment = employee1.department === employee2.department;
                    
                    if (sameDepartment) {
                        // 相性が良ければ関係改善、悪ければ悪化
                        const relationChange = (compatibility - 1.0) * 5;
                        currentRelation += relationChange;
                    }
                    
                    // プロジェクトでの協力（ランダムイベント）
                    if (Math.random() < 0.1 && sameDepartment) {
                        const collaborationSuccess = Math.random() < 0.7;
                        currentRelation += collaborationSuccess ? 5 : -2;
                    }
                    
                    // 関係値を-50から+50の範囲に制限
                    currentRelation = Math.max(-50, Math.min(50, currentRelation));
                    this.relationshipMatrix[relationshipKey] = currentRelation;
                    
                    // 従業員の個人関係記録も更新
                    employee1.relationships[employee2.id] = currentRelation;
                }
            });
        });
    }

    /**
     * チーム統計の計算
     */
    calculateTeamStats() {
        if (this.employees.length === 0) return;

        // 平均スキルレベル
        const totalSkillLevel = this.employees.reduce((sum, emp) => sum + emp.getTotalAbility(), 0);
        this.teamStats.averageSkillLevel = totalSkillLevel / this.employees.length;

        // チームモラール（満足度・モチベーション・ストレスの総合）
        const totalMorale = this.employees.reduce((sum, emp) => {
            return sum + (emp.satisfaction + emp.motivation - emp.stress) / 3;
        }, 0);
        this.teamStats.teamMorale = totalMorale / this.employees.length;

        // 部署別効率性（既に計算済みのperformance.currentを使用）
        Object.keys(this.departments).forEach(deptId => {
            const deptEmployees = this.employees.filter(emp => emp.department === deptId);
            if (deptEmployees.length > 0) {
                const deptPerformance = deptEmployees.reduce((sum, emp) => {
                    return sum + (emp.performance.current || 0);
                }, 0) / deptEmployees.length;

                this.teamStats.departmentEfficiency[deptId] = deptPerformance;
            }
        });

        // 社内対立レベル
        let conflictCount = 0;
        let totalRelationships = 0;
        Object.values(this.relationshipMatrix).forEach(relation => {
            totalRelationships++;
            if (relation < -20) conflictCount++; // 関係値-20以下を対立とみなす
        });

        this.teamStats.conflictLevel = totalRelationships > 0 ?
            (conflictCount / totalRelationships) * 100 : 0;
    }

    /**
     * 月次HR処理
     */
    processMonthlyHR() {
        // 関係性更新
        this.updateRelationships();

        // 各従業員のマイルストーン・状態更新
        const newMilestones = [];
        this.employees.forEach(employee => {
            const teamMembers = this.employees.filter(e => e.department === employee.department);

            // パフォーマンス計算
            employee.calculateMonthlyPerformance(teamMembers, this.workEnvironment);

            // 心理状態更新
            employee.updatePsychologicalState(1.0, this.workEnvironment);

            // 学習進捗更新
            employee.updateLearningProgress();

            // マイルストーンチェック
            const employeeMilestones = employee.checkMilestones();
            if (employeeMilestones.length > 0) {
                newMilestones.push(...employeeMilestones);
            }
        });

        // チーム統計計算
        this.calculateTeamStats();

        // 離職チェック
        this.checkEmployeeRetention();

        return {
            teamStats: this.teamStats,
            retentionIssues: this.getRetentionIssues(),
            newMilestones: newMilestones
        };
    }

    /**
     * 離職チェック
     */
    checkEmployeeRetention() {
        const quitEmployees = [];
        
        this.employees.forEach(employee => {
            const quitRisk = employee.getQuitRisk();
            
            if (Math.random() < quitRisk) {
                quitEmployees.push({
                    employee: employee,
                    reason: this.getQuitReason(employee),
                    quitRisk: quitRisk
                });
            }
        });
        
        // 実際に退職処理
        quitEmployees.forEach(({ employee, reason }) => {
            this.processEmployeeQuit(employee.id, reason);
        });
        
        return quitEmployees;
    }

    /**
     * 退職理由の特定
     */
    getQuitReason(employee) {
        const reasons = [];
        
        if (employee.satisfaction < 30) reasons.push('満足度低下');
        if (employee.stress > 70) reasons.push('過度なストレス');
        if (employee.salary < employee.getMarketSalary() * 0.8) reasons.push('給与不満');
        if (employee.getDepartmentFitness(employee.department) < 40) reasons.push('部署不適合');
        
        const badRelationships = Object.values(employee.relationships).filter(r => r < -30);
        if (badRelationships.length > 2) reasons.push('人間関係の問題');
        
        return reasons.length > 0 ? reasons[0] : 'キャリアアップ';
    }

    /**
     * 従業員退職処理
     */
    processEmployeeQuit(employeeId, reason) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee) return;
        
        // 部署から削除
        if (this.departments[employee.department]) {
            this.departments[employee.department].employees = 
                this.departments[employee.department].employees.filter(id => id !== employeeId);
                
            // 部署長だった場合
            if (this.departments[employee.department].manager === employeeId) {
                this.departments[employee.department].manager = null;
            }
        }
        
        // 従業員リストから削除
        this.employees = this.employees.filter(e => e.id !== employeeId);
        
        // 関係マトリックスからも削除
        Object.keys(this.relationshipMatrix).forEach(key => {
            if (key.includes(employeeId.toString())) {
                delete this.relationshipMatrix[key];
            }
        });
        
        // 他の従業員への影響
        this.employees.forEach(otherEmployee => {
            const relationshipScore = otherEmployee.relationships[employeeId];
            if (relationshipScore !== undefined) {
                // 退職による士気への影響（削除前に値を取得）
                if (relationshipScore > 20) {
                    otherEmployee.satisfaction = Math.max(0, otherEmployee.satisfaction - 10);
                    otherEmployee.motivation = Math.max(0, otherEmployee.motivation - 5);
                }

                delete otherEmployee.relationships[employeeId];
            }
        });
        
        return { employee, reason };
    }

    /**
     * 人事課題の特定
     */
    getRetentionIssues() {
        const issues = [];
        
        // 高リスク従業員
        const highRiskEmployees = this.employees.filter(e => e.getQuitRisk() > 0.3);
        if (highRiskEmployees.length > 0) {
            issues.push({
                type: 'high_quit_risk',
                severity: 'high',
                description: `${highRiskEmployees.length}名の従業員に高い離職リスク`,
                employees: highRiskEmployees.map(e => ({ id: e.id, name: e.name, risk: e.getQuitRisk() }))
            });
        }
        
        // 部署の人手不足
        Object.keys(this.departments).forEach(deptId => {
            const dept = ENHANCED_DEPARTMENTS[deptId];
            const currentCount = this.departments[deptId].employees.length;
            
            if (currentCount < dept.minEmployees) {
                issues.push({
                    type: 'understaffed',
                    severity: 'high',
                    description: `${dept.name}が人手不足（${currentCount}/${dept.minEmployees}人）`,
                    department: deptId
                });
            }
        });
        
        // スキル不足
        if (this.teamStats.averageSkillLevel < 50) {
            issues.push({
                type: 'skill_gap',
                severity: 'medium',
                description: 'チーム全体のスキルレベルが低下',
                averageLevel: this.teamStats.averageSkillLevel
            });
        }
        
        // 社内対立
        if (this.teamStats.conflictLevel > 30) {
            issues.push({
                type: 'high_conflict',
                severity: 'medium',
                description: '社内の人間関係に問題',
                conflictLevel: this.teamStats.conflictLevel
            });
        }
        
        return issues;
    }

    /**
     * 拡張された月次処理
     */
    processMonthlyUpdate() {
        // 基本の月次処理
        const baseResults = super.processMonthlyUpdate();

        // 拡張HR処理
        const hrResults = this.processMonthlyHR();

        // 業界固有の影響
        const sectorEffects = this.applySectorEffects();

        // デイリーミッションリセット
        this.dailyMissionSystem.resetMonthlyMissions();

        // 満足度でミッションチェック
        if (this.teamStats.teamMorale >= 80) {
            this.dailyMissionSystem.checkProgress('satisfaction', this.teamStats.teamMorale);
        }

        // 成長ダッシュボード履歴更新
        this.growthDashboard.updateHistory();

        return {
            ...baseResults,
            hr: hrResults,
            sector: sectorEffects
        };
    }

    /**
     * 業界固有効果の適用
     */
    applySectorEffects() {
        const sector = BUSINESS_SECTORS[this.businessSector];
        if (!sector) return {};
        
        let effects = {
            revenueMultiplier: 1.0,
            volatility: 1.0,
            competitionPressure: 1.0
        };
        
        // 市場規模による影響
        effects.revenueMultiplier *= sector.market_size_multiplier || 1.0;
        
        // 業界特性による影響
        if (sector.characteristics.growth_potential === 'very_high') {
            effects.revenueMultiplier *= (1.0 + Math.random() * 0.3); // 0-30%ボーナス
        } else if (sector.characteristics.growth_potential === 'low') {
            effects.revenueMultiplier *= (0.9 + Math.random() * 0.1); // -10%〜0%
        }
        
        // 競争激化による影響
        if (sector.characteristics.competition === 'very_high') {
            effects.competitionPressure = 1.5;
        }
        
        // 技術変化速度による影響
        if (sector.characteristics.technology_change_speed === 'very_high') {
            // 技術スキルが低いと不利
            const avgTechSkill = this.employees.reduce((sum, emp) => {
                return sum + emp.baseAbilities.technical;
            }, 0) / Math.max(1, this.employees.length);
            
            if (avgTechSkill < 60) {
                effects.revenueMultiplier *= 0.8; // 技術遅れペナルティ
            }
        }
        
        return effects;
    }

    /**
     * ゲーム状態取得（拡張版）
     */
    getGameState() {
        const baseState = super.getGameState();
        
        return {
            ...baseState,
            businessSector: this.businessSector,
            departments: this.departments,
            workEnvironment: this.workEnvironment,
            relationshipMatrix: this.relationshipMatrix,
            teamStats: this.teamStats,
            policies: this.policies,
            interviewSystem: {
                currentCandidates: this.interviewSystem.getCurrentCandidates(),
                hiringBudget: this.interviewSystem.hiringBudget
            }
        };
    }

    /**
     * セーブ（拡張版）
     */
    saveGame() {
        try {
            const enhancedData = {
                ...this.getGameState(),
                employees: this.employees.map(emp => emp.toJSON()),
                version: '2.0' // 拡張版識別
            };
            
            localStorage.setItem('businessEmpire', JSON.stringify(enhancedData));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * ロード（拡張版）
     */
    loadGame() {
        try {
            const saveData = localStorage.getItem('businessEmpire');
            if (!saveData) {
                throw new Error('保存データが見つかりません');
            }
            
            const data = JSON.parse(saveData);
            
            // バージョンチェック
            if (data.version === '2.0') {
                // 拡張版データの復元
                Object.assign(this, data);
                
                // 従業員オブジェクトの復元
                this.employees = data.employees.map(empData => EnhancedEmployee.fromJSON(empData));
                
                // 面接システムの復元
                this.interviewSystem = new InterviewSystem(this);
            } else {
                // 旧版からの移行
                this.migrateFromOldVersion(data);
            }
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 旧版データからの移行
     */
    migrateFromOldVersion(oldData) {
        // 基本データのコピー
        this.money = oldData.money || GAME_CONSTANTS.INITIAL_VALUES.MONEY;
        this.turn = oldData.turn || 1;
        this.year = oldData.year || GAME_CONSTANTS.INITIAL_VALUES.YEAR;
        this.month = oldData.month || GAME_CONSTANTS.INITIAL_VALUES.MONTH;
        this.week = oldData.week || GAME_CONSTANTS.INITIAL_VALUES.WEEK;
        
        // 従業員データの変換
        this.employees = (oldData.employees || []).map(oldEmp => {
            return new EnhancedEmployee({
                id: oldEmp.id,
                name: oldEmp.name,
                personalityId: 'serious', // デフォルト
                baseAbilities: {
                    technical: oldEmp.abilities?.technical || 50,
                    business: oldEmp.abilities?.sales || 50,
                    planning: oldEmp.abilities?.planning || 50,
                    management: oldEmp.abilities?.management || 50,
                    communication: 50,
                    creativity: 50,
                    analytical: 50,
                    leadership: 50
                },
                salary: oldEmp.salary || 400000,
                department: oldEmp.department || 'development'
            });
        });
        
        // 拡張データの初期化
        this.initializeEnhancements();
    }
}

/**
 * 成長ダッシュボードシステム
 */
class GrowthDashboard {
    constructor(game) {
        this.game = game;
        this.charts = {};
        this.historyData = {
            revenue: [],
            employees: [],
            marketShare: [],
            satisfaction: [],
            labels: []
        };
    }

    /**
     * 月次データを履歴に追加
     */
    updateHistory() {
        const state = this.game.getGameState();

        this.historyData.revenue.push(state.monthlyRevenue || 0);
        this.historyData.employees.push(state.employees.length);
        this.historyData.marketShare.push(state.marketShare || 0);
        this.historyData.satisfaction.push(Math.round(state.teamStats.teamMorale || 0));
        this.historyData.labels.push(`${state.year}年${state.month}月`);

        // 最新12ヶ月分のみ保持
        if (this.historyData.labels.length > 12) {
            Object.keys(this.historyData).forEach(key => {
                this.historyData[key].shift();
            });
        }
    }

    /**
     * 財務成長グラフ描画
     */
    renderFinancialChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // 既存のグラフを破棄
        if (this.charts.financial) {
            this.charts.financial.destroy();
        }

        this.charts.financial = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.historyData.labels,
                datasets: [
                    {
                        label: '売上 (万円)',
                        data: this.historyData.revenue,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        label: '市場シェア (%)',
                        data: this.historyData.marketShare,
                        borderColor: '#4ecdc4',
                        backgroundColor: 'rgba(78, 205, 196, 0.1)',
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                if (label.includes('売上')) {
                                    return `${label}: ${value}万円`;
                                }
                                return `${label}: ${value}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '売上 (万円)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: '市場シェア (%)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

    /**
     * チーム成長グラフ描画
     */
    renderTeamChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // 既存のグラフを破棄
        if (this.charts.team) {
            this.charts.team.destroy();
        }

        this.charts.team = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.historyData.labels,
                datasets: [
                    {
                        label: '従業員数',
                        data: this.historyData.employees,
                        backgroundColor: 'rgba(76, 175, 80, 0.6)',
                        borderColor: '#4caf50',
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: '満足度 (%)',
                        data: this.historyData.satisfaction,
                        backgroundColor: 'rgba(255, 167, 38, 0.6)',
                        borderColor: '#ffa726',
                        borderWidth: 2,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        },
                        title: {
                            display: true,
                            text: '従業員数'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: '満足度 (%)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

    /**
     * JSON形式で保存
     */
    toJSON() {
        return {
            historyData: this.historyData
        };
    }

    /**
     * JSONから復元
     */
    static fromJSON(data, game) {
        const dashboard = new GrowthDashboard(game);
        dashboard.historyData = data.historyData || {
            revenue: [],
            employees: [],
            marketShare: [],
            satisfaction: [],
            labels: []
        };
        return dashboard;
    }
}

/**
 * デイリーミッションシステム
 */
class DailyMissionSystem {
    constructor(game) {
        this.game = game;
        this.missions = [];
        this.lastGeneratedDate = null;
        this.lastGeneratedMonth = null;
    }

    /**
     * デイリーミッションを生成
     */
    generateDailyMissions() {
        const missionPool = [
            {
                id: 'hire_1',
                name: '人材採用',
                desc: '従業員を1人採用する',
                reward: { money: 50000, reputation: 5 },
                type: 'hire',
                target: 1
            },
            {
                id: 'train_3',
                name: '研修実施',
                desc: '3人に研修を実施する',
                reward: { money: 30000, reputation: 3 },
                type: 'train',
                target: 3
            },
            {
                id: 'develop_product',
                name: '製品開発',
                desc: '新製品を1つ開発する',
                reward: { money: 80000, reputation: 10 },
                type: 'develop',
                target: 1
            },
            {
                id: 'revenue_100',
                name: '売上目標',
                desc: '月間売上100万円達成',
                reward: { money: 100000, reputation: 15 },
                type: 'revenue',
                target: 1000000
            },
            {
                id: 'satisfaction_80',
                name: 'チーム満足度向上',
                desc: 'チーム満足度を80%以上にする',
                reward: { money: 60000, reputation: 8 },
                type: 'satisfaction',
                target: 80
            },
            {
                id: 'promote_1',
                name: '昇進',
                desc: '従業員を1人昇進させる',
                reward: { money: 40000, reputation: 5 },
                type: 'promote',
                target: 1
            }
        ];

        // ランダムに3つ選択
        this.missions = this.shuffleArray(missionPool).slice(0, 3).map(m => ({
            ...m,
            progress: 0,
            completed: false
        }));

        this.lastGeneratedDate = new Date().toDateString();
        this.lastGeneratedMonth = `${this.game.year}-${this.game.month}`;
    }

    /**
     * ミッション進捗チェック
     */
    checkProgress(actionType, value) {
        const completedMissions = [];

        this.missions.forEach(mission => {
            if (mission.type === actionType && !mission.completed) {
                // 閾値タイプ（satisfaction, revenue）は直接値を比較
                const isThresholdMission = ['satisfaction', 'revenue'].includes(mission.type);

                if (isThresholdMission) {
                    // 閾値に達しているかチェック
                    if (value >= mission.target) {
                        mission.progress = mission.target;
                        mission.completed = true;
                    }
                } else {
                    // カウントタイプ（hire, train, promote等）は累積加算
                    mission.progress += value;

                    if (mission.progress >= mission.target) {
                        mission.completed = true;
                    }
                }

                // 報酬付与
                if (mission.completed && completedMissions.findIndex(m => m.id === mission.id) === -1) {
                    if (mission.reward.money) {
                        this.game.money += mission.reward.money;
                    }
                    if (mission.reward.reputation) {
                        this.game.reputation = Math.min(100, this.game.reputation + mission.reward.reputation);
                    }

                    completedMissions.push(mission);
                }
            }
        });

        // 全ミッション達成ボーナス
        if (this.missions.every(m => m.completed) && completedMissions.length > 0) {
            this.game.money += 200000;
            completedMissions.push({
                name: '全ミッションコンプリート',
                reward: { money: 200000, reputation: 20 },
                bonus: true
            });
        }

        return completedMissions;
    }

    /**
     * 月初にミッションをリセット
     */
    resetMonthlyMissions() {
        const currentMonth = `${this.game.year}-${this.game.month}`;
        if (this.lastGeneratedMonth !== currentMonth) {
            this.generateDailyMissions();
        }
    }

    /**
     * 配列をシャッフル
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * JSON形式で保存
     */
    toJSON() {
        return {
            missions: this.missions,
            lastGeneratedDate: this.lastGeneratedDate,
            lastGeneratedMonth: this.lastGeneratedMonth
        };
    }

    /**
     * JSONから復元
     */
    static fromJSON(data, game) {
        const system = new DailyMissionSystem(game);
        system.missions = data.missions || [];
        system.lastGeneratedDate = data.lastGeneratedDate;
        system.lastGeneratedMonth = data.lastGeneratedMonth;
        return system;
    }
}