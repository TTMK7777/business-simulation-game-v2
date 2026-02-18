/**
 * 30資格システム - 求職者生成ロジック
 *
 * 求職者に資格を割り当てるロジック
 * 全体で約5%が資格保有、S級は0.5%以下
 */

import { QUALIFICATIONS_30, QUALIFICATION_OVERALL_RATE, TIER_EMOJIS } from './qualifications';

// 候補者の型定義（game.tsと互換性を保つため簡易版）
interface Candidate {
    age: number;
    abilities: {
        technical: number;
        sales: number;
        planning: number;
        management: number;
    };
    personality?: string;
    qualification?: string | null;
}

/**
 * 求職者に資格を割り当てる
 */
export function selectQualificationForCandidate(candidate: Candidate): string | null {
    // 全体で5%の確率で資格を持つ
    if (Math.random() > QUALIFICATION_OVERALL_RATE) {
        return null;
    }

    const eligibleQuals: Array<{id: string, qual: any, weight: number}> = [];

    // 各資格について適格性をチェック
    for (const [id, qual] of Object.entries(QUALIFICATIONS_30)) {
        // 年齢制限
        if (qual.tier === 'S' && candidate.age < 28) continue;
        if (qual.tier === 'A' && candidate.age < 25) continue;
        if (qual.tier === 'B' && candidate.age < 23) continue;

        // 能力値制限（平均能力値）
        const avgAbility = (
            candidate.abilities.technical +
            candidate.abilities.sales +
            candidate.abilities.planning +
            candidate.abilities.management
        ) / 4;

        if (qual.tier === 'S' && avgAbility < 75) continue;
        if (qual.tier === 'A' && avgAbility < 65) continue;
        if (qual.tier === 'B' && avgAbility < 55) continue;
        if (qual.tier === 'C' && avgAbility < 45) continue;

        // 前提資格チェック（簡易版 - 実装時は要改善）
        // 現状は前提条件をスキップ

        // スポーン確率で抽選
        if (Math.random() < qual.spawnRate) {
            eligibleQuals.push({id, qual, weight: qual.spawnRate});
        }
    }

    if (eligibleQuals.length === 0) {
        return null;
    }

    // 重み付きランダム選択
    const totalWeight = eligibleQuals.reduce((sum, q) => sum + q.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of eligibleQuals) {
        random -= item.weight;
        if (random <= 0) {
            return item.id;
        }
    }

    // フォールバック
    return eligibleQuals[0].id;
}

/**
 * 資格保有者の給与を計算
 */
export function calculateCandidateSalaryWithQualification(
    candidate: Candidate,
    qualificationId: string | null
): number {
    let baseSalary = 3000000; // 基本300万円

    // 能力値補正（能力1ポイントあたり3万円）
    const avgAbility = (
        candidate.abilities.technical +
        candidate.abilities.sales +
        candidate.abilities.planning +
        candidate.abilities.management
    ) / 4;
    baseSalary += (avgAbility - 50) * 30000;

    // 資格補正
    if (qualificationId && QUALIFICATIONS_30[qualificationId]) {
        const qual = QUALIFICATIONS_30[qualificationId];
        baseSalary *= qual.salaryMultiplier;
        baseSalary = Math.max(baseSalary, qual.minSalary);
    }

    // 年齢補正（経験値: 年齢-22歳 × 5万円）
    baseSalary += (candidate.age - 22) * 50000;

    // 性格補正（野心家は給与要求高い、協調的は控えめ）
    if (candidate.personality === 'ambitious') {
        baseSalary *= 1.1;
    } else if (candidate.personality === 'cooperative') {
        baseSalary *= 0.95;
    }

    return Math.floor(baseSalary);
}

/**
 * 資格バッジのHTMLを生成
 */
export function renderQualificationBadge(qualificationId: string | null): string {
    if (!qualificationId || !QUALIFICATIONS_30[qualificationId]) {
        return '';
    }

    const qual = QUALIFICATIONS_30[qualificationId];
    const emoji = TIER_EMOJIS[qual.tier] || '📜';

    return `
        <div class="qualification-badge tier-${qual.tier}" title="${qual.description}">
            <span class="qual-emoji">${emoji}</span>
            <span class="qual-name">${qual.name}</span>
        </div>
    `;
}

/**
 * 資格ボーナスの詳細表示を生成
 */
export function renderQualificationDetails(qualificationId: string | null): string {
    if (!qualificationId || !QUALIFICATIONS_30[qualificationId]) {
        return '';
    }

    const qual = QUALIFICATIONS_30[qualificationId];

    let bonusHtml = '<div class="qualification-bonus-details">';
    bonusHtml += '<h4>📊 資格ボーナス</h4>';
    bonusHtml += '<div class="bonus-grid">';

    // 能力ボーナス
    for (const [ability, value] of Object.entries(qual.abilityBonus)) {
        bonusHtml += `
            <div class="bonus-item">
                <span class="bonus-label">${ability}:</span>
                <span class="bonus-value">+${value}</span>
            </div>
        `;
    }

    bonusHtml += '</div>';

    // 給与情報
    bonusHtml += `
        <div class="qual-salary-info">
            <div>給与倍率: <strong>×${qual.salaryMultiplier}</strong></div>
            <div>最低年収: <strong>¥${qual.minSalary.toLocaleString()}</strong></div>
        </div>
    `;

    // 説明文
    bonusHtml += `
        <p class="qual-description">${qual.description}</p>
    `;

    bonusHtml += '</div>';

    return bonusHtml;
}

/**
 * 資格Tierの色を取得
 */
export function getQualificationTierClass(tier: string): string {
    return `tier-${tier}`;
}

/**
 * 資格保有率の統計を取得（デバッグ用）
 */
export function getQualificationStats(candidates: Candidate[]): any {
    const stats = {
        total: candidates.length,
        withQualification: 0,
        byTier: {S: 0, A: 0, B: 0, C: 0, D: 0},
        byCategory: {} as Record<string, number>
    };

    for (const candidate of candidates) {
        if (candidate.qualification) {
            stats.withQualification++;
            const qual = QUALIFICATIONS_30[candidate.qualification];
            if (qual) {
                stats.byTier[qual.tier as keyof typeof stats.byTier]++;
                stats.byCategory[qual.category] = (stats.byCategory[qual.category] || 0) + 1;
            }
        }
    }

    const qualificationRate = (stats.withQualification / stats.total * 100).toFixed(2) + '%';

    return {
        ...stats,
        qualificationRate
    };
}
