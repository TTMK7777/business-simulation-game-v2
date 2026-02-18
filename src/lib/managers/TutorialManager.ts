// ビジネスエンパイア 2.0 - Tutorial Manager
// game.ts から抽出したチュートリアル関連ロジック
// 注: チュートリアル専用UIのためDOM操作をそのまま含む

import { getGame } from '../store/gameStore'
import { TUTORIAL_STEPS } from '../gameConfig'

// TODO: UI接続 - showModal, updateDisplay は外部から注入予定
// 現状は直接 document 操作のまま残す

// ============================================
// チュートリアル開始
// ============================================

/** チュートリアルを開始 (game.ts:1160-1164) */
export function startTutorial(): void {
    const game = getGame()
    game.tutorialStep = 0
    game.tutorialCompleted = false
    showTutorialStep()
}

// ============================================
// チュートリアルステップ表示
// ============================================

/** チュートリアルステップを表示 (game.ts:1167-1220) */
export function showTutorialStep(): void {
    const game = getGame()

    if (game.tutorialCompleted || game.tutorialStep >= TUTORIAL_STEPS.length) {
        completeTutorial()
        return
    }

    const step = TUTORIAL_STEPS[game.tutorialStep]
    const isLastStep = game.tutorialStep === TUTORIAL_STEPS.length - 1

    // チュートリアルオーバーレイを作成/更新
    let overlay = document.getElementById('tutorialOverlay')
    if (!overlay) {
        overlay = document.createElement('div')
        overlay.id = 'tutorialOverlay'
        overlay.className = 'tutorial-overlay'
        document.body.appendChild(overlay)
    }

    const buttonText = isLastStep ? '完了！' : (step.action ? 'この操作を実行して進む' : '次へ')
    const skipButton = !isLastStep ? `<button class="tutorial-skip-btn" onclick="skipTutorial()">スキップ</button>` : ''

    overlay.innerHTML = `
        <div class="tutorial-content">
            <div class="tutorial-step-indicator">
                ${TUTORIAL_STEPS.map((_, i) => `
                    <div class="tutorial-dot ${i === game.tutorialStep ? 'active' : ''} ${i < game.tutorialStep ? 'completed' : ''}"></div>
                `).join('')}
            </div>
            <div class="tutorial-emoji">${step.emoji}</div>
            <div class="tutorial-title">${step.title}</div>
            <div class="tutorial-description">${step.description}</div>
            ${step.reward ? `
                <div class="tutorial-reward">
                    🎁 報酬: ${step.reward.type === 'money' ? `${(step.reward.value / 10000).toFixed(0)}万円` : `ブランド力+${step.reward.value}`}
                </div>
            ` : ''}
            <div class="tutorial-buttons">
                ${!step.action ? `<button class="tutorial-next-btn" onclick="advanceTutorial()">${buttonText}</button>` : `
                    <div class="tutorial-hint">👆 上記の操作を実行してください</div>
                `}
                ${skipButton}
            </div>
        </div>
    `

    overlay.style.display = 'flex'

    // ターゲット要素のハイライト
    if (step.targetElement) {
        highlightElement(step.targetElement)
    } else {
        removeHighlight()
    }
}

// ============================================
// チュートリアル進行
// ============================================

/** チュートリアルを進める (game.ts:1223-1243) */
export function advanceTutorial(): void {
    const game = getGame()
    const currentStep = TUTORIAL_STEPS[game.tutorialStep]

    // 報酬を付与
    if (currentStep.reward) {
        if (currentStep.reward.type === 'money') {
            game.money += currentStep.reward.value
        } else if (currentStep.reward.type === 'brandPower') {
            game.brandPower += currentStep.reward.value
        }
        // TODO: UI接続 - updateDisplay()
    }

    game.tutorialStep++

    if (game.tutorialStep >= TUTORIAL_STEPS.length) {
        completeTutorial()
    } else {
        showTutorialStep()
    }
}

/** アクションでチュートリアルを進める (game.ts:1246-1253) */
export function advanceTutorialByAction(actionType: string): void {
    const game = getGame()
    if (game.tutorialCompleted) return

    const currentStep = TUTORIAL_STEPS[game.tutorialStep]
    if (currentStep && currentStep.action === actionType) {
        advanceTutorial()
    }
}

// ============================================
// チュートリアル完了・スキップ
// ============================================

/** チュートリアル完了 (game.ts:1256-1282) */
export function completeTutorial(): void {
    const game = getGame()
    game.tutorialCompleted = true
    removeHighlight()

    const overlay = document.getElementById('tutorialOverlay')
    if (overlay) {
        overlay.style.display = 'none'
    }

    // TODO: UI接続 - showModal で完了メッセージを表示
    // 現状は呼び出し元で showModal を使用
}

/** チュートリアルをスキップ (game.ts:1285-1293) */
export function skipTutorial(): void {
    const game = getGame()
    game.tutorialCompleted = true
    removeHighlight()

    const overlay = document.getElementById('tutorialOverlay')
    if (overlay) {
        overlay.style.display = 'none'
    }
}

// ============================================
// ハイライト制御
// ============================================

/** 要素をハイライト (game.ts:1296-1303) */
export function highlightElement(selector: string): void {
    removeHighlight()

    const element = document.querySelector(selector)
    if (element) {
        element.classList.add('tutorial-highlight')
    }
}

/** ハイライトを削除 (game.ts:1306-1310) */
export function removeHighlight(): void {
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight')
    })
}

// ============================================
// チュートリアル表示切り替え
// ============================================

/** チュートリアル表示の切り替え (game.ts:1313-1322) */
export function toggleTutorial(): void {
    const overlay = document.getElementById('tutorialOverlay')
    if (overlay) {
        if (overlay.style.display === 'none') {
            showTutorialStep()
        } else {
            overlay.style.display = 'none'
        }
    }
}
