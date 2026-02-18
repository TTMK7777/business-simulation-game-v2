/**
 * 経営シミュレーションゲーム - UI管理クラス
 */

class GameUI {
    constructor(game) {
        this.game = game;
        this.currentPanel = 'overview';
        this.modal = null;
        this.newsText = '';
        
        this.initializeElements();
        this.bindEvents();
    }

    /**
     * DOM要素の初期化
     */
    initializeElements() {
        this.elements = {
            money: document.getElementById('money'),
            employeeCount: document.getElementById('employeeCount'),
            revenue: document.getElementById('revenue'),
            gameDate: document.getElementById('gameDate'),
            marketShare: document.getElementById('marketShare'),
            brand: document.getElementById('brand'),
            reputation: document.getElementById('reputation'),
            researchPoints: document.getElementById('researchPoints'),
            marketTrend: document.getElementById('marketTrend'),
            currentStrategy: document.getElementById('currentStrategy'),
            newsText: document.getElementById('newsText'),
            rankingBar: document.getElementById('rankingBar'),
            employeeList: document.getElementById('employeeList'),
            productList: document.getElementById('productList'),
            marketInfo: document.getElementById('marketInfo'),
            financeInfo: document.getElementById('financeInfo'),
            modal: document.getElementById('modal'),
            modalTitle: document.getElementById('modalTitle'),
            modalBody: document.getElementById('modalBody'),
            achievementsList: document.getElementById('achievementsList'),
            achievements: document.getElementById('achievements')
        };
    }

    /**
     * イベントバインド
     */
    bindEvents() {
        // タブクリックイベント
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.showPanel(e.target.dataset.panel || this.getPanelFromText(e.target.textContent));
            });
        });

        // モーダルクローズイベント
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close')) {
                this.closeModal();
            }
        });
    }

    /**
     * タブテキストからパネル名を取得
     */
    getPanelFromText(text) {
        const panelMap = {
            '📊 概要': 'overview',
            '👥 人事': 'employees',
            '📦 製品': 'products',
            '🏢 市場': 'market',
            '💰 財務': 'finance'
        };
        return panelMap[text] || 'overview';
    }

    /**
     * 全体表示更新
     */
    updateDisplay() {
        try {
            const state = this.game.getGameState();
            
            // 基本情報の更新
            this.elements.money.textContent = `${GameUtils.formatMoney(state.money)}万`;
            this.elements.employeeCount.textContent = state.employees.length;
            this.elements.revenue.textContent = `${GameUtils.formatMoney(state.monthlyRevenue)}万`;
            this.elements.gameDate.textContent = `${state.year}年${state.month}月 第${state.week}週`;
            this.elements.marketShare.textContent = `${GameUtils.formatPercentage(state.marketShare)}%`;
            this.elements.brand.textContent = '⭐'.repeat(Math.min(5, state.brandPower));
            this.elements.reputation.textContent = state.reputation;
            this.elements.researchPoints.textContent = state.researchPoints;
            
            // 市場環境の表示
            const trendText = this.getMarketTrendText(state.marketTrend);
            this.elements.marketTrend.textContent = trendText;
            
            // 戦略表示の更新
            this.updateStrategyDisplay();
            
            // 実績表示の更新
            this.updateAchievementsDisplay();
            
        } catch (error) {
            console.error('Display update error:', error);
        }
    }

    /**
     * 市場トレンドテキスト取得
     */
    getMarketTrendText(trend) {
        const trendMap = {
            'boom': '📈 ブーム',
            'recession': '📉 不況',
            'stable': '📊 安定'
        };
        return trendMap[trend] || '📊 安定';
    }

    /**
     * 戦略表示更新
     */
    updateStrategyDisplay() {
        const state = this.game.getGameState();
        if (state.companyStrategy && COMPANY_STRATEGIES[state.companyStrategy]) {
            const strategy = COMPANY_STRATEGIES[state.companyStrategy];
            this.elements.currentStrategy.innerHTML = 
                `<strong>${strategy.name}</strong><br><small>${strategy.description}</small>`;
        } else {
            this.elements.currentStrategy.textContent = '戦略未設定';
        }
    }

    /**
     * 実績表示更新
     */
    updateAchievementsDisplay() {
        const state = this.game.getGameState();
        if (state.achievements.length > 0) {
            this.elements.achievementsList.style.display = 'block';
        }
    }

    /**
     * パネル切り替え
     */
    showPanel(panelId) {
        // アクティブタブの更新
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
        
        // 新しいパネルをアクティブに
        const activeTab = Array.from(document.querySelectorAll('.tab'))
            .find(tab => this.getPanelFromText(tab.textContent) === panelId);
        if (activeTab) activeTab.classList.add('active');
        
        const activePanel = document.getElementById(panelId);
        if (activePanel) activePanel.classList.add('active');
        
        this.currentPanel = panelId;
        
        // パネル固有の更新
        switch(panelId) {
            case 'employees':
                this.renderEmployees();
                break;
            case 'products':
                this.renderProducts();
                break;
            case 'market':
                this.renderMarket();
                break;
            case 'finance':
                this.renderFinance();
                break;
        }
    }

    /**
     * 従業員リスト表示
     */
    renderEmployees() {
        const state = this.game.getGameState();
        const list = this.elements.employeeList;
        
        if (state.employees.length === 0) {
            list.innerHTML = '<div class="empty">従業員がいません</div>';
            return;
        }

        list.innerHTML = state.employees.map(emp => {
            const traitsHtml = emp.traits && emp.traits.length > 0 ? 
                `<div style="margin: 5px 0;">
                    ${emp.traits.map(t => {
                        const trait = EMPLOYEE_TRAITS[t];
                        return trait ? `<span style="background: #4caf50; color: white; padding: 1px 4px; border-radius: 3px; font-size: 10px; margin: 1px;">${trait.name}</span>` : '';
                    }).join(' ')}
                </div>` : '';
            
            return `
                <div class="employee">
                    <div class="employee-header">
                        <div class="employee-name">${emp.name}</div>
                        <span class="personality">${emp.personality}</span>
                    </div>
                    <div class="abilities">
                        <div class="ability">
                            <span class="ability-name">技術:</span>
                            <span class="ability-value">${emp.abilities.technical}</span>
                        </div>
                        <div class="ability">
                            <span class="ability-name">営業:</span>
                            <span class="ability-value">${emp.abilities.sales}</span>
                        </div>
                    </div>
                    ${traitsHtml}
                    <div>月給: ${GameUtils.formatMoney(emp.salary)}万円</div>
                </div>
            `;
        }).join('');
    }

    /**
     * 製品リスト表示
     */
    renderProducts() {
        const state = this.game.getGameState();
        const list = this.elements.productList;
        
        if (state.products.length === 0) {
            list.innerHTML = '<div class="empty">製品がありません</div>';
            return;
        }

        list.innerHTML = state.products.map(product => {
            const lifecycle = product.lifecycle || 'introduction';
            const stageInfo = PRODUCT_LIFECYCLE[lifecycle];
            const lifecycleColor = {
                'introduction': '#ffa726',
                'growth': '#4caf50', 
                'maturity': '#2196f3',
                'decline': '#f44336'
            }[lifecycle];
            
            return `
                <div class="product" style="border-left: 4px solid ${lifecycleColor};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="font-weight: bold;">${product.name}</div>
                        <span style="background: ${lifecycleColor}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">${stageInfo.name}</span>
                    </div>
                    <div>品質: ${product.quality}%</div>
                    <div>月売上: ${GameUtils.formatMoney(product.currentRevenue || 0)}万円</div>
                    <div>累計売上: ${GameUtils.formatMoney(product.totalRevenue || 0)}万円</div>
                    <div style="font-size: 12px; color: #666; margin-top: 5px;">${stageInfo.description}</div>
                    ${lifecycle === 'decline' ? 
                        `<button class="btn" style="margin: 5px 0; padding: 8px; font-size: 12px;" onclick="gameUI.improveProduct(${product.id})">製品改良 (100万)</button>` : 
                        ''
                    }
                </div>
            `;
        }).join('');
    }

    /**
     * 市場情報表示
     */
    renderMarket() {
        const state = this.game.getGameState();
        const info = this.elements.marketInfo;
        const activeEvents = state.eventHistory.filter(e => e.remainingTurns > 0);
        
        info.innerHTML = `
            <h4>🏆 競合企業</h4>
            ${state.competitors.map(comp => `
                <div class="competitor">
                    <strong>${comp.name}</strong>
                    <div>CEO: ${comp.ceo}</div>
                    <div>市場シェア: ${GameUtils.formatPercentage(comp.share)}%</div>
                    <div>戦略: ${this.getStrategyText(comp.strategy)}</div>
                    <div>警戒度: ${this.getAlertLevelText(comp.alertLevel)}</div>
                </div>
            `).join('')}
            
            ${activeEvents.length > 0 ? `
                <h4 style="margin-top: 20px;">📊 進行中のイベント</h4>
                ${activeEvents.map(event => `
                    <div class="info-box" style="background: #fff3cd; border-left: 3px solid #ff9800;">
                        <div style="font-weight: bold;">${event.name}</div>
                        <div style="font-size: 14px; color: #666;">${event.description}</div>
                        <div style="font-size: 12px; color: #999;">残り${event.remainingTurns}ターン</div>
                    </div>
                `).join('')}
            ` : ''}
        `;
    }

    /**
     * 戦略テキスト取得
     */
    getStrategyText(strategy) {
        const strategyMap = {
            'aggressive': '攻撃的',
            'balanced': 'バランス型',
            'defensive': '守備的'
        };
        return strategyMap[strategy] || strategy;
    }

    /**
     * 警戒レベルテキスト取得
     */
    getAlertLevelText(alertLevel) {
        const alertMap = {
            'aggressive': '🔴 高',
            'cautious': '🟡 中',
            'normal': '🟢 低'
        };
        return alertMap[alertLevel] || '🟢 低';
    }

    /**
     * 財務情報表示
     */
    renderFinance() {
        const state = this.game.getGameState();
        const info = this.elements.financeInfo;
        const salaryTotal = state.employees.reduce((sum, emp) => sum + emp.salary, 0);
        
        info.innerHTML = `
            <div class="info-box">
                <div>売上高: ${GameUtils.formatMoney(state.monthlyRevenue)}万円</div>
                <div>人件費: ${GameUtils.formatMoney(salaryTotal)}万円</div>
                <div>純利益: ${GameUtils.formatMoney(state.monthlyRevenue - salaryTotal)}万円</div>
                ${state.debt > 0 ? `<div>借金: ${GameUtils.formatMoney(state.debt)}万円</div>` : ''}
            </div>
        `;
    }

    /**
     * ランキング更新
     */
    updateRanking() {
        const state = this.game.getGameState();
        const allCompanies = [
            ...state.competitors.map(c => ({ name: c.name, share: c.share })),
            { name: 'あなた', share: state.marketShare, isPlayer: true }
        ].sort((a, b) => b.share - a.share);

        const rankingHtml = allCompanies.slice(0, 4).map((company, index) => 
            `<div class="rank-item ${company.isPlayer ? 'player' : ''}">
                ${index + 1}位: ${company.name}(${GameUtils.formatPercentage(company.share)}%)
            </div>`
        ).join('');
        
        this.elements.rankingBar.innerHTML = rankingHtml;
    }

    /**
     * ニュース生成・表示
     */
    generateNews() {
        const state = this.game.getGameState();
        const templates = GAME_DATA.NEWS_TEMPLATES;
        const template = templates[Math.floor(Math.random() * templates.length)];
        const company = state.competitors[Math.floor(Math.random() * state.competitors.length)].name;
        const percent = Math.floor(Math.random() * 30) + 10;
        
        this.newsText = template.replace('${company}', company).replace('${percent}', percent);
        this.elements.newsText.textContent = '📰 ' + this.newsText;
    }

    /**
     * モーダル表示
     */
    showModal(title, body) {
        this.elements.modalTitle.textContent = title;
        this.elements.modalBody.innerHTML = body.replace(/\n/g, '<br>');
        this.elements.modal.classList.add('active');
    }

    /**
     * モーダル閉じる
     */
    closeModal() {
        this.elements.modal.classList.remove('active');
    }

    /**
     * 通知表示（モーダルのラッパー）
     */
    showNotification(title, message, type = 'info') {
        const iconMap = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        
        const icon = iconMap[type] || iconMap.info;
        this.showModal(`${icon} ${title}`, message);
    }

    /**
     * 確認ダイアログ
     */
    showConfirmDialog(title, message, onConfirm, onCancel = null) {
        const confirmHtml = `
            ${message}
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button class="btn" onclick="gameUI.handleConfirm(true)" style="flex: 1;">はい</button>
                <button class="modal-close" onclick="gameUI.handleConfirm(false)" style="flex: 1; background: #ccc;">いいえ</button>
            </div>
        `;
        
        this.pendingConfirm = { onConfirm, onCancel };
        this.showModal(title, confirmHtml);
    }

    /**
     * 確認ダイアログの応答処理
     */
    handleConfirm(confirmed) {
        if (this.pendingConfirm) {
            if (confirmed && this.pendingConfirm.onConfirm) {
                this.pendingConfirm.onConfirm();
            } else if (!confirmed && this.pendingConfirm.onCancel) {
                this.pendingConfirm.onCancel();
            }
            this.pendingConfirm = null;
        }
        this.closeModal();
    }

    /**
     * ゲームアクション実行（結果に基づいてUI更新）
     */
    executeGameAction(action, ...args) {
        const result = this.game[action](...args);
        
        if (result.success) {
            this.updateDisplay();
            this.updateRanking();
        } else if (result.error) {
            this.showNotification('エラー', result.error, 'error');
        }
        
        return result;
    }

    /**
     * 製品改良（UI用ラッパー）
     */
    improveProduct(productId) {
        const state = this.game.getGameState();
        const product = state.products.find(p => p.id === productId);
        if (!product) return;
        
        if (!this.game.canAfford(GAME_CONSTANTS.COSTS.PRODUCT_IMPROVEMENT)) {
            this.showNotification('改良失敗', '資金不足です（100万円必要）', 'error');
            return;
        }
        
        try {
            this.game.spendMoney(GAME_CONSTANTS.COSTS.PRODUCT_IMPROVEMENT, '製品改良');
            const wasRevived = product.improve();
            
            const message = wasRevived ? 
                `${product.name}が市場で再注目を集めています！` : 
                `${product.name}の品質が向上しました！`;
                
            this.showNotification('改良完了', message, 'success');
            this.updateDisplay();
            this.renderProducts();
        } catch (error) {
            this.showNotification('改良失敗', error.message, 'error');
        }
    }
}

// グローバル変数（互換性のため）
let gameUI;