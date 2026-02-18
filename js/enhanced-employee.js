/**
 * 経営シミュレーションゲーム - 拡張従業員システム
 */

/**
 * 拡張従業員クラス
 */
class EnhancedEmployee {
    constructor({
        id = Date.now(),
        name = '',
        personalityId = 'serious',
        baseAbilities = {},
        skills = {},
        certifications = [],
        motivation = 75,
        satisfaction = 75,
        stress = 0,
        salary = 400000,
        department = 'development',
        position = 'member',
        experience = 0,
        workPreference = null,
        relationships = {},
        performance = { current: 0, history: [] },
        traits = [],
        workStyle = 'office',
        backstory = null,
        quirks = null,
        milestones = [],
        learningProgress = {},
        burnoutRisk = 0,
        loyaltyLevel = 50
    } = {}) {
        this.id = id;
        this.name = name;
        this.personalityId = personalityId;
        this.baseAbilities = this.initializeAbilities(baseAbilities);
        this.skills = this.initializeSkills(skills);
        this.certifications = [...certifications];
        this.motivation = motivation;
        this.satisfaction = satisfaction;
        this.stress = stress;
        this.salary = salary;
        this.department = department;
        this.position = position; // member, leader, manager
        this.experience = experience;
        this.workPreference = workPreference;
        this.relationships = { ...relationships }; // 他従業員との関係度
        this.performance = { ...performance };
        this.traits = [...traits];
        this.workStyle = workStyle;
        this.learningProgress = { ...learningProgress }; // 現在学習中のスキル/資格
        this.burnoutRisk = burnoutRisk;
        this.loyaltyLevel = loyaltyLevel;

        // ストーリー要素の生成または復元
        this.backstory = backstory || this.generateBackstory();
        this.quirks = quirks || this.generateQuirks();
        this.milestones = [...milestones]; // 達成したマイルストーン
    }

    /**
     * 基本能力値の初期化
     */
    initializeAbilities(abilities) {
        return {
            technical: abilities.technical ?? GameUtils.generateRandomAbility(),
            business: abilities.business ?? GameUtils.generateRandomAbility(),
            planning: abilities.planning ?? GameUtils.generateRandomAbility(),
            management: abilities.management ?? GameUtils.generateRandomAbility(),
            communication: abilities.communication ?? GameUtils.generateRandomAbility(),
            creativity: abilities.creativity ?? GameUtils.generateRandomAbility(),
            analytical: abilities.analytical ?? GameUtils.generateRandomAbility(),
            leadership: abilities.leadership ?? GameUtils.generateRandomAbility()
        };
    }

    /**
     * スキルマップの初期化
     */
    initializeSkills(skills = {}) {
        const initialSkills = {};
        
        // SKILL_CATEGORIESが存在する場合のみ初期化
        if (typeof SKILL_CATEGORIES !== 'undefined') {
            Object.keys(SKILL_CATEGORIES).forEach(categoryKey => {
                const category = SKILL_CATEGORIES[categoryKey];
                if (category && category.subcategories) {
                    Object.keys(category.subcategories).forEach(subKey => {
                        const subcategory = category.subcategories[subKey];
                        if (subcategory && subcategory.skills) {
                            Object.keys(subcategory.skills).forEach(skillKey => {
                                initialSkills[skillKey] = skills[skillKey] || 0;
                            });
                        }
                    });
                }
            });
        }

        return initialSkills;
    }

    /**
     * 性格特性を取得
     */
    getPersonality() {
        if (typeof ENHANCED_PERSONALITIES !== 'undefined') {
            return ENHANCED_PERSONALITIES[this.personalityId] || ENHANCED_PERSONALITIES.serious;
        }
        // フォールバック用の基本性格定義
        return {
            id: this.personalityId || 'serious',
            name: 'まじめ',
            description: '安定性を重視する性格',
            effects: { reliability: 1.0 },
            workPreference: 'stability',
            teamRole: 'supporter'
        };
    }

    /**
     * 総合能力値の計算（性格・スキル・経験考慮）
     */
    getTotalAbility() {
        const personality = this.getPersonality();
        let total = 0;
        
        Object.values(this.baseAbilities).forEach(ability => {
            total += ability;
        });
        
        // 経験ボーナス
        total += this.experience * 2;
        
        // 性格による修正
        total *= this.getPersonalityMultiplier();
        
        return Math.round(total);
    }

    /**
     * 性格による能力修正値を取得
     */
    getPersonalityMultiplier() {
        const personality = this.getPersonality();
        let multiplier = 1.0;
        
        // 満足度による影響
        multiplier *= (this.satisfaction / 100);
        
        // ストレスによる影響
        multiplier *= Math.max(0.5, 1.0 - (this.stress / 200));
        
        // 性格特性による影響
        if (personality.effects.reliability) {
            multiplier *= personality.effects.reliability;
        }
        
        return multiplier;
    }

    /**
     * 特定スキルレベルを取得
     */
    getSkillLevel(skillKey) {
        const baseLevel = this.skills[skillKey] || 0;
        const certificationBonus = this.getCertificationBonus(skillKey);
        const experienceBonus = Math.floor(this.experience / 10);
        
        return Math.min(100, baseLevel + certificationBonus + experienceBonus);
    }

    /**
     * 資格による特定スキルボーナスを計算
     */
    getCertificationBonus(skillKey) {
        let bonus = 0;
        
        this.certifications.forEach(certId => {
            const cert = CERTIFICATIONS[certId];
            if (cert && cert.effects) {
                // 全技術スキルボーナス
                if (cert.effects.all_technical_skills && this.isTechnicalSkill(skillKey)) {
                    bonus += cert.effects.all_technical_skills;
                }
                // 特定スキルボーナス
                if (cert.effects[skillKey]) {
                    bonus += cert.effects[skillKey];
                }
            }
        });
        
        return bonus;
    }

    /**
     * 技術スキルかどうかを判定
     */
    isTechnicalSkill(skillKey) {
        const technicalSkills = SKILL_CATEGORIES.technical;
        for (let subCategoryKey in technicalSkills.subcategories) {
            if (technicalSkills.subcategories[subCategoryKey].skills[skillKey]) {
                return true;
            }
        }
        return false;
    }

    /**
     * 部署適性度を計算
     */
    getDepartmentFitness(departmentId) {
        const department = ENHANCED_DEPARTMENTS[departmentId];
        if (!department) return 0;
        
        let fitness = 0;
        let totalWeight = 0;
        
        // 主要スキルの適性（重み3）
        department.primarySkills.forEach(skillKey => {
            fitness += this.getSkillLevel(skillKey) * 3;
            totalWeight += 3;
        });
        
        // 副次スキルの適性（重み1）
        department.secondarySkills.forEach(skillKey => {
            fitness += this.getSkillLevel(skillKey) * 1;
            totalWeight += 1;
        });
        
        // 性格適性
        const personality = this.getPersonality();
        const personalityBonus = this.getPersonalityDepartmentBonus(personality, departmentId);
        fitness *= personalityBonus;
        
        return totalWeight > 0 ? fitness / totalWeight : 0;
    }

    /**
     * 性格による部署適性ボーナス
     */
    getPersonalityDepartmentBonus(personality, departmentId) {
        const bonusMap = {
            development: {
                craftsman: 1.3,
                innovator: 1.2,
                perfectionist: 1.15,
                analyst: 1.1
            },
            sales: {
                communicator: 1.3,
                cheerful: 1.25,
                entrepreneur: 1.2,
                competitive: 1.15
            },
            planning: {
                analyst: 1.3,
                entrepreneur: 1.2,
                ambitious: 1.15,
                cautious: 1.1
            },
            quality: {
                perfectionist: 1.4,
                cautious: 1.3,
                analyst: 1.2,
                serious: 1.1
            },
            hr: {
                communicator: 1.25,
                cooperative: 1.2,
                serious: 1.15,
                stable: 1.1
            }
        };
        
        return bonusMap[departmentId]?.[personality.id] || 1.0;
    }

    /**
     * スキル学習
     */
    learnSkill(skillKey, effort = 10) {
        if (!this.skills.hasOwnProperty(skillKey)) return false;
        
        const personality = this.getPersonality();
        const learningMultiplier = personality.effects.learningBonus || 1.0;
        const motivationMultiplier = this.motivation / 100;
        
        const progress = effort * learningMultiplier * motivationMultiplier;
        this.skills[skillKey] = Math.min(100, this.skills[skillKey] + progress);
        
        return true;
    }

    /**
     * 資格取得開始
     */
    startCertification(certificationId) {
        const cert = CERTIFICATIONS[certificationId];
        if (!cert) return false;
        
        // 前提条件チェック
        if (cert.prerequisite) {
            const hasPrerequisites = cert.prerequisite.every(prereq => 
                this.certifications.includes(prereq)
            );
            if (!hasPrerequisites) return false;
        }
        
        this.learningProgress[certificationId] = {
            type: 'certification',
            progress: 0,
            maxProgress: cert.duration,
            cost: cert.cost
        };
        
        return true;
    }

    /**
     * 学習進捗更新
     */
    updateLearningProgress() {
        const personality = this.getPersonality();
        const learningMultiplier = personality.effects.learningBonus || 1.0;
        const motivationMultiplier = this.motivation / 100;
        
        Object.keys(this.learningProgress).forEach(key => {
            const learning = this.learningProgress[key];
            learning.progress += learningMultiplier * motivationMultiplier;
            
            // 完了チェック
            if (learning.progress >= learning.maxProgress) {
                if (learning.type === 'certification') {
                    this.certifications.push(key);
                    // 給与更新
                    const cert = CERTIFICATIONS[key];
                    if (cert.effects.salary_multiplier) {
                        this.salary *= cert.effects.salary_multiplier;
                    }
                }
                delete this.learningProgress[key];
            }
        });
    }

    /**
     * 他従業員との相性度を計算
     */
    getCompatibilityWith(otherEmployee) {
        if (!otherEmployee) return 1.0;
        
        let compatibility = 1.0;
        
        // 性格相性
        const personalityKey = `${this.personalityId}_${otherEmployee.personalityId}`;
        const reversePersonalityKey = `${otherEmployee.personalityId}_${this.personalityId}`;
        
        if (TEAM_COMPATIBILITY.personality_synergy[personalityKey]) {
            compatibility *= TEAM_COMPATIBILITY.personality_synergy[personalityKey].bonus;
        } else if (TEAM_COMPATIBILITY.personality_synergy[reversePersonalityKey]) {
            compatibility *= TEAM_COMPATIBILITY.personality_synergy[reversePersonalityKey].bonus;
        }
        
        // リーダーシップ相性
        const myPersonality = this.getPersonality();
        const otherPersonality = otherEmployee.getPersonality();
        
        if (myPersonality.teamRole === 'leader' && otherPersonality.teamRole === 'follower') {
            compatibility *= TEAM_COMPATIBILITY.leadership_combinations.leader_follower.bonus;
        } else if (myPersonality.teamRole === 'leader' && otherPersonality.teamRole === 'leader') {
            compatibility *= TEAM_COMPATIBILITY.leadership_combinations.leader_leader.bonus;
        }
        
        // 既存の人間関係
        if (this.relationships[otherEmployee.id]) {
            compatibility *= (1 + this.relationships[otherEmployee.id] / 200); // -50 to +50 -> 0.75 to 1.25
        }
        
        return compatibility;
    }

    /**
     * ストレス・満足度の更新
     */
    updatePsychologicalState(workload = 1.0, workEnvironment = {}) {
        const personality = this.getPersonality();
        
        // ストレス計算
        let stressIncrease = workload * 5;
        
        // 性格によるストレス耐性
        if (personality.effects.stressResistance) {
            stressIncrease /= personality.effects.stressResistance;
        }
        
        this.stress = Math.min(100, this.stress + stressIncrease);
        
        // 満足度計算
        let satisfactionChange = 0;
        
        // 給与満足度
        const marketSalary = this.getMarketSalary();
        const salaryRatio = this.salary / marketSalary;
        if (salaryRatio > 1.1) satisfactionChange += 5;
        else if (salaryRatio < 0.9) satisfactionChange -= 5;
        
        // 部署適性による満足度
        const deptFitness = this.getDepartmentFitness(this.department);
        if (deptFitness > 70) satisfactionChange += 3;
        else if (deptFitness < 40) satisfactionChange -= 3;
        
        // 労働環境による満足度
        if (workEnvironment.facilities) {
            satisfactionChange += (workEnvironment.facilities.effects.satisfaction - 1) * 50;
        }
        
        this.satisfaction = Math.max(0, Math.min(100, this.satisfaction + satisfactionChange));
        
        // バーンアウトリスク計算
        this.burnoutRisk = (this.stress * 0.6 + (100 - this.satisfaction) * 0.4) / 100;
    }

    /**
     * 市場給与の推定
     */
    getMarketSalary() {
        const baseSalary = 400000;
        const experienceMultiplier = 1 + (this.experience * 0.05);
        const skillMultiplier = 1 + (this.getTotalAbility() / 1000);
        
        let certificationMultiplier = 1.0;
        this.certifications.forEach(certId => {
            const cert = CERTIFICATIONS[certId];
            if (cert?.effects.salary_multiplier) {
                certificationMultiplier *= cert.effects.salary_multiplier;
            }
        });
        
        return Math.round(baseSalary * experienceMultiplier * skillMultiplier * certificationMultiplier);
    }

    /**
     * 離職リスク計算
     */
    getQuitRisk() {
        let quitRisk = 0;
        
        // 満足度による影響
        quitRisk += (100 - this.satisfaction) * 0.003;
        
        // ストレスによる影響
        quitRisk += this.stress * 0.002;
        
        // 給与不満による影響
        const marketSalary = this.getMarketSalary();
        const salaryRatio = this.salary / marketSalary;
        if (salaryRatio < 0.8) quitRisk += 0.1;
        else if (salaryRatio < 0.9) quitRisk += 0.05;
        
        // 性格による影響
        const personality = this.getPersonality();
        if (personality.effects.loyaltyBonus) {
            quitRisk *= (1 - personality.effects.loyaltyBonus);
        }
        
        // ロイヤリティによる影響
        quitRisk *= (1 - this.loyaltyLevel / 200);
        
        return Math.max(0, Math.min(0.5, quitRisk)); // 最大50%
    }

    /**
     * 月次パフォーマンス計算
     */
    calculateMonthlyPerformance(teamMembers = [], workEnvironment = {}) {
        let basePerformance = this.getTotalAbility();
        
        // チーム相性によるボーナス
        let teamBonus = 1.0;
        teamMembers.forEach(member => {
            if (member.id !== this.id) {
                teamBonus *= this.getCompatibilityWith(member);
            }
        });
        teamBonus = Math.pow(teamBonus, 1 / Math.max(1, teamMembers.length - 1)); // 平均値
        
        // 労働環境による影響
        let environmentBonus = 1.0;
        if (workEnvironment.facilities) {
            environmentBonus *= workEnvironment.facilities.effects.productivity || 1.0;
        }
        
        // モチベーション影響
        const motivationMultiplier = this.motivation / 100;
        
        // ストレス影響
        const stressMultiplier = Math.max(0.5, 1.0 - this.stress / 200);
        
        const finalPerformance = basePerformance * teamBonus * environmentBonus * motivationMultiplier * stressMultiplier;
        
        // パフォーマンス履歴を更新
        this.performance.current = Math.round(finalPerformance);
        this.performance.history.push({
            month: Date.now(),
            performance: this.performance.current,
            factors: {
                base: basePerformance,
                team: teamBonus,
                environment: environmentBonus,
                motivation: motivationMultiplier,
                stress: stressMultiplier
            }
        });
        
        // 履歴は最新12ヶ月のみ保持
        if (this.performance.history.length > 12) {
            this.performance.history.shift();
        }
        
        return this.performance.current;
    }

    /**
     * 昇進可能性を評価
     */
    getPromotionReadiness() {
        const requirements = {
            leader: {
                minExperience: 12,
                minLeadership: 60,
                minPerformance: 70,
                requiredTraits: ['leadership', 'communication']
            },
            manager: {
                minExperience: 24,
                minLeadership: 75,
                minPerformance: 80,
                requiredTraits: ['leadership', 'management', 'strategic_thinking']
            }
        };
        
        const results = {};
        
        Object.keys(requirements).forEach(position => {
            const req = requirements[position];
            let score = 0;
            let maxScore = 0;
            
            // 経験チェック
            maxScore += 25;
            if (this.experience >= req.minExperience) score += 25;
            else score += (this.experience / req.minExperience) * 25;
            
            // リーダーシップ能力
            maxScore += 25;
            if (this.baseAbilities.leadership >= req.minLeadership) score += 25;
            else score += (this.baseAbilities.leadership / req.minLeadership) * 25;
            
            // パフォーマンス
            maxScore += 25;
            if (this.performance.current >= req.minPerformance) score += 25;
            else score += (this.performance.current / req.minPerformance) * 25;
            
            // 満足度・ロイヤリティ
            maxScore += 25;
            score += (this.satisfaction + this.loyaltyLevel) / 200 * 25;
            
            results[position] = {
                readiness: score / maxScore,
                blockers: this.getPromotionBlockers(req)
            };
        });
        
        return results;
    }

    /**
     * 昇進の阻害要因を特定
     */
    getPromotionBlockers(requirements) {
        const blockers = [];

        if (this.experience < requirements.minExperience) {
            blockers.push(`経験不足 (${this.experience}/${requirements.minExperience}ヶ月)`);
        }
        if (this.baseAbilities.leadership < requirements.minLeadership) {
            blockers.push(`リーダーシップ不足 (${this.baseAbilities.leadership}/${requirements.minLeadership})`);
        }
        if (this.performance.current < requirements.minPerformance) {
            blockers.push(`パフォーマンス不足 (${this.performance.current}/${requirements.minPerformance})`);
        }
        if (this.satisfaction < 60) {
            blockers.push('満足度低下');
        }
        if (this.loyaltyLevel < 40) {
            blockers.push('ロイヤリティ不足');
        }

        return blockers;
    }

    /**
     * 背景ストーリーを生成
     */
    generateBackstory() {
        if (typeof EMPLOYEE_BACKSTORIES === 'undefined') return '';

        // 性格や能力に基づいてカテゴリを選択
        let category = 'stable_worker'; // デフォルト

        // 経験値ベースでカテゴリ判定
        if (this.experience === 0) {
            category = 'fresh_graduate';
        } else if (this.experience >= 180) { // 15年以上
            category = 'veteran';
        } else {
            // 能力値で判定
            const totalAbility = Object.values(this.baseAbilities).reduce((sum, val) => sum + val, 0);
            const avgAbility = totalAbility / Object.keys(this.baseAbilities).length;

            if (avgAbility >= 80) {
                category = 'tech_genius';
            } else if (this.baseAbilities.business >= 75 || this.baseAbilities.management >= 75) {
                category = 'business_expert';
            } else if (this.baseAbilities.creativity >= 75) {
                category = 'creative_mind';
            } else {
                category = 'stable_worker';
            }
        }

        // カテゴリ内からランダムに選択
        const stories = EMPLOYEE_BACKSTORIES[category];
        return stories ? stories[Math.floor(Math.random() * stories.length)] : '';
    }

    /**
     * 個性・癖を生成
     */
    generateQuirks() {
        if (typeof EMPLOYEE_QUIRKS === 'undefined') return [];

        // 1-2個の癖をランダムに選択
        const quirkCount = Math.random() < 0.7 ? 1 : 2;
        const selectedQuirks = [];
        const availableQuirks = [...EMPLOYEE_QUIRKS];

        for (let i = 0; i < quirkCount && availableQuirks.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableQuirks.length);
            selectedQuirks.push(availableQuirks.splice(randomIndex, 1)[0]);
        }

        return selectedQuirks;
    }

    /**
     * マイルストーンをチェック
     */
    checkMilestones() {
        const newMilestones = [];

        // 勤続年数マイルストーン
        const years = Math.floor(this.experience / 12);
        if (years > 0 && years % 5 === 0 && !this.hasMilestone(`tenure_${years}`)) {
            newMilestones.push({
                id: `tenure_${years}`,
                type: 'tenure',
                title: `${years}年勤続達成`,
                description: `${this.name}さんが入社から${years}年を迎えました。長きに渡る貢献に感謝します。`,
                icon: '🎉',
                date: Date.now()
            });
        }

        // 昇進マイルストーン
        if (this.position === 'leader' && !this.hasMilestone('promotion_leader')) {
            newMilestones.push({
                id: 'promotion_leader',
                type: 'promotion',
                title: 'リーダーへ昇進',
                description: `${this.name}さんがリーダーに昇進しました。チームを牽引する存在として期待されています。`,
                icon: '👑',
                date: Date.now()
            });
        }

        if (this.position === 'manager' && !this.hasMilestone('promotion_manager')) {
            newMilestones.push({
                id: 'promotion_manager',
                type: 'promotion',
                title: 'マネージャーへ昇進',
                description: `${this.name}さんがマネージャーに昇進しました。部門の運営を任される重要な役割です。`,
                icon: '⭐',
                date: Date.now()
            });
        }

        // スキル習得マイルストーン
        Object.keys(this.skills).forEach(skillKey => {
            const level = this.skills[skillKey];
            if (level >= 100 && !this.hasMilestone(`skill_master_${skillKey}`)) {
                newMilestones.push({
                    id: `skill_master_${skillKey}`,
                    type: 'skill',
                    title: 'スキルマスター達成',
                    description: `${this.name}さんが${skillKey}スキルをマスターしました。専門分野での第一人者です。`,
                    icon: '🏆',
                    date: Date.now()
                });
            }
        });

        // 資格取得マイルストーン
        this.certifications.forEach(certId => {
            if (!this.hasMilestone(`cert_${certId}`)) {
                const cert = typeof CERTIFICATIONS !== 'undefined' ? CERTIFICATIONS[certId] : null;
                if (cert) {
                    newMilestones.push({
                        id: `cert_${certId}`,
                        type: 'certification',
                        title: '資格取得',
                        description: `${this.name}さんが${cert.name}を取得しました。専門性がさらに高まりました。`,
                        icon: '📜',
                        date: Date.now()
                    });
                }
            }
        });

        // 高満足度維持マイルストーン
        if (this.satisfaction >= 90 && !this.hasMilestone('high_satisfaction')) {
            newMilestones.push({
                id: 'high_satisfaction',
                type: 'achievement',
                title: '高いモチベーション',
                description: `${this.name}さんの満足度が非常に高い状態を維持しています。良好な職場環境の証です。`,
                icon: '😊',
                date: Date.now()
            });
        }

        // マイルストーンを記録
        newMilestones.forEach(milestone => {
            this.milestones.push(milestone);
        });

        return newMilestones;
    }

    /**
     * マイルストーン達成済みかチェック
     */
    hasMilestone(milestoneId) {
        return this.milestones.some(m => m.id === milestoneId);
    }

    /**
     * データのJSON変換用
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            personalityId: this.personalityId,
            baseAbilities: this.baseAbilities,
            skills: this.skills,
            certifications: this.certifications,
            motivation: this.motivation,
            satisfaction: this.satisfaction,
            stress: this.stress,
            salary: this.salary,
            department: this.department,
            position: this.position,
            experience: this.experience,
            workPreference: this.workPreference,
            relationships: this.relationships,
            performance: this.performance,
            traits: this.traits,
            workStyle: this.workStyle,
            learningProgress: this.learningProgress,
            burnoutRisk: this.burnoutRisk,
            loyaltyLevel: this.loyaltyLevel,
            backstory: this.backstory,
            quirks: this.quirks,
            milestones: this.milestones
        };
    }

    /**
     * JSONからインスタンス復元
     */
    static fromJSON(data) {
        return new EnhancedEmployee(data);
    }
}