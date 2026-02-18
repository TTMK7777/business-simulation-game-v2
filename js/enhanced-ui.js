/**
 * 経営シミュレーションゲーム - 拡張UIシステム
 */

class EnhancedGameUI extends GameUI {
    constructor(game) {
        super(game);
        this.initializeEnhancedElements();
    }

    /**
     * HTMLエスケープ (XSS対策)
     */
    escapeHtml(text) {
        if (text == null) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * 拡張UI要素の初期化
     */
    initializeEnhancedElements() {
        this.enhancedElements = {
            businessSector: document.getElementById('businessSector'),
            teamStats: document.getElementById('teamStats'),
            departmentTabs: document.getElementById('departmentTabs'),
            departmentContent: document.getElementById('departmentContent'),
            hrDashboard: document.getElementById('hrDashboard'),
            interviewPanel: document.getElementById('interviewPanel'),
            workEnvironment: document.getElementById('workEnvironment'),
            relationshipMatrix: document.getElementById('relationshipMatrix')
        };
        
        this.currentInterviewCandidates = [];
        this.selectedDepartment = 'development';
    }

    /**
     * スキルキーから日本語表示名を取得
     */
    getSkillDisplayName(skillKey) {
        // SKILL_CATEGORIESから対応する日本語名を検索
        for (const categoryKey in SKILL_CATEGORIES) {
            const category = SKILL_CATEGORIES[categoryKey];
            
            // カテゴリ名の場合
            if (categoryKey === skillKey) {
                return category.name;
            }
            
            // サブカテゴリを検索
            for (const subKey in category.subcategories) {
                const subcategory = category.subcategories[subKey];
                
                // サブカテゴリ名の場合
                if (subKey === skillKey) {
                    return subcategory.name;
                }
                
                // 個別スキルを検索
                for (const skillId in subcategory.skills) {
                    if (skillId === skillKey) {
                        return subcategory.skills[skillId].name;
                    }
                }
            }
        }
        
        // 見つからない場合はキーをそのまま返す
        return skillKey;
    }

    /**
     * 拡張版表示更新
     */
    updateDisplay() {
        super.updateDisplay();
        this.updateBusinessSectorDisplay();
        this.updateTeamStatsDisplay();
        this.updateDepartmentDisplay();
        this.updateHRDashboard();
        this.updateDailyMissions();
        this.updateGrowthDashboard();
    }

    /**
     * 業界表示更新
     */
    updateBusinessSectorDisplay() {
        const state = this.game.getGameState();
        const sector = BUSINESS_SECTORS[state.businessSector];
        
        if (this.enhancedElements.businessSector && sector) {
            this.enhancedElements.businessSector.innerHTML = `
                <div class="info-box">
                    <h4>🏭 事業領域</h4>
                    <div><strong>${sector.name}</strong></div>
                    <div style="font-size: 12px; color: #666; margin-top: 5px;">${sector.description}</div>
                    <div style="margin-top: 10px;">
                        <div>成長性: ${this.getCharacteristicText(sector.characteristics.growth_potential)}</div>
                        <div>競争度: ${this.getCharacteristicText(sector.characteristics.competition)}</div>
                        <div>技術変化: ${this.getCharacteristicText(sector.characteristics.technology_change_speed)}</div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * 特性テキストの変換
     */
    getCharacteristicText(level) {
        const levelMap = {
            'very_high': '🔴 非常に高',
            'high': '🟠 高',
            'medium': '🟡 普通',
            'low': '🟢 低',
            'very_low': '🔵 非常に低'
        };
        return levelMap[level] || level;
    }

    /**
     * チーム統計表示更新
     */
    updateTeamStatsDisplay() {
        const state = this.game.getGameState();
        const stats = state.teamStats;
        
        if (this.enhancedElements.teamStats && stats) {
            this.enhancedElements.teamStats.innerHTML = `
                <div class="info-box">
                    <h4>📊 チーム統計</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-label">平均スキル</div>
                            <div class="stat-value">${Math.round(stats.averageSkillLevel)}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">チームモラール</div>
                            <div class="stat-value">${Math.round(stats.teamMorale)}%</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">社内対立レベル</div>
                            <div class="stat-value ${stats.conflictLevel > 30 ? 'warning' : ''}">${Math.round(stats.conflictLevel)}%</div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * 部署表示更新
     */
    updateDepartmentDisplay() {
        if (!this.enhancedElements.departmentTabs || !this.enhancedElements.departmentContent) return;
        
        const state = this.game.getGameState();
        
        // 部署タブ
        const departmentTabs = Object.keys(ENHANCED_DEPARTMENTS).map(deptId => {
            const dept = ENHANCED_DEPARTMENTS[deptId];
            const employeeCount = state.departments[deptId]?.employees.length || 0;
            const isActive = this.selectedDepartment === deptId;
            
            return `
                <button class="dept-tab ${isActive ? 'active' : ''}" onclick="enhancedGameUI.selectDepartment('${deptId}')">
                    ${dept.name} (${employeeCount})
                </button>
            `;
        }).join('');
        
        this.enhancedElements.departmentTabs.innerHTML = departmentTabs;
        
        // 部署詳細
        this.renderDepartmentDetail(this.selectedDepartment);
    }

    /**
     * 部署選択
     */
    selectDepartment(departmentId) {
        this.selectedDepartment = departmentId;
        this.updateDepartmentDisplay();
    }

    /**
     * 部署詳細表示
     */
    renderDepartmentDetail(departmentId) {
        const state = this.game.getGameState();
        const dept = ENHANCED_DEPARTMENTS[departmentId];
        const deptData = state.departments[departmentId];
        
        if (!dept || !deptData) return;
        
        const employees = state.employees.filter(emp => emp.department === departmentId);
        const manager = employees.find(emp => emp.id === deptData.manager);
        const efficiency = state.teamStats.departmentEfficiency[departmentId] || 0;
        
        const html = `
            <div class="department-detail">
                <div class="dept-header">
                    <h4>${dept.name}</h4>
                    <div class="dept-efficiency">効率性: ${Math.round(efficiency)}%</div>
                </div>
                
                <div class="dept-info">
                    <div>${dept.description}</div>
                    <div class="dept-stats">
                        <div>現在の人数: ${employees.length}名 (最適: ${dept.optimalEmployees.min}-${dept.optimalEmployees.max}名)</div>
                        <div>部署長: ${manager ? manager.name : '未任命'}</div>
                    </div>
                </div>
                
                <div class="required-skills">
                    <h5>求められるスキル</h5>
                    <div class="skill-tags">
                        ${dept.primarySkills.map(skill => `<span class="skill-tag primary">${this.getSkillDisplayName(skill)}</span>`).join('')}
                        ${dept.secondarySkills.map(skill => `<span class="skill-tag secondary">${this.getSkillDisplayName(skill)}</span>`).join('')}
                    </div>
                </div>
                
                <div class="dept-employees">
                    <h5>所属従業員</h5>
                    ${employees.length === 0 ? 
                        '<div class="empty">従業員がいません</div>' :
                        employees.map(emp => this.renderDepartmentEmployee(emp, departmentId)).join('')
                    }
                </div>
                
                <div class="dept-actions">
                    <button class="btn small" onclick="enhancedGameUI.showDepartmentHiring('${departmentId}')">➕ 部署向け採用</button>
                    <button class="btn small" onclick="enhancedGameUI.showEmployeeTransfer('${departmentId}')">🔄 人事異動</button>
                    ${employees.length > 0 && !manager ? 
                        `<button class="btn small" onclick="enhancedGameUI.showManagerSelection('${departmentId}')">👑 部署長任命</button>` : 
                        ''
                    }
                </div>
            </div>
        `;
        
        this.enhancedElements.departmentContent.innerHTML = html;
    }

    /**
     * 部署従業員表示
     */
    renderDepartmentEmployee(employee, departmentId) {
        const fitness = employee.getDepartmentFitness ? employee.getDepartmentFitness(departmentId) : 70;
        const personality = ENHANCED_PERSONALITIES[employee.personalityId] || { name: '不明' };
        const quitRisk = employee.getQuitRisk ? Math.round(employee.getQuitRisk() * 100) : 0;
        
        return `
            <div class="dept-employee" onclick="enhancedGameUI.showEmployeeDetail(${employee.id})">
                <div class="emp-header">
                    <span class="emp-name">${this.escapeHtml(employee.name)}</span>
                    <span class="emp-position">${this.escapeHtml(employee.position || 'メンバー')}</span>
                </div>
                <div class="emp-stats">
                    <div class="emp-stat">
                        <span>適性:</span>
                        <span class="fitness-${fitness > 70 ? 'high' : fitness > 40 ? 'medium' : 'low'}">${Math.round(fitness)}%</span>
                    </div>
                    <div class="emp-stat">
                        <span>性格:</span>
                        <span>${personality.name}</span>
                    </div>
                    <div class="emp-stat">
                        <span>離職リスク:</span>
                        <span class="risk-${quitRisk > 30 ? 'high' : quitRisk > 15 ? 'medium' : 'low'}">${quitRisk}%</span>
                    </div>
                </div>
                <div class="emp-performance">
                    パフォーマンス: ${employee.performance?.current || 0}
                </div>
            </div>
        `;
    }

    /**
     * HR ダッシュボード更新
     */
    updateHRDashboard() {
        if (!this.enhancedElements.hrDashboard) return;
        
        const state = this.game.getGameState();
        const retentionIssues = (typeof this.game.getRetentionIssues === 'function') ? 
            this.game.getRetentionIssues() : [];
        
        const html = `
            <div class="hr-dashboard">
                <h4>👥 HR ダッシュボード</h4>
                
                <div class="hr-summary">
                    <div class="hr-stat">
                        <div class="hr-stat-value">${state.employees.length}</div>
                        <div class="hr-stat-label">総従業員数</div>
                    </div>
                    <div class="hr-stat">
                        <div class="hr-stat-value">${Math.round(state.teamStats.teamMorale)}%</div>
                        <div class="hr-stat-label">平均満足度</div>
                    </div>
                    <div class="hr-stat">
                        <div class="hr-stat-value">${retentionIssues.filter(i => i.type === 'high_quit_risk').length}</div>
                        <div class="hr-stat-label">離職リスク者</div>
                    </div>
                </div>
                
                ${retentionIssues.length > 0 ? `
                    <div class="hr-issues">
                        <h5>⚠️ 人事課題</h5>
                        ${retentionIssues.map(issue => `
                            <div class="hr-issue ${issue.severity}">
                                <div class="issue-title">${issue.description}</div>
                                ${issue.employees ? `
                                    <div class="issue-details">
                                        対象: ${issue.employees.map(e => e.name).join(', ')}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="hr-actions">
                    <button class="btn small" onclick="enhancedGameUI.showTrainingPrograms()">📚 研修プログラム</button>
                    <button class="btn small" onclick="enhancedGameUI.showWorkEnvironmentOptions()">🏢 労働環境改善</button>
                    <button class="btn small" onclick="enhancedGameUI.showSalaryReview()">💰 給与見直し</button>
                </div>
            </div>
        `;
        
        this.enhancedElements.hrDashboard.innerHTML = html;
    }

    /**
     * 従業員詳細表示
     */
    showEmployeeDetail(employeeId) {
        const employee = this.game.employees.find(e => e.id === employeeId);
        if (!employee) return;
        
        const personality = ENHANCED_PERSONALITIES[employee.personalityId] || { name: '不明', description: '' };
        const quitRisk = employee.getQuitRisk ? employee.getQuitRisk() : 0;
        const promotionReadiness = employee.getPromotionReadiness ? employee.getPromotionReadiness() : {};
        
        // スキル表示（上位5つ）
        const topSkills = Object.entries(employee.skills || {})
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([skill, level]) => `<div class="skill-item">${skill}: ${level}</div>`)
            .join('');
        
        const html = `
            <div class="employee-detail-modal">
                <h3>${this.escapeHtml(employee.name)} の詳細情報</h3>

                <div class="employee-sections">
                    <div class="employee-section">
                        <h4>基本情報</h4>
                        <div class="info-grid">
                            <div>性格: ${this.escapeHtml(personality.name)}</div>
                            <div>経験: ${employee.experience || 0}ヶ月</div>
                            <div>部署: ${this.escapeHtml(ENHANCED_DEPARTMENTS[employee.department]?.name || employee.department)}</div>
                            <div>役職: ${this.escapeHtml(employee.position || 'メンバー')}</div>
                            <div>給与: ${GameUtils.formatMoney(employee.salary)}万円/月</div>
                        </div>
                        <div class="personality-desc">${this.escapeHtml(personality.description)}</div>
                        ${employee.backstory ? `
                            <div class="employee-backstory">
                                <h5>📖 バックストーリー</h5>
                                <p>${this.escapeHtml(employee.backstory)}</p>
                            </div>
                        ` : ''}
                        ${employee.quirks && employee.quirks.length > 0 ? `
                            <div class="employee-quirks">
                                <h5>✨ 個性</h5>
                                <div class="quirk-tags">
                                    ${employee.quirks.map(quirk => `<span class="quirk-tag">${this.escapeHtml(quirk)}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        ${employee.milestones && employee.milestones.length > 0 ? `
                            <div class="employee-milestones">
                                <h5>🏆 達成マイルストーン</h5>
                                <div class="milestone-list">
                                    ${employee.milestones.slice(-3).reverse().map(m => `
                                        <div class="milestone-item" onclick="enhancedGameUI.showEmployeeStoryCard(${JSON.stringify(m).replace(/"/g, '&quot;')})">
                                            <span class="milestone-icon">${this.escapeHtml(m.icon)}</span>
                                            <span class="milestone-title">${this.escapeHtml(m.title)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="employee-section">
                        <h4>メンタル状態</h4>
                        <div class="mental-bars">
                            <div class="mental-bar">
                                <span>満足度</span>
                                <div class="bar"><div class="fill" style="width: ${employee.satisfaction}%"></div></div>
                                <span>${employee.satisfaction}%</span>
                            </div>
                            <div class="mental-bar">
                                <span>モチベーション</span>
                                <div class="bar"><div class="fill" style="width: ${employee.motivation}%"></div></div>
                                <span>${employee.motivation}%</span>
                            </div>
                            <div class="mental-bar">
                                <span>ストレス</span>
                                <div class="bar"><div class="fill stress" style="width: ${employee.stress}%"></div></div>
                                <span>${employee.stress}%</span>
                            </div>
                        </div>
                        <div class="quit-risk ${quitRisk > 0.3 ? 'high-risk' : quitRisk > 0.15 ? 'medium-risk' : 'low-risk'}">
                            離職リスク: ${Math.round(quitRisk * 100)}%
                        </div>
                    </div>
                    
                    <div class="employee-section">
                        <h4>能力値</h4>
                        <div class="ability-grid">
                            ${Object.entries(employee.baseAbilities || {}).map(([ability, value]) => `
                                <div class="ability-item">
                                    <span>${ability}</span>
                                    <span>${value}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="employee-section">
                        <h4>主要スキル</h4>
                        <div class="skills-list">
                            ${topSkills || '<div>スキルデータなし</div>'}
                        </div>
                    </div>
                    
                    ${Object.keys(promotionReadiness).length > 0 ? `
                        <div class="employee-section">
                            <h4>昇進可能性</h4>
                            <div class="promotion-readiness">
                                ${Object.entries(promotionReadiness).map(([position, data]) => `
                                    <div class="promotion-item">
                                        <span>${position}</span>
                                        <div class="readiness-bar">
                                            <div class="fill" style="width: ${data.readiness * 100}%"></div>
                                        </div>
                                        <span>${Math.round(data.readiness * 100)}%</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="employee-actions">
                    <button class="btn small" onclick="enhancedGameUI.showSalaryAdjustment(${employeeId})">💰 給与調整</button>
                    <button class="btn small" onclick="enhancedGameUI.showEmployeeTraining(${employeeId})">📚 個人研修</button>
                    <button class="btn small" onclick="enhancedGameUI.showDepartmentTransfer(${employeeId})">🔄 部署異動</button>
                    ${employee.position === 'member' && promotionReadiness.leader?.readiness > 0.6 ? 
                        `<button class="btn small" onclick="enhancedGameUI.promoteEmployee(${employeeId}, 'leader')">⬆️ リーダー昇進</button>` : ''
                    }
                </div>
            </div>
        `;
        
        this.showModal('従業員詳細', html);
    }

    /**
     * 拡張モーダル表示（サイズ指定対応）
     */
    showModal(title, body, size = 'normal') {
        super.showModal(title, body);
        
        // サイズクラスを追加
        const modal = document.getElementById('modal');
        if (modal) {
            modal.classList.remove('modal-large', 'modal-small');
            if (size === 'large') {
                modal.classList.add('modal-large');
            } else if (size === 'small') {
                modal.classList.add('modal-small');
            }
        }
    }

    /**
     * 拡張採用システム表示
     */
    showDepartmentHiring(targetDepartment = 'development') {
        const dept = ENHANCED_DEPARTMENTS[targetDepartment];
        const gameState = this.game.getGameState();
        
        const budgetOptions = [
            { 
                value: 500000, 
                label: '50万円', 
                type: '基本採用',
                description: '候補者3名、標準品質',
                icon: '💼',
                recommended: false
            },
            { 
                value: 1000000, 
                label: '100万円', 
                type: '積極採用',
                description: '候補者5名、高品質',
                icon: '🎯',
                recommended: true
            },
            { 
                value: 2000000, 
                label: '200万円', 
                type: 'ヘッドハント',
                description: '候補者8名、最高品質',
                icon: '🏆',
                recommended: false
            },
            { 
                value: 3000000, 
                label: '300万円', 
                type: '特別採用',
                description: '候補者10名、プレミアム品質',
                icon: '👑',
                recommended: false
            }
        ];
        
        const html = `
            <div class="hiring-system-enhanced">
                <div class="hiring-header">
                    <div class="dept-info">
                        <h2>${dept?.name || targetDepartment}</h2>
                        <p>${dept?.description || '部署の説明'}</p>
                        <div class="dept-stats">
                            <span class="stat-item">
                                <span class="stat-label">現在の人数:</span>
                                <span class="stat-value">${gameState.employees.filter(emp => emp.department === targetDepartment).length}名</span>
                            </span>
                            <span class="stat-item">
                                <span class="stat-label">最適人数:</span>
                                <span class="stat-value">${dept?.optimalEmployees?.min || 0}-${dept?.optimalEmployees?.max || 0}名</span>
                            </span>
                        </div>
                    </div>
                    <div class="required-skills-summary">
                        <h4>求められるスキル</h4>
                        <div class="skill-tags">
                            ${dept?.primarySkills?.map(skill => `<span class="skill-tag primary">${this.getSkillDisplayName(skill)}</span>`).join('') || ''}
                        </div>
                    </div>
                </div>
                
                <div class="hiring-steps">
                    <div class="step-container">
                        <div class="step-header">
                            <span class="step-number">1</span>
                            <h3>採用予算を選択</h3>
                        </div>
                        <div class="budget-grid">
                            ${budgetOptions.map((option, index) => `
                                <div class="budget-card ${option.recommended ? 'recommended' : ''}" onclick="selectBudget(${index})">
                                    <input type="radio" id="budget${index}" name="hiringBudget" value="${option.value}" ${index === 1 ? 'checked' : ''} style="display: none;">
                                    <div class="budget-icon">${option.icon}</div>
                                    <div class="budget-amount">${option.label}</div>
                                    <div class="budget-type">${option.type}</div>
                                    <div class="budget-description">${option.description}</div>
                                    ${option.recommended ? '<div class="recommended-badge">おすすめ</div>' : ''}
                                    <div class="affordability ${gameState.money >= option.value ? 'affordable' : 'unaffordable'}">
                                        ${gameState.money >= option.value ? '✅ 予算内' : '❌ 予算不足'}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="step-container">
                        <div class="step-header">
                            <span class="step-number">2</span>
                            <h3>募集ポジション</h3>
                        </div>
                        <div class="position-selector">
                            <select id="targetPosition" class="form-select-enhanced">
                                <option value="member">一般メンバー (新卒・中途)</option>
                                <option value="leader">チームリーダー (経験者)</option>
                                <option value="manager">マネージャー (管理職経験者)</option>
                            </select>
                            <div class="position-info">
                                <small>ポジションが上位ほど高いスキルを持つ候補者が集まりますが、給与も高くなります。</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="hiring-actions">
                    <button class="btn success large" onclick="enhancedGameUI.startRecruitment('${targetDepartment}')">
                        🚀 採用活動を開始する
                    </button>
                    <button class="btn secondary" onclick="enhancedGameUI.closeModal()">
                        キャンセル
                    </button>
                </div>
                
                ${this.currentInterviewCandidates.length > 0 ? this.renderCandidateList() : ''}
            </div>
            
            <script>
                function selectBudget(index) {
                    document.querySelectorAll('.budget-card').forEach(card => card.classList.remove('selected'));
                    document.querySelectorAll('input[name="hiringBudget"]').forEach(input => input.checked = false);
                    
                    const selectedCard = document.querySelectorAll('.budget-card')[index];
                    selectedCard.classList.add('selected');
                    document.getElementById('budget' + index).checked = true;
                }
            </script>
        `;
        
        this.showModal('💼 採用システム', html, 'large');
    }

    /**
     * 求人開始
     */
    async startRecruitment(targetDepartment) {
        const budgetElement = document.querySelector('input[name="hiringBudget"]:checked');
        const positionElement = document.getElementById('targetPosition');
        
        if (!budgetElement || !positionElement) {
            this.showNotification('エラー', '予算とポジションを選択してください', 'error');
            return;
        }
        
        const budget = parseInt(budgetElement.value);
        const position = positionElement.value;
        
        const result = this.game.interviewSystem.startRecruitment(budget, targetDepartment, position);
        
        if (result.success) {
            this.currentInterviewCandidates = result.candidates;
            this.showNotification('求人開始', 
                `求人広告を掲載しました。${result.candidates.length}名の応募があります。\n広告費用: ${GameUtils.formatMoney(result.cost)}万円`, 
                'success');
            
            // 候補者リストを更新
            this.showDepartmentHiring(targetDepartment);
        } else {
            this.showNotification('求人失敗', result.error, 'error');
        }
    }

    /**
     * 候補者リスト表示
     */
    renderCandidateList() {
        if (this.currentInterviewCandidates.length === 0) return '';
        
        return `
            <div class="candidate-list">
                <h4>📋 応募者一覧</h4>
                <div class="candidates">
                    ${this.currentInterviewCandidates.map(candidate => `
                        <div class="candidate-card ${candidate.interviewed ? 'interviewed' : ''}">
                            <div class="candidate-header">
                                <span class="candidate-name">${candidate.name}</span>
                                <span class="candidate-value">価値: ${candidate.estimatedValue}</span>
                            </div>
                            <div class="candidate-info">
                                <div>経験: ${candidate.experience}ヶ月</div>
                                <div>希望給与: ${candidate.expectedSalary}万円</div>
                                <div>資格数: ${candidate.certificationCount}</div>
                            </div>
                            <div class="candidate-actions">
                                ${!candidate.interviewed ? `
                                    <button class="btn small" onclick="enhancedGameUI.conductInterview(${candidate.id}, 'general')">📋 一般面接</button>
                                    <button class="btn small" onclick="enhancedGameUI.conductInterview(${candidate.id}, 'technical')">🔧 技術面接</button>
                                    <button class="btn small" onclick="enhancedGameUI.conductInterview(${candidate.id}, 'behavioral')">👥 行動面接</button>
                                ` : `
                                    <div class="interview-result">
                                        <div>評価: ${'⭐'.repeat(candidate.interviewResult?.evaluation?.score || 0)}</div>
                                        <div class="recommendation ${candidate.interviewResult?.evaluation?.recommendation}">
                                            ${candidate.interviewResult?.evaluation?.recommendation === 'recommend' ? '✅ 推奨' : 
                                              candidate.interviewResult?.evaluation?.recommendation === 'neutral' ? '⚖️ 中立' : 
                                              '❌ 非推奨'}
                                        </div>
                                        <button class="btn small success" onclick="enhancedGameUI.showHiringOffer(${candidate.id})">📝 採用オファー</button>
                                    </div>
                                `}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 面接実行
     */
    async conductInterview(candidateId, interviewType) {
        const result = this.game.interviewSystem.conductInterview(candidateId, interviewType);
        
        if (result.success) {
            // 候補者情報を更新
            const candidateIndex = this.currentInterviewCandidates.findIndex(c => c.id === candidateId);
            if (candidateIndex >= 0) {
                this.currentInterviewCandidates[candidateIndex].interviewed = true;
                this.currentInterviewCandidates[candidateIndex].interviewResult = result.result;
            }
            
            this.showInterviewResult(result.result);
        } else {
            this.showNotification('面接失敗', result.error, 'error');
        }
    }

    /**
     * 面接結果表示
     */
    showInterviewResult(result) {
        const typeNames = {
            general: '一般面接',
            technical: '技術面接',
            behavioral: '行動面接'
        };
        
        const html = `
            <div class="interview-result-modal">
                <h4>${typeNames[result.type]} 結果</h4>
                
                <div class="interview-evaluation">
                    <div class="evaluation-score">
                        評価: ${'⭐'.repeat(result.evaluation.score)}
                    </div>
                    <div class="evaluation-recommendation ${result.evaluation.recommendation}">
                        ${result.evaluation.recommendation === 'recommend' ? '✅ 採用推奨' : 
                          result.evaluation.recommendation === 'neutral' ? '⚖️ 判断保留' : 
                          '❌ 採用非推奨'}
                    </div>
                </div>
                
                <div class="interview-comments">
                    <h5>面接官コメント:</h5>
                    <ul>
                        ${result.evaluation.comments.map(comment => `<li>${comment}</li>`).join('')}
                    </ul>
                </div>
                
                ${result.revealed ? `
                    <div class="revealed-info">
                        <h5>判明した情報:</h5>
                        ${this.formatRevealedInfo(result.revealed)}
                    </div>
                ` : ''}
            </div>
        `;
        
        this.showModal('面接結果', html);
    }

    /**
     * 判明情報のフォーマット
     */
    formatRevealedInfo(revealed) {
        let html = '';
        
        if (revealed.abilities) {
            html += '<div class="revealed-section"><strong>能力:</strong><ul>';
            Object.entries(revealed.abilities).forEach(([ability, value]) => {
                html += `<li>${ability}: ${value}</li>`;
            });
            html += '</ul></div>';
        }
        
        if (revealed.personality) {
            html += `<div class="revealed-section"><strong>性格:</strong> ${revealed.personality.name}<br>
                     <small>${revealed.personality.description}</small></div>`;
        }
        
        if (revealed.skills) {
            html += '<div class="revealed-section"><strong>スキル:</strong><ul>';
            Object.entries(revealed.skills).forEach(([skill, level]) => {
                if (level > 0) html += `<li>${skill}: ${level}</li>`;
            });
            html += '</ul></div>';
        }
        
        if (revealed.topSkills) {
            html += '<div class="revealed-section"><strong>主要スキル:</strong><ul>';
            Object.entries(revealed.topSkills).forEach(([skill, level]) => {
                html += `<li>${skill}: ${level}</li>`;
            });
            html += '</ul></div>';
        }
        
        return html;
    }

    /**
     * 採用オファー表示
     */
    showHiringOffer(candidateId) {
        const candidate = this.game.interviewSystem.currentCandidates.find(c => c.id === candidateId);
        if (!candidate) return;
        
        const marketSalary = candidate.getMarketSalary ? candidate.getMarketSalary() : candidate.salary;
        
        const html = `
            <div class="hiring-offer">
                <h4>💼 ${candidate.name}への採用オファー</h4>
                
                <div class="offer-section">
                    <h5>給与条件</h5>
                    <div class="salary-input">
                        <label>月給:</label>
                        <input type="number" id="offerSalary" value="${candidate.salary}"
                               min="${Math.round(candidate.salary * 0.8)}"
                               max="${Math.round(candidate.salary * 1.5)}"
                               step="1">
                        <span>万円</span>
                    </div>
                    <div class="salary-info">
                        <div>希望給与: ${GameUtils.formatMoney(candidate.salary)}万円</div>
                        <div>市場相場: ${GameUtils.formatMoney(marketSalary)}万円</div>
                    </div>
                </div>
                
                <div class="offer-section">
                    <h5>労働条件</h5>
                    <div class="work-conditions">
                        <label>
                            <input type="radio" name="workStyle" value="office" checked> 
                            オフィス勤務
                        </label>
                        <label>
                            <input type="radio" name="workStyle" value="flexible"> 
                            フレックス制
                        </label>
                        <label>
                            <input type="radio" name="workStyle" value="remote"> 
                            リモート可
                        </label>
                    </div>
                </div>
                
                <div class="offer-prediction">
                    <div id="successPrediction">成功率を計算中...</div>
                </div>
                
                <div class="offer-actions">
                    <button class="btn success" onclick="enhancedGameUI.finalizeHiring(${candidateId})">📋 オファー送信</button>
                    <button class="btn secondary" onclick="enhancedGameUI.closeModal()">キャンセル</button>
                </div>
            </div>
        `;
        
        this.showModal('採用オファー', html);
        
        // 成功率の動的更新
        document.getElementById('offerSalary')?.addEventListener('input', () => {
            this.updateSuccessPrediction(candidateId);
        });
        
        this.updateSuccessPrediction(candidateId);
    }

    /**
     * 採用成功率予測更新
     */
    updateSuccessPrediction(candidateId) {
        const salaryInput = document.getElementById('offerSalary');
        const workStyleInputs = document.querySelectorAll('input[name="workStyle"]');
        
        if (!salaryInput) return;
        
        const offerSalary = parseInt(salaryInput.value) * 10000;
        const selectedWorkStyle = Array.from(workStyleInputs).find(input => input.checked)?.value || 'office';
        
        const conditions = { workStyle: selectedWorkStyle };
        const successRate = this.game.interviewSystem.calculateHiringSuccessRate(
            this.game.interviewSystem.currentCandidates.find(c => c.id === candidateId), 
            offerSalary, 
            conditions
        );
        
        const predictionElement = document.getElementById('successPrediction');
        if (predictionElement) {
            const percentage = Math.round(successRate * 100);
            const color = percentage >= 70 ? 'green' : percentage >= 50 ? 'orange' : 'red';
            predictionElement.innerHTML = `<span style="color: ${color}">採用成功率: ${percentage}%</span>`;
        }
    }

    /**
     * 採用確定
     */
    async finalizeHiring(candidateId) {
        const salaryInput = document.getElementById('offerSalary');
        const workStyleInputs = document.querySelectorAll('input[name="workStyle"]');
        
        if (!salaryInput) return;
        
        const offerSalary = parseInt(salaryInput.value) * 10000;
        const selectedWorkStyle = Array.from(workStyleInputs).find(input => input.checked)?.value || 'office';
        
        const conditions = { workStyle: selectedWorkStyle };
        const result = this.game.interviewSystem.finalizeHiring(candidateId, offerSalary, conditions);
        
        this.closeModal();
        
        if (result.success) {
            this.showNotification('採用成功', 
                `${result.employee.name}を採用しました！\n契約費用: ${GameUtils.formatMoney(result.cost)}万円\n成功率: ${result.successRate}%`, 
                'success');
            
            // 候補者リストから削除
            this.currentInterviewCandidates = this.currentInterviewCandidates.filter(c => c.id !== candidateId);
            
            this.updateDisplay();
        } else {
            this.showNotification('採用失敗', 
                `${result.error}\n成功率は${result.successRate}%でした`, 
                'error');
        }
    }

    /**
     * 研修プログラム表示
     */
    showTrainingPrograms() {
        const html = `
            <div class="training-programs">
                <h4>📚 研修プログラム</h4>
                
                <div class="training-options">
                    <div class="training-option">
                        <h5>🔧 技術研修</h5>
                        <div class="training-desc">技術力・分析力を向上させる研修</div>
                        <div class="training-cost">費用: 30万円/人</div>
                        <button class="btn small" onclick="enhancedGameUI.startTraining('technical')">開始</button>
                    </div>
                    
                    <div class="training-option">
                        <h5>💼 ビジネス研修</h5>
                        <div class="training-desc">営業力・コミュニケーション力を向上させる研修</div>
                        <div class="training-cost">費用: 25万円/人</div>
                        <button class="btn small" onclick="enhancedGameUI.startTraining('business')">開始</button>
                    </div>
                    
                    <div class="training-option">
                        <h5>👑 リーダーシップ研修</h5>
                        <div class="training-desc">管理職向けのリーダーシップ・マネジメント研修</div>
                        <div class="training-cost">費用: 40万円/人</div>
                        <button class="btn small" onclick="enhancedGameUI.startTraining('leadership')">開始</button>
                    </div>
                    
                    <div class="training-option">
                        <h5>📊 総合研修</h5>
                        <div class="training-desc">全能力をバランスよく向上させる包括的研修</div>
                        <div class="training-cost">費用: 50万円/人</div>
                        <button class="btn small" onclick="enhancedGameUI.startTraining('comprehensive')">開始</button>
                    </div>
                </div>
                
                <div class="training-budget">
                    <label>研修予算:</label>
                    <input type="number" id="trainingBudget" value="1000000" min="100000" step="100000">
                    <span>円</span>
                </div>
            </div>
        `;
        
        this.showModal('研修プログラム', html);
    }

    /**
     * 研修開始
     */
    startTraining(trainingType) {
        const budgetElement = document.getElementById('trainingBudget');
        const budget = budgetElement ? parseInt(budgetElement.value) : 1000000;
        
        const result = this.game.conductTraining(trainingType, [], budget);
        
        this.closeModal();
        
        if (result.success) {
            this.showNotification('研修実施完了', 
                `${result.program}を実施しました\n参加者: ${result.participantCount}名\n費用: ${GameUtils.formatMoney(result.totalCost)}万円`, 
                'success');
            this.updateDisplay();
        } else {
            this.showNotification('研修実施失敗', result.error, 'error');
        }
    }

    /**
     * 労働環境改善オプション表示
     */
    showWorkEnvironmentOptions() {
        const html = `
            <div class="work-environment-options">
                <h4>🏢 労働環境改善</h4>
                
                <div class="improvement-categories">
                    <div class="improvement-category">
                        <h5>🏢 オフィス改装</h5>
                        <div class="improvement-options">
                            <button class="btn small" onclick="enhancedGameUI.improveEnvironment('office_upgrade', 2000000)">
                                快適オフィス (200万円)
                            </button>
                            <button class="btn small" onclick="enhancedGameUI.improveEnvironment('office_upgrade', 5000000)">
                                高級オフィス (500万円)
                            </button>
                        </div>
                    </div>
                    
                    <div class="improvement-category">
                        <h5>🎁 福利厚生</h5>
                        <div class="improvement-options">
                            <button class="btn small" onclick="enhancedGameUI.improveEnvironment('welfare_expansion', 3000000)">
                                社員食堂 (300万円)
                            </button>
                            <button class="btn small" onclick="enhancedGameUI.improveEnvironment('welfare_expansion', 1500000)">
                                社内ジム (150万円)
                            </button>
                            <button class="btn small" onclick="enhancedGameUI.improveEnvironment('welfare_expansion', 100000)">
                                学習支援制度 (10万円)
                            </button>
                        </div>
                    </div>
                    
                    <div class="improvement-category">
                        <h5>⏰ 働き方改革</h5>
                        <div class="improvement-options">
                            <button class="btn small" onclick="enhancedGameUI.improveEnvironment('work_style', 200000)">
                                フレックス制 (20万円)
                            </button>
                            <button class="btn small" onclick="enhancedGameUI.improveEnvironment('work_style', 1000000)">
                                リモートワーク対応 (100万円)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal('労働環境改善', html);
    }

    /**
     * 環境改善実行
     */
    improveEnvironment(improvementType, budget) {
        const result = this.game.improveWorkEnvironment(improvementType, budget);

        this.closeModal();

        if (result.success) {
            this.showNotification('環境改善完了',
                `${result.improvement}を実施\n${result.effect}\n費用: ${GameUtils.formatMoney(result.cost)}万円`,
                'success');
            this.updateDisplay();
        } else {
            this.showNotification('環境改善失敗', result.error, 'error');
        }
    }

    /**
     * デイリーミッション表示更新
     */
    updateDailyMissions() {
        const container = document.getElementById('dailyMissions');
        if (!container || !this.game.dailyMissionSystem) return;

        const missions = this.game.dailyMissionSystem.missions;
        const allCompleted = missions.every(m => m.completed);

        const html = missions.map(mission => {
            const progressPercent = Math.min(100, (mission.progress / mission.target) * 100);
            const completedClass = mission.completed ? 'completed' : '';

            return `
                <div class="mission-card ${completedClass}">
                    <div class="mission-title">
                        ${mission.completed ? '✅' : '📌'} ${mission.name}
                    </div>
                    <div class="mission-meta">
                        <span>${mission.desc}</span>
                        <span class="mission-progress-text">${mission.progress}/${mission.target}</span>
                    </div>
                    <div class="mission-progress">
                        <span style="width: ${progressPercent}%"></span>
                    </div>
                    <div class="mission-rewards">
                        ${mission.reward.money ? `<span class="mission-reward">💰 ${GameUtils.formatMoney(mission.reward.money)}円</span>` : ''}
                        ${mission.reward.reputation ? `<span class="mission-reward">⭐ 評判+${mission.reward.reputation}</span>` : ''}
                    </div>
                    ${mission.completed ? '<div class="mission-status">✨ 達成!</div>' : ''}
                </div>
            `;
        }).join('');

        container.innerHTML = html + (allCompleted ? `
            <div class="mission-card completed achievement-unlocked">
                <div class="mission-title">🏆 全ミッション達成!</div>
                <div class="mission-meta">
                    <span>素晴らしい!ボーナス報酬を獲得しました!</span>
                </div>
                <div class="mission-rewards">
                    <span class="mission-reward">💰 200,000円</span>
                    <span class="mission-reward">⭐ 評判+20</span>
                </div>
            </div>
        ` : '');

        // ミッションリフレッシュ情報
        const refreshInfo = document.getElementById('missionRefreshInfo');
        if (refreshInfo) {
            const currentMonth = `${this.game.year}年${this.game.month}月`;
            refreshInfo.textContent = `${currentMonth} | 月初にリセット`;
        }
    }

    /**
     * 成長ダッシュボード更新
     */
    updateGrowthDashboard() {
        if (!this.game.growthDashboard) return;

        // グラフ描画
        this.game.growthDashboard.renderFinancialChart('financialGrowthChart');
        this.game.growthDashboard.renderTeamChart('teamGrowthChart');

        // サマリー情報更新
        const summaryContainer = document.getElementById('growthSummary');
        if (summaryContainer) {
            const state = this.game.getGameState();
            const history = this.game.growthDashboard.historyData;

            // 成長率計算
            const revenueGrowth = this.calculateGrowthRate(history.revenue);
            const employeeGrowth = this.calculateGrowthRate(history.employees);
            const satisfactionChange = this.calculateChange(history.satisfaction);

            summaryContainer.innerHTML = `
                <div class="growth-pill">
                    <span>💰 売上成長率</span>
                    <strong class="${revenueGrowth >= 0 ? 'positive' : 'negative'}">${revenueGrowth > 0 ? '+' : ''}${revenueGrowth}%</strong>
                </div>
                <div class="growth-pill">
                    <span>👥 組織拡大</span>
                    <strong class="${employeeGrowth >= 0 ? 'positive' : 'negative'}">${employeeGrowth > 0 ? '+' : ''}${employeeGrowth}%</strong>
                </div>
                <div class="growth-pill">
                    <span>😊 満足度推移</span>
                    <strong class="${satisfactionChange >= 0 ? 'positive' : 'negative'}">${satisfactionChange > 0 ? '+' : ''}${satisfactionChange}pt</strong>
                </div>
            `;
        }

        // グラフ凡例更新
        const legendContainer = document.getElementById('growthLegend');
        if (legendContainer) {
            legendContainer.innerHTML = `
                <span><span class="chart-dot" style="background: #667eea;"></span> 売上</span>
                <span><span class="chart-dot" style="background: #4ecdc4;"></span> 市場シェア</span>
                <span><span class="chart-dot" style="background: #4caf50;"></span> 従業員数</span>
                <span><span class="chart-dot" style="background: #ffa726;"></span> 満足度</span>
            `;
        }
    }

    /**
     * 成長率計算
     */
    calculateGrowthRate(dataArray) {
        if (dataArray.length < 2) return 0;
        const latest = dataArray[dataArray.length - 1];
        const previous = dataArray[dataArray.length - 2];
        if (previous === 0) return latest > 0 ? 100 : 0;
        return Math.round(((latest - previous) / previous) * 100);
    }

    /**
     * 変化量計算
     */
    calculateChange(dataArray) {
        if (dataArray.length < 2) return 0;
        const latest = dataArray[dataArray.length - 1];
        const previous = dataArray[dataArray.length - 2];
        return Math.round(latest - previous);
    }

    /**
     * 従業員ストーリーカード表示
     */
    showEmployeeStoryCard(milestone) {
        const html = `
            <div class="story-card-modal">
                <div class="story-card-icon">${this.escapeHtml(milestone.icon)}</div>
                <div class="story-card-title">${this.escapeHtml(milestone.title)}</div>
                <div class="story-card-description">${this.escapeHtml(milestone.description)}</div>
                <div class="story-card-date">${new Date(milestone.date).toLocaleDateString('ja-JP')}</div>
                <div class="story-card-actions">
                    <button class="btn success" onclick="enhancedGameUI.closeModal()">✨ 素晴らしい!</button>
                </div>
            </div>
        `;

        this.showModal('📜 マイルストーン達成', html);
    }

    /**
     * マイルストーン通知処理
     */
    processNewMilestones(hrResults) {
        if (!hrResults || !hrResults.newMilestones || hrResults.newMilestones.length === 0) {
            return;
        }

        // 最初のマイルストーンを表示
        const firstMilestone = hrResults.newMilestones[0];
        this.showEmployeeStoryCard(firstMilestone);

        // 複数ある場合は通知
        if (hrResults.newMilestones.length > 1) {
            this.showNotification(
                'マイルストーン達成',
                `${hrResults.newMilestones.length}件のマイルストーンが達成されました!`,
                'success'
            );
        }
    }
}

// グローバル変数
let enhancedGameUI;