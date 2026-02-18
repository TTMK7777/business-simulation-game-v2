/**
 * 経営シミュレーションゲーム - 資格取得UIシステム
 * Business Simulation Game - Certification UI System
 *
 * 資格取得システムのユーザーインターフェースを管理:
 * - 資格一覧の表示
 * - 従業員ごとの資格取得状況表示
 * - 進捗バー、カード表示
 * - 通知システム
 */

class CertificationUI {
    constructor(certificationManager) {
        this.certificationManager = certificationManager;
        this.currentEmployeeId = null;
        this.notificationQueue = [];

        console.log('[CertificationUI] Certification UI initialized');
    }

    /**
     * HTMLエスケープ (XSS対策)
     * @param {string} text - エスケープするテキスト
     * @returns {string} エスケープされたテキスト
     */
    escapeHtml(text) {
        if (text == null) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
            '`': '&#96;'
        };
        return String(text).replace(/[&<>"'`]/g, m => map[m]);
    }

    /**
     * 資格パネル全体をレンダリング
     * Render the complete certification panel
     *
     * @param {Map<string, Object>} employees - 従業員マップ
     * @param {number} currentCash - 現在の資金
     * @returns {string} HTML文字列
     */
    renderCertificationPanel(employees, currentCash) {
        const employeeList = Array.from(employees.values());

        if (employeeList.length === 0) {
            return this.renderEmptyState();
        }

        // 現在選択中の従業員を取得（なければ最初の従業員を選択）
        if (!this.currentEmployeeId || !employees.has(this.currentEmployeeId)) {
            this.currentEmployeeId = employeeList[0].id;
        }

        const currentEmployee = employees.get(this.currentEmployeeId);

        return `
            <div class="certification-container">
                <div class="certification-header">
                    <h3>🎓 資格取得システム</h3>
                    <div class="certification-summary">
                        <span>💰 利用可能資金: <strong>¥${this.formatNumber(currentCash)}</strong></span>
                    </div>
                </div>

                <div class="certification-main">
                    <!-- 従業員選択セクション -->
                    <div class="employee-selector-section">
                        ${this.renderEmployeeSelector(employeeList)}
                    </div>

                    <!-- 選択中の従業員の情報と資格 -->
                    <div class="employee-certification-section">
                        ${this.renderEmployeeCertificationDetail(currentEmployee, currentCash)}
                    </div>
                </div>

                <!-- 通知エリア -->
                <div id="certification-notifications" class="certification-notifications">
                    ${this.renderNotifications()}
                </div>
            </div>
        `;
    }

    /**
     * 空状態（従業員がいない場合）の表示
     * @returns {string} HTML文字列
     */
    renderEmptyState() {
        return `
            <div class="certification-empty-state">
                <div class="empty-icon">👥</div>
                <h3>従業員がいません</h3>
                <p>まずは従業員を採用してから、資格取得を開始しましょう。</p>
            </div>
        `;
    }

    /**
     * 従業員選択セレクターをレンダリング
     * @param {Array<Object>} employees - 従業員配列
     * @returns {string} HTML文字列
     */
    renderEmployeeSelector(employees) {
        const employeeCards = employees.map(emp => {
            const isActive = emp.id === this.currentEmployeeId;
            const activeCert = this.certificationManager.getActiveCertification(emp.id);
            const personality = emp.getPersonality ? emp.getPersonality() :
                ENHANCED_PERSONALITIES[emp.personalityId] || ENHANCED_PERSONALITIES.serious;

            return `
                <div class="employee-card ${isActive ? 'active' : ''}"
                     onclick="certificationUI.selectEmployee('${emp.id}')"
                     data-employee-id="${emp.id}">
                    <div class="employee-card-header">
                        <div class="employee-name">${this.escapeHtml(emp.name)}</div>
                        <div class="employee-personality">${personality.name}</div>
                    </div>
                    <div class="employee-card-body">
                        <div class="employee-certs-count">
                            📜 ${(emp.certifications || []).length}件取得済み
                        </div>
                        ${activeCert ? `
                            <div class="employee-active-cert">
                                ⏳ ${CERTIFICATIONS[activeCert.certificationId].name}
                                <div class="mini-progress-bar">
                                    <div class="mini-progress-fill" style="width: ${activeCert.progress}%"></div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="employee-selector">
                <h4>従業員一覧</h4>
                <div class="employee-cards-grid">
                    ${employeeCards}
                </div>
            </div>
        `;
    }

    /**
     * 選択中の従業員の資格取得詳細をレンダリング
     * @param {Object} employee - 従業員オブジェクト
     * @param {number} currentCash - 現在の資金
     * @returns {string} HTML文字列
     */
    renderEmployeeCertificationDetail(employee, currentCash) {
        const activeCert = this.certificationManager.getActiveCertification(employee.id);
        const certificationHistory = this.certificationManager.getCertificationHistory(employee.id);
        const availableCerts = this.certificationManager.getAvailableCertifications(employee);

        return `
            <div class="certification-detail">
                <!-- 従業員情報ヘッダー -->
                ${this.renderEmployeeHeader(employee)}

                <!-- 進行中の資格取得 -->
                ${activeCert ? this.renderActiveCertification(employee, activeCert) : ''}

                <!-- 取得可能な資格リスト -->
                ${!activeCert ? this.renderAvailableCertifications(employee, availableCerts, currentCash) : ''}

                <!-- 取得済み資格 -->
                ${this.renderCompletedCertifications(employee)}

                <!-- 資格取得履歴 -->
                ${certificationHistory.length > 0 ?
                    this.renderCertificationHistory(certificationHistory) : ''}
            </div>
        `;
    }

    /**
     * 従業員情報ヘッダーをレンダリング
     * @param {Object} employee - 従業員オブジェクト
     * @returns {string} HTML文字列
     */
    renderEmployeeHeader(employee) {
        const personality = employee.getPersonality ? employee.getPersonality() :
            ENHANCED_PERSONALITIES[employee.personalityId] || ENHANCED_PERSONALITIES.serious;

        return `
            <div class="employee-detail-header">
                <div class="employee-info">
                    <h3>${this.escapeHtml(employee.name)}</h3>
                    <div class="employee-meta">
                        <span class="personality-badge">${personality.name}</span>
                        <span class="department-badge">${this.getDepartmentName(employee.department)}</span>
                    </div>
                </div>
                <div class="employee-stats-mini">
                    <div class="stat-mini">
                        <span class="stat-label">モチベ</span>
                        <span class="stat-value ${this.getMotivationClass(employee.motivation)}">
                            ${Math.round(employee.motivation || 75)}%
                        </span>
                    </div>
                    <div class="stat-mini">
                        <span class="stat-label">ストレス</span>
                        <span class="stat-value ${this.getStressClass(employee.stress)}">
                            ${Math.round(employee.stress || 0)}%
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 進行中の資格取得をレンダリング
     * @param {Object} employee - 従業員オブジェクト
     * @param {Object} activeCert - 進行中の資格データ
     * @returns {string} HTML文字列
     */
    renderActiveCertification(employee, activeCert) {
        const certification = CERTIFICATIONS[activeCert.certificationId];
        const progressPercentage = Math.min(100, activeCert.progress).toFixed(1);
        const remainingMonths = Math.max(0, activeCert.totalDuration - activeCert.monthsElapsed);

        return `
            <div class="active-certification-section">
                <h4>📚 学習中の資格</h4>
                <div class="active-cert-card">
                    <div class="cert-card-header">
                        <div class="cert-name">${certification.name}</div>
                        <div class="cert-difficulty ${certification.difficulty}">
                            ${this.getDifficultyBadge(certification.difficulty)}
                        </div>
                    </div>
                    <div class="cert-progress">
                        <div class="progress-info">
                            <span>進捗: ${progressPercentage}%</span>
                            <span>残り: ${remainingMonths}ヶ月</span>
                        </div>
                        <div class="progress-bar-large">
                            <div class="progress-fill-large" style="width: ${progressPercentage}%">
                                <span class="progress-text">${progressPercentage}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="cert-stats">
                        <div class="cert-stat">
                            <span>経過: ${activeCert.monthsElapsed}ヶ月</span>
                        </div>
                        <div class="cert-stat">
                            <span>予定: ${activeCert.totalDuration}ヶ月</span>
                        </div>
                    </div>
                    <div class="cert-actions">
                        <button class="btn-secondary btn-cancel"
                                onclick="certificationUI.cancelCertification('${employee.id}')">
                            ⚠️ 学習中止
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 取得可能な資格リストをレンダリング
     * @param {Object} employee - 従業員オブジェクト
     * @param {Array<Object>} availableCerts - 取得可能な資格配列
     * @param {number} currentCash - 現在の資金
     * @returns {string} HTML文字列
     */
    renderAvailableCertifications(employee, availableCerts, currentCash) {
        if (availableCerts.length === 0) {
            return `
                <div class="no-available-certs">
                    <p>✅ 取得可能な資格はありません</p>
                    <p class="hint">全ての前提資格を満たしているか、既に全て取得済みです。</p>
                </div>
            `;
        }

        const certCards = availableCerts.map(cert => {
            const canAfford = currentCash >= cert.cost;
            const roi = this.certificationManager.calculateROI(cert.id, employee, 5000000);

            return `
                <div class="cert-available-card ${!canAfford ? 'unaffordable' : ''}">
                    <div class="cert-card-header">
                        <div class="cert-name-section">
                            <div class="cert-name">${cert.name}</div>
                            <div class="cert-category">${this.getCategoryBadge(cert.category)}</div>
                        </div>
                        <div class="cert-difficulty ${cert.difficulty}">
                            ${this.getDifficultyBadge(cert.difficulty)}
                        </div>
                    </div>
                    <div class="cert-card-body">
                        <div class="cert-info-row">
                            <span>💰 コスト:</span>
                            <strong>¥${this.formatNumber(cert.cost)}</strong>
                        </div>
                        <div class="cert-info-row">
                            <span>⏱️ 期間:</span>
                            <strong>${cert.duration}ヶ月</strong>
                        </div>
                        <div class="cert-info-row">
                            <span>📈 投資回収:</span>
                            <strong class="${roi.analysis.shortTerm}">${roi.paybackPeriod}ヶ月</strong>
                        </div>
                        <div class="cert-info-row">
                            <span>💎 ROI:</span>
                            <strong class="${roi.analysis.longTerm}">${roi.roi}%</strong>
                        </div>
                        ${cert.prerequisites.length > 0 ? `
                            <div class="cert-prerequisites">
                                <span>前提資格: ${cert.prerequisites.join(', ')}</span>
                            </div>
                        ` : ''}
                        <div class="cert-effects">
                            ${this.renderCertificationEffects(cert.effects)}
                        </div>
                    </div>
                    <div class="cert-card-actions">
                        <button class="btn-primary ${!canAfford ? 'disabled' : ''}"
                                ${!canAfford ? 'disabled' : ''}
                                onclick="certificationUI.startCertification('${employee.id}', '${cert.id}')">
                            ${canAfford ? '🎯 学習開始' : '💰 資金不足'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="available-certifications-section">
                <h4>📋 取得可能な資格</h4>
                <div class="cert-available-grid">
                    ${certCards}
                </div>
            </div>
        `;
    }

    /**
     * 資格の効果を表示
     * @param {Object} effects - 資格の効果オブジェクト
     * @returns {string} HTML文字列
     */
    renderCertificationEffects(effects) {
        const effectsList = [];

        if (effects.all_technical_skills) {
            effectsList.push(`<li>🔧 全技術スキル +${effects.all_technical_skills}</li>`);
        }
        if (effects.all_sales_skills) {
            effectsList.push(`<li>💼 全営業スキル +${effects.all_sales_skills}</li>`);
        }
        if (effects.salary_multiplier && effects.salary_multiplier !== 1.0) {
            const percentage = ((effects.salary_multiplier - 1.0) * 100).toFixed(0);
            effectsList.push(`<li>💰 給与 +${percentage}%</li>`);
        }
        if (effects.leadership_potential && effects.leadership_potential !== 1.0) {
            const percentage = ((effects.leadership_potential - 1.0) * 100).toFixed(0);
            effectsList.push(`<li>👔 リーダーシップ +${percentage}%</li>`);
        }
        if (effects.reputation) {
            effectsList.push(`<li>⭐ 企業評判 +${effects.reputation}</li>`);
        }

        // 特定スキル効果
        Object.entries(effects).forEach(([key, value]) => {
            if (!['all_technical_skills', 'all_sales_skills', 'salary_multiplier',
                  'leadership_potential', 'reputation', 'market_value',
                  'innovation_bonus', 'project_success_rate', 'sales_performance'].includes(key)) {
                effectsList.push(`<li>📊 ${key} +${value}</li>`);
            }
        });

        return `<ul class="cert-effects-list">${effectsList.join('')}</ul>`;
    }

    /**
     * 取得済み資格をレンダリング
     * @param {Object} employee - 従業員オブジェクト
     * @returns {string} HTML文字列
     */
    renderCompletedCertifications(employee) {
        const completedCerts = (employee.certifications || []).map(certId => {
            const cert = CERTIFICATIONS[certId];
            return cert ? `
                <div class="completed-cert-badge">
                    <span class="cert-icon">🏆</span>
                    <span class="cert-name">${cert.name}</span>
                </div>
            ` : '';
        }).join('');

        if (!completedCerts) {
            return `
                <div class="completed-certifications-section">
                    <h4>🏆 取得済み資格</h4>
                    <p class="no-certs-message">まだ資格を取得していません</p>
                </div>
            `;
        }

        return `
            <div class="completed-certifications-section">
                <h4>🏆 取得済み資格 (${(employee.certifications || []).length}件)</h4>
                <div class="completed-certs-grid">
                    ${completedCerts}
                </div>
            </div>
        `;
    }

    /**
     * 資格取得履歴をレンダリング
     * @param {Array<Object>} history - 資格取得履歴
     * @returns {string} HTML文字列
     */
    renderCertificationHistory(history) {
        const historyItems = history.map(item => {
            const cert = CERTIFICATIONS[item.certificationId];
            return `
                <div class="history-item">
                    <div class="history-cert-name">${cert.name}</div>
                    <div class="history-details">
                        <span>完了: ${item.completionMonth}ヶ月目</span>
                        <span>期間: ${item.duration}ヶ月</span>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="certification-history-section">
                <h4>📜 取得履歴</h4>
                <div class="history-list">
                    ${historyItems}
                </div>
            </div>
        `;
    }

    /**
     * 通知をレンダリング
     * @returns {string} HTML文字列
     */
    renderNotifications() {
        return this.notificationQueue.map((notification, index) => `
            <div class="certification-notification ${notification.type}"
                 data-notification-id="${index}">
                <span class="notification-icon">${notification.icon}</span>
                <span class="notification-message">${this.escapeHtml(notification.message)}</span>
            </div>
        `).join('');
    }

    // ========== ユーティリティメソッド ==========

    /**
     * 従業員を選択
     * @param {string} employeeId - 従業員ID
     */
    selectEmployee(employeeId) {
        this.currentEmployeeId = employeeId;
        console.log(`[CertificationUI] Selected employee: ${employeeId}`);
        // UIを再レンダリング（呼び出し元で実装）
        if (typeof window.game !== 'undefined' && window.game.ui) {
            window.game.ui.updateDisplay();
        }
    }

    /**
     * 資格取得を開始（UIからの呼び出し）
     * @param {string} employeeId - 従業員ID
     * @param {string} certificationId - 資格ID
     */
    startCertification(employeeId, certificationId) {
        console.log(`[CertificationUI] Starting certification ${certificationId} for ${employeeId}`);

        if (typeof window.game !== 'undefined') {
            const employee = window.game.employees.get(employeeId);
            const cert = CERTIFICATIONS[certificationId];

            if (!employee) {
                this.showNotification('error', '❌ 従業員が見つかりません');
                return;
            }

            // 資金チェック
            if (window.game.cash < cert.cost) {
                this.showNotification('error', '❌ 資金が不足しています');
                return;
            }

            // 資格取得開始
            const result = this.certificationManager.startCertification(
                employeeId, certificationId, employee, window.game.currentMonth
            );

            if (result.success) {
                // 資金を減らす
                window.game.cash -= cert.cost;
                this.showNotification('success', `✅ ${result.message}`);
                window.game.ui.updateDisplay();
            } else {
                this.showNotification('error', `❌ ${result.message}`);
            }
        }
    }

    /**
     * 資格取得をキャンセル
     * @param {string} employeeId - 従業員ID
     */
    cancelCertification(employeeId) {
        if (confirm('本当に学習を中止しますか？進捗は失われます。')) {
            const result = this.certificationManager.cancelCertification(employeeId);

            if (result.success) {
                // 返金処理
                if (typeof window.game !== 'undefined' && result.refund) {
                    window.game.cash += result.refund;
                }
                this.showNotification('warning', `⚠️ ${result.message}`);
                if (typeof window.game !== 'undefined' && window.game.ui) {
                    window.game.ui.updateDisplay();
                }
            } else {
                this.showNotification('error', `❌ ${result.message}`);
            }
        }
    }

    /**
     * 通知を表示
     * @param {string} type - 'success', 'error', 'warning', 'info'
     * @param {string} message - 通知メッセージ
     */
    showNotification(type, message) {
        const iconMap = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        this.notificationQueue.push({
            type,
            icon: iconMap[type] || 'ℹ️',
            message
        });

        // 5秒後に削除
        setTimeout(() => {
            this.notificationQueue.shift();
            if (typeof window.game !== 'undefined' && window.game.ui) {
                window.game.ui.updateDisplay();
            }
        }, 5000);
    }

    /**
     * 数値をフォーマット（カンマ区切り）
     * @param {number} num - 数値
     * @returns {string} フォーマットされた文字列
     */
    formatNumber(num) {
        return num.toLocaleString('ja-JP');
    }

    /**
     * 部署名を取得
     * @param {string} deptId - 部署ID
     * @returns {string} 部署名
     */
    getDepartmentName(deptId) {
        const deptMap = {
            development: '開発部',
            sales: '営業部',
            planning: '企画部',
            quality: '品質管理部',
            hr: '人事部'
        };
        return deptMap[deptId] || deptId;
    }

    /**
     * 難易度バッジを取得
     * @param {string} difficulty - 難易度
     * @returns {string} バッジテキスト
     */
    getDifficultyBadge(difficulty) {
        const badges = {
            low: '初級',
            medium: '中級',
            high: '上級'
        };
        return badges[difficulty] || difficulty;
    }

    /**
     * カテゴリバッジを取得
     * @param {string} category - カテゴリ
     * @returns {string} バッジテキスト
     */
    getCategoryBadge(category) {
        const badges = {
            technical: '技術系',
            business: 'ビジネス系',
            management: '管理系'
        };
        return badges[category] || category;
    }

    /**
     * モチベーションのCSSクラスを取得
     * @param {number} motivation - モチベーション値
     * @returns {string} CSSクラス名
     */
    getMotivationClass(motivation) {
        if (motivation >= 75) return 'high';
        if (motivation >= 50) return 'medium';
        return 'low';
    }

    /**
     * ストレスのCSSクラスを取得
     * @param {number} stress - ストレス値
     * @returns {string} CSSクラス名
     */
    getStressClass(stress) {
        if (stress >= 70) return 'high';
        if (stress >= 40) return 'medium';
        return 'low';
    }
}

// グローバルスコープに公開
if (typeof window !== 'undefined') {
    window.CertificationUI = CertificationUI;
}
