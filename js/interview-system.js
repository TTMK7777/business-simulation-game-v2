/**
 * 経営シミュレーションゲーム - 面接システム
 */

/**
 * 面接システムクラス
 */
class InterviewSystem {
    constructor(game) {
        this.game = game;
        this.currentCandidates = [];
        this.interviewResults = {};
        this.hiringBudget = 0;
    }

    /**
     * 採用活動開始（書類選考）
     */
    startRecruitment(budget, targetDepartment = 'development', targetPosition = 'member') {
        if (this.game.money < budget) {
            return { success: false, error: '資金不足です' };
        }

        this.hiringBudget = budget;
        this.game.spendMoney(budget * 0.3, '求人広告費'); // 予算の30%を広告費として先払い
        
        // 予算に応じて候補者を生成
        const candidateCount = this.getCandidateCount(budget);
        this.currentCandidates = this.generateCandidates(candidateCount, targetDepartment, targetPosition, budget);
        
        return {
            success: true,
            candidates: this.currentCandidates.map(c => this.getCandidateBasicInfo(c)),
            cost: budget * 0.3
        };
    }

    /**
     * 予算に応じた候補者数を決定
     */
    getCandidateCount(budget) {
        if (budget < 500000) return 3; // 50万未満：3名
        if (budget < 1000000) return 5; // 100万未満：5名
        if (budget < 2000000) return 8; // 200万未満：8名
        return 10; // 200万以上：10名
    }

    /**
     * 候補者生成
     */
    generateCandidates(count, targetDepartment, targetPosition, budget) {
        const candidates = [];
        const qualityMultiplier = Math.min(2.0, budget / 1000000); // 予算によって候補者の質が向上
        
        for (let i = 0; i < count; i++) {
            const candidate = this.generateCandidate(targetDepartment, targetPosition, qualityMultiplier);
            candidates.push(candidate);
        }
        
        return candidates.sort((a, b) => b.estimatedValue - a.estimatedValue);
    }

    /**
     * 個別候補者生成
     */
    generateCandidate(targetDepartment, targetPosition, qualityMultiplier) {
        // 基本的な候補者を作成
        const personalityIds = Object.keys(ENHANCED_PERSONALITIES);
        const personalityId = personalityIds[Math.floor(Math.random() * personalityIds.length)];
        
        // 部署に適した能力値生成
        const baseAbilities = this.generateDepartmentSuitedAbilities(targetDepartment, qualityMultiplier);
        
        // 経験年数生成（ポジションに応じて）
        const experience = this.generateExperience(targetPosition, qualityMultiplier);
        
        // スキル生成
        const skills = this.generateSkillsForDepartment(targetDepartment, experience, qualityMultiplier);
        
        // 資格生成
        const certifications = this.generateCertifications(skills, experience, qualityMultiplier);
        
        // 給与希望額
        const expectedSalary = this.calculateExpectedSalary(baseAbilities, skills, certifications, experience);
        
        const candidate = new EnhancedEmployee({
            id: Date.now() + Math.floor(Math.random() * 10000),
            name: GameUtils.generateEmployeeName(),
            personalityId: personalityId,
            baseAbilities: baseAbilities,
            skills: skills,
            certifications: certifications,
            experience: experience,
            salary: expectedSalary,
            department: targetDepartment,
            position: targetPosition,
            motivation: GameUtils.randomInt(60, 90),
            satisfaction: GameUtils.randomInt(70, 85),
            loyaltyLevel: GameUtils.randomInt(40, 70)
        });
        
        // 候補者の推定価値を計算
        candidate.estimatedValue = this.calculateCandidateValue(candidate);
        candidate.interviewRevealed = {}; // 面接で明らかになった情報
        
        return candidate;
    }

    /**
     * 部署に適した能力値生成
     */
    generateDepartmentSuitedAbilities(department, qualityMultiplier) {
        const base = GAME_CONSTANTS.ABILITY_RANGE.MIN;
        const range = GAME_CONSTANTS.ABILITY_RANGE.RANGE;
        
        const abilities = {
            technical: GameUtils.randomInt(base, base + range),
            business: GameUtils.randomInt(base, base + range),
            planning: GameUtils.randomInt(base, base + range),
            management: GameUtils.randomInt(base, base + range),
            communication: GameUtils.randomInt(base, base + range),
            creativity: GameUtils.randomInt(base, base + range),
            analytical: GameUtils.randomInt(base, base + range),
            leadership: GameUtils.randomInt(base, base + range)
        };
        
        // 部署に特化したボーナス
        const departmentBonus = Math.floor(range * 0.3 * qualityMultiplier);
        
        switch (department) {
            case 'development':
                abilities.technical += departmentBonus;
                abilities.analytical += Math.floor(departmentBonus * 0.7);
                break;
            case 'sales':
                abilities.business += departmentBonus;
                abilities.communication += Math.floor(departmentBonus * 0.8);
                break;
            case 'planning':
                abilities.planning += departmentBonus;
                abilities.analytical += Math.floor(departmentBonus * 0.6);
                abilities.creativity += Math.floor(departmentBonus * 0.5);
                break;
            case 'quality':
                abilities.analytical += departmentBonus;
                abilities.technical += Math.floor(departmentBonus * 0.6);
                break;
            case 'hr':
                abilities.communication += departmentBonus;
                abilities.management += Math.floor(departmentBonus * 0.7);
                break;
        }
        
        // 上限チェック
        Object.keys(abilities).forEach(key => {
            abilities[key] = Math.min(GAME_CONSTANTS.LIMITS.MAX_ABILITY, abilities[key]);
        });
        
        return abilities;
    }

    /**
     * 経験年数生成
     */
    generateExperience(position, qualityMultiplier) {
        let baseExperience;
        let range;
        
        switch (position) {
            case 'member':
                baseExperience = 0;
                range = 36;
                break;
            case 'leader':
                baseExperience = 12;
                range = 48;
                break;
            case 'manager':
                baseExperience = 24;
                range = 60;
                break;
            default:
                baseExperience = 0;
                range = 24;
        }
        
        const experience = baseExperience + Math.floor(Math.random() * range * qualityMultiplier);
        return Math.min(120, experience); // 最大10年
    }

    /**
     * 部署向けスキル生成
     */
    generateSkillsForDepartment(department, experience, qualityMultiplier) {
        const skills = {};
        const deptInfo = ENHANCED_DEPARTMENTS[department];
        
        // 全スキルを0で初期化
        Object.keys(SKILL_CATEGORIES).forEach(categoryKey => {
            const category = SKILL_CATEGORIES[categoryKey];
            Object.keys(category.subcategories).forEach(subKey => {
                const subcategory = category.subcategories[subKey];
                Object.keys(subcategory.skills).forEach(skillKey => {
                    skills[skillKey] = 0;
                });
            });
        });
        
        if (!deptInfo) return skills;
        
        // 経験に基づく基本スキルレベル
        const experienceMultiplier = Math.min(2.0, experience / 24); // 2年で1.0倍
        const baseSkillLevel = Math.floor(20 * experienceMultiplier * qualityMultiplier);
        
        // 主要スキルの設定
        deptInfo.primarySkills.forEach(skillCategory => {
            this.assignSkillsInCategory(skills, skillCategory, baseSkillLevel + 20);
        });
        
        // 副次スキルの設定
        deptInfo.secondarySkills.forEach(skillCategory => {
            this.assignSkillsInCategory(skills, skillCategory, baseSkillLevel);
        });
        
        return skills;
    }

    /**
     * カテゴリ内のスキルレベル設定
     */
    assignSkillsInCategory(skills, categoryKey, baseLevel) {
        // カテゴリから具体的なスキルを探す
        Object.keys(SKILL_CATEGORIES).forEach(mainCategoryKey => {
            const mainCategory = SKILL_CATEGORIES[mainCategoryKey];
            if (mainCategory.subcategories[categoryKey]) {
                const subcategory = mainCategory.subcategories[categoryKey];
                Object.keys(subcategory.skills).forEach(skillKey => {
                    const variation = Math.floor(Math.random() * 21) - 10; // -10 to +10
                    skills[skillKey] = Math.max(0, Math.min(100, baseLevel + variation));
                });
            }
        });
    }

    /**
     * 資格生成
     */
    generateCertifications(skills, experience, qualityMultiplier) {
        const certifications = [];
        const certificationChance = Math.min(0.4, experience / 60 * qualityMultiplier); // 経験と予算に応じて確率up
        
        Object.keys(CERTIFICATIONS).forEach(certId => {
            const cert = CERTIFICATIONS[certId];
            
            // 前提条件チェック
            if (cert.prerequisite && !cert.prerequisite.every(prereq => certifications.includes(prereq))) {
                return;
            }
            
            // 取得確率計算（難易度考慮）
            let chance = certificationChance;
            switch (cert.difficulty) {
                case 'low': chance *= 1.5; break;
                case 'medium': chance *= 1.0; break;
                case 'high': chance *= 0.6; break;
                case 'very_high': chance *= 0.3; break;
            }
            
            if (Math.random() < chance) {
                certifications.push(certId);
            }
        });
        
        return certifications;
    }

    /**
     * 希望給与計算
     */
    calculateExpectedSalary(abilities, skills, certifications, experience) {
        const baseSalary = GAME_CONSTANTS.SALARY_RANGE.MIN;
        
        // 能力による倍率
        const abilityScore = Object.values(abilities).reduce((sum, val) => sum + val, 0);
        const abilityMultiplier = 1 + (abilityScore / 800); // 800満点で2倍
        
        // 経験による倍率
        const experienceMultiplier = 1 + (experience * 0.03); // 1ヶ月3%
        
        // 資格による倍率
        let certificationMultiplier = 1.0;
        certifications.forEach(certId => {
            const cert = CERTIFICATIONS[certId];
            if (cert?.effects?.salary_multiplier) {
                certificationMultiplier *= cert.effects.salary_multiplier;
            }
        });
        
        const expectedSalary = baseSalary * abilityMultiplier * experienceMultiplier * certificationMultiplier;
        
        // ランダム要素追加（±15%）
        const randomMultiplier = 0.85 + (Math.random() * 0.3);
        
        return Math.round(expectedSalary * randomMultiplier);
    }

    /**
     * 候補者価値計算
     */
    calculateCandidateValue(candidate) {
        const abilityScore = candidate.getTotalAbility();
        const skillScore = Object.values(candidate.skills).reduce((sum, val) => sum + val, 0);
        const certificationScore = candidate.certifications.length * 10;
        const experienceScore = candidate.experience;
        
        return abilityScore + skillScore * 0.5 + certificationScore + experienceScore * 2;
    }

    /**
     * 候補者基本情報取得（書類選考段階）
     */
    getCandidateBasicInfo(candidate) {
        return {
            id: candidate.id,
            name: candidate.name,
            experience: candidate.experience,
            expectedSalary: GameUtils.formatMoney(candidate.salary),
            certificationCount: candidate.certifications.length,
            estimatedValue: Math.round(candidate.estimatedValue)
        };
    }

    /**
     * 面接実行
     */
    conductInterview(candidateId, interviewType = 'general') {
        const candidate = this.currentCandidates.find(c => c.id === candidateId);
        if (!candidate) {
            return { success: false, error: '候補者が見つかりません' };
        }

        const interviewCost = 50000; // 面接1回あたり5万円
        if (this.game.money < interviewCost) {
            return { success: false, error: '面接費用が不足しています' };
        }

        this.game.spendMoney(interviewCost, '面接費用');
        
        // 面接結果生成
        const result = this.generateInterviewResult(candidate, interviewType);
        this.interviewResults[candidateId] = result;
        
        return {
            success: true,
            result: result,
            cost: interviewCost
        };
    }

    /**
     * 面接結果生成
     */
    generateInterviewResult(candidate, interviewType) {
        const personality = candidate.getPersonality();
        let revealedInfo = {};
        
        switch (interviewType) {
            case 'technical':
                revealedInfo = {
                    abilities: {
                        technical: candidate.baseAbilities.technical,
                        analytical: candidate.baseAbilities.analytical
                    },
                    skills: this.selectRelevantSkills(candidate.skills, 'technical'),
                    certifications: candidate.certifications.filter(c => 
                        CERTIFICATIONS[c]?.category === 'technical'
                    )
                };
                break;
                
            case 'behavioral':
                revealedInfo = {
                    personality: {
                        id: candidate.personalityId,
                        name: personality.name,
                        description: personality.description,
                        teamRole: personality.teamRole
                    },
                    abilities: {
                        communication: candidate.baseAbilities.communication,
                        leadership: candidate.baseAbilities.leadership
                    },
                    motivation: candidate.motivation,
                    workPreference: personality.workPreference
                };
                break;
                
            case 'general':
            default:
                revealedInfo = {
                    abilities: {
                        technical: candidate.baseAbilities.technical,
                        business: candidate.baseAbilities.business,
                        communication: candidate.baseAbilities.communication
                    },
                    personalityHint: personality.name,
                    motivationRange: this.getValueRange(candidate.motivation, 10),
                    topSkills: this.getTopSkills(candidate.skills, 3)
                };
                break;
        }
        
        // 面接官の評価生成
        const evaluation = this.generateInterviewerEvaluation(candidate, interviewType);
        
        return {
            type: interviewType,
            revealed: revealedInfo,
            evaluation: evaluation,
            timestamp: Date.now()
        };
    }

    /**
     * 関連スキル選択
     */
    selectRelevantSkills(skills, category) {
        const relevantSkills = {};
        const skillCategories = SKILL_CATEGORIES[category];
        
        if (!skillCategories) return {};
        
        Object.keys(skillCategories.subcategories).forEach(subKey => {
            const subcategory = skillCategories.subcategories[subKey];
            Object.keys(subcategory.skills).forEach(skillKey => {
                if (skills[skillKey] > 0) {
                    relevantSkills[skillKey] = skills[skillKey];
                }
            });
        });
        
        return relevantSkills;
    }

    /**
     * 値の範囲表示（曖昧情報）
     */
    getValueRange(value, range) {
        const min = Math.max(0, value - range);
        const max = Math.min(100, value + range);
        return `${min}-${max}`;
    }

    /**
     * トップスキル取得
     */
    getTopSkills(skills, count) {
        return Object.entries(skills)
            .sort(([,a], [,b]) => b - a)
            .slice(0, count)
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});
    }

    /**
     * 面接官評価生成
     */
    generateInterviewerEvaluation(candidate, interviewType) {
        const score = GameUtils.randomInt(1, 5); // 1-5点評価
        const comments = this.generateInterviewComments(candidate, interviewType, score);
        
        return {
            score: score,
            comments: comments,
            recommendation: score >= 4 ? 'recommend' : score >= 3 ? 'neutral' : 'not_recommend'
        };
    }

    /**
     * 面接コメント生成
     */
    generateInterviewComments(candidate, interviewType, score) {
        const personality = candidate.getPersonality();
        const comments = [];
        
        // スコアに基づくコメント
        if (score >= 4) {
            comments.push('優秀な候補者です');
        } else if (score >= 3) {
            comments.push('平均的な能力を持っています');
        } else {
            comments.push('期待値を下回る結果でした');
        }
        
        // 性格に基づくコメント
        switch (personality.id) {
            case 'honest':
                comments.push('素直で学習意欲が高い印象');
                break;
            case 'ambitious':
                comments.push('向上心が強く、リーダーシップの素質あり');
                break;
            case 'perfectionist':
                comments.push('品質にこだわりを持っているが、完璧主義的な面も');
                break;
            default:
                comments.push(`${personality.name}な性格で、チームに良い影響を与えそう`);
        }
        
        // 面接タイプに基づくコメント
        if (interviewType === 'technical') {
            const techLevel = candidate.baseAbilities.technical;
            if (techLevel >= 70) {
                comments.push('技術力は十分高いレベル');
            } else if (techLevel >= 50) {
                comments.push('技術力は標準的なレベル');
            } else {
                comments.push('技術力に不安がある');
            }
        }
        
        return comments;
    }

    /**
     * 最終採用判定
     */
    finalizeHiring(candidateId, offerSalary, conditions = {}) {
        const candidate = this.currentCandidates.find(c => c.id === candidateId);
        if (!candidate) {
            return { success: false, error: '候補者が見つかりません' };
        }

        const contractCost = offerSalary * 3; // 3ヶ月分の初期コスト
        if (this.game.money < contractCost) {
            return { success: false, error: '契約資金が不足しています' };
        }

        // 採用成功率計算
        const successRate = this.calculateHiringSuccessRate(candidate, offerSalary, conditions);
        
        if (Math.random() > successRate) {
            return {
                success: false,
                error: '候補者が他社のオファーを選択しました',
                successRate: Math.round(successRate * 100)
            };
        }

        // 採用成功
        this.game.spendMoney(contractCost, '採用契約費');
        
        // 給与設定
        candidate.salary = offerSalary;
        
        // 条件適用
        if (conditions.workStyle) {
            candidate.workStyle = conditions.workStyle;
        }
        if (conditions.startDate) {
            candidate.startDate = conditions.startDate;
        }

        // ゲームに従業員追加
        this.game.employees.push(candidate);
        this.game.lastPlayerAction = 'hiring';

        // 候補者リストから削除
        this.currentCandidates = this.currentCandidates.filter(c => c.id !== candidateId);

        return {
            success: true,
            employee: candidate,
            cost: contractCost,
            successRate: Math.round(successRate * 100)
        };
    }

    /**
     * 採用成功率計算
     */
    calculateHiringSuccessRate(candidate, offerSalary, conditions) {
        let successRate = 0.5; // 基本成功率50%
        
        // 給与による影響
        const salaryRatio = offerSalary / candidate.salary;
        if (salaryRatio >= 1.2) successRate += 0.3; // +20%で大幅向上
        else if (salaryRatio >= 1.1) successRate += 0.2; // +10%で向上
        else if (salaryRatio >= 1.0) successRate += 0.1; // 希望額で少し向上
        else if (salaryRatio >= 0.9) successRate -= 0.1; // -10%で低下
        else successRate -= 0.3; // それ以下で大幅低下
        
        // 会社の評判による影響
        const reputationBonus = (this.game.reputation - 50) / 200; // 評判50が基準
        successRate += reputationBonus;
        
        // ブランド力による影響
        successRate += (this.game.brandPower - 1) * 0.05;
        
        // 条件による影響
        if (conditions.workStyle === 'remote_friendly') {
            const personality = candidate.getPersonality();
            if (personality.workPreference === 'flexibility') {
                successRate += 0.1;
            }
        }
        
        // 面接結果による影響
        const interviewResult = this.interviewResults[candidate.id];
        if (interviewResult) {
            if (interviewResult.evaluation.recommendation === 'recommend') {
                successRate += 0.1; // 好印象だと成功率up
            }
        }
        
        return Math.max(0.1, Math.min(0.95, successRate)); // 10%-95%の範囲
    }

    /**
     * 採用活動終了
     */
    endRecruitment() {
        this.currentCandidates = [];
        this.interviewResults = {};
        this.hiringBudget = 0;
    }

    /**
     * 現在の候補者一覧取得
     */
    getCurrentCandidates() {
        return this.currentCandidates.map(candidate => ({
            ...this.getCandidateBasicInfo(candidate),
            interviewed: this.interviewResults[candidate.id] ? true : false,
            interviewResult: this.interviewResults[candidate.id] || null
        }));
    }
}