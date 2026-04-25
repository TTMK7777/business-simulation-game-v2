// ビジネスエンパイア 2.0 - メインエントリーポイント
// Tauri Desktop App Version

import './styles/main.css'
import './styles/qualifications.css'
import './styles/desk.css'
import './lib/game.ts'
import { getAllSlotsMetadata, slotHasData } from './lib/storage'
import { type DifficultyLevel } from './lib/gameConfig'

// A2UI Integration - Google A2UI inspired rich UI components
import { getA2UIManager } from './lib/a2ui/index'

// Initialize A2UI Manager globally
const a2ui = getA2UIManager()
;(window as any).a2ui = a2ui

console.log('🏢 ビジネスエンパイア 2.0 - 起動中...')

// フェーズ1: 難易度選択を保持
let selectedDifficulty: DifficultyLevel = 'normal'
let selectedGameMode: 'management' | 'ceo' = 'management'

// メニュー画面HTMLテンプレート
const menuHTML = `
    <div class="menu-screen">
        <div class="menu-header">
            <div class="menu-logo">🏢</div>
            <h1 class="menu-title">ビジネスエンパイア 2.0</h1>
            <p class="menu-subtitle">IT業界で成功を目指せ！</p>
        </div>

        <div class="menu-slots-container">
            <div class="menu-slot" id="menuSlot1" data-slot="1">
                <div class="slot-empty">
                    <div class="slot-icon">💾</div>
                    <div class="slot-label">スロット 1</div>
                    <div class="slot-action">+ 新しいゲーム</div>
                </div>
            </div>

            <div class="menu-slot" id="menuSlot2" data-slot="2">
                <div class="slot-empty">
                    <div class="slot-icon">💾</div>
                    <div class="slot-label">スロット 2</div>
                    <div class="slot-action">+ 新しいゲーム</div>
                </div>
            </div>

            <div class="menu-slot" id="menuSlot3" data-slot="3">
                <div class="slot-empty">
                    <div class="slot-icon">💾</div>
                    <div class="slot-label">スロット 3</div>
                    <div class="slot-action">+ 新しいゲーム</div>
                </div>
            </div>
        </div>

        <div class="menu-footer">
            <div class="menu-version">Version 2.0.0 Phase 2</div>
        </div>
    </div>

    <!-- フェーズ1: 難易度選択モーダル -->
    <div id="difficultyModal" class="difficulty-modal" style="display: none;">
        <div class="difficulty-modal-content">
            <h2 style="text-align: center; margin-bottom: 20px; color: #667eea;">🎮 難易度を選択</h2>
            <div class="difficulty-options">
                <div class="difficulty-option" data-difficulty="easy">
                    <div class="difficulty-emoji">😊</div>
                    <div class="difficulty-name">イージー</div>
                    <div class="difficulty-desc">初心者向け。資金2倍、競合は穏やか</div>
                    <div class="difficulty-money">💰 2,000万円</div>
                </div>
                <div class="difficulty-option selected" data-difficulty="normal">
                    <div class="difficulty-emoji">💼</div>
                    <div class="difficulty-name">ノーマル</div>
                    <div class="difficulty-desc">標準的な難易度。バランスの取れた挑戦</div>
                    <div class="difficulty-money">💰 1,000万円</div>
                </div>
                <div class="difficulty-option" data-difficulty="hard">
                    <div class="difficulty-emoji">🔥</div>
                    <div class="difficulty-name">ハード</div>
                    <div class="difficulty-desc">上級者向け。資金半分、競合は攻撃的</div>
                    <div class="difficulty-money">💰 500万円</div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 24px;">
                <button id="startWithDifficultyBtn" class="start-game-btn">ゲーム開始 🚀</button>
                <button id="cancelDifficultyBtn" class="cancel-btn" style="margin-left: 12px;">キャンセル</button>
            </div>
        </div>
    </div>

    <!-- モード選択モーダル -->
    <div id="modeSelectModal" class="difficulty-modal" style="display: none;">
        <div class="difficulty-modal-content">
            <h2 style="text-align: center; margin-bottom: 20px; color: #667eea;">🎮 ゲームモードを選択</h2>
            <div class="mode-selection" style="display: flex; gap: 16px; justify-content: center;">
                <div class="difficulty-option selected" data-mode="management" id="modeManagement" style="flex:1;max-width:220px;">
                    <div class="difficulty-emoji">📋</div>
                    <div class="difficulty-name">管理モード</div>
                    <div class="difficulty-desc">従来通り全てを直接操作</div>
                </div>
                <div class="difficulty-option" data-mode="ceo" id="modeCEO" style="flex:1;max-width:220px;">
                    <div class="difficulty-emoji">🏢</div>
                    <div class="difficulty-name">社長モード</div>
                    <div class="difficulty-desc">決裁書類と部下対応で経営</div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 24px;">
                <button id="confirmModeBtn" class="start-game-btn">次へ ➡️</button>
                <button id="cancelModeBtn" class="cancel-btn" style="margin-left: 12px;">キャンセル</button>
            </div>
        </div>
    </div>
`

// ゲームHTMLテンプレートを読み込み
const gameHTML = `
    <div class="container">
        <div class="header">
            <div class="company-name">🏢 株式会社スタートアップ</div>
            <div class="date" id="gameDate">2025年1月 第1週</div>
            <div class="stats">
                <div class="stat">
                    <div class="stat-label">💰 資金</div>
                    <div class="stat-value" id="money">1000万</div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="moneyProgress" style="width: 100%"></div>
                    </div>
                </div>
                <div class="stat">
                    <div class="stat-label">👥 従業員</div>
                    <div class="stat-value" id="employeeCount">1</div>
                </div>
                <div class="stat">
                    <div class="stat-label">📊 売上</div>
                    <div class="stat-value" id="revenue">0万</div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="revenueProgress" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Phaser.js Game Canvas -->
        <div id="game-canvas" class="game-canvas-container"></div>

        <!-- ニュースティッカー -->
        <div class="news-ticker">
            <span id="newsText">📰 ゲーム開始！IT業界で成功を目指そう！</span>
        </div>

        <!-- ランキング表示 -->
        <div class="ranking-bar" id="rankingBar">
            <div class="rank-item">
                <span class="rank-medal">🥇</span>
                テックコープ<br>(35%)
            </div>
            <div class="rank-item">
                <span class="rank-medal">🥈</span>
                デジタルワークス<br>(29%)
            </div>
            <div class="rank-item">
                <span class="rank-medal">🥉</span>
                サイバーソフト<br>(22%)
            </div>
            <div class="rank-item player">
                <span class="rank-medal">4</span>
                あなた<br>(0.1%)
            </div>
        </div>

        <div class="tabs">
            <button class="tab active" data-panel="overview" onclick="showPanel(this, 'overview')">📊 概要</button>
            <button class="tab" data-panel="employees" onclick="showPanel(this, 'employees')">👥 人事</button>
            <button class="tab" data-panel="departments" onclick="showPanel(this, 'departments')">🏢 部署</button>
            <button class="tab" data-panel="products" onclick="showPanel(this, 'products')">📦 製品</button>
            <button class="tab" data-panel="market" onclick="showPanel(this, 'market')">📈 市場</button>
            <button class="tab" data-panel="finance" onclick="showPanel(this, 'finance')">💰 財務</button>
            <button class="tab" data-panel="certifications" onclick="showPanel(this, 'certifications')">🎓 資格</button>
            <button class="tab" data-panel="desk" onclick="showPanel(this, 'desk')" style="display:none;">🏢 社長室</button>
        </div>

        <div class="content">
            <div id="overview" class="panel active">
                <h3>🏢 会社概要</h3>
                <div class="info-box">
                    <div>
                        <span>業界</span>
                        <span>IT・ソフトウェア</span>
                    </div>
                    <div>
                        <span>市場シェア</span>
                        <span id="marketShare">0.1%</span>
                    </div>
                    <div>
                        <span>ブランド力</span>
                        <span id="brand">⭐</span>
                    </div>
                </div>

                <div id="officeDisplay"></div>

                <div id="achievementDisplay" class="achievement-panel"></div>

                <div class="chart-container">
                    <div class="chart-title">📈 売上推移</div>
                    <canvas id="revenueChart" height="180"></canvas>
                </div>

                <button id="endTurnBtn" class="btn" data-requires-active="true" onclick="nextTurn()">⏭️ 次のターンへ</button>
                <button class="btn" data-requires-active="true" onclick="saveGame()">💾 ゲーム保存</button>
                <button class="btn" onclick="returnToMenu()" style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); color: #333;">🏠 メニューに戻る</button>
                <button class="btn" id="restartButton" onclick="restartGame()">🔄 ゲーム再スタート</button>
            </div>

            <div id="employees" class="panel">
                <h3>👥 従業員管理</h3>
                <div id="employeeList"></div>
                <button class="btn" data-requires-active="true" onclick="showHiring()">➕ 採用活動</button>
                <button class="btn" data-requires-active="true" onclick="trainEmployees()">📚 研修実施</button>
            </div>

            <div id="products" class="panel">
                <h3>📦 製品開発</h3>
                <div id="productList"></div>
                <button class="btn" data-requires-active="true" onclick="developProduct()">🔧 新製品開発</button>
            </div>

            <div id="market" class="panel">
                <h3>🏢 市場状況</h3>
                <div class="chart-container">
                    <div class="chart-title">📊 市場シェア分布</div>
                    <canvas id="marketChart" height="200"></canvas>
                </div>
                <div id="marketInfo"></div>
                <button class="btn" data-requires-active="true" onclick="doMarketing()">📢 マーケティング</button>
            </div>

            <div id="finance" class="panel">
                <h3>💰 財務状況</h3>
                <div id="financeInfo"></div>
                <button class="btn" data-requires-active="true" onclick="getLoan()">🏦 銀行融資</button>
                <button class="btn" data-requires-active="true" onclick="repayLoan()">💸 融資返済</button>
            </div>

            <div id="departments" class="panel">
                <h3>🏢 部署管理</h3>
                <div style="margin-bottom: 20px; padding: 14px; background: rgba(102, 126, 234, 0.1); border-radius: 12px;">
                    <div style="font-size: 13px; color: #666;">
                        📊 各部署の状況を確認し、効率的な人員配置を行いましょう
                    </div>
                </div>
                <div id="departmentsGrid"></div>
            </div>

            <div id="desk" class="panel"></div>

            <div id="certifications" class="panel">
                <div id="certificationPanel">
                    <div class="certification-empty-state">
                        <div class="empty-icon">🎓</div>
                        <h3>資格取得システム</h3>
                        <p>従業員のスキルアップのために資格取得を支援しましょう。</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="modal" class="modal" onclick="if(event.target===this)closeModal()">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title" id="modalTitle"></div>
                <button class="modal-close-x" onclick="closeModal()" aria-label="閉じる">&times;</button>
            </div>
            <div class="modal-body" id="modalBody"></div>
            <div class="modal-footer">
                <button class="modal-close" onclick="closeModal()">閉じる</button>
            </div>
        </div>
    </div>
`

// メニュー画面 → ゲーム画面への遷移を管理
async function startGameWithSlot(slotNumber: number, difficulty: DifficultyLevel = 'normal') {
  console.log(`🎮 スロット ${slotNumber} でゲーム開始 (難易度: ${difficulty})`)

  const app = document.querySelector('#app')
  if (!app) {
    console.error('❌ #app要素が見つかりません')
    return
  }

  // ゲーム画面に切り替え
  app.innerHTML = gameHTML
  console.log('✅ ゲームHTML挿入完了')

  // ゲームを初期化（スロット番号と難易度を渡す）
  if (typeof (window as any).initWithSlot === 'function') {
    await (window as any).initWithSlot(slotNumber, difficulty)
    console.log(`✅ スロット ${slotNumber} でゲーム初期化完了 (難易度: ${difficulty})`)
    // Initialize animation system
    if (typeof (window as any).initAnimationSystem === 'function') {
      ;(window as any).initAnimationSystem()
      console.log('✅ Animation system initialized')
    } else {
      console.warn('⚠️ initAnimationSystem function not found')
    }
  } else {
    console.error('❌ initWithSlot関数が見つかりません')
  }
}

// ゲーム画面 → メニュー画面への遷移
async function returnToMenu() {
  console.log('🔙 メニュー画面に戻ります')

  const app = document.querySelector('#app')
  if (!app) {
    console.error('❌ #app要素が見つかりません')
    return
  }

  // チュートリアルオーバーレイは body 直下に存在するため、明示的に削除
  // （app.innerHTML 上書きでは body 直下要素は残留する）
  document.getElementById('tutorialOverlay')?.remove()

  // メニュー画面に切り替え
  app.innerHTML = menuHTML
  console.log('✅ メニューHTML挿入完了')

  // メニュー画面を初期化（メタデータを再読み込み）
  await initMenu()
}

// フェーズ1: 難易度選択モーダルを表示
let pendingSlotNumber: number | null = null

function showDifficultyModal(slotNumber: number) {
  pendingSlotNumber = slotNumber
  selectedDifficulty = 'normal'
  selectedGameMode = 'management'

  // Step 1: モード選択モーダルを表示
  const modeModal = document.getElementById('modeSelectModal')
  if (modeModal) {
    modeModal.style.display = 'flex'

    const modeOptions = modeModal.querySelectorAll('.difficulty-option[data-mode]')
    modeOptions.forEach(option => {
      option.classList.remove('selected')
      if ((option as HTMLElement).dataset.mode === 'management') {
        option.classList.add('selected')
      }
      option.addEventListener('click', () => {
        modeOptions.forEach(o => o.classList.remove('selected'))
        option.classList.add('selected')
        selectedGameMode = (option as HTMLElement).dataset.mode as 'management' | 'ceo'
      })
    })

    const confirmModeBtn = document.getElementById('confirmModeBtn')
    if (confirmModeBtn) {
      confirmModeBtn.onclick = () => {
        modeModal.style.display = 'none'
        showDifficultySelection()
      }
    }

    const cancelModeBtn = document.getElementById('cancelModeBtn')
    if (cancelModeBtn) {
      cancelModeBtn.onclick = () => {
        modeModal.style.display = 'none'
        pendingSlotNumber = null
      }
    }
  }
}

function showDifficultySelection() {
  const modal = document.getElementById('difficultyModal')
  if (modal) {
    modal.style.display = 'flex'

    const options = modal.querySelectorAll('.difficulty-option[data-difficulty]')
    options.forEach(option => {
      option.classList.remove('selected')
      if ((option as HTMLElement).dataset.difficulty === 'normal') {
        option.classList.add('selected')
      }

      option.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected'))
        option.classList.add('selected')
        selectedDifficulty = (option as HTMLElement).dataset.difficulty as DifficultyLevel
      })
    })

    const startBtn = document.getElementById('startWithDifficultyBtn')
    if (startBtn) {
      startBtn.onclick = async () => {
        modal.style.display = 'none'
        if (pendingSlotNumber !== null) {
          await startGameWithSlot(pendingSlotNumber, selectedDifficulty)
          // 社長モードの場合はCEO特性選択を表示
          if (selectedGameMode === 'ceo') {
            if (typeof (window as any).game !== 'undefined') {
              (window as any).game.gameMode = 'ceo'
              // 管理モード前提のチュートリアルを CEOモードでは抑制
              // （未来の setTimeout 起動を tutorialCompleted で弾く）
              ;(window as any).game.tutorialCompleted = true
            }
            // 既に表示中のチュートリアル overlay があれば即削除
            document.getElementById('tutorialOverlay')?.remove()

            const modalEl = document.getElementById('modal')
            if (modalEl) {
              const titleEl = document.getElementById('modalTitle')
              const bodyEl = document.getElementById('modalBody')
              if (titleEl) titleEl.textContent = '🏢 CEO特性を選択'
              if (bodyEl) {
                bodyEl.innerHTML = generateCEOTraitSelectionHTML()
              }
              modalEl.classList.add('active')
            }
          }
        }
      }
    }

    const cancelBtn = document.getElementById('cancelDifficultyBtn')
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        modal.style.display = 'none'
        pendingSlotNumber = null
      }
    }
  }
}

function generateCEOTraitSelectionHTML(): string {
  const traits = [
    { key: 'visionary', emoji: '🔮', name: '先見の明', desc: '市場の変化を敏感に察知。長期投資のヒントが見やすい' },
    { key: 'people_person', emoji: '🤝', name: '人たらし', desc: '人心掌握に長ける。訪問者対応の効果が+50%' },
    { key: 'analyst', emoji: '📊', name: '分析家', desc: '数字に強い。数値不整合の観察ポイントが追加される' },
    { key: 'charismatic', emoji: '🌟', name: 'カリスマ', desc: '圧倒的なカリスマ性。支持率の自然減衰が軽減' },
    { key: 'strict', emoji: '⚔️', name: '厳格', desc: '規律を重んじる。罠の発見率+20%、却下時のモチベ影響大' },
    { key: 'generous', emoji: '🎁', name: '寛大', desc: '部下に寛容。承認ボーナスが大きいが罠の発見が難しい' }
  ]
  return `
    <div class="ceo-trait-selection">
      <p style="text-align:center;color:#666;font-size:13px;margin-bottom:20px;">選んだ特性がゲーム全体に影響します</p>
      <div class="trait-grid">
        ${traits.map(t => `
          <div class="trait-option" onclick="selectCEOTrait('${t.key}')">
            <div class="trait-emoji">${t.emoji}</div>
            <div class="trait-name">${t.name}</div>
            <div class="trait-desc">${t.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

// メニュー画面でのスロット選択処理
async function onSlotClick(slotNumber: number) {
  // セーブデータの存在確認
  const hasData = await slotHasData(slotNumber)

  if (hasData) {
    // 既存データがある場合は直接ロード（難易度選択なし）
    await startGameWithSlot(slotNumber)
  } else {
    // 新規ゲームの場合は難易度選択モーダルを表示
    showDifficultyModal(slotNumber)
  }
}

/**
 * 日付を読みやすい形式にフォーマット
 * @param date Dateオブジェクト
 * @returns フォーマットされた日付文字列
 */
function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}`
}

// メニュー画面の初期化
async function initMenu() {
  console.log('📋 メニュー画面初期化中...')

  try {
    // 各スロットのメタデータを読み込んで表示更新
    const allMetadata = await getAllSlotsMetadata()

  for (let slotId = 1; slotId <= 3; slotId++) {
    const slotEl = document.getElementById(`menuSlot${slotId}`)
    if (!slotEl) continue

    const metadata = allMetadata[slotId]

    if (metadata) {
      // セーブデータがある場合: 詳細情報を表示（XSS対策: innerHTML → DOM操作）
      const playTimeHours = Math.floor(metadata.playTime / 3600)
      const playTimeMinutes = Math.floor((metadata.playTime % 3600) / 60)
      const playTimeStr = playTimeHours > 0
        ? `${playTimeHours}時間${playTimeMinutes}分`
        : `${playTimeMinutes}分`

      const lastSaveDate = new Date(metadata.lastSaveDate)
      const dateStr = formatDateTime(lastSaveDate)

      const brandStars = '⭐'.repeat(Math.min(metadata.brandLevel, 5))

      // XSS対策: textContentを使用してDOM要素を構築
      const slotContent = document.createElement('div')
      slotContent.className = 'slot-filled'

      // 会社名（XSSエスケープ済み）
      const companyNameDiv = document.createElement('div')
      companyNameDiv.className = 'slot-company-name'
      companyNameDiv.textContent = `🏢 ${metadata.companyName}`
      slotContent.appendChild(companyNameDiv)

      // メタデータグリッド
      const metadataDiv = document.createElement('div')
      metadataDiv.className = 'slot-metadata'

      // 各メタデータ項目を安全に追加
      const metaItems = [
        { label: 'プレイ時間', value: `⏱️ ${playTimeStr}` },
        { label: '最終保存', value: `💾 ${dateStr}` },
        { label: 'ゲーム内日付', value: `📅 ${metadata.gameDate.year}年${metadata.gameDate.month}月 第${metadata.gameDate.week}週` },
        { label: '資金', value: `💰 ${Math.floor(metadata.money / 10000)}万円` },
        { label: '従業員数', value: `👥 ${metadata.employeeCount}人` },
        { label: '市場シェア', value: `📊 ${metadata.marketShare}%` }
      ]

      metaItems.forEach(item => {
        const itemDiv = document.createElement('div')
        itemDiv.className = 'slot-meta-item'

        const labelDiv = document.createElement('div')
        labelDiv.className = 'slot-meta-label'
        labelDiv.textContent = item.label

        const valueDiv = document.createElement('div')
        valueDiv.className = 'slot-meta-value'
        valueDiv.textContent = item.value

        itemDiv.appendChild(labelDiv)
        itemDiv.appendChild(valueDiv)
        metadataDiv.appendChild(itemDiv)
      })

      slotContent.appendChild(metadataDiv)

      // ブランドレベル表示
      const brandDiv = document.createElement('div')
      brandDiv.style.textAlign = 'center'
      brandDiv.style.marginTop = '8px'
      brandDiv.style.fontSize = '18px'
      brandDiv.textContent = brandStars || '(スタート)'
      slotContent.appendChild(brandDiv)

      // 既存の内容をクリアして新しい内容を挿入
      slotEl.innerHTML = ''
      slotEl.appendChild(slotContent)
    } else {
      // セーブデータがない場合: 空スロット表示（デフォルトのまま）
      // HTMLはすでに空きスロット形式なのでそのまま
    }

    // スロットクリックイベントを設定
    slotEl.style.cursor = 'pointer'
    slotEl.addEventListener('click', () => {
      onSlotClick(slotId)
    })
  }

    console.log('✅ メニュー画面初期化完了')
  } catch (error) {
    console.error('❌ メニュー画面初期化エラー:', error)
    // エラー時もUI操作を有効化（空スロット表示）
    for (let slotId = 1; slotId <= 3; slotId++) {
      const slotEl = document.getElementById(`menuSlot${slotId}`)
      if (slotEl) {
        slotEl.style.cursor = 'pointer'
        slotEl.addEventListener('click', () => {
          onSlotClick(slotId)
        })
      }
    }
  }
}

// Window関数として公開
;(window as any).startGameWithSlot = startGameWithSlot
;(window as any).onSlotClick = onSlotClick
;(window as any).returnToMenu = returnToMenu

// DOMContentLoaded後にメニュー画面を表示
document.addEventListener('DOMContentLoaded', async () => {
  console.log('✅ DOM読み込み完了')

  const app = document.querySelector('#app')
  if (app) {
    // まずメニュー画面を表示
    app.innerHTML = menuHTML
    console.log('✅ メニューHTML挿入完了')

    // メニュー画面を初期化
    await initMenu()
  } else {
    console.error('❌ #app要素が見つかりません')
  }
})
