/**
 * 経営シミュレーションゲーム - 拡張ゲームデータ
 */

// 拡張された性格システム（15種類）
const ENHANCED_PERSONALITIES = {
    // 既存の5種類（詳細化）
    honest: {
        id: 'honest',
        name: 'すなお',
        description: '素直で学習能力が高い。指導しやすいがストレス耐性が低い',
        effects: {
            learningBonus: 1.5,
            stressResistance: 0.7,
            coachability: 1.3,
            adaptability: 1.2
        },
        workPreference: 'learning',
        teamRole: 'follower'
    },
    serious: {
        id: 'serious',
        name: 'まじめ',
        description: '安定性を重視。残業も厭わないが革新性に欠ける',
        effects: {
            reliability: 1.4,
            overtimeAcceptance: 1.5,
            innovation: 0.8,
            qualityFocus: 1.2
        },
        workPreference: 'stability',
        teamRole: 'supporter'
    },
    cheerful: {
        id: 'cheerful',
        name: 'お調子者',
        description: 'チームを活性化させる。営業向きだが集中力にムラがある',
        effects: {
            teamMorale: 1.3,
            salesAbility: 1.4,
            concentration: 0.8,
            socialSkills: 1.5
        },
        workPreference: 'social',
        teamRole: 'energizer'
    },
    ambitious: {
        id: 'ambitious',
        name: '野心家',
        description: '成長志向が強い。リーダー適性があるが協調性に欠ける',
        effects: {
            growthSpeed: 1.6,
            leadershipPotential: 1.4,
            teamwork: 0.7,
            competitiveness: 1.5
        },
        workPreference: 'achievement',
        teamRole: 'leader'
    },
    cooperative: {
        id: 'cooperative',
        name: '協調的',
        description: 'チームワークを重視。調整役に最適だが決断力に欠ける',
        effects: {
            teamwork: 1.5,
            mediation: 1.4,
            decisiveness: 0.7,
            conflictResolution: 1.6
        },
        workPreference: 'harmony',
        teamRole: 'mediator'
    },

    // 新規追加の10種類
    perfectionist: {
        id: 'perfectionist',
        name: '完璧主義者',
        description: '品質にこだわる。高品質だが作業が遅く、ストレスを蓄積しやすい',
        effects: {
            qualityBonus: 1.3,
            workSpeed: 0.8,
            stressAccumulation: 1.4,
            detailOriented: 1.5
        },
        workPreference: 'quality',
        teamRole: 'quality_checker'
    },
    innovator: {
        id: 'innovator',
        name: '革新者',
        description: '新技術習得が得意。革新的だが既存システムを軽視する傾向',
        effects: {
            technologyAdoption: 1.5,
            creativity: 1.4,
            traditionRespect: 0.6,
            riskTaking: 1.3
        },
        workPreference: 'innovation',
        teamRole: 'innovator'
    },
    analyst: {
        id: 'analyst',
        name: '分析家',
        description: 'データ処理能力が高い。論理的だが直感的判断が苦手',
        effects: {
            analyticalThinking: 1.4,
            dataProcessing: 1.6,
            intuition: 0.6,
            logicalReasoning: 1.5
        },
        workPreference: 'analysis',
        teamRole: 'analyst'
    },
    communicator: {
        id: 'communicator',
        name: 'コミュニケーター',
        description: '営業・交渉が得意。人との関わりが多いが技術集中力に欠ける',
        effects: {
            negotiation: 1.35,
            customerRelations: 1.4,
            technicalFocus: 0.85,
            presentationSkills: 1.5
        },
        workPreference: 'communication',
        teamRole: 'communicator'
    },
    craftsman: {
        id: 'craftsman',
        name: '職人気質',
        description: '専門技術に長ける。技術的には優秀だが管理業務を嫌う',
        effects: {
            technicalExpertise: 1.45,
            specialization: 1.5,
            managementInterest: 0.5,
            craftmanship: 1.6
        },
        workPreference: 'technical',
        teamRole: 'specialist'
    },
    entrepreneur: {
        id: 'entrepreneur',
        name: '起業家精神',
        description: '新規事業に強い。革新的だがルーティン作業を嫌う',
        effects: {
            businessSense: 1.4,
            newBusinessDevelopment: 1.6,
            routineWork: 0.6,
            riskTolerance: 1.5
        },
        workPreference: 'business',
        teamRole: 'entrepreneur'
    },
    stable: {
        id: 'stable',
        name: '安定志向',
        description: '継続性がある。安定した成果だが変化への適応が苦手',
        effects: {
            consistency: 1.25,
            reliability: 1.3,
            changeAdaptation: 0.8,
            longTermCommitment: 1.4
        },
        workPreference: 'stability',
        teamRole: 'stabilizer'
    },
    competitive: {
        id: 'competitive',
        name: '競争心旺盛',
        description: '個人成果が高い。成果主義だがチーム協調に難がある',
        effects: {
            individualPerformance: 1.3,
            competitiveness: 1.5,
            teamCollaboration: 0.9,
            goalAchievement: 1.4
        },
        workPreference: 'competition',
        teamRole: 'performer'
    },
    cautious: {
        id: 'cautious',
        name: '慎重派',
        description: 'リスク管理が得意。安全だが意思決定が遅い',
        effects: {
            riskManagement: 1.4,
            safetyFocus: 1.5,
            decisionSpeed: 0.75,
            errorPrevention: 1.3
        },
        workPreference: 'safety',
        teamRole: 'risk_manager'
    },
    optimist: {
        id: 'optimist',
        name: '楽天家',
        description: 'ストレス耐性が高い。明るいが危機感が薄い',
        effects: {
            stressResistance: 1.5,
            positivity: 1.4,
            crisisAwareness: 0.7,
            resilience: 1.6
        },
        workPreference: 'positive',
        teamRole: 'morale_booster'
    }
};

// 階層化されたスキルシステム
const SKILL_CATEGORIES = {
    technical: {
        name: '技術力',
        subcategories: {
            development: {
                name: '開発技術',
                skills: {
                    web_development: { name: 'Web開発', demand: 'high', difficulty: 'medium' },
                    mobile_development: { name: 'モバイル開発', demand: 'high', difficulty: 'medium' },
                    backend_development: { name: 'バックエンド開発', demand: 'high', difficulty: 'high' },
                    frontend_development: { name: 'フロントエンド開発', demand: 'medium', difficulty: 'medium' },
                    game_development: { name: 'ゲーム開発', demand: 'medium', difficulty: 'high' }
                }
            },
            system_design: {
                name: 'システム設計',
                skills: {
                    architecture: { name: 'システムアーキテクチャ', demand: 'high', difficulty: 'very_high' },
                    database_design: { name: 'データベース設計', demand: 'high', difficulty: 'high' },
                    api_design: { name: 'API設計', demand: 'high', difficulty: 'medium' },
                    microservices: { name: 'マイクロサービス', demand: 'medium', difficulty: 'very_high' }
                }
            },
            emerging_tech: {
                name: '最新技術',
                skills: {
                    ai_ml: { name: 'AI・機械学習', demand: 'very_high', difficulty: 'very_high' },
                    blockchain: { name: 'ブロックチェーン', demand: 'medium', difficulty: 'high' },
                    iot: { name: 'IoT', demand: 'medium', difficulty: 'medium' },
                    ar_vr: { name: 'AR/VR', demand: 'low', difficulty: 'high' }
                }
            }
        }
    },

    business: {
        name: '営業力',
        subcategories: {
            sales: {
                name: '提案力',
                skills: {
                    solution_selling: { name: 'ソリューション営業', demand: 'high', difficulty: 'medium' },
                    technical_sales: { name: '技術営業', demand: 'high', difficulty: 'high' },
                    enterprise_sales: { name: '大企業営業', demand: 'medium', difficulty: 'high' },
                    startup_sales: { name: 'スタートアップ営業', demand: 'medium', difficulty: 'medium' }
                }
            },
            negotiation: {
                name: '交渉力',
                skills: {
                    contract_negotiation: { name: '契約交渉', demand: 'high', difficulty: 'high' },
                    price_negotiation: { name: '価格交渉', demand: 'high', difficulty: 'medium' },
                    partnership: { name: 'パートナーシップ構築', demand: 'medium', difficulty: 'high' }
                }
            },
            customer_relations: {
                name: '顧客関係構築',
                skills: {
                    account_management: { name: 'アカウント管理', demand: 'high', difficulty: 'medium' },
                    customer_success: { name: 'カスタマーサクセス', demand: 'very_high', difficulty: 'medium' },
                    support: { name: 'カスタマーサポート', demand: 'medium', difficulty: 'low' }
                }
            }
        }
    },

    planning: {
        name: '企画力',
        subcategories: {
            strategy: {
                name: '戦略立案',
                skills: {
                    business_strategy: { name: '事業戦略', demand: 'high', difficulty: 'very_high' },
                    product_strategy: { name: '製品戦略', demand: 'high', difficulty: 'high' },
                    marketing_strategy: { name: 'マーケティング戦略', demand: 'high', difficulty: 'high' }
                }
            },
            analysis: {
                name: '市場分析',
                skills: {
                    market_research: { name: '市場調査', demand: 'medium', difficulty: 'medium' },
                    competitive_analysis: { name: '競合分析', demand: 'medium', difficulty: 'medium' },
                    data_analysis: { name: 'データ分析', demand: 'very_high', difficulty: 'high' }
                }
            },
            project_management: {
                name: 'プロジェクト管理',
                skills: {
                    agile: { name: 'アジャイル開発', demand: 'very_high', difficulty: 'medium' },
                    waterfall: { name: 'ウォーターフォール', demand: 'medium', difficulty: 'low' },
                    scrum_master: { name: 'スクラムマスター', demand: 'high', difficulty: 'high' }
                }
            }
        }
    },

    management: {
        name: '管理力',
        subcategories: {
            people_management: {
                name: '人材管理',
                skills: {
                    team_leadership: { name: 'チームリーダーシップ', demand: 'high', difficulty: 'high' },
                    coaching: { name: 'コーチング', demand: 'medium', difficulty: 'high' },
                    performance_management: { name: '人事評価', demand: 'medium', difficulty: 'medium' }
                }
            },
            budget_management: {
                name: '予算管理',
                skills: {
                    financial_planning: { name: '財務計画', demand: 'medium', difficulty: 'high' },
                    cost_management: { name: 'コスト管理', demand: 'high', difficulty: 'medium' },
                    roi_analysis: { name: 'ROI分析', demand: 'medium', difficulty: 'high' }
                }
            },
            quality_management: {
                name: '品質管理',
                skills: {
                    quality_assurance: { name: '品質保証', demand: 'high', difficulty: 'medium' },
                    process_improvement: { name: 'プロセス改善', demand: 'medium', difficulty: 'high' },
                    compliance: { name: 'コンプライアンス', demand: 'medium', difficulty: 'medium' }
                }
            }
        }
    }
};

// 資格・認定システム
const CERTIFICATIONS = {
    basic_it: {
        name: '基本情報技術者',
        category: 'technical',
        cost: 50000,
        duration: 2, // ターン数
        difficulty: 'low',
        effects: {
            all_technical_skills: 5,
            salary_multiplier: 1.05,
            reputation: 5
        }
    },
    applied_it: {
        name: '応用情報技術者',
        category: 'technical',
        cost: 100000,
        duration: 4,
        difficulty: 'medium',
        prerequisite: ['basic_it'],
        effects: {
            all_technical_skills: 10,
            salary_multiplier: 1.10,
            reputation: 10
        }
    },
    project_manager: {
        name: 'プロジェクトマネージャー',
        category: 'management',
        cost: 150000,
        duration: 6,
        difficulty: 'high',
        effects: {
            project_management: 15,
            people_management: 10,
            salary_multiplier: 1.20,
            leadership_potential: 1.2
        }
    },
    aws_certified: {
        name: 'AWS認定',
        category: 'technical',
        cost: 100000,
        duration: 3,
        difficulty: 'medium',
        effects: {
            cloud_technology: 25,
            market_value: 1.15,
            salary_multiplier: 1.15
        }
    },
    google_certified: {
        name: 'Google認定',
        category: 'technical',
        cost: 120000,
        duration: 4,
        difficulty: 'high',
        effects: {
            emerging_tech: 20,
            innovation_bonus: 1.1,
            salary_multiplier: 1.12
        }
    },
    scrum_master: {
        name: 'スクラムマスター',
        category: 'management',
        cost: 80000,
        duration: 2,
        difficulty: 'medium',
        effects: {
            agile: 20,
            team_leadership: 10,
            project_success_rate: 1.15
        }
    },
    sales_certification: {
        name: '営業士',
        category: 'business',
        cost: 60000,
        duration: 3,
        difficulty: 'low',
        effects: {
            all_sales_skills: 10,
            customer_relations: 15,
            sales_performance: 1.1
        }
    }
};

/**
 * 資格取得の前提条件マップ
 * Certification prerequisite mapping
 *
 * 各資格を取得するために必要な前提資格を定義
 * キー: 資格ID, 値: 前提資格IDの配列
 */
const CERTIFICATION_PREREQUISITES = {
    basic_it: [],
    applied_it: ['basic_it'],
    project_manager: [],
    aws_certified: [],
    google_certified: [],
    scrum_master: [],
    sales_certification: []
};

/**
 * 資格難易度による成功率の基準値
 * Base success rates by certification difficulty
 */
const CERTIFICATION_DIFFICULTY_RATES = {
    low: {
        baseSuccessRate: 0.70,      // 基準成功率 70%
        monthlyProgressBase: 0.35,  // 月次進捗の基準値 35%
        stressMultiplier: 1.0,      // ストレス影響度
        motivationMultiplier: 1.2   // モチベーション影響度
    },
    medium: {
        baseSuccessRate: 0.50,
        monthlyProgressBase: 0.20,
        stressMultiplier: 1.3,
        motivationMultiplier: 1.5
    },
    high: {
        baseSuccessRate: 0.30,
        monthlyProgressBase: 0.12,
        stressMultiplier: 1.6,
        motivationMultiplier: 1.8
    }
};

// 部署システムの詳細定義
const ENHANCED_DEPARTMENTS = {
    development: {
        id: 'development',
        name: '開発部',
        description: 'システム・製品の開発を担当',
        primarySkills: ['development', 'system_design', 'emerging_tech'],
        secondarySkills: ['project_management', 'quality_management'],
        minEmployees: 3,
        optimalEmployees: { min: 8, max: 12 },
        effects: {
            product_quality: 1.3,
            development_speed: 1.2,
            innovation_rate: 1.25
        },
        managerEffects: {
            technology_selection: true,
            quality_standards: true,
            development_methodology: true
        },
        costs: {
            equipment_per_person: 500000, // PC、ソフトウェア等
            monthly_operation: 200000     // 電気代、ライセンス等
        }
    },

    sales: {
        id: 'sales',
        name: '営業部',
        description: '売上獲得と顧客関係構築を担当',
        primarySkills: ['sales', 'negotiation', 'customer_relations'],
        secondarySkills: ['strategy', 'analysis'],
        minEmployees: 2,
        optimalEmployees: { min: 5, max: 8 },
        effects: {
            revenue_bonus: 1.25,
            customer_acquisition: 1.4,
            market_share_growth: 1.3
        },
        managerEffects: {
            sales_strategy: true,
            pricing_authority: true,
            territory_management: true
        },
        costs: {
            equipment_per_person: 200000, // 営業ツール、車両等
            monthly_operation: 150000     // 交通費、接待費等
        }
    },

    planning: {
        id: 'planning',
        name: '企画部',
        description: '事業戦略と新規企画の立案を担当',
        primarySkills: ['strategy', 'analysis', 'project_management'],
        secondarySkills: ['sales', 'emerging_tech'],
        minEmployees: 2,
        optimalEmployees: { min: 4, max: 6 },
        effects: {
            new_business_success_rate: 1.4,
            market_trend_prediction: 1.5,
            strategic_planning: 1.3
        },
        managerEffects: {
            business_direction: true,
            investment_decisions: true,
            market_strategy: true
        },
        costs: {
            equipment_per_person: 300000, // 分析ツール、調査費等
            monthly_operation: 100000     // 調査費、情報購読等
        }
    },

    quality: {
        id: 'quality',
        name: '品質管理部',
        description: '製品・サービスの品質保証を担当',
        primarySkills: ['quality_management', 'system_design', 'project_management'],
        secondarySkills: ['development', 'process_improvement'],
        minEmployees: 1,
        optimalEmployees: { min: 3, max: 5 },
        effects: {
            defect_reduction: 0.5,        // 不具合50%減
            customer_satisfaction: 1.2,
            reputation_protection: 1.3
        },
        managerEffects: {
            quality_standards: true,
            testing_strategy: true,
            process_definition: true
        },
        costs: {
            equipment_per_person: 400000, // テストツール、測定機器等
            monthly_operation: 80000      // 外部監査、認証費等
        }
    },

    hr: {
        id: 'hr',
        name: '人事部',
        description: '人材採用・育成・労務管理を担当',
        primarySkills: ['people_management', 'negotiation', 'strategy'],
        secondarySkills: ['coaching', 'compliance'],
        minEmployees: 1,
        optimalEmployees: { min: 2, max: 4 },
        effects: {
            hiring_success_rate: 1.3,
            employee_satisfaction: 1.15,
            retention_rate: 1.2
        },
        managerEffects: {
            hr_policy: true,
            compensation_strategy: true,
            culture_development: true
        },
        costs: {
            equipment_per_person: 150000, // 人事システム、評価ツール等
            monthly_operation: 100000     // 求人広告、研修費等
        }
    }
};

// 業界・業態定義
const BUSINESS_SECTORS = {
    it_services: {
        id: 'it_services',
        name: 'ITサービス',
        description: 'システム開発・保守サービス',
        characteristics: {
            stability: 'high',
            growth_potential: 'medium',
            competition: 'high',
            technology_change_speed: 'medium'
        },
        required_skills: ['development', 'system_design', 'project_management'],
        revenue_model: 'project_based',
        typical_margins: { min: 0.15, max: 0.30 },
        market_size_multiplier: 1.0
    },

    web_services: {
        id: 'web_services',
        name: 'Webサービス',
        description: 'Webアプリケーション・プラットフォーム開発',
        characteristics: {
            stability: 'low',
            growth_potential: 'very_high',
            competition: 'very_high',
            technology_change_speed: 'very_high'
        },
        required_skills: ['web_development', 'frontend_development', 'marketing_strategy'],
        revenue_model: 'subscription',
        typical_margins: { min: 0.05, max: 0.60 },
        market_size_multiplier: 1.5
    },

    ai_data: {
        id: 'ai_data',
        name: 'AI・データサイエンス',
        description: 'AI技術・データ分析サービス',
        characteristics: {
            stability: 'medium',
            growth_potential: 'very_high',
            competition: 'high',
            technology_change_speed: 'very_high'
        },
        required_skills: ['ai_ml', 'data_analysis', 'system_design'],
        revenue_model: 'consulting',
        typical_margins: { min: 0.25, max: 0.50 },
        market_size_multiplier: 2.0,
        entry_cost_multiplier: 1.5
    },

    game_development: {
        id: 'game_development',
        name: 'ゲーム開発',
        description: 'デジタルゲーム・エンターテイメント',
        characteristics: {
            stability: 'very_low',
            growth_potential: 'high',
            competition: 'very_high',
            technology_change_speed: 'high'
        },
        required_skills: ['game_development', 'frontend_development', 'product_strategy'],
        revenue_model: 'hit_driven',
        typical_margins: { min: -0.20, max: 0.80 },
        market_size_multiplier: 1.2,
        volatility_multiplier: 2.0
    },

    consulting: {
        id: 'consulting',
        name: 'ITコンサルティング',
        description: '経営・IT戦略コンサルティング',
        characteristics: {
            stability: 'medium',
            growth_potential: 'medium',
            competition: 'medium',
            technology_change_speed: 'low'
        },
        required_skills: ['business_strategy', 'analysis', 'people_management'],
        revenue_model: 'hourly_billing',
        typical_margins: { min: 0.30, max: 0.60 },
        market_size_multiplier: 0.8,
        prestige_multiplier: 1.5
    },

    fintech: {
        id: 'fintech',
        name: 'FinTech',
        description: '金融テクノロジーサービス',
        characteristics: {
            stability: 'medium',
            growth_potential: 'high',
            competition: 'high',
            technology_change_speed: 'medium'
        },
        required_skills: ['backend_development', 'compliance', 'financial_planning'],
        revenue_model: 'transaction_fee',
        typical_margins: { min: 0.20, max: 0.45 },
        market_size_multiplier: 1.3,
        regulatory_complexity: 'very_high'
    }
};

// チーム相性システム
const TEAM_COMPATIBILITY = {
    leadership_combinations: {
        // リーダー + フォロワーの組み合わせ
        leader_follower: { bonus: 1.2, description: 'リーダーとフォロワーの良好な関係' },
        leader_leader: { bonus: 0.8, description: 'リーダー同士の衝突' },
        follower_follower: { bonus: 0.9, description: 'リーダーシップ不足' }
    },

    personality_synergy: {
        // 相性の良い組み合わせ
        perfectionist_analyst: { bonus: 1.15, description: '完璧主義者と分析家の品質向上' },
        innovator_entrepreneur: { bonus: 1.25, description: '革新者と起業家の新規事業' },
        communicator_cheerful: { bonus: 1.2, description: 'コミュニケーターとお調子者の営業力' },
        cautious_stable: { bonus: 1.1, description: '慎重派と安定志向の安定性' },

        // 相性の悪い組み合わせ
        perfectionist_entrepreneur: { bonus: 0.85, description: '完璧主義者と起業家の方向性の違い' },
        innovator_cautious: { bonus: 0.8, description: '革新者と慎重派のスピード感の違い' },
        competitive_cooperative: { bonus: 0.9, description: '競争心旺盛と協調的の価値観の違い' }
    },

    skill_combinations: {
        // スキルの相乗効果
        technical_business: { bonus: 1.15, description: '技術者と営業の製品理解' },
        analysis_strategy: { bonus: 1.2, description: '分析力と戦略立案の組み合わせ' },
        development_quality: { bonus: 1.1, description: '開発と品質管理の連携' }
    }
};

// 労働環境・福利厚生システム
const WORK_ENVIRONMENT = {
    office_facilities: {
        basic: {
            name: '基本設備',
            cost: 0,
            effects: { productivity: 1.0, satisfaction: 1.0 }
        },
        comfortable: {
            name: '快適オフィス',
            cost: 2000000,
            effects: { productivity: 1.1, satisfaction: 1.15, recruitment_appeal: 1.1 }
        },
        luxury: {
            name: '高級オフィス',
            cost: 5000000,
            effects: { productivity: 1.15, satisfaction: 1.25, recruitment_appeal: 1.2, reputation: 10 }
        }
    },

    welfare_programs: {
        health_insurance: {
            name: '健康保険充実',
            monthly_cost_per_employee: 5000,
            effects: { satisfaction: 1.1, sick_leave_reduction: 0.8 }
        },
        cafeteria: {
            name: '社員食堂',
            setup_cost: 3000000,
            monthly_cost: 500000,
            effects: { satisfaction: 1.15, productivity: 1.05, team_bonding: 1.1 }
        },
        gym: {
            name: '社内ジム',
            setup_cost: 1500000,
            monthly_cost: 200000,
            effects: { satisfaction: 1.1, health: 1.2, stress_reduction: 1.15 }
        },
        learning_support: {
            name: '学習支援制度',
            monthly_cost_per_employee: 10000,
            effects: { skill_growth: 1.2, motivation: 1.15, loyalty: 1.1 }
        }
    },

    work_styles: {
        traditional: {
            name: '従来型勤務',
            effects: { management_ease: 1.1, flexibility: 0.9 }
        },
        flexible: {
            name: 'フレックス制',
            effects: { satisfaction: 1.1, productivity: 1.05, work_life_balance: 1.2 }
        },
        remote_friendly: {
            name: 'リモートワーク',
            setup_cost: 1000000,
            effects: { satisfaction: 1.2, office_cost_reduction: 0.8, communication_challenge: 0.9 }
        }
    }
};

// 従業員背景ストーリー
const EMPLOYEE_BACKSTORIES = {
    tech_genius: [
        "幼少期からプログラミングに夢中。大学時代にハッカソンで優勝経験あり。",
        "元フリーランス。大手企業の案件を複数こなした実績を持つ。",
        "独学でAIを学び、個人プロジェクトでバズった経験がある。",
        "有名IT企業のインターンシップで高評価を得た逸材。",
        "学生時代に開発したアプリが10万ダウンロードを達成。"
    ],
    business_expert: [
        "MBA取得後、コンサルティングファームで5年勤務。",
        "スタートアップでCOOを務めた経験があり、組織づくりに精通。",
        "営業成績トップを3年連続で獲得した実力者。",
        "大手商社で培った交渉術を武器に活躍。",
        "新規事業立ち上げで1億円の売上を達成した実績あり。"
    ],
    creative_mind: [
        "デザインコンテストで受賞歴あり。美的センス抜群。",
        "広告代理店でクリエイティブディレクターとして活躍。",
        "UXデザインの専門家。ユーザー心理を深く理解している。",
        "アート系大学出身。独創的な発想力が強み。",
        "複数のブランディングプロジェクトを成功に導いた経験あり。"
    ],
    stable_worker: [
        "前職で10年勤務。安定性と継続力が評価されている。",
        "コツコツと積み上げる仕事スタイル。信頼性が高い。",
        "大企業での勤務経験が長く、プロセス遵守に長けている。",
        "家族を大切にし、ワークライフバランスを重視。",
        "堅実な仕事ぶりで社内表彰を複数回受賞。"
    ],
    fresh_graduate: [
        "今年大学を卒業したばかり。意欲と吸収力が武器。",
        "インターンシップ経験あり。基礎スキルは習得済み。",
        "学生時代はゼミ長を務め、リーダーシップを発揮。",
        "優秀な成績で卒業。専門知識を活かしたいと考えている。",
        "未経験だが、学習意欲が高く成長ポテンシャルあり。"
    ],
    veteran: [
        "業界歴15年以上のベテラン。豊富な経験と人脈が強み。",
        "過去に大規模プロジェクトを複数リードした実績あり。",
        "若手育成に情熱を持ち、メンター経験も豊富。",
        "技術トレンドを常にキャッチアップしている現役プレイヤー。",
        "業界内で一目置かれる存在。専門分野では第一人者。"
    ]
};

// 従業員の個性・癖
const EMPLOYEE_QUIRKS = [
    '☕ コーヒー中毒',
    '🎮 ゲーム好き',
    '📚 読書家',
    '🏃 健康志向',
    '🎵 音楽マニア',
    '🍜 ラーメン通',
    '🌙 夜型人間',
    '☀️ 朝型人間',
    '🐱 猫派',
    '🐶 犬派',
    '🎬 映画好き',
    '🎨 アート好き',
    '⚽ スポーツ好き',
    '🍺 飲み会好き',
    '🏠 インドア派',
    '🏕️ アウトドア派',
    '✈️ 旅行好き',
    '🍳 料理上手',
    '📱 最新ガジェット好き',
    '🌱 環境意識高い系'
];

// 読み取り専用にするため凍結
Object.freeze(ENHANCED_PERSONALITIES);
Object.freeze(SKILL_CATEGORIES);
Object.freeze(CERTIFICATIONS);
Object.freeze(CERTIFICATION_PREREQUISITES);
Object.freeze(CERTIFICATION_DIFFICULTY_RATES);
Object.freeze(ENHANCED_DEPARTMENTS);
Object.freeze(BUSINESS_SECTORS);
Object.freeze(TEAM_COMPATIBILITY);
Object.freeze(WORK_ENVIRONMENT);
Object.freeze(EMPLOYEE_BACKSTORIES);
Object.freeze(EMPLOYEE_QUIRKS);
