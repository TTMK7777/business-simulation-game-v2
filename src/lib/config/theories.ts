// 経営理論図鑑 (Theory Codex) Phase A - 理論定義表
// 設計原則:「行動 → 後から理論で命名」— プレイヤーが体験した瞬間に対応する理論を
// 解禁する (todo.md Phase 7「経営理論学習レイヤー」)。先に講義しない。
// 説明は summary 3行以内 + 実例1社 + ゲーム内ヒント1行を上限とする (読ませすぎ禁止)。
// 実例は教科書レベルの公知の事実のみ記載する。

export interface TheoryCondition {
    /** 解禁条件の評価軸 (TheoryManager.checkTheoryCondition が解釈) */
    type: 'products' | 'employees' | 'marketShare' | 'brandPower' | 'turn'
        | 'money_low' | 'monthly_profit' | 'total_sales'
    value: number
}

export type TheoryCategory = 'strategy' | 'org' | 'finance' | 'marketing'

export const THEORY_CATEGORIES: Record<TheoryCategory, { name: string; emoji: string }> = {
    strategy: { name: '経営戦略', emoji: '♟️' },
    org: { name: '組織・人事', emoji: '👥' },
    finance: { name: '財務', emoji: '💴' },
    marketing: { name: 'マーケティング', emoji: '📣' },
}

export interface TheoryDef {
    id: string
    emoji: string
    name: string
    category: TheoryCategory
    /** 一言 (何についての理論か) */
    tagline: string
    /** 平易な説明 (3行以内厳守) */
    summary: string
    /** 実在企業の実例 (公知の事実の範囲) */
    example: string
    /** このゲーム内でどう活きるか (1行) */
    gameHint: string
    /** 解禁時 toast の一言 —「今あなたがやったこと」に名前を付ける */
    unlockMessage: string
    /** 未解禁時に図鑑へ表示するヒント */
    hintText: string
    condition: TheoryCondition
}

/** 図鑑の表示順 (解禁されやすい順に並べる) */
export const THEORY_LIST: TheoryDef[] = [
    {
        id: 'swot',
        emoji: '🧭',
        name: 'SWOT分析',
        category: 'strategy',
        tagline: '経営の現在地を4象限で棚卸しする',
        summary: '自社の「強み・弱み」と環境の「機会・脅威」を4象限に整理する定番フレームワーク。戦略はこの棚卸しから始まる。',
        example: 'ホンダは1960年代の北米進出で、大型バイク市場 (脅威) を避けスーパーカブ (強み) を新しい客層に売り込んで成功した。',
        gameHint: '概要タブの資金・シェア・ブランドが S/W、ニュースと競合動向が O/T にあたる。',
        unlockMessage: '経営を始めた今こそ現在地の棚卸しを。それが SWOT 分析です。',
        hintText: '経営を1ターン進めると解禁',
        condition: { type: 'turn', value: 2 },
    },
    {
        id: 'herzberg',
        emoji: '⚖️',
        name: 'ハーズバーグの二要因理論',
        category: 'org',
        tagline: '給与は「不満を防ぐ」だけで、やる気は生まない',
        summary: '給与や職場環境は不満を防ぐ「衛生要因」にすぎず、やる気を生むのは達成・承認・成長という「動機づけ要因」だとする理論。',
        example: '高給でも離職が止まらない企業がある一方、成長機会と裁量で人を惹きつける企業が存在する理由を説明する古典。',
        gameHint: '給与だけではモチベーションは維持できない。資格取得や昇進が動機づけ要因になる。',
        unlockMessage: '従業員が3人に。給与だけでは人は動かない — 二要因理論の出番です。',
        hintText: '従業員を3人にすると解禁',
        condition: { type: 'employees', value: 3 },
    },
    {
        id: 'break_even',
        emoji: '📉',
        name: '損益分岐点',
        category: 'finance',
        tagline: '売上が費用とちょうど釣り合う一線',
        summary: '売上が固定費+変動費と等しくなる点。ここを超えた売上だけが利益になる。固定費が重いほど分岐点は高くなる。',
        example: '航空会社は「搭乗率◯%が損益分岐点」と開示する。JAL 再建では機材・路線整理で分岐点自体を引き下げたことが核だった。',
        gameHint: 'あなたの分岐点はほぼ人件費の総額。月次売上がそこを超えた分が利益。',
        unlockMessage: '初黒字おめでとうございます！今超えたラインが「損益分岐点」です。',
        hintText: '月次決算を黒字にすると解禁',
        condition: { type: 'monthly_profit', value: 1 },
    },
    {
        id: 'ansoff',
        emoji: '🗺️',
        name: 'アンゾフの成長マトリクス',
        category: 'strategy',
        tagline: '成長の打ち手は「製品×市場」の4通り',
        summary: '成長戦略を既存/新規の「製品×市場」4象限で整理する。市場浸透→新製品開発→新市場開拓→多角化の順にリスクが上がる。',
        example: '富士フイルムはフィルム技術を化粧品・医薬へ多角化して生き残り、本業に留まったコダックは経営破綻した。',
        gameHint: '2つ目の製品開発は「新製品開発」の一手。リスクとリターンを意識して打つ手を選ぼう。',
        unlockMessage: '2つ目の製品を開発 — アンゾフの言う「新製品開発」戦略です。',
        hintText: '製品を2つ開発すると解禁',
        condition: { type: 'products', value: 2 },
    },
    {
        id: 'lanchester',
        emoji: '⚔️',
        name: 'ランチェスター戦略',
        category: 'strategy',
        tagline: '弱者は局地戦、強者は物量戦',
        summary: 'シェア下位の弱者は戦場を絞った一点集中、首位の強者は総合力で面を制する — 立場によって正しい戦い方が逆転するという理論。',
        example: 'スズキは軽自動車とインド市場に集中し、巨人と正面から戦わずに高収益を維持してきた。',
        gameHint: 'シェア下位のうちは製品を絞って品質集中が定石。手を広げるのはシェアを取ってから。',
        unlockMessage: 'シェア5%到達。ここからの戦い方を教えるのがランチェスター戦略です。',
        hintText: '市場シェア5%を達成すると解禁',
        condition: { type: 'marketShare', value: 5 },
    },
    {
        id: 'economies_of_scale',
        emoji: '🏭',
        name: '規模の経済',
        category: 'strategy',
        tagline: '大きくなるほど1個あたりが安くなる',
        summary: '事業規模が大きいほど固定費が分散され、1単位あたりのコストが下がる効果。価格競争力の源泉になる。',
        example: 'Amazon は巨大な物流投資を膨大な取扱量で薄め、他社が追随できない低コスト構造を作った。',
        gameHint: '従業員が増えるほど開発力は上がるが、人件費という固定費も増える。分岐点とセットで考えること。',
        unlockMessage: '従業員5人の組織に。規模の経済とその代償 (固定費) を学ぶ時です。',
        hintText: '従業員を5人にすると解禁',
        condition: { type: 'employees', value: 5 },
    },
    {
        id: 'ppm',
        emoji: '🎯',
        name: 'PPM (BCGマトリクス)',
        category: 'strategy',
        tagline: 'どの事業に金を注ぎ、どれを見切るか',
        summary: '事業を「市場成長率×相対シェア」で花形・金のなる木・問題児・負け犬に分類し、資金の配分先を決めるフレームワーク。',
        example: 'ボストン・コンサルティングが考案し GE などが実践。花王は事業ポートフォリオの入れ替え判断に活用してきた。',
        gameHint: '製品が3つを超えたら「どれに注力しどれを見切るか」— それが PPM の問いそのもの。',
        unlockMessage: '製品3つ — ポートフォリオ管理 (PPM) を考える段階に入りました。',
        hintText: '製品を3つ開発すると解禁',
        condition: { type: 'products', value: 3 },
    },
    {
        id: 'cash_flow',
        emoji: '🩸',
        name: 'キャッシュフロー経営',
        category: 'finance',
        tagline: '利益があっても現金が尽きれば倒産する',
        summary: '帳簿上の利益と手元の現金は別物。支払いに使えるのは現金だけであり、現金が尽きた瞬間に会社は倒れる (黒字倒産)。',
        example: 'トヨタは好業績でも巨額の手元流動性を維持する。リーマンショック級の危機を乗り切れたのはこの現金主義による。',
        gameHint: '資金300万円割れは危険水域。採用費 (給与3ヶ月分) が払えなくなる前に、借入も冷静な選択肢。',
        unlockMessage: '資金が危険水域に。今あなたが直面しているのがキャッシュフローの問題です。',
        hintText: '資金が300万円を下回ると解禁',
        condition: { type: 'money_low', value: 3000000 },
    },
    {
        id: 'brand_equity',
        emoji: '👑',
        name: 'ブランド・エクイティ',
        category: 'marketing',
        tagline: 'ブランドは無形の「資産」である',
        summary: '同じ品質でも「その名前」だけで選ばれ、価格プレミアムを生む力をブランド資産と捉える考え方。広告費は費用でなく資産形成。',
        example: 'コカ・コーラのブランド価値は中身の原価とは桁違いの数兆円規模と評価され続けている。',
        gameHint: 'ブランド力は売上係数に直結する。マーケティング投資は「消える費用」ではなく資産の積み上げ。',
        unlockMessage: 'ブランド力30到達。あなたが積み上げたものは「資産」— ブランド・エクイティです。',
        hintText: 'ブランド力30を達成すると解禁',
        condition: { type: 'brandPower', value: 30 },
    },
    {
        id: 'experience_curve',
        emoji: '📈',
        name: '経験曲線効果',
        category: 'strategy',
        tagline: '累積生産量が増えるほどコストは下がる',
        summary: '累積生産量が倍になるたびに単位コストが一定率下がる経験則。先に量を積んだ企業ほど価格で勝てる。',
        example: 'フォードは T型の大量生産で価格を3分の1にして市場を独占した。半導体の価格競争も同じ論理で動く。',
        gameHint: '長く売れ続けている製品ほど利益効率が良い。育てた製品を簡単に見切らないこと。',
        unlockMessage: '累計売上3,000万円。量を積んだ者が強くなる — 経験曲線効果です。',
        hintText: '全製品の累計売上3,000万円で解禁',
        condition: { type: 'total_sales', value: 30000000 },
    },
    {
        id: 'ambidexterity',
        emoji: '🤹',
        name: '両利きの経営',
        category: 'strategy',
        tagline: '「深化」と「探索」を同時にやる',
        summary: '既存事業を磨き込む「深化」と、新しい柱を探す「探索」を両立させる経営。どちらかに偏った企業は環境変化で衰退する。',
        example: 'AGC はガラス事業の深化と電子材料・ライフサイエンスの探索を両輪で回し、成熟企業から再成長した。',
        gameHint: '既存製品のマーケ (深化) と新製品開発 (探索) への資金配分バランスが、あなたの両利き度。',
        unlockMessage: '製品4つの多角経営 — 「両利きの経営」の実践者になりました。',
        hintText: '製品を4つ開発すると解禁',
        condition: { type: 'products', value: 4 },
    },
]

/** id 引き用マップ */
export const THEORIES: Record<string, TheoryDef> = Object.fromEntries(
    THEORY_LIST.map(t => [t.id, t])
)
