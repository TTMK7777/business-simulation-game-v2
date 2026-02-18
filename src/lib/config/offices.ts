// ビジネスエンパイア 2.0 - オフィスレベル定義
// game.ts:667-704 から抽出

import type { OfficeLevelDef } from '../types'

// オフィスレベル定義（5段階の成長システム）
export const OFFICE_LEVELS: Record<number, OfficeLevelDef> = {
    1: {
        name: 'アパートオフィス',
        emoji: '🏠',
        maxEmployees: 6,
        description: '小さなアパートの一室からスタート',
        unlockConditions: { employees: 1, money: 0, marketShare: 0 }
    },
    2: {
        name: 'シェアワーキングスペース',
        emoji: '☕',
        maxEmployees: 12,
        description: '共用オフィスで成長の兆し',
        unlockConditions: { employees: 6, money: 1500000, marketShare: 3 }
    },
    3: {
        name: '小規模オフィス',
        emoji: '🏢',
        maxEmployees: 24,
        description: '独立した小さなオフィス',
        unlockConditions: { employees: 12, money: 4000000, marketShare: 6 }
    },
    4: {
        name: '大規模オフィス',
        emoji: '🏛️',
        maxEmployees: 40,
        description: 'フロア全体を占める立派なオフィス',
        unlockConditions: { employees: 24, money: 9000000, marketShare: 12 }
    },
    5: {
        name: '自社ビル',
        emoji: '🏰',
        maxEmployees: 70,
        description: '念願の自社ビル！業界のリーダーへ',
        unlockConditions: { employees: 40, money: 18000000, marketShare: 22 }
    }
}
