/**
 * 経営シミュレーションゲーム - 30資格システム
 *
 * 2025年の実際の市場データに基づく資格定義
 * S級（超難関）から D級（入門）まで5段階
 */

import type { Qualification } from './types/qualification';

export const QUALIFICATIONS_30: Record<string, Qualification> = {
    // ============================================
    // 🏆 S級: 超難関資格（保有率 0.3-0.8%）
    // ============================================

    lawyer: {
        id: 'lawyer',
        name: '弁護士',
        category: 'legal',
        tier: 'S',
        difficulty: 5,
        duration: 36,
        cost: 5000000,
        spawnRate: 0.005,
        passRate: 0.40,
        salaryMultiplier: 2.5,
        minSalary: 8000000,
        abilityBonus: {
            legal: 50,
            negotiation: 40,
            analysis: 30
        },
        requirements: [],
        effects: {
            legal_quality: 1.5,
            contract_sales: 1.2,
            company_trust: 1.3
        },
        description: '法律実務の最高峰。契約・訴訟対応のスペシャリスト。'
    },

    cpa: {
        id: 'cpa',
        name: '公認会計士',
        category: 'accounting',
        tier: 'S',
        difficulty: 5,
        duration: 36,
        cost: 4500000,
        spawnRate: 0.003,
        passRate: 0.09,
        salaryMultiplier: 2.3,
        minSalary: 7500000,
        abilityBonus: {
            accounting: 50,
            audit: 45,
            analysis: 40
        },
        requirements: ['boki2'],
        effects: {
            financial_quality: 1.6,
            audit_strength: 1.8,
            ipo_ready: true
        },
        description: '会計分野の最高峰。財務諸表監査・CFO候補。'
    },

    mba: {
        id: 'mba',
        name: 'MBA（海外トップ校）',
        category: 'management',
        tier: 'S',
        difficulty: 5,
        duration: 24,
        cost: 15000000,
        spawnRate: 0.004,
        passRate: 0.20,
        salaryMultiplier: 2.2,
        minSalary: 7000000,
        abilityBonus: {
            management: 50,
            strategy: 45,
            leadership: 40
        },
        requirements: ['toeic730'],
        effects: {
            strategy_quality: 1.5,
            new_business_success: 1.3,
            global_expansion: 1.5
        },
        description: '経営トップ層への最短ルート。グローバル視点を持つリーダー。'
    },

    tax_accountant: {
        id: 'tax_accountant',
        name: '税理士',
        category: 'accounting',
        tier: 'S',
        difficulty: 5,
        duration: 40,
        cost: 3500000,
        spawnRate: 0.006,
        passRate: 0.12,
        salaryMultiplier: 2.1,
        minSalary: 6500000,
        abilityBonus: {
            tax: 50,
            accounting: 45,
            consulting: 40
        },
        requirements: ['boki2'],
        effects: {
            tax_cost_reduction: 0.8,
            tax_audit_defense: 1.5,
            tax_strategy: 1.3
        },
        description: '税務のエキスパート。節税戦略と税務調査対応。'
    },

    // ============================================
    // ⭐ A級: 難関資格（保有率 1-3%）
    // ============================================

    social_insurance_labor_consultant: {
        id: 'social_insurance_labor_consultant',
        name: '社会保険労務士',
        category: 'hr',
        tier: 'A',
        difficulty: 4,
        duration: 18,
        cost: 800000,
        spawnRate: 0.015,
        passRate: 0.065,
        salaryMultiplier: 1.8,
        minSalary: 5000000,
        abilityBonus: {
            hr: 40,
            labor_law: 45,
            administration: 30
        },
        requirements: [],
        effects: {
            labor_trouble_prevention: 1.8,
            hr_optimization: 1.3,
            social_insurance_cost: 0.9
        },
        description: '労務管理のプロ。働き方改革で需要急増。'
    },

    sme_consultant: {
        id: 'sme_consultant',
        name: '中小企業診断士',
        category: 'consulting',
        tier: 'A',
        difficulty: 4,
        duration: 18,
        cost: 600000,
        spawnRate: 0.020,
        passRate: 0.055,
        salaryMultiplier: 1.75,
        minSalary: 4800000,
        abilityBonus: {
            management: 40,
            analysis: 35,
            consulting: 40
        },
        requirements: [],
        effects: {
            management_improvement: 1.4,
            subsidy_success: 1.5,
            consulting_revenue: 1.3
        },
        description: '唯一の経営コンサル国家資格。経営改善提案のプロ。'
    },

    real_estate_appraiser: {
        id: 'real_estate_appraiser',
        name: '不動産鑑定士',
        category: 'real_estate',
        tier: 'A',
        difficulty: 4,
        duration: 24,
        cost: 1200000,
        spawnRate: 0.012,
        passRate: 0.15,
        salaryMultiplier: 1.85,
        minSalary: 5200000,
        abilityBonus: {
            real_estate: 45,
            valuation: 40,
            analysis: 30
        },
        requirements: ['takken'],
        effects: {
            real_estate_investment_accuracy: 1.6,
            property_valuation: 1.5,
            real_estate_business: true
        },
        description: '不動産分野の最高峰。物件評価と投資判断のエキスパート。'
    },

    judicial_scrivener: {
        id: 'judicial_scrivener',
        name: '司法書士',
        category: 'legal',
        tier: 'A',
        difficulty: 4,
        duration: 20,
        cost: 900000,
        spawnRate: 0.018,
        passRate: 0.045,
        salaryMultiplier: 1.7,
        minSalary: 4500000,
        abilityBonus: {
            legal: 40,
            registration: 45,
            administration: 30
        },
        requirements: [],
        effects: {
            legal_cost_reduction: 0.7,
            registration_efficiency: 1.5,
            company_establishment: true
        },
        description: '登記・法的手続きのスペシャリスト。独立開業率高い。'
    },

    patent_attorney: {
        id: 'patent_attorney',
        name: '弁理士',
        category: 'ip',
        tier: 'A',
        difficulty: 4,
        duration: 22,
        cost: 1000000,
        spawnRate: 0.013,
        passRate: 0.07,
        salaryMultiplier: 1.75,
        minSalary: 4800000,
        abilityBonus: {
            ip: 45,
            patent: 50,
            technical: 30
        },
        requirements: [],
        effects: {
            patent_application: true,
            ip_strategy: 1.5,
            product_ip_protection: 1.5
        },
        description: '知財戦略のプロ。IT・製造業で高需要。'
    },

    first_class_architect: {
        id: 'first_class_architect',
        name: '一級建築士',
        category: 'architecture',
        tier: 'A',
        difficulty: 4,
        duration: 20,
        cost: 800000,
        spawnRate: 0.025,
        passRate: 0.11,
        salaryMultiplier: 1.65,
        minSalary: 4300000,
        abilityBonus: {
            architecture: 45,
            design: 40,
            project_management: 30
        },
        requirements: [],
        effects: {
            large_building_design: true,
            design_quality: 1.5,
            construction_project_success: 1.3
        },
        description: '建築業界必須資格。大規模建築物の設計が可能。'
    },

    // ============================================
    // 🌟 B級: 高難度資格（保有率 3-5%）
    // ============================================

    pmp: {
        id: 'pmp',
        name: 'PMP（プロジェクトマネージャー）',
        category: 'management',
        tier: 'B',
        difficulty: 3,
        duration: 6,
        cost: 200000,
        spawnRate: 0.035,
        passRate: 0.60,
        salaryMultiplier: 1.5,
        minSalary: 4000000,
        abilityBonus: {
            project_management: 35,
            planning: 40,
            leadership: 30
        },
        requirements: [],
        effects: {
            project_success_rate: 1.4,
            schedule_adherence: 1.3,
            large_project_management: true
        },
        description: 'グローバル標準のPM資格。大規模プロジェクト管理のプロ。'
    },

    aws_pro: {
        id: 'aws_pro',
        name: 'AWS認定ソリューションアーキテクト Professional',
        category: 'it',
        tier: 'B',
        difficulty: 4,
        duration: 8,
        cost: 300000,
        spawnRate: 0.028,
        passRate: 0.15,
        salaryMultiplier: 1.6,
        minSalary: 4500000,
        abilityBonus: {
            cloud: 45,
            architecture: 40,
            technical: 35
        },
        requirements: ['aws_associate'],
        effects: {
            cloud_cost_reduction: 0.75,
            system_availability: 1.4,
            cloud_migration: true
        },
        description: 'クラウド時代の必須スキル。インフラコスト削減のエキスパート。'
    },

    boki1: {
        id: 'boki1',
        name: '日商簿記1級',
        category: 'accounting',
        tier: 'B',
        difficulty: 4,
        duration: 12,
        cost: 150000,
        spawnRate: 0.042,
        passRate: 0.10,
        salaryMultiplier: 1.45,
        minSalary: 3800000,
        abilityBonus: {
            accounting: 35,
            analysis: 25,
            finance: 30
        },
        requirements: ['boki2'],
        effects: {
            accounting_quality: 1.35,
            financial_analysis: 1.3,
            cpa_preparation: true
        },
        description: '簿記の最高峰。公認会計士への足がかり。'
    },

    securities_analyst: {
        id: 'securities_analyst',
        name: '証券アナリスト',
        category: 'finance',
        tier: 'B',
        difficulty: 4,
        duration: 18,
        cost: 500000,
        spawnRate: 0.030,
        passRate: 0.45,
        salaryMultiplier: 1.55,
        minSalary: 4200000,
        abilityBonus: {
            finance: 40,
            analysis: 35,
            investment: 40
        },
        requirements: [],
        effects: {
            investment_accuracy: 1.5,
            portfolio_optimization: 1.4,
            financial_strategy: 1.3
        },
        description: '金融業界で高評価。投資判断と財務戦略のプロ。'
    },

    applied_it: {
        id: 'applied_it',
        name: '応用情報技術者',
        category: 'it',
        tier: 'B',
        difficulty: 3,
        duration: 6,
        cost: 100000,
        spawnRate: 0.045,
        passRate: 0.22,
        salaryMultiplier: 1.35,
        minSalary: 3500000,
        abilityBonus: {
            technical: 30,
            system_design: 25,
            architecture: 20
        },
        requirements: ['basic_it'],
        effects: {
            development_quality: 1.3,
            technical_leadership: true,
            it_strategist_preparation: true
        },
        description: 'IT技術者の登竜門。システム開発リーダー候補。'
    },

    gcp_pro: {
        id: 'gcp_pro',
        name: 'Google Cloud Professional Cloud Architect',
        category: 'it',
        tier: 'B',
        difficulty: 4,
        duration: 8,
        cost: 300000,
        spawnRate: 0.025,
        passRate: 0.20,
        salaryMultiplier: 1.55,
        minSalary: 4200000,
        abilityBonus: {
            cloud: 40,
            architecture: 35,
            technical: 35
        },
        requirements: [],
        effects: {
            multi_cloud_strategy: 1.4,
            system_scalability: 1.4,
            google_cloud_integration: true
        },
        description: 'AWS対抗の主要クラウド資格。マルチクラウド戦略に必須。'
    },

    // ============================================
    // 💫 C級: 中難度資格（保有率 5-10%）
    // ============================================

    takken: {
        id: 'takken',
        name: '宅地建物取引士',
        category: 'real_estate',
        tier: 'C',
        difficulty: 3,
        duration: 6,
        cost: 80000,
        spawnRate: 0.085,
        passRate: 0.16,
        salaryMultiplier: 1.3,
        minSalary: 3200000,
        abilityBonus: {
            real_estate: 30,
            sales: 20,
            legal: 15
        },
        requirements: [],
        effects: {
            real_estate_transaction: true,
            property_sales: 1.2,
            real_estate_knowledge: 1.3
        },
        description: '不動産業界必須資格。独占業務あり。'
    },

    fp1: {
        id: 'fp1',
        name: 'FP1級（CFP）',
        category: 'finance',
        tier: 'C',
        difficulty: 3,
        duration: 12,
        cost: 300000,
        spawnRate: 0.050,
        passRate: 0.12,
        salaryMultiplier: 1.4,
        minSalary: 3600000,
        abilityBonus: {
            finance: 30,
            consulting: 25,
            tax: 20
        },
        requirements: ['fp2'],
        effects: {
            financial_planning_quality: 1.4,
            client_satisfaction: 1.3,
            independent_fp: true
        },
        description: 'FP業務の最高峰。独立FPとして活躍可能。'
    },

    basic_it: {
        id: 'basic_it',
        name: '基本情報技術者',
        category: 'it',
        tier: 'C',
        difficulty: 2,
        duration: 3,
        cost: 50000,
        spawnRate: 0.090,
        passRate: 0.45,
        salaryMultiplier: 1.2,
        minSalary: 3000000,
        abilityBonus: {
            technical: 20,
            programming: 15,
            it_literacy: 15
        },
        requirements: [],
        effects: {
            development_participation: true,
            it_basics: 1.2,
            applied_it_preparation: true
        },
        description: 'IT系の入門資格。システム開発の基礎知識を証明。'
    },

    toeic900: {
        id: 'toeic900',
        name: 'TOEIC 900点以上',
        category: 'language',
        tier: 'C',
        difficulty: 3,
        duration: 12,
        cost: 200000,
        spawnRate: 0.060,
        passRate: 0.04,
        salaryMultiplier: 1.35,
        minSalary: 3400000,
        abilityBonus: {
            english: 40,
            negotiation: 15,
            international: 25
        },
        requirements: ['toeic730'],
        effects: {
            overseas_business: 1.4,
            foreign_client_sales: 1.3,
            global_expansion: 1.3
        },
        description: 'ビジネス英語の最高レベル。海外展開の要。'
    },

    sme_consultant_1st: {
        id: 'sme_consultant_1st',
        name: '中小企業診断士1次試験合格',
        category: 'consulting',
        tier: 'C',
        difficulty: 3,
        duration: 8,
        cost: 200000,
        spawnRate: 0.070,
        passRate: 0.35,
        salaryMultiplier: 1.25,
        minSalary: 3100000,
        abilityBonus: {
            management: 20,
            analysis: 15,
            strategy: 15
        },
        requirements: [],
        effects: {
            business_analysis: 1.2,
            management_knowledge: 1.2,
            sme_consultant_preparation: true
        },
        description: '経営コンサルの基礎。診断士2次へのステップ。'
    },

    aws_associate: {
        id: 'aws_associate',
        name: 'AWS認定ソリューションアーキテクト Associate',
        category: 'it',
        tier: 'C',
        difficulty: 2,
        duration: 3,
        cost: 100000,
        spawnRate: 0.080,
        passRate: 0.65,
        salaryMultiplier: 1.3,
        minSalary: 3300000,
        abilityBonus: {
            cloud: 20,
            infrastructure: 20,
            technical: 25
        },
        requirements: [],
        effects: {
            aws_infrastructure: true,
            cloud_migration_support: 1.2,
            infrastructure_cost_optimization: 1.1
        },
        description: 'クラウド資格の入門。AWSインフラ構築の基礎。'
    },

    it_strategist: {
        id: 'it_strategist',
        name: 'ITストラテジスト',
        category: 'it',
        tier: 'C',
        difficulty: 3,
        duration: 8,
        cost: 150000,
        spawnRate: 0.055,
        passRate: 0.15,
        salaryMultiplier: 1.35,
        minSalary: 3500000,
        abilityBonus: {
            it_strategy: 30,
            business: 25,
            planning: 25
        },
        requirements: ['applied_it'],
        effects: {
            it_strategy_quality: 1.35,
            dx_promotion: 1.4,
            system_planning: 1.3
        },
        description: 'IT経営の橋渡し役。DX推進リーダー。'
    },

    scrum_master: {
        id: 'scrum_master',
        name: 'スクラムマスター（CSM）',
        category: 'management',
        tier: 'C',
        difficulty: 2,
        duration: 2,
        cost: 150000,
        spawnRate: 0.075,
        passRate: 0.95,
        salaryMultiplier: 1.25,
        minSalary: 3100000,
        abilityBonus: {
            agile: 30,
            facilitation: 20,
            project_management: 25
        },
        requirements: [],
        effects: {
            agile_development: true,
            team_productivity: 1.25,
            project_flexibility: 1.3
        },
        description: 'アジャイル時代の必須資格。チーム生産性向上のプロ。'
    },

    // ============================================
    // ⚡ D級: 入門・実務資格（保有率 10-20%）
    // ============================================

    boki2: {
        id: 'boki2',
        name: '日商簿記2級',
        category: 'accounting',
        tier: 'D',
        difficulty: 2,
        duration: 4,
        cost: 50000,
        spawnRate: 0.180,
        passRate: 0.25,
        salaryMultiplier: 1.15,
        minSalary: 2800000,
        abilityBonus: {
            accounting: 15,
            administration: 10,
            analysis: 8
        },
        requirements: [],
        effects: {
            accounting_basics: 1.2,
            financial_statement_reading: 1.15,
            accounting_department: true
        },
        description: 'ビジネスパーソンの基本。会計業務の基礎。'
    },

    fp2: {
        id: 'fp2',
        name: 'FP2級（AFP）',
        category: 'finance',
        tier: 'D',
        difficulty: 2,
        duration: 4,
        cost: 80000,
        spawnRate: 0.150,
        passRate: 0.45,
        salaryMultiplier: 1.18,
        minSalary: 2900000,
        abilityBonus: {
            finance: 15,
            consulting: 10,
            insurance: 10
        },
        requirements: [],
        effects: {
            financial_planning_basics: 1.2,
            client_consultation: 1.15,
            financial_product_sales: 1.1
        },
        description: 'FP業務の実務レベル。資産運用アドバイスの基礎。'
    },

    it_passport: {
        id: 'it_passport',
        name: 'ITパスポート',
        category: 'it',
        tier: 'D',
        difficulty: 1,
        duration: 2,
        cost: 30000,
        spawnRate: 0.120,
        passRate: 0.55,
        salaryMultiplier: 1.10,
        minSalary: 2700000,
        abilityBonus: {
            it_literacy: 10,
            business: 8,
            dx: 8
        },
        requirements: [],
        effects: {
            it_literacy_basics: 1.1,
            dx_participation: true,
            business_efficiency: 1.05
        },
        description: 'IT系の最初の一歩。IT基礎リテラシーの証明。'
    },

    toeic730: {
        id: 'toeic730',
        name: 'TOEIC 730点以上',
        category: 'language',
        tier: 'D',
        difficulty: 2,
        duration: 6,
        cost: 100000,
        spawnRate: 0.160,
        passRate: 0.20,
        salaryMultiplier: 1.20,
        minSalary: 2900000,
        abilityBonus: {
            english: 20,
            business: 10,
            reading: 15
        },
        requirements: [],
        effects: {
            business_english_basics: 1.2,
            overseas_support: 1.15,
            email_english: true
        },
        description: 'ビジネス英語の基準点。海外案件サポート可能。'
    },

    mos_excel: {
        id: 'mos_excel',
        name: 'MOS Excel Expert',
        category: 'office',
        tier: 'D',
        difficulty: 1,
        duration: 2,
        cost: 50000,
        spawnRate: 0.140,
        passRate: 0.80,
        salaryMultiplier: 1.12,
        minSalary: 2700000,
        abilityBonus: {
            excel: 25,
            administration: 15,
            analysis: 10
        },
        requirements: [],
        effects: {
            advanced_excel: true,
            data_analysis_efficiency: 1.2,
            business_automation: 1.15
        },
        description: '事務職の必須スキル。高度なExcel操作とVBA。'
    },

    google_analytics: {
        id: 'google_analytics',
        name: 'Googleアナリティクス個人認定資格（GAIQ）',
        category: 'marketing',
        tier: 'D',
        difficulty: 1,
        duration: 1,
        cost: 30000,
        spawnRate: 0.110,
        passRate: 0.70,
        salaryMultiplier: 1.15,
        minSalary: 2800000,
        abilityBonus: {
            web_analytics: 20,
            marketing: 15,
            data: 15
        },
        requirements: [],
        effects: {
            web_analysis: true,
            marketing_measurement: 1.2,
            data_driven_decision: 1.15
        },
        description: 'Webマーケの基本。サイト分析とマーケティング施策評価。'
    },

    marketing2: {
        id: 'marketing2',
        name: 'マーケティング検定2級',
        category: 'marketing',
        tier: 'D',
        difficulty: 2,
        duration: 3,
        cost: 50000,
        spawnRate: 0.130,
        passRate: 0.60,
        salaryMultiplier: 1.18,
        minSalary: 2850000,
        abilityBonus: {
            marketing: 20,
            sales: 15,
            planning: 20
        },
        requirements: [],
        effects: {
            marketing_basics: 1.2,
            market_analysis: 1.15,
            sales_strategy_support: 1.1
        },
        description: 'マーケティング部門の基礎。市場分析と営業戦略立案。'
    }
};

// 資格の Tier 分類マップ
export const QUALIFICATION_TIERS: Record<string, string[]> = {
    'S': ['lawyer', 'cpa', 'mba', 'tax_accountant'],
    'A': ['social_insurance_labor_consultant', 'sme_consultant', 'real_estate_appraiser',
          'judicial_scrivener', 'patent_attorney', 'first_class_architect'],
    'B': ['pmp', 'aws_pro', 'boki1', 'securities_analyst', 'applied_it', 'gcp_pro'],
    'C': ['takken', 'fp1', 'basic_it', 'toeic900', 'sme_consultant_1st',
          'aws_associate', 'it_strategist', 'scrum_master'],
    'D': ['boki2', 'fp2', 'it_passport', 'toeic730', 'mos_excel', 'google_analytics', 'marketing2']
};

// Tier別の絵文字
export const TIER_EMOJIS: Record<string, string> = {
    'S': '🏆',
    'A': '⭐',
    'B': '🌟',
    'C': '💫',
    'D': '⚡'
};

// 全体で約5%が資格保有、難関ほど希少
export const QUALIFICATION_OVERALL_RATE = 0.05;

// 後方互換性のため、古い7資格IDもサポート
export const LEGACY_QUALIFICATION_MAP: Record<string, string> = {
    'basic_it': 'basic_it',
    'applied_it': 'applied_it',
    'project_manager': 'pmp',
    'aws_certified': 'aws_associate',
    'google_certified': 'gcp_pro',
    'scrum_master': 'scrum_master',
    'sales_certification': 'marketing2'
};
