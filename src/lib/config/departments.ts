// ビジネスエンパイア 2.0 - 部署・役職定義
// game.ts:320-436 から抽出

import type { DepartmentDef, PositionDef } from '../types'

// 🏢 部署システム定義
export const DEPARTMENTS: Record<string, DepartmentDef> = {
    development: {
        name: '開発部',
        emoji: '💻',
        primaryAbility: 'technical',
        salaryMultiplier: 1.0,
        description: '製品の開発を担当',
        abilityWeights: {
            technical: { min: 60, max: 95 },
            sales: { min: 20, max: 60 },
            planning: { min: 40, max: 80 },
            management: { min: 30, max: 70 }
        },
        temperamentWeights: {
            creativity: 20,
            conscientiousness: 15,
            sociability: -15,
            cautiousness: 10
        }
    },
    sales: {
        name: '営業部',
        emoji: '📈',
        primaryAbility: 'sales',
        salaryMultiplier: 1.1,
        description: '製品の販売を担当',
        abilityWeights: {
            technical: { min: 20, max: 60 },
            sales: { min: 60, max: 95 },
            planning: { min: 30, max: 70 },
            management: { min: 40, max: 75 }
        },
        temperamentWeights: {
            sociability: 25,
            boldness: 15,
            bravery: 10,
            cautiousness: -15
        }
    },
    planning: {
        name: '企画部',
        emoji: '💡',
        primaryAbility: 'planning',
        salaryMultiplier: 0.95,
        description: '新製品の企画を担当',
        abilityWeights: {
            technical: { min: 40, max: 75 },
            sales: { min: 35, max: 75 },
            planning: { min: 60, max: 95 },
            management: { min: 40, max: 75 }
        },
        temperamentWeights: {
            creativity: 30,
            cooperation: 15,
            boldness: 10
        }
    },
    management: {
        name: '管理部',
        emoji: '📊',
        primaryAbility: 'management',
        salaryMultiplier: 1.05,
        description: '会社全体の管理を担当',
        abilityWeights: {
            technical: { min: 30, max: 70 },
            sales: { min: 30, max: 70 },
            planning: { min: 40, max: 75 },
            management: { min: 60, max: 95 }
        },
        temperamentWeights: {
            conscientiousness: 25,
            cautiousness: 20,
            emotionalStability: 15,
            cooperation: 10
        }
    }
}

// 👔 役職システム定義 (昇進システム)
export const POSITIONS: Record<string, PositionDef> = {
    staff: {
        name: 'スタッフ',
        emoji: '👤',
        salaryMultiplier: 1.0,
        requiredAbility: 0,
        managementBonus: 0,
        description: '一般社員'
    },
    senior: {
        name: 'シニア',
        emoji: '⭐',
        salaryMultiplier: 1.3,
        requiredAbility: 70,
        managementBonus: 0.1,
        description: '上級社員'
    },
    manager: {
        name: '課長',
        emoji: '👔',
        salaryMultiplier: 1.6,
        requiredAbility: 80,
        managementBonus: 0.2,
        canManage: 5,
        description: '課長職 (5名まで管理可能)'
    },
    director: {
        name: '部長',
        emoji: '💼',
        salaryMultiplier: 2.0,
        requiredAbility: 90,
        managementBonus: 0.3,
        canManage: 15,
        description: '部長職 (15名まで管理可能)'
    }
}
