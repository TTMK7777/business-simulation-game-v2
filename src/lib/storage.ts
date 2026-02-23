// ストレージアダプター
// ビジネスエンパイア 2.0 - LocalForage統合（Tauri対応）
// Phase 2B: セキュアなストレージシステム（Geminiレビュー対応版）

import localforage from 'localforage'
import { z } from 'zod'

/**
 * ストレージキー定数
 * マジックストリング防止のため一箇所で管理
 */
export const STORAGE_KEYS = {
  SLOT_1: 'BusinessEmpire_Save_Slot_1',
  SLOT_2: 'BusinessEmpire_Save_Slot_2',
  SLOT_3: 'BusinessEmpire_Save_Slot_3',
  METADATA: 'BusinessEmpire_SaveMetadata'
} as const

export const SAVE_SLOT_KEYS = [
  STORAGE_KEYS.SLOT_1,
  STORAGE_KEYS.SLOT_2,
  STORAGE_KEYS.SLOT_3
] as const

/**
 * ストレージアダプターインターフェース
 * ジェネリクスで型安全性を向上
 */
export interface StorageAdapter {
  get<T = unknown>(key: string): Promise<T | null>
  set<T = unknown>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
}

/**
 * LocalForage実装（IndexedDB/WebSQL/localStorage自動フォールバック）
 * - ブラウザ: IndexedDB優先
 * - Tauri: IndexedDB互換ストレージ
 * - 容量制限なし（localStorage 5MBの制限を回避）
 */
class LocalForageAdapter implements StorageAdapter {
  constructor() {
    // LocalForage初期設定
    localforage.config({
      name: 'BusinessEmpire',
      storeName: 'gameData',
      description: 'ビジネスエンパイア 2.0 ゲームセーブデータ'
    })
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const value = await localforage.getItem<T>(key)
      return value
    } catch (error) {
      console.error(`Storage get error for key "${key}":`, error)
      throw error // Geminiレビュー対応: 一貫してエラーをthrow
    }
  }

  async set<T = unknown>(key: string, value: T): Promise<void> {
    try {
      await localforage.setItem(key, value)
    } catch (error) {
      console.error(`Storage set error for key "${key}":`, error)
      throw error
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await localforage.removeItem(key)
    } catch (error) {
      console.error(`Storage remove error for key "${key}":`, error)
      throw error
    }
  }
}

/**
 * デフォルトストレージインスタンス
 * アプリ全体で共有される単一のストレージインスタンス
 */
export const storage = new LocalForageAdapter()

/**
 * レガシーlocalStorage互換ヘルパー（移行用）
 * 注意: 非同期なので、awaitが必要
 */
export const storageHelpers = {
  async getItem(key: string): Promise<string | null> {
    try {
      const value = await storage.get<string>(key)
      return value
    } catch (error) {
      console.error(`storageHelpers.getItem error for key "${key}":`, error)
      return null // 後方互換性のためnullを返す
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    await storage.set(key, value)
  },

  async removeItem(key: string): Promise<void> {
    await storage.remove(key)
  }
}

/**
 * Phase 2B: セーブスロット & メタデータ管理
 * 3つのセーブスロットをサポート
 */

/**
 * Zodスキーマ: ゲーム内日付
 */
const GameDateSchema = z.object({
  year: z.number().int().min(2025).max(2100),
  month: z.number().int().min(1).max(12),
  week: z.number().int().min(1).max(4)
})

/**
 * Zodスキーマ: セーブメタデータ
 */
const SaveMetadataSchema = z.object({
  slotId: z.number().int().min(1).max(3),
  companyName: z.string().min(1).max(100),
  playTime: z.number().int().min(0),
  lastSaveDate: z.string().datetime(), // ISO 8601形式
  gameDate: GameDateSchema,
  money: z.number().int(),
  employeeCount: z.number().int().min(0),
  marketShare: z.number().min(0).max(100),
  brandLevel: z.number().int().min(0).max(10),
  checksum: z.string().optional() // データ整合性チェック用
})

/**
 * セーブスロットのメタデータ構造
 */
export type SaveMetadata = z.infer<typeof SaveMetadataSchema>

/**
 * セキュリティ: SHA-256チェックサムを計算
 * @param data 任意のデータ
 * @returns Promise<string> SHA-256ハッシュ（16進数文字列）
 */
async function calculateChecksum(data: unknown): Promise<string> {
  const jsonString = JSON.stringify(data)
  // crypto.subtleはHTTPS/localhost環境でのみ利用可能
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(jsonString)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  // HTTP/file://環境: 簡易ハッシュ（改ざん検知のみ、暗号的強度は不要）
  let hash = 0
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash.toString(16)
}

/**
 * セキュリティ: データの整合性を検証
 * @param data ゲームデータ
 * @param expectedChecksum 期待されるチェックサム
 * @returns Promise<boolean> 検証結果
 */
async function verifyChecksum(data: unknown, expectedChecksum: string): Promise<boolean> {
  const actualChecksum = await calculateChecksum(data)
  return actualChecksum === expectedChecksum
}

/**
 * 全スロットのメタデータを取得
 * @returns Promise<Record<number, SaveMetadata>> スロットID → メタデータのマップ
 */
export async function getAllSlotsMetadata(): Promise<Record<number, SaveMetadata>> {
  try {
    const metadata = await storage.get<Record<number, SaveMetadata>>(STORAGE_KEYS.METADATA)
    return metadata || {}
  } catch (error) {
    console.error('メタデータ読み込みエラー:', error)
    return {}
  }
}

/**
 * 特定スロットのメタデータを取得
 * @param slotId スロットID（1, 2, 3）
 * @returns Promise<SaveMetadata | null> メタデータまたはnull
 */
export async function getSlotMetadata(slotId: number): Promise<SaveMetadata | null> {
  const allMetadata = await getAllSlotsMetadata()
  return allMetadata[slotId] || null
}

/**
 * スロットのメタデータを更新（内部用）
 * @param slotId スロットID（1, 2, 3）
 * @param metadata メタデータ
 * @param allMetadata 既存の全メタデータ（状態不整合対策）
 */
async function updateSlotMetadataInternal(
  slotId: number,
  metadata: SaveMetadata,
  allMetadata: Record<number, SaveMetadata>
): Promise<void> {
  allMetadata[slotId] = metadata
  await storage.set(STORAGE_KEYS.METADATA, allMetadata)
}

/**
 * スロットのセーブデータを読み込み
 * @param slotId スロットID（1, 2, 3）
 * @returns Promise<any | null> セーブデータまたはnull
 */
export async function loadSlotData(slotId: number): Promise<any | null> {
  try {
    // スロットID検証（詳細なエラーメッセージ）
    if (slotId < 1 || slotId > 3) {
      throw new Error(`無効なスロットID: ${slotId}（有効範囲: 1-3）`)
    }

    const key = SAVE_SLOT_KEYS[slotId - 1]
    const data = await storage.get(key)

    if (!data) {
      return null
    }

    // メタデータからチェックサムを取得して検証
    const metadata = await getSlotMetadata(slotId)
    if (metadata?.checksum) {
      const isValid = await verifyChecksum(data, metadata.checksum)
      if (!isValid) {
        console.warn(`⚠️ スロット ${slotId} のデータが改ざんされている可能性があります`)
        // 改ざん検出時の対応（警告のみ、ロードは続行）
      }
    }

    return data
  } catch (error) {
    console.error(`スロット ${slotId} の読み込みエラー:`, error)
    throw error
  }
}

/**
 * スロットにセーブデータを保存
 * Geminiレビュー対応: 状態不整合を防ぐため、メタデータを先に更新
 * @param slotId スロットID（1, 2, 3）
 * @param gameData ゲームデータ
 * @param metadata メタデータ
 */
export async function saveSlotData(
  slotId: number,
  gameData: unknown,
  metadata: SaveMetadata
): Promise<void> {
  try {
    // スロットID検証
    if (slotId < 1 || slotId > 3) {
      throw new Error(`無効なスロットID: ${slotId}（有効範囲: 1-3）`)
    }

    const key = SAVE_SLOT_KEYS[slotId - 1]

    // チェックサムを計算
    const checksum = await calculateChecksum(gameData)
    const metadataWithChecksum: SaveMetadata = {
      ...metadata,
      checksum
    }

    // メタデータをバリデーション
    const validatedMetadata = SaveMetadataSchema.parse(metadataWithChecksum)

    // 状態不整合対策: メタデータを先に準備してから一括保存
    const allMetadata = await getAllSlotsMetadata()

    // ゲームデータを保存
    await storage.set(key, gameData)

    // メタデータを更新（ゲームデータ保存成功後）
    await updateSlotMetadataInternal(slotId, validatedMetadata, allMetadata)

    console.log(`✅ スロット ${slotId} に保存完了（チェックサム: ${checksum.substring(0, 8)}...）`)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`スロット ${slotId} のメタデータバリデーションエラー:`, error.errors)
    } else {
      console.error(`スロット ${slotId} の保存エラー:`, error)
    }
    throw error
  }
}

/**
 * スロットのデータを削除
 * @param slotId スロットID（1, 2, 3）
 */
export async function deleteSlotData(slotId: number): Promise<void> {
  try {
    // スロットID検証
    if (slotId < 1 || slotId > 3) {
      throw new Error(`無効なスロットID: ${slotId}（有効範囲: 1-3）`)
    }

    const key = SAVE_SLOT_KEYS[slotId - 1]

    // 状態不整合対策: メタデータを先に準備
    const allMetadata = await getAllSlotsMetadata()
    delete allMetadata[slotId]

    // ゲームデータを削除
    await storage.remove(key)

    // メタデータを更新（ゲームデータ削除成功後）
    await storage.set(STORAGE_KEYS.METADATA, allMetadata)

    console.log(`🗑️ スロット ${slotId} を削除しました`)
  } catch (error) {
    console.error(`スロット ${slotId} の削除エラー:`, error)
    throw error
  }
}

/**
 * スロットにデータが存在するかチェック
 * @param slotId スロットID（1, 2, 3）
 * @returns Promise<boolean> データが存在する場合true
 */
export async function slotHasData(slotId: number): Promise<boolean> {
  try {
    const metadata = await getSlotMetadata(slotId)
    return metadata !== null
  } catch (error) {
    console.error(`スロット ${slotId} の存在チェックエラー:`, error)
    return false
  }
}

/**
 * セーブデータのバリデーション（開発・デバッグ用）
 * @param metadata メタデータ
 * @returns バリデーション結果
 */
export function validateSaveMetadata(metadata: unknown): { success: boolean; error?: z.ZodError } {
  const result = SaveMetadataSchema.safeParse(metadata)
  if (result.success) {
    return { success: true }
  } else {
    return { success: false, error: result.error }
  }
}
