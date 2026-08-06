// 経営力ドリル: 「引き出し」＝解法パターンの定義
//
// 設計思想:
//   4択を潰す訓練ではなく、「この状況で頭のどの棚に手を伸ばすか」を独立した設問にする。
//   知識があっても引き出しが開かなければ解答には至らない、という失敗モードへの直接の対処。
//
// 引き出しは経営判断の型であって試験の分類ではない。
// 診断士受験生にとっては結果的に試験対策になるが、問題文は常に「自分の会社」を主語にする。

export type DrawerKey =
    | 'difference'
    | 'afterTax'
    | 'controllable'
    | 'denominator'
    | 'accrual'
    | 'discount'
    | 'formula'
    | 'classification'

export interface DrawerDef {
    key: DrawerKey
    name: string
    /** この引き出しを開けるべき状況の見分け方 */
    trigger: string
}

export const DRAWERS: Record<DrawerKey, DrawerDef> = {
    difference: {
        key: 'difference',
        name: '差額・増分で考える',
        trigger: '2つの案を比べるとき。どちらを選んでも同じ金額（埋没原価）は両方から消す'
    },
    afterTax: {
        key: 'afterTax',
        name: '税引後に直す',
        trigger: '税率が与えられたとき。費用削減は利益増＝課税対象になる'
    },
    controllable: {
        key: 'controllable',
        name: '管理可能か不能か',
        trigger: '人や部門を評価するとき。その人が動かせる数字だけで測る'
    },
    denominator: {
        key: 'denominator',
        name: '分母・掛け先の対応',
        trigger: '比率を出すとき。何と何を対応させる概念かを先に言葉で確認する'
    },
    accrual: {
        key: 'accrual',
        name: '支払⇔発生の変換',
        trigger: '現金の動きと費用の発生がずれるとき。未払・前払の増減で調整する'
    },
    discount: {
        key: 'discount',
        name: '割引の完走',
        trigger: '複数期にまたがるとき。現在価値に直すまでが1セット'
    },
    formula: {
        key: 'formula',
        name: '公式に数値代入',
        trigger: '一般論で答えたくなるとき。式を書いてから実際の数字を入れる'
    },
    classification: {
        key: 'classification',
        name: '費用・勘定の属性識別',
        trigger: '費用や勘定科目が出たとき。名前の印象ではなく「売上に連動するか」「貸借のどちら側か」で判定する'
    }
}

export const DRAWER_KEYS = Object.keys(DRAWERS) as DrawerKey[]

/** 表示名から引き出しを引く（UI 側の逆引き用） */
export function getDrawerName(key: DrawerKey): string {
    return DRAWERS[key].name
}
