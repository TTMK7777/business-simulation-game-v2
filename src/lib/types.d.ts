// Chart.jsは./charts.tsから正式にインポートされるため、
// グローバル宣言は不要になりました

// ============================================
// 30資格システムの型定義
// ============================================

export interface Qualification {
  id: string;
  name: string;
  category: string;
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
  difficulty: number;
  duration: number; // 月
  cost: number;
  spawnRate: number;
  passRate: number;
  salaryMultiplier: number;
  minSalary: number;
  abilityBonus: Record<string, number>;
  requirements: string[];
  effects: Record<string, number | boolean>;
  description: string;
}
