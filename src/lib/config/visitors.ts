// 社長モード: 訪問イベントテンプレート定義
import type { VisitorTemplate } from '../types/index'

export const VISITOR_TEMPLATES: VisitorTemplate[] = [
  // === 給与交渉（consultation）===
  {
    type: 'consultation',
    titleTemplate: '${name}からの給与相談',
    descriptionTemplate: '${name}（${department}部・${position}）が給与について相談があると言っています。',
    dialogTemplates: [
      '社長、お忙しいところ申し訳ありません。',
      '実は、他社からオファーをいただいておりまして…',
      '今の待遇について、ご検討いただけないでしょうか。'
    ],
    responsesTemplate: [
      {
        text: '前向きに検討しよう。人事部と調整する。',
        tone: 'supportive',
        effects: { visitorMoraleChange: 20, ceoApprovalChange: 1, moneyChange: -100000 }
      },
      {
        text: '今は厳しいが、業績次第で考える。',
        tone: 'diplomatic',
        effects: { visitorMoraleChange: 5, ceoApprovalChange: 0 }
      },
      {
        text: '他社のオファーがあるなら、そちらに行くのも一つの選択肢だ。',
        tone: 'harsh',
        effects: { visitorMoraleChange: -20, ceoApprovalChange: -2, specialEffect: 'increase_leave_risk' }
      }
    ],
    weight: 20,
    moods: ['anxious', 'calm'],
    triggerCondition: (state) => state.employees.some((e: any) => e.motivation < 50)
  },

  // === 退職相談（consultation）===
  {
    type: 'consultation',
    titleTemplate: '${name}からの退職相談',
    descriptionTemplate: '${name}が退職を考えていると打ち明けに来ました。',
    dialogTemplates: [
      '社長、ちょっとお時間いただけますか。',
      '実は…退職を考えています。',
      'この会社にはお世話になりましたが、新しい挑戦がしたいんです。'
    ],
    responsesTemplate: [
      {
        text: '何か不満があるなら改善する。条件を聞かせてほしい。',
        tone: 'supportive',
        effects: { visitorMoraleChange: 15, ceoApprovalChange: 1, specialEffect: 'prevent_resignation' }
      },
      {
        text: '残念だが、君の決断を尊重する。引き継ぎを頼む。',
        tone: 'neutral',
        effects: { visitorMoraleChange: 0, ceoApprovalChange: 0 }
      },
      {
        text: 'プロジェクトの途中で辞めるのは無責任じゃないか？',
        tone: 'harsh',
        effects: { visitorMoraleChange: -25, ceoApprovalChange: -3, companyCultureChange: -5 }
      }
    ],
    weight: 10,
    moods: ['anxious', 'desperate'],
    triggerCondition: (state) => state.employees.some((e: any) => e.motivation < 30 && (state.turn - (e.joinedTurn || 1)) > 10)
  },

  // === 進捗報告（report）===
  {
    type: 'report',
    titleTemplate: '${name}からの業務報告',
    descriptionTemplate: '${name}が${department}部の業務状況を報告しに来ました。',
    dialogTemplates: [
      '社長、${department}部の進捗をご報告いたします。',
      '現在のプロジェクトは${status}です。',
      'チームメンバーは${condition}取り組んでいます。'
    ],
    responsesTemplate: [
      {
        text: '良い報告だ。チームによろしく伝えてくれ。',
        tone: 'supportive',
        effects: { visitorMoraleChange: 10, ceoApprovalChange: 1, companyCultureChange: 2 }
      },
      {
        text: 'もう少し具体的な数字を出してくれないか。',
        tone: 'neutral',
        effects: { visitorMoraleChange: -5, ceoApprovalChange: 0 }
      },
      {
        text: 'スピードが遅い。もっとペースを上げるように。',
        tone: 'harsh',
        effects: { visitorMoraleChange: -15, ceoApprovalChange: -1, companyCultureChange: -3 }
      }
    ],
    weight: 25,
    moods: ['calm', 'excited']
  },

  // === 新規提案（proposal）===
  {
    type: 'proposal',
    titleTemplate: '${name}からのアイデア提案',
    descriptionTemplate: '${name}が新しいビジネスアイデアを持ってきました。',
    dialogTemplates: [
      '社長、ちょっとアイデアがあるんですが聞いてもらえますか？',
      '最近の市場動向を見ていて思いついたんですが…',
      'うまくいけば、大きな利益になると思います！'
    ],
    responsesTemplate: [
      {
        text: '面白い！企画書にまとめて提出してくれ。',
        tone: 'supportive',
        effects: { visitorMoraleChange: 25, ceoApprovalChange: 2, companyCultureChange: 3 }
      },
      {
        text: 'アイデアは悪くないが、リスクもある。もう少し検討してくれ。',
        tone: 'diplomatic',
        effects: { visitorMoraleChange: 5, ceoApprovalChange: 0 }
      },
      {
        text: '今はそんな余裕はない。本業に集中してくれ。',
        tone: 'harsh',
        effects: { visitorMoraleChange: -20, ceoApprovalChange: -1, companyCultureChange: -5 }
      }
    ],
    weight: 15,
    moods: ['excited', 'calm'],
    triggerCondition: (state) => state.employees.some((e: any) => e.personalityKey === 'creative' || e.personalityKey === 'intuitive')
  },

  // === ハラスメント報告（complaint）===
  {
    type: 'complaint',
    titleTemplate: '${name}からのハラスメント報告',
    descriptionTemplate: '${name}が職場でのハラスメントについて報告に来ました。',
    dialogTemplates: [
      '社長、深刻な話なのですが…',
      '実は、${targetName}からハラスメントを受けています。',
      'このまま放置すると、他の社員にも影響が出ると思います。'
    ],
    responsesTemplate: [
      {
        text: '重大な問題だ。すぐに調査チームを立ち上げる。',
        tone: 'supportive',
        effects: { visitorMoraleChange: 20, ceoApprovalChange: 3, companyCultureChange: 5, moneyChange: -200000 }
      },
      {
        text: '双方の話を聞いてから判断する。',
        tone: 'diplomatic',
        effects: { visitorMoraleChange: 5, ceoApprovalChange: 0 }
      },
      {
        text: '当事者同士で解決してくれないか。',
        tone: 'harsh',
        effects: { visitorMoraleChange: -30, ceoApprovalChange: -5, companyCultureChange: -10, specialEffect: 'trigger_scandal' }
      }
    ],
    weight: 5,
    moods: ['anxious', 'angry']
  },

  // === 引き抜き危機（crisis）===
  {
    type: 'crisis',
    titleTemplate: '人事部からの緊急報告',
    descriptionTemplate: '競合他社による社員引き抜きの動きが検知されました。',
    dialogTemplates: [
      '社長、緊急のご報告があります。',
      '${company}が当社の${count}名に接触しているようです。',
      '特に${name}は引き抜きのリスクが高い状況です。'
    ],
    responsesTemplate: [
      {
        text: '待遇改善と引き止め面談を実施する。',
        tone: 'supportive',
        effects: { visitorMoraleChange: 10, ceoApprovalChange: 2, moneyChange: -500000, specialEffect: 'prevent_poaching' }
      },
      {
        text: '状況を注視しつつ、代替人材の確保も進めよう。',
        tone: 'diplomatic',
        effects: { visitorMoraleChange: 0, ceoApprovalChange: 0 }
      },
      {
        text: '去る者は追わず。残りたい者だけ残ればいい。',
        tone: 'harsh',
        effects: { visitorMoraleChange: -15, ceoApprovalChange: -3, companyCultureChange: -5 }
      }
    ],
    weight: 10,
    moods: ['anxious', 'desperate']
  },

  // === 内部告発（crisis）===
  {
    type: 'crisis',
    titleTemplate: '匿名の内部告発',
    descriptionTemplate: '社内の不正に関する匿名の告発がありました。',
    dialogTemplates: [
      '社長、匿名の内部通報が届きました。',
      '${department}部の経費処理に不審な点があるとのことです。',
      '早急な対応が必要です。'
    ],
    responsesTemplate: [
      {
        text: '外部監査を入れて徹底的に調べろ。',
        tone: 'supportive',
        effects: { visitorMoraleChange: 5, ceoApprovalChange: 5, moneyChange: -300000, specialEffect: 'reduce_scandal_risk' }
      },
      {
        text: '内部で静かに調査を進めよう。',
        tone: 'diplomatic',
        effects: { visitorMoraleChange: 0, ceoApprovalChange: 1, specialEffect: 'partial_reduce_scandal' }
      },
      {
        text: '匿名の告発は信用できない。保留だ。',
        tone: 'harsh',
        effects: { visitorMoraleChange: -10, ceoApprovalChange: -5, specialEffect: 'increase_scandal_risk' }
      }
    ],
    weight: 5,
    moods: ['calm', 'anxious'],
    triggerCondition: (state) => (state.scandalRisk || 0) > 60
  },

  // === キャリア相談（consultation）===
  {
    type: 'consultation',
    titleTemplate: '${name}からのキャリア相談',
    descriptionTemplate: '${name}が今後のキャリアパスについて相談に来ました。',
    dialogTemplates: [
      '社長、少しお時間よろしいでしょうか。',
      '自分の将来のキャリアについて考えているんですが…',
      'この会社で成長できる道はあるでしょうか？'
    ],
    responsesTemplate: [
      {
        text: '君の成長を全力でサポートする。具体的なプランを一緒に考えよう。',
        tone: 'supportive',
        effects: { visitorMoraleChange: 25, ceoApprovalChange: 2, companyCultureChange: 3 }
      },
      {
        text: 'まずは今の業務で結果を出してから考えよう。',
        tone: 'neutral',
        effects: { visitorMoraleChange: -5, ceoApprovalChange: 0 }
      },
      {
        text: '自分で考えるのが大事だ。もっと主体性を持ってくれ。',
        tone: 'harsh',
        effects: { visitorMoraleChange: -15, ceoApprovalChange: -1 }
      }
    ],
    weight: 10,
    moods: ['calm', 'anxious']
  }
]

// 決裁連動型の訪問テンプレート
export const VERDICT_LINKED_VISITOR_TEMPLATES: {
  triggerVerdict: 'approve' | 'reject'
  triggerCategory: string
  template: VisitorTemplate
}[] = [
  {
    triggerVerdict: 'approve',
    triggerCategory: 'cost_cut',
    template: {
      type: 'complaint',
      titleTemplate: '${name}からの抗議',
      descriptionTemplate: 'コスト削減施策の影響を受けた${name}が抗議に来ました。',
      dialogTemplates: [
        '社長、先日のコスト削減の件ですが…',
        '正直、現場は大変なことになっています。',
        'もう少し現場の声を聞いてほしいんです。'
      ],
      responsesTemplate: [
        {
          text: '申し訳ない。現場の負担を軽減する方法を考えよう。',
          tone: 'supportive',
          effects: { visitorMoraleChange: 15, ceoApprovalChange: 1, moneyChange: -100000 }
        },
        {
          text: '会社全体のために必要な判断だった。理解してほしい。',
          tone: 'diplomatic',
          effects: { visitorMoraleChange: 0, ceoApprovalChange: 0 }
        },
        {
          text: '経営判断に口出しするな。',
          tone: 'harsh',
          effects: { visitorMoraleChange: -25, ceoApprovalChange: -3, companyCultureChange: -5 }
        }
      ],
      weight: 0,
      moods: ['angry', 'anxious']
    }
  },
  {
    triggerVerdict: 'approve',
    triggerCategory: 'new_business',
    template: {
      type: 'report',
      titleTemplate: '新規事業チームからの報告',
      descriptionTemplate: '新規事業の担当チームが意気込んで中間報告に来ました。',
      dialogTemplates: [
        '社長、新規事業の件でご報告です！',
        'チーム一丸となって取り組んでいます！',
        '良い成果が出始めています。'
      ],
      responsesTemplate: [
        {
          text: '素晴らしい！このまま頑張ってくれ。',
          tone: 'supportive',
          effects: { visitorMoraleChange: 20, ceoApprovalChange: 2, companyCultureChange: 3 }
        },
        {
          text: '期待している。引き続き数字で報告してくれ。',
          tone: 'neutral',
          effects: { visitorMoraleChange: 5, ceoApprovalChange: 1 }
        }
      ],
      weight: 0,
      moods: ['excited']
    }
  },
  {
    triggerVerdict: 'approve',
    triggerCategory: 'hiring',
    template: {
      type: 'report',
      titleTemplate: '新メンバー紹介の報告',
      descriptionTemplate: '採用された新メンバーの配属が完了し、上司が報告に来ました。',
      dialogTemplates: [
        '社長、先日承認いただいた採用の件ですが…',
        '新メンバーが無事に着任しました。',
        'チームに馴染んできています。'
      ],
      responsesTemplate: [
        {
          text: '良かった。しっかり育ててやってくれ。',
          tone: 'supportive',
          effects: { visitorMoraleChange: 10, ceoApprovalChange: 1, companyCultureChange: 2 }
        },
        {
          text: '了解。成果を期待している。',
          tone: 'neutral',
          effects: { visitorMoraleChange: 5, ceoApprovalChange: 0 }
        }
      ],
      weight: 0,
      moods: ['calm', 'excited']
    }
  }
]

// 訪問者の気分→表示情報
export const MOOD_DISPLAY: Record<string, { emoji: string; label: string }> = {
  calm: { emoji: '😐', label: '冷静' },
  anxious: { emoji: '😰', label: '不安' },
  angry: { emoji: '😠', label: '怒り' },
  excited: { emoji: '😄', label: '興奮' },
  desperate: { emoji: '😱', label: '切迫' }
}
