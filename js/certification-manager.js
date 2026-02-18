/**
 * 経営シミュレーションゲーム - 資格取得管理システム
 * Business Simulation Game - Certification Management System
 *
 * 従業員の資格取得プロセスを管理:
 * - 資格取得の開始・進捗追跡
 * - 月次更新での進捗計算
 * - 性格・モチベーション・ストレスの影響
 * - 前提条件の検証
 * - ROI (投資対効果) の計算
 */

class CertificationProgressTracker {
    constructor() {
        // 進行中の資格取得を追跡
        // key: employeeId, value: { certificationId, progress, monthsElapsed, startMonth }
        this.activeCertifications = new Map();

        // 完了した資格取得の履歴
        // key: employeeId, value: [{ certificationId, completionDate, duration }]
        this.certificationHistory = new Map();

        console.log('[CertificationManager] Certification Progress Tracker initialized');
    }

    /**
     * 資格取得を開始
     * Start certification pursuit for an employee
     *
     * @param {string} employeeId - 従業員ID
     * @param {string} certificationId - 資格ID
     * @param {Object} employee - 従業員オブジェクト
     * @param {number} currentMonth - 現在の月（ターン数）
     * @returns {Object} { success: boolean, message: string, data?: Object }
     */
    startCertification(employeeId, certificationId, employee, currentMonth) {
        console.log(`[CertificationManager] Starting certification ${certificationId} for employee ${employeeId}`);

        // 1. 資格データの取得
        const certification = CERTIFICATIONS[certificationId];
        if (!certification) {
            return {
                success: false,
                message: `資格 ${certificationId} が見つかりません`
            };
        }

        // 2. 前提条件の検証
        const prerequisiteCheck = this.validateCertificationStart(employeeId, certificationId, employee);
        if (!prerequisiteCheck.valid) {
            return {
                success: false,
                message: prerequisiteCheck.message
            };
        }

        // 3. 既に進行中かチェック
        if (this.activeCertifications.has(employeeId)) {
            const active = this.activeCertifications.get(employeeId);
            return {
                success: false,
                message: `${CERTIFICATIONS[active.certificationId].name} を既に学習中です`
            };
        }

        // 4. 資格取得の初期データを作成
        const certificationData = {
            certificationId,
            progress: 0,
            monthsElapsed: 0,
            startMonth: currentMonth,
            totalDuration: certification.duration,
            difficulty: certification.difficulty,
            cost: certification.cost,
            // 初期のモチベーション・ストレス記録
            initialMotivation: employee.motivation || 75,
            initialStress: employee.stress || 0
        };

        // 5. アクティブリストに追加
        this.activeCertifications.set(employeeId, certificationData);

        console.log(`[CertificationManager] Certification started:`, certificationData);

        return {
            success: true,
            message: `${certification.name} の学習を開始しました！`,
            data: certificationData
        };
    }

    /**
     * 月次更新処理 - 全従業員の資格取得進捗を更新
     * Process monthly updates for all active certifications
     *
     * @param {Map<string, Object>} employees - 従業員マップ (id => employee object)
     * @param {number} currentMonth - 現在の月
     * @returns {Array<Object>} 完了した資格のリスト
     */
    processMonthlyUpdates(employees, currentMonth) {
        console.log(`[CertificationManager] Processing monthly updates for ${this.activeCertifications.size} active certifications`);

        const completedCertifications = [];

        // 各進行中の資格取得を処理
        for (const [employeeId, certData] of this.activeCertifications.entries()) {
            // Map と Array の両方に対応
            const employee = employees instanceof Map ?
                employees.get(employeeId) :
                employees.find(e => e.id === employeeId);

            if (!employee) {
                console.warn(`[CertificationManager] Employee ${employeeId} not found, skipping`);
                continue;
            }

            // 月次進捗を計算
            const monthlyUpdate = this.calculateMonthlyProgress(employee, certData);

            // 進捗を更新
            certData.progress += monthlyUpdate.progressGain;
            certData.monthsElapsed++;

            // ストレス・モチベーションへの影響を適用
            if (monthlyUpdate.stressImpact) {
                employee.stress = Math.min(100, employee.stress + monthlyUpdate.stressImpact);
            }
            if (monthlyUpdate.motivationImpact) {
                employee.motivation = Math.max(0, Math.min(100,
                    employee.motivation + monthlyUpdate.motivationImpact));
            }

            console.log(`[CertificationManager] Employee ${employeeId} progress: ${certData.progress.toFixed(1)}%, ` +
                `stress: ${employee.stress.toFixed(1)}, motivation: ${employee.motivation.toFixed(1)}`);

            // 100%到達で完了
            if (certData.progress >= 100) {
                const result = this.completeCertification(employeeId, employee, certData, currentMonth);
                if (result.success) {
                    completedCertifications.push({
                        employeeId,
                        employee,
                        certification: CERTIFICATIONS[certData.certificationId],
                        ...result
                    });
                }
            }
        }

        return completedCertifications;
    }

    /**
     * 月次進捗を計算
     * Calculate monthly progress for a certification
     *
     * @param {Object} employee - 従業員オブジェクト
     * @param {Object} certData - 資格取得データ
     * @returns {Object} { progressGain, stressImpact, motivationImpact }
     */
    calculateMonthlyProgress(employee, certData) {
        const certification = CERTIFICATIONS[certData.certificationId];
        const personality = employee.getPersonality ? employee.getPersonality() :
            ENHANCED_PERSONALITIES[employee.personalityId] || ENHANCED_PERSONALITIES.serious;

        // 難易度設定を取得
        const difficultySettings = CERTIFICATION_DIFFICULTY_RATES[certification.difficulty] ||
            CERTIFICATION_DIFFICULTY_RATES.medium;

        // 基礎進捗率（期間に応じた理論値）
        const baseProgressRate = (100 / certification.duration);

        // === 進捗への影響要素 ===

        // 1. モチベーションの影響 (0.5x ~ 1.5x)
        const motivationFactor = 0.5 + (employee.motivation / 100);

        // 2. ストレスの影響 (0.6x ~ 1.0x)
        const stressFactor = Math.max(0.6, 1.0 - (employee.stress / 200));

        // 3. 性格特性の影響
        let personalityFactor = 1.0;
        if (personality.effects.learningBonus) {
            personalityFactor *= personality.effects.learningBonus;
        }
        if (personality.effects.concentration) {
            personalityFactor *= personality.effects.concentration;
        }

        // 4. 資格カテゴリと従業員の適性の一致度
        let aptitudeFactor = 1.0;
        const technicalAptitude = employee?.baseAbilities?.technical;
        const businessAptitude = employee?.baseAbilities?.business;
        const managementAptitude = employee?.baseAbilities?.management;

        if (certification.category === 'technical' && typeof technicalAptitude === 'number') {
            aptitudeFactor = 0.8 + (technicalAptitude / 100) * 0.4;
        } else if (certification.category === 'business' && typeof businessAptitude === 'number') {
            aptitudeFactor = 0.8 + (businessAptitude / 100) * 0.4;
        } else if (certification.category === 'management' && typeof managementAptitude === 'number') {
            aptitudeFactor = 0.8 + (managementAptitude / 100) * 0.4;
        }

        // 5. 難易度による修正
        const difficultyFactor = difficultySettings.monthlyProgressBase /
            CERTIFICATION_DIFFICULTY_RATES.medium.monthlyProgressBase;

        // 総合進捗計算
        let progressGain = baseProgressRate *
            motivationFactor *
            stressFactor *
            personalityFactor *
            aptitudeFactor *
            difficultyFactor;

        // ランダム要素を追加 (±15%)
        const randomFactor = 0.85 + Math.random() * 0.3;
        progressGain *= randomFactor;

        // === ストレスへの影響 ===
        let stressImpact = 2; // 基本ストレス増加

        // 難易度による影響
        stressImpact *= difficultySettings.stressMultiplier;

        // 性格特性による耐性
        if (personality.effects.stressResistance) {
            stressImpact /= personality.effects.stressResistance;
        }
        if (personality.effects.stressAccumulation) {
            stressImpact *= personality.effects.stressAccumulation;
        }

        // === モチベーションへの影響 ===
        let motivationImpact = 0;

        // 進捗が良い場合はモチベーション上昇
        if (progressGain > baseProgressRate * 1.2) {
            motivationImpact = 2;
        } else if (progressGain < baseProgressRate * 0.8) {
            // 進捗が悪い場合は下降
            motivationImpact = -3;
        }

        // 難易度による修正
        motivationImpact *= difficultySettings.motivationMultiplier;

        return {
            progressGain: Math.max(0, progressGain),
            stressImpact: Math.max(0, stressImpact),
            motivationImpact
        };
    }

    /**
     * 資格取得を完了
     * Complete certification and apply effects
     *
     * @param {string} employeeId - 従業員ID
     * @param {Object} employee - 従業員オブジェクト
     * @param {Object} certData - 資格取得データ
     * @param {number} currentMonth - 現在の月
     * @returns {Object} { success: boolean, message: string }
     */
    completeCertification(employeeId, employee, certData, currentMonth) {
        const certification = CERTIFICATIONS[certData.certificationId];

        console.log(`[CertificationManager] Completing certification ${certData.certificationId} for employee ${employeeId}`);

        // 1. 従業員の資格リストに追加
        if (!employee.certifications) {
            employee.certifications = [];
        }
        employee.certifications.push(certData.certificationId);

        // 2. 資格の効果を適用
        this.applyCertificationEffects(employee, certification);

        // 3. 履歴に記録
        if (!this.certificationHistory.has(employeeId)) {
            this.certificationHistory.set(employeeId, []);
        }
        this.certificationHistory.get(employeeId).push({
            certificationId: certData.certificationId,
            completionMonth: currentMonth,
            duration: certData.monthsElapsed,
            completionDate: new Date().toISOString()
        });

        // 4. アクティブリストから削除
        this.activeCertifications.delete(employeeId);

        // 5. モチベーション大幅アップ、ストレス軽減
        employee.motivation = Math.min(100, employee.motivation + 15);
        employee.stress = Math.max(0, employee.stress - 10);

        // 6. マイルストーン記録
        if (employee.milestones && Array.isArray(employee.milestones)) {
            employee.milestones.push({
                type: 'certification',
                certificationId: certData.certificationId,
                name: certification.name,
                month: currentMonth,
                date: new Date().toISOString()
            });
        }

        console.log(`[CertificationManager] Certification completed: ${certification.name}`);

        return {
            success: true,
            message: `${certification.name} を取得しました！`,
            certification
        };
    }

    /**
     * 資格の効果を従業員に適用
     * Apply certification effects to employee
     *
     * @param {Object} employee - 従業員オブジェクト
     * @param {Object} certification - 資格データ
     */
    applyCertificationEffects(employee, certification) {
        const effects = certification.effects;

        // スキルボーナスを適用
        if (effects.all_technical_skills && employee.skills) {
            this.applySkillBonus(employee, 'technical', effects.all_technical_skills);
        }
        if (effects.all_sales_skills && employee.skills) {
            this.applySkillBonus(employee, 'business', effects.all_sales_skills);
        }

        // 特定スキルへのボーナス
        Object.keys(effects).forEach(effectKey => {
            if (employee.skills && employee.skills.hasOwnProperty(effectKey)) {
                employee.skills[effectKey] = Math.min(100,
                    (employee.skills[effectKey] || 0) + effects[effectKey]);
            }
        });

        // 給与倍率の適用
        if (effects.salary_multiplier && employee.salary) {
            employee.salary = Math.round(employee.salary * effects.salary_multiplier);
        }

        // リーダーシップ潜在能力の向上
        if (effects.leadership_potential && employee.baseAbilities) {
            employee.baseAbilities.leadership = Math.min(100,
                (employee.baseAbilities.leadership || 50) * effects.leadership_potential);
        }

        console.log(`[CertificationManager] Applied effects:`, effects);
    }

    /**
     * カテゴリ全体にスキルボーナスを適用
     * Apply skill bonus to all skills in a category
     *
     * @param {Object} employee - 従業員オブジェクト
     * @param {string} category - スキルカテゴリ ('technical', 'business', etc.)
     * @param {number} bonus - ボーナス値
     */
    applySkillBonus(employee, category, bonus) {
        if (!SKILL_CATEGORIES[category] || !employee.skills) return;

        const categoryData = SKILL_CATEGORIES[category];
        if (categoryData.subcategories) {
            Object.values(categoryData.subcategories).forEach(subcategory => {
                if (subcategory.skills) {
                    Object.keys(subcategory.skills).forEach(skillKey => {
                        if (employee.skills.hasOwnProperty(skillKey)) {
                            employee.skills[skillKey] = Math.min(100,
                                (employee.skills[skillKey] || 0) + bonus);
                        }
                    });
                }
            });
        }
    }

    /**
     * 資格取得開始時の前提条件を検証
     * Validate prerequisites for starting certification
     *
     * @param {string} employeeId - 従業員ID
     * @param {string} certificationId - 資格ID
     * @param {Object} employee - 従業員オブジェクト
     * @returns {Object} { valid: boolean, message: string }
     */
    validateCertificationStart(employeeId, certificationId, employee) {
        // 前提資格の確認
        const prerequisites = CERTIFICATION_PREREQUISITES[certificationId] || [];

        if (prerequisites.length > 0) {
            const employeeCerts = employee.certifications || [];
            const missingPrereqs = prerequisites.filter(prereq =>
                !employeeCerts.includes(prereq));

            if (missingPrereqs.length > 0) {
                const missingNames = missingPrereqs.map(id => CERTIFICATIONS[id].name).join(', ');
                return {
                    valid: false,
                    message: `前提資格が不足しています: ${missingNames}`
                };
            }
        }

        // 既に取得済みかチェック
        if (employee.certifications && employee.certifications.includes(certificationId)) {
            return {
                valid: false,
                message: `${CERTIFICATIONS[certificationId].name} は既に取得済みです`
            };
        }

        return { valid: true, message: 'OK' };
    }

    /**
     * 従業員が取得可能な資格リストを取得
     * Get list of available certifications for an employee
     *
     * @param {Object} employee - 従業員オブジェクト
     * @returns {Array<Object>} 取得可能な資格の配列
     */
    getAvailableCertifications(employee) {
        const available = [];
        const employeeCerts = employee.certifications || [];

        Object.entries(CERTIFICATIONS).forEach(([certId, cert]) => {
            // 既に取得済みの場合はスキップ
            if (employeeCerts.includes(certId)) {
                return;
            }

            // 前提条件のチェック
            const prerequisites = CERTIFICATION_PREREQUISITES[certId] || [];
            const hasPrerequisites = prerequisites.every(prereq =>
                employeeCerts.includes(prereq));

            if (hasPrerequisites) {
                available.push({
                    id: certId,
                    ...cert,
                    canAfford: true, // コスト判定は呼び出し側で行う
                    prerequisites: prerequisites.map(id => CERTIFICATIONS[id].name)
                });
            }
        });

        return available;
    }

    /**
     * 資格取得のROI (投資対効果) を計算
     * Calculate ROI for certification investment
     *
     * @param {string} certificationId - 資格ID
     * @param {Object} employee - 従業員オブジェクト
     * @param {number} companyMonthlyRevenue - 会社の月次売上
     * @returns {Object} ROI分析結果
     */
    calculateROI(certificationId, employee, companyMonthlyRevenue = 5000000) {
        const certification = CERTIFICATIONS[certificationId];

        // 初期コスト
        const initialCost = certification.cost;

        // 学習期間中の機会損失（生産性低下）
        const productivityLoss = companyMonthlyRevenue * 0.1 * certification.duration;

        // 総投資額
        const totalInvestment = initialCost + productivityLoss;

        // 給与上昇による月次コスト増加
        const currentMonthlySalary = employee.salary || 400000;
        const salaryIncrease = currentMonthlySalary *
            ((certification.effects.salary_multiplier || 1.0) - 1.0);

        // リターン計算
        // 1. 生産性向上による収益増加 (難易度に応じて)
        let productivityBonus = 0.05; // 5%の生産性向上
        if (certification.difficulty === 'medium') productivityBonus = 0.08;
        if (certification.difficulty === 'high') productivityBonus = 0.12;

        const monthlyRevenueIncrease = companyMonthlyRevenue * productivityBonus;

        // 2. スキル向上による間接的効果
        const skillImpactValue = (certification.effects.all_technical_skills || 0) * 5000 +
                                 (certification.effects.all_sales_skills || 0) * 8000;

        // 月次リターン
        const monthlyReturn = monthlyRevenueIncrease + (skillImpactValue / 12);

        // 投資回収期間（月数）
        const paybackPeriod = totalInvestment / (monthlyReturn - salaryIncrease);

        // 1年間のROI
        const annualReturn = (monthlyReturn - salaryIncrease) * 12;
        const roi = ((annualReturn - totalInvestment) / totalInvestment) * 100;

        return {
            initialCost,
            productivityLoss,
            totalInvestment,
            salaryIncrease,
            monthlyRevenueIncrease,
            monthlyReturn,
            paybackPeriod: Math.ceil(paybackPeriod),
            roi: roi.toFixed(1),
            worthIt: roi > 50 && paybackPeriod < 24, // 2年以内に回収できるか
            analysis: {
                shortTerm: paybackPeriod < 12 ? 'excellent' : paybackPeriod < 24 ? 'good' : 'fair',
                longTerm: roi > 100 ? 'excellent' : roi > 50 ? 'good' : 'fair'
            }
        };
    }

    /**
     * 進行中の資格取得を取得
     * Get active certification for an employee
     *
     * @param {string} employeeId - 従業員ID
     * @returns {Object|null} 資格取得データまたはnull
     */
    getActiveCertification(employeeId) {
        return this.activeCertifications.get(employeeId) || null;
    }

    /**
     * 資格取得履歴を取得
     * Get certification history for an employee
     *
     * @param {string} employeeId - 従業員ID
     * @returns {Array<Object>} 資格取得履歴
     */
    getCertificationHistory(employeeId) {
        return this.certificationHistory.get(employeeId) || [];
    }

    /**
     * 資格取得をキャンセル
     * Cancel certification pursuit
     *
     * @param {string} employeeId - 従業員ID
     * @returns {Object} { success: boolean, message: string }
     */
    cancelCertification(employeeId) {
        if (!this.activeCertifications.has(employeeId)) {
            return {
                success: false,
                message: '進行中の資格取得はありません'
            };
        }

        const certData = this.activeCertifications.get(employeeId);
        const certification = CERTIFICATIONS[certData.certificationId];

        this.activeCertifications.delete(employeeId);

        console.log(`[CertificationManager] Cancelled certification ${certData.certificationId} for employee ${employeeId}`);

        return {
            success: true,
            message: `${certification.name} の学習をキャンセルしました`,
            refund: Math.floor(certData.cost * 0.5) // 50%返金
        };
    }

    /**
     * すべての進行中資格を取得
     * Get all active certifications
     *
     * @returns {Map} activeCertifications map
     */
    getAllActiveCertifications() {
        return this.activeCertifications;
    }

    /**
     * セーブデータ用にエクスポート
     * Export data for save file
     *
     * @returns {Object} シリアライズ可能なデータ
     */
    exportData() {
        return {
            activeCertifications: Array.from(this.activeCertifications.entries()),
            certificationHistory: Array.from(this.certificationHistory.entries())
        };
    }

    /**
     * セーブデータからインポート
     * Import data from save file
     *
     * @param {Object} data - インポートするデータ
     */
    importData(data) {
        if (data.activeCertifications) {
            this.activeCertifications = new Map(data.activeCertifications);
        }
        if (data.certificationHistory) {
            this.certificationHistory = new Map(data.certificationHistory);
        }
        console.log('[CertificationManager] Data imported successfully');
    }
}

// グローバルスコープに公開（他のファイルから使用可能にする）
if (typeof window !== 'undefined') {
    window.CertificationProgressTracker = CertificationProgressTracker;
}
