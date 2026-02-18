// 社長モード: 決裁書類テンプレート定義
import type { DocumentTemplate, DocumentCategory, SituationModifier } from '../types/index'

// 12カテゴリの書類テンプレート
export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  // === 採用（hiring）===
  {
    category: 'hiring',
    titleTemplate: '${department}部 中途採用稟議書',
    summaryTemplate: '${department}部の人員強化のため、${position}クラスの人材を${count}名採用したい。',
    benefitTemplate: '部門の生産性${percent}%向上が見込まれる',
    risksTemplate: '採用後のミスマッチリスク、人件費増加',
    baseAmount: { min: 300000, max: 1200000 },
    baseBenefit: { min: 30, max: 80 },
    priority: 'normal',
    possibleNatures: ['clear_good', 'clear_bad', 'tradeoff'],
    possibleTraps: ['incompetent_hire', 'inflated_cost'],
    clueTemplates: [
      { field: '採用予算', observation: '採用コストが業界平均の${ratio}倍' },
      { field: '提出者実績', observation: '${name}の過去の採用成功率は${percent}%' },
      { field: '部門状況', observation: '${department}部の現在の稼働率は${percent}%' }
    ],
    triggerCategories: ['training']
  },
  {
    category: 'hiring',
    titleTemplate: '新卒採用計画書',
    summaryTemplate: '来期の新卒採用枠として${count}名の確保を提案します。',
    benefitTemplate: '長期的な人材育成と組織の若返り',
    risksTemplate: '教育コスト、戦力化まで時間がかかる',
    baseAmount: { min: 500000, max: 2000000 },
    baseBenefit: { min: 20, max: 60 },
    priority: 'normal',
    possibleNatures: ['clear_good', 'tradeoff', 'long_term'],
    possibleTraps: [null],
    clueTemplates: [
      { field: '教育体制', observation: '現在のメンター社員数は${count}名' },
      { field: '市場動向', observation: '今年の新卒市場は${condition}' }
    ]
  },

  // === 予算（budget）===
  {
    category: 'budget',
    titleTemplate: '${department}部 ${quarter}四半期予算申請',
    summaryTemplate: '${department}部の活動費として${amount}万円の予算配分を申請します。',
    benefitTemplate: '部門活動の円滑な推進',
    risksTemplate: '予算超過時の対応が困難',
    baseAmount: { min: 1000000, max: 5000000 },
    baseBenefit: { min: 40, max: 70 },
    priority: 'high',
    possibleNatures: ['clear_good', 'clear_bad', 'tradeoff'],
    possibleTraps: ['inflated_cost', 'wasteful_spending', 'embezzlement'],
    clueTemplates: [
      { field: '予算内訳', observation: '交際費が前期比${percent}%増加' },
      { field: '実績対比', observation: '前期の予算消化率は${percent}%' },
      { field: '部門業績', observation: '${department}部の目標達成率は${percent}%' }
    ]
  },
  {
    category: 'budget',
    titleTemplate: '臨時予算追加申請',
    summaryTemplate: '${reason}のため、追加予算${amount}万円を申請します。',
    benefitTemplate: '緊急対応による損害防止',
    risksTemplate: '計画外支出による財務圧迫',
    baseAmount: { min: 500000, max: 3000000 },
    baseBenefit: { min: 30, max: 60 },
    priority: 'urgent',
    possibleNatures: ['clear_good', 'clear_bad', 'gamble'],
    possibleTraps: ['inflated_cost', 'fake_data'],
    clueTemplates: [
      { field: '緊急性', observation: '申請理由の発生が${timing}' },
      { field: '金額根拠', observation: '見積もりの取得先は${count}社' }
    ]
  },

  // === 製品企画（product_plan）===
  {
    category: 'product_plan',
    titleTemplate: '新製品企画提案書「${productName}」',
    summaryTemplate: '${market}市場向けの新製品を開発します。開発期間は${months}ヶ月を想定。',
    benefitTemplate: '新規市場参入により売上${amount}万円増加見込み',
    risksTemplate: '開発失敗リスク、市場の不確実性',
    baseAmount: { min: 2000000, max: 8000000 },
    baseBenefit: { min: 50, max: 95 },
    priority: 'high',
    possibleNatures: ['clear_good', 'gamble', 'long_term', 'tradeoff'],
    possibleTraps: ['hidden_risk', 'fake_data'],
    clueTemplates: [
      { field: '市場調査', observation: '対象市場の成長率は年${percent}%' },
      { field: '競合分析', observation: '同分野の競合は${count}社が参入済み' },
      { field: '技術実現性', observation: '必要な技術の社内充足率は${percent}%' }
    ],
    triggerCategories: ['marketing', 'hiring']
  },
  {
    category: 'product_plan',
    titleTemplate: '既存製品改善計画',
    summaryTemplate: '${productName}の機能強化と品質改善を行います。',
    benefitTemplate: '顧客満足度向上とチャーンレート低減',
    risksTemplate: '開発リソースの一時的圧迫',
    baseAmount: { min: 500000, max: 3000000 },
    baseBenefit: { min: 40, max: 80 },
    priority: 'normal',
    possibleNatures: ['clear_good', 'tradeoff'],
    possibleTraps: [null],
    clueTemplates: [
      { field: '顧客要望', observation: '改善要望の件数は直近${count}件' },
      { field: '工数見積', observation: '必要な開発工数は${hours}人月' }
    ]
  },

  // === マーケティング（marketing）===
  {
    category: 'marketing',
    titleTemplate: 'マーケティングキャンペーン企画書',
    summaryTemplate: '${channel}を活用したプロモーション施策を実施します。',
    benefitTemplate: 'ブランド認知度${percent}%向上、リード獲得${count}件見込み',
    risksTemplate: '効果が不確実、コストパフォーマンスのリスク',
    baseAmount: { min: 500000, max: 4000000 },
    baseBenefit: { min: 30, max: 85 },
    priority: 'normal',
    possibleNatures: ['clear_good', 'gamble', 'tradeoff'],
    possibleTraps: ['wasteful_spending', 'inflated_cost'],
    clueTemplates: [
      { field: 'ROI予測', observation: '過去の類似施策のROIは${percent}%' },
      { field: '代理店選定', observation: '提案代理店の実績は業界${rank}位' }
    ]
  },

  // === 設備投資（equipment）===
  {
    category: 'equipment',
    titleTemplate: '${equipment}導入稟議書',
    summaryTemplate: '業務効率化のため${equipment}を導入します。',
    benefitTemplate: '作業効率${percent}%向上、${amount}万円/年のコスト削減',
    risksTemplate: '初期投資の回収に時間がかかる',
    baseAmount: { min: 1000000, max: 10000000 },
    baseBenefit: { min: 40, max: 90 },
    priority: 'normal',
    possibleNatures: ['clear_good', 'clear_bad', 'long_term', 'gamble'],
    possibleTraps: ['inflated_cost', 'hidden_risk', 'conflict_interest'],
    clueTemplates: [
      { field: '見積比較', observation: '${count}社から相見積もりを取得' },
      { field: '導入実績', observation: '同業他社での導入実績は${count}件' },
      { field: '保守費用', observation: '年間保守費用は導入費の${percent}%' }
    ]
  },
  {
    category: 'equipment',
    titleTemplate: 'オフィス環境改善提案',
    summaryTemplate: '従業員の作業環境を改善するための設備更新を提案します。',
    benefitTemplate: '従業員満足度向上、離職率低減',
    risksTemplate: '投資対効果の定量化が困難',
    baseAmount: { min: 300000, max: 2000000 },
    baseBenefit: { min: 30, max: 60 },
    priority: 'low',
    possibleNatures: ['clear_good', 'tradeoff'],
    possibleTraps: ['wasteful_spending'],
    clueTemplates: [
      { field: '従業員調査', observation: '環境改善要望は${percent}%の社員が回答' }
    ]
  },

  // === 人事異動（personnel_change）===
  {
    category: 'personnel_change',
    titleTemplate: '人事異動提案書',
    summaryTemplate: '${name}を${fromDept}部から${toDept}部へ異動させることを提案します。',
    benefitTemplate: '適材適所の実現と組織活性化',
    risksTemplate: '本人の意向、異動先でのパフォーマンス不確定',
    baseAmount: { min: 0, max: 100000 },
    baseBenefit: { min: 20, max: 70 },
    priority: 'normal',
    possibleNatures: ['clear_good', 'tradeoff', 'clear_bad'],
    possibleTraps: ['conflict_interest'],
    clueTemplates: [
      { field: '本人意向', observation: '${name}の異動希望は${status}' },
      { field: '適性評価', observation: '異動先業務への適性スコアは${score}/100' }
    ]
  },

  // === 昇進（promotion）===
  {
    category: 'promotion',
    titleTemplate: '${name} 昇進推薦書',
    summaryTemplate: '${name}を${fromPosition}から${toPosition}へ昇進させることを推薦します。',
    benefitTemplate: '組織のモチベーション向上と人材定着',
    risksTemplate: '給与増加、期待に応えられないリスク',
    baseAmount: { min: 50000, max: 200000 },
    baseBenefit: { min: 40, max: 80 },
    priority: 'normal',
    possibleNatures: ['clear_good', 'tradeoff', 'clear_bad'],
    possibleTraps: ['incompetent_hire', 'conflict_interest'],
    clueTemplates: [
      { field: '実績', observation: '${name}の直近${months}ヶ月の評価は${grade}' },
      { field: '部下からの評価', observation: 'チームメンバーの信頼度は${percent}%' }
    ]
  },

  // === 研修（training）===
  {
    category: 'training',
    titleTemplate: '${trainingName}研修実施計画',
    summaryTemplate: '${department}部の社員${count}名を対象に研修を実施します。',
    benefitTemplate: 'スキルアップによる生産性${percent}%向上',
    risksTemplate: '研修期間中の業務停滞',
    baseAmount: { min: 200000, max: 1500000 },
    baseBenefit: { min: 30, max: 75 },
    priority: 'low',
    possibleNatures: ['clear_good', 'tradeoff', 'long_term'],
    possibleTraps: ['wasteful_spending', 'inflated_cost'],
    clueTemplates: [
      { field: '研修費', observation: '受講料が業界平均の${ratio}倍' },
      { field: '研修実績', observation: '過去の同種研修の効果測定結果は${result}' }
    ]
  },

  // === 給与改定（salary_raise）===
  {
    category: 'salary_raise',
    titleTemplate: '${name} 給与改定申請',
    summaryTemplate: '${name}の給与を${percent}%引き上げることを申請します。',
    benefitTemplate: '離職防止と従業員満足度向上',
    risksTemplate: '人件費増加、他社員との公平性',
    baseAmount: { min: 30000, max: 150000 },
    baseBenefit: { min: 30, max: 70 },
    priority: 'normal',
    possibleNatures: ['clear_good', 'tradeoff'],
    possibleTraps: [null],
    clueTemplates: [
      { field: '市場相場', observation: '同職種の市場給与は月額${amount}万円' },
      { field: '離職リスク', observation: '${name}の現在の離職リスクは${level}' }
    ]
  },

  // === 新規事業（new_business）===
  {
    category: 'new_business',
    titleTemplate: '新規事業提案「${businessName}」',
    summaryTemplate: '${market}分野への新規参入を提案します。',
    benefitTemplate: '${years}年後に年商${amount}万円規模の事業に成長見込み',
    risksTemplate: '初期投資の回収リスク、市場の不確実性が高い',
    baseAmount: { min: 3000000, max: 15000000 },
    baseBenefit: { min: 60, max: 100 },
    priority: 'high',
    possibleNatures: ['gamble', 'long_term', 'tradeoff'],
    possibleTraps: ['hidden_risk', 'fake_data'],
    clueTemplates: [
      { field: '市場規模', observation: '対象市場の規模は${amount}億円' },
      { field: '参入障壁', observation: '参入障壁は${level}と評価' },
      { field: '提案者の経験', observation: '${name}の該当分野での経験は${years}年' }
    ],
    triggerCategories: ['hiring', 'equipment', 'marketing']
  },
  {
    category: 'new_business',
    titleTemplate: '海外展開計画書',
    summaryTemplate: '${country}市場への進出を計画しています。',
    benefitTemplate: '新市場開拓による売上拡大',
    risksTemplate: '法規制、文化の違い、為替リスク',
    baseAmount: { min: 5000000, max: 20000000 },
    baseBenefit: { min: 50, max: 95 },
    priority: 'high',
    possibleNatures: ['gamble', 'long_term'],
    possibleTraps: ['hidden_risk'],
    clueTemplates: [
      { field: '現地調査', observation: '現地パートナーの信頼度は${level}' },
      { field: '法規制', observation: '進出に必要な許認可は${count}件' }
    ]
  },

  // === コスト削減（cost_cut）===
  {
    category: 'cost_cut',
    titleTemplate: 'コスト削減提案書',
    summaryTemplate: '${area}のコストを${percent}%削減する施策を提案します。',
    benefitTemplate: '年間${amount}万円のコスト削減',
    risksTemplate: '品質低下、従業員のモチベーション低下',
    baseAmount: { min: 0, max: 500000 },
    baseBenefit: { min: 30, max: 80 },
    priority: 'normal',
    possibleNatures: ['clear_good', 'tradeoff', 'clear_bad'],
    possibleTraps: ['hidden_risk'],
    clueTemplates: [
      { field: '影響範囲', observation: '削減対象は${count}名に影響' },
      { field: '代替案', observation: '代替策の検討は${status}' }
    ],
    triggerVisitorTypes: ['complaint']
  },
  {
    category: 'cost_cut',
    titleTemplate: '外注費見直し提案',
    summaryTemplate: '外注先の見直しにより年間${amount}万円の削減を目指します。',
    benefitTemplate: 'コスト効率の改善',
    risksTemplate: '外注先との関係悪化、品質リスク',
    baseAmount: { min: 0, max: 300000 },
    baseBenefit: { min: 25, max: 65 },
    priority: 'low',
    possibleNatures: ['clear_good', 'tradeoff'],
    possibleTraps: [null],
    clueTemplates: [
      { field: '現行コスト', observation: '現在の外注費は月額${amount}万円' }
    ]
  },

  // === 提携（partnership）===
  {
    category: 'partnership',
    titleTemplate: '${company}との業務提携提案',
    summaryTemplate: '${company}との${type}提携により、相互の強みを活かした事業展開を行います。',
    benefitTemplate: '技術力強化とシナジー効果',
    risksTemplate: '提携先への依存リスク、機密情報の管理',
    baseAmount: { min: 1000000, max: 5000000 },
    baseBenefit: { min: 50, max: 90 },
    priority: 'high',
    possibleNatures: ['clear_good', 'gamble', 'tradeoff'],
    possibleTraps: ['conflict_interest', 'hidden_risk'],
    clueTemplates: [
      { field: '提携先評価', observation: '${company}の業界評判は${level}' },
      { field: '契約条件', observation: '利益配分は当社${percent}:先方${otherPercent}' },
      { field: '提携実績', observation: '${company}の過去の提携実績は${count}件' }
    ],
    triggerCategories: ['product_plan', 'new_business']
  }
]

// 状況修飾子: 経営状況に応じて書類の内容を変化させる
export const SITUATION_MODIFIERS: SituationModifier[] = [
  {
    condition: (state) => state.money < 3000000,
    label: '資金不足',
    amountMultiplier: 0.7,
    benefitMultiplier: 1.2,
    extraClue: { field: '財務状況', observation: '会社の資金繰りが厳しい状況' }
  },
  {
    condition: (state) => state.money > 30000000,
    label: '余裕あり',
    amountMultiplier: 1.3,
    benefitMultiplier: 0.9,
    extraClue: { field: '財務状況', observation: '潤沢な資金がある状況' }
  },
  {
    condition: (state) => state.employees.length < 5,
    label: '少人数',
    amountMultiplier: 0.8,
    benefitMultiplier: 1.1,
    extraClue: { field: '組織規模', observation: '少人数体制での運営' }
  },
  {
    condition: (state) => state.employees.length > 20,
    label: '大規模組織',
    amountMultiplier: 1.5,
    benefitMultiplier: 1.0,
    extraClue: { field: '組織規模', observation: '大規模組織での管理コスト増大' }
  },
  {
    condition: (state) => state.marketShare > 20,
    label: '高シェア',
    amountMultiplier: 1.2,
    benefitMultiplier: 0.8
  },
  {
    condition: (state) => state.products.length === 0,
    label: '製品なし',
    amountMultiplier: 0.9,
    benefitMultiplier: 1.3,
    extraClue: { field: '事業状況', observation: '自社製品がまだ存在しない' }
  }
]

// カテゴリ→日本語名マッピング
export const CATEGORY_NAMES: Record<string, string> = {
  hiring: '採用',
  budget: '予算',
  product_plan: '製品企画',
  marketing: 'マーケティング',
  equipment: '設備投資',
  personnel_change: '人事異動',
  promotion: '昇進',
  training: '研修',
  salary_raise: '給与改定',
  new_business: '新規事業',
  cost_cut: 'コスト削減',
  partnership: '提携'
}

// 書類優先度→表示情報
export const PRIORITY_DISPLAY = {
  urgent: { emoji: '🔴', label: '緊急', color: '#e74c3c' },
  high: { emoji: '🟠', label: '高', color: '#e67e22' },
  normal: { emoji: '🟡', label: '通常', color: '#f1c40f' },
  low: { emoji: '🟢', label: '低', color: '#2ecc71' }
}

// 罠の日本語名
export const TRAP_NAMES: Record<string, string> = {
  inflated_cost: '水増し請求',
  embezzlement: '横領',
  incompetent_hire: '不適格人材',
  wasteful_spending: '無駄遣い',
  hidden_risk: '隠れたリスク',
  conflict_interest: '利益相反',
  fake_data: 'データ偽装'
}

// 因果チェーン定義: 承認/却下時に後続イベントを発生させる
export interface CausalChain {
  triggerCategory: DocumentCategory
  triggerVerdict: 'approve' | 'reject'
  resultCategory?: DocumentCategory
  resultVisitorType?: string
  delayTurns: number
  probability: number
  description: string
}

export const CAUSAL_CHAINS: CausalChain[] = [
  { triggerCategory: 'hiring', triggerVerdict: 'approve', resultCategory: 'training', delayTurns: 3, probability: 0.6, description: '新入社員研修計画が提出される' },
  { triggerCategory: 'cost_cut', triggerVerdict: 'approve', resultVisitorType: 'complaint', delayTurns: 2, probability: 0.5, description: '削減対象社員からの苦情' },
  { triggerCategory: 'new_business', triggerVerdict: 'approve', resultCategory: 'hiring', delayTurns: 2, probability: 0.7, description: '新規事業のための人材採用が必要に' },
  { triggerCategory: 'new_business', triggerVerdict: 'approve', resultCategory: 'equipment', delayTurns: 3, probability: 0.5, description: '新規事業用の設備投資が必要に' },
  { triggerCategory: 'product_plan', triggerVerdict: 'approve', resultCategory: 'marketing', delayTurns: 4, probability: 0.8, description: '新製品のマーケティング計画が必要に' },
  { triggerCategory: 'equipment', triggerVerdict: 'approve', resultCategory: 'training', delayTurns: 2, probability: 0.4, description: '新設備の操作研修が必要に' },
  { triggerCategory: 'salary_raise', triggerVerdict: 'reject', resultVisitorType: 'complaint', delayTurns: 1, probability: 0.7, description: '給与改定を却下された社員が不満を訴えに来る' },
  { triggerCategory: 'promotion', triggerVerdict: 'reject', resultVisitorType: 'consultation', delayTurns: 1, probability: 0.5, description: '昇進が見送られた社員がキャリア相談に来る' },
  { triggerCategory: 'partnership', triggerVerdict: 'approve', resultCategory: 'product_plan', delayTurns: 3, probability: 0.6, description: '提携先との共同製品企画が立ち上がる' }
]
