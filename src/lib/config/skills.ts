// ビジネスエンパイア 2.0 - スキルツリー定義
// game.ts:438-664 から抽出

import type { SkillCategoryDef, SkillEffectDef } from '../types'

// 🌳 スキルツリーシステム定義
export const SKILL_TREE: Record<string, SkillCategoryDef> = {
    technical: {
        name: '技術スキル',
        emoji: '💻',
        color: '#667eea',
        skills: {
            tech_basic: {
                name: 'プログラミング基礎',
                description: '基本的なコーディングスキルを習得',
                cost: 1,
                effect: { technical: 5 },
                prerequisites: [],
                tier: 1,
                icon: '📝'
            },
            tech_advanced: {
                name: 'アーキテクチャ設計',
                description: 'システム全体の設計能力を獲得',
                cost: 2,
                effect: { technical: 10, planning: 3 },
                prerequisites: ['tech_basic'],
                tier: 2,
                icon: '🏗️'
            },
            tech_optimization: {
                name: 'パフォーマンス最適化',
                description: 'コードを高速化し品質を向上',
                cost: 2,
                effect: { technical: 8 },
                prerequisites: ['tech_advanced'],
                tier: 3,
                icon: '⚡',
                special: 'product_quality_bonus'
            },
            tech_ai: {
                name: 'AI・機械学習',
                description: '最新のAI技術を活用できる',
                cost: 3,
                effect: { technical: 15, planning: 5 },
                prerequisites: ['tech_advanced'],
                tier: 3,
                icon: '🤖'
            },
            tech_security: {
                name: 'セキュリティエキスパート',
                description: 'セキュリティの専門知識を獲得',
                cost: 2,
                effect: { technical: 10, management: 3 },
                prerequisites: ['tech_basic'],
                tier: 2,
                icon: '🔒'
            }
        }
    },
    sales: {
        name: '営業スキル',
        emoji: '📈',
        color: '#f093fb',
        skills: {
            sales_basic: {
                name: '顧客対応基礎',
                description: '基本的な営業スキルを習得',
                cost: 1,
                effect: { sales: 5 },
                prerequisites: [],
                tier: 1,
                icon: '🤝'
            },
            sales_negotiation: {
                name: '交渉術',
                description: '高度な交渉テクニックを獲得',
                cost: 2,
                effect: { sales: 10, management: 3 },
                prerequisites: ['sales_basic'],
                tier: 2,
                icon: '💼'
            },
            sales_presentation: {
                name: 'プレゼンテーション',
                description: '説得力のある提案ができる',
                cost: 2,
                effect: { sales: 8, planning: 4 },
                prerequisites: ['sales_basic'],
                tier: 2,
                icon: '📊'
            },
            sales_closing: {
                name: 'クロージング技術',
                description: '確実に契約を獲得できる',
                cost: 3,
                effect: { sales: 15 },
                prerequisites: ['sales_negotiation', 'sales_presentation'],
                tier: 3,
                icon: '🎯',
                special: 'revenue_bonus'
            },
            sales_account: {
                name: 'アカウント管理',
                description: '長期的な顧客関係を構築',
                cost: 2,
                effect: { sales: 10, management: 5 },
                prerequisites: ['sales_negotiation'],
                tier: 3,
                icon: '📇'
            }
        }
    },
    planning: {
        name: '企画スキル',
        emoji: '💡',
        color: '#4facfe',
        skills: {
            plan_basic: {
                name: '企画立案基礎',
                description: '基本的な企画力を習得',
                cost: 1,
                effect: { planning: 5 },
                prerequisites: [],
                tier: 1,
                icon: '✏️'
            },
            plan_market: {
                name: '市場分析',
                description: '市場動向を読み取る力を獲得',
                cost: 2,
                effect: { planning: 10, sales: 3 },
                prerequisites: ['plan_basic'],
                tier: 2,
                icon: '🔍'
            },
            plan_innovation: {
                name: 'イノベーション思考',
                description: '革新的なアイデアを生み出せる',
                cost: 3,
                effect: { planning: 15, technical: 5 },
                prerequisites: ['plan_market'],
                tier: 3,
                icon: '💫',
                special: 'product_innovation_bonus'
            },
            plan_strategy: {
                name: '戦略立案',
                description: '長期的な戦略を策定できる',
                cost: 2,
                effect: { planning: 10, management: 5 },
                prerequisites: ['plan_basic'],
                tier: 2,
                icon: '🎲'
            },
            plan_ux: {
                name: 'UX設計',
                description: 'ユーザー体験を最適化できる',
                cost: 2,
                effect: { planning: 8, technical: 4 },
                prerequisites: ['plan_basic'],
                tier: 2,
                icon: '🎨'
            }
        }
    },
    management: {
        name: '管理スキル',
        emoji: '📊',
        color: '#f857a6',
        skills: {
            mgmt_basic: {
                name: 'プロジェクト管理基礎',
                description: '基本的な管理スキルを習得',
                cost: 1,
                effect: { management: 5 },
                prerequisites: [],
                tier: 1,
                icon: '📋'
            },
            mgmt_team: {
                name: 'チームマネジメント',
                description: 'チームを効果的に管理できる',
                cost: 2,
                effect: { management: 10, sales: 3 },
                prerequisites: ['mgmt_basic'],
                tier: 2,
                icon: '👥',
                special: 'team_productivity_bonus'
            },
            mgmt_finance: {
                name: '財務管理',
                description: '予算管理と財務分析ができる',
                cost: 2,
                effect: { management: 10 },
                prerequisites: ['mgmt_basic'],
                tier: 2,
                icon: '💰',
                special: 'cost_reduction'
            },
            mgmt_leadership: {
                name: 'リーダーシップ',
                description: '組織全体を牽引できる',
                cost: 3,
                effect: { management: 15, sales: 5 },
                prerequisites: ['mgmt_team'],
                tier: 3,
                icon: '👑',
                special: 'company_bonus'
            },
            mgmt_risk: {
                name: 'リスク管理',
                description: 'リスクを予測し対処できる',
                cost: 2,
                effect: { management: 8, planning: 4 },
                prerequisites: ['mgmt_basic'],
                tier: 2,
                icon: '🛡️'
            }
        }
    }
}

// スキルの特殊効果定義
export const SKILL_EFFECTS: Record<string, SkillEffectDef> = {
    product_quality_bonus: { description: '製品品質+10%', value: 0.1 },
    revenue_bonus: { description: '売上+5%', value: 0.05 },
    product_innovation_bonus: { description: '新製品開発時間-20%', value: 0.2 },
    team_productivity_bonus: { description: 'チーム生産性+15%', value: 0.15 },
    cost_reduction: { description: '運営コスト-10%', value: 0.1 },
    company_bonus: { description: '全従業員の能力+3', value: 3 }
}
