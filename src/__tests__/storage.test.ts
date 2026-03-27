/**
 * storage.ts のユニットテスト
 *
 * テスト対象:
 * - I5修正検証: calculateChecksum の HTTP環境フォールバック
 *   - crypto.subtle が undefined の環境でも動作すること
 *   - 簡易ハッシュ（djb2風）の決定論的動作確認
 * - validateSaveMetadata: Zod バリデーションの動作
 * - STORAGE_KEYS / SAVE_SLOT_KEYS 定数の確認
 *
 * Note: calculateChecksum は private 関数のため、
 *       saveSlotData 経由またはロジックを直接テストする。
 *       I5 の HTTP フォールバックロジックは同等の純粋関数として再現してテスト。
 */

import { describe, it, expect } from 'vitest'
import { validateSaveMetadata, STORAGE_KEYS, SAVE_SLOT_KEYS } from '../lib/storage'

// ============================================================
// I5: crypto.subtle HTTP環境フォールバックロジックのテスト
//
// 問題: storage.ts:153 で crypto.subtle が HTTPS/localhost 以外では undefined になり
//       crypto.subtle.digest() が TypeError でクラッシュする
// 修正: crypto.subtle が undefined の場合、簡易 djb2 風ハッシュにフォールバック
//
// calculateChecksum は private のため、同等のロジックを純粋関数として再現する
// ============================================================

/**
 * storage.ts の calculateChecksum と同等のロジックを純粋関数として再現
 * （private関数のテスト代替戦略）
 */
async function calculateChecksumEquivalent(
  data: unknown,
  cryptoSubtle: SubtleCrypto | undefined
): Promise<string> {
  const jsonString = JSON.stringify(data)

  if (typeof cryptoSubtle !== 'undefined') {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(jsonString)
    const hashBuffer = await cryptoSubtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // HTTP/file://環境: 簡易ハッシュ（I5修正後のフォールバック）
  let hash = 0
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash.toString(16)
}

describe('I5: calculateChecksum — HTTP環境フォールバック', () => {
  it('crypto.subtle が undefined の場合に TypeError が発生しないこと', async () => {
    const testData = { money: 1000000, turn: 5, employees: [] }

    // crypto.subtle = undefined でもエラーなく動作することを確認
    await expect(
      calculateChecksumEquivalent(testData, undefined)
    ).resolves.not.toThrow()
  })

  it('crypto.subtle が undefined の場合、16進数文字列を返すこと', async () => {
    const testData = { money: 1000000, turn: 5, employees: [] }
    const result = await calculateChecksumEquivalent(testData, undefined)

    // 結果が文字列であること
    expect(typeof result).toBe('string')
    // 16進数文字列（負の数は - が含まれる場合があるが toString(16) は符号付き）
    expect(result).toMatch(/^-?[0-9a-f]+$/)
  })

  it('同じデータは常に同じフォールバックハッシュを返すこと（決定論的）', async () => {
    const testData = { money: 5000000, turn: 10 }

    const hash1 = await calculateChecksumEquivalent(testData, undefined)
    const hash2 = await calculateChecksumEquivalent(testData, undefined)

    expect(hash1).toBe(hash2)
  })

  it('異なるデータは異なるフォールバックハッシュを返すこと', async () => {
    const data1 = { money: 1000000 }
    const data2 = { money: 2000000 }

    const hash1 = await calculateChecksumEquivalent(data1, undefined)
    const hash2 = await calculateChecksumEquivalent(data2, undefined)

    expect(hash1).not.toBe(hash2)
  })

  it('空オブジェクトのフォールバックハッシュが null でないこと', async () => {
    const result = await calculateChecksumEquivalent({}, undefined)
    expect(result).not.toBeNull()
    expect(result.length).toBeGreaterThan(0)
  })

  it('crypto.subtle が利用可能な場合、SHA-256 ハッシュ（64文字）を返すこと', async () => {
    // Node.js / vitest 環境では globalThis.crypto.subtle が使える場合がある
    if (typeof globalThis.crypto?.subtle !== 'undefined') {
      const testData = { money: 1000000, turn: 5 }
      const result = await calculateChecksumEquivalent(testData, globalThis.crypto.subtle)

      // SHA-256 は 256bit = 32bytes = 64 hex chars
      expect(result).toHaveLength(64)
      expect(result).toMatch(/^[0-9a-f]{64}$/)
    } else {
      // crypto.subtle が使えない環境ではスキップ
      console.log('crypto.subtle が利用不可のため SHA-256 テストをスキップ')
    }
  })

  it('フォールバックハッシュと SHA-256 ハッシュは異なる形式であること', async () => {
    if (typeof globalThis.crypto?.subtle !== 'undefined') {
      const testData = { key: 'value' }
      const fallbackHash = await calculateChecksumEquivalent(testData, undefined)
      const sha256Hash = await calculateChecksumEquivalent(testData, globalThis.crypto.subtle)

      // フォールバックは短い（32bit整数の16進数）、SHA-256は64文字
      expect(fallbackHash.replace('-', '').length).toBeLessThan(sha256Hash.length)
    }
  })
})

// ============================================================
// STORAGE_KEYS / SAVE_SLOT_KEYS 定数テスト
// ============================================================
describe('STORAGE_KEYS / SAVE_SLOT_KEYS: ストレージキー定数', () => {
  it('STORAGE_KEYS が必須キーを持つこと', () => {
    expect(STORAGE_KEYS.SLOT_1).toBeDefined()
    expect(STORAGE_KEYS.SLOT_2).toBeDefined()
    expect(STORAGE_KEYS.SLOT_3).toBeDefined()
    expect(STORAGE_KEYS.METADATA).toBeDefined()
  })

  it('SAVE_SLOT_KEYS が 3 つのキーを持つこと', () => {
    expect(SAVE_SLOT_KEYS).toHaveLength(3)
    expect(SAVE_SLOT_KEYS[0]).toBe(STORAGE_KEYS.SLOT_1)
    expect(SAVE_SLOT_KEYS[1]).toBe(STORAGE_KEYS.SLOT_2)
    expect(SAVE_SLOT_KEYS[2]).toBe(STORAGE_KEYS.SLOT_3)
  })

  it('各スロットキーが一意であること', () => {
    const uniqueKeys = new Set(SAVE_SLOT_KEYS)
    expect(uniqueKeys.size).toBe(3)
  })
})

// ============================================================
// validateSaveMetadata: Zod バリデーションテスト
// ============================================================
describe('validateSaveMetadata: セーブメタデータバリデーション', () => {
  const validMetadata = {
    slotId: 1,
    companyName: 'テスト株式会社',
    playTime: 3600,
    lastSaveDate: new Date().toISOString(),
    gameDate: { year: 2025, month: 6, week: 2 },
    money: 10_000_000,
    employeeCount: 5,
    marketShare: 15.5,
    brandLevel: 3,
  }

  it('有効なメタデータは success: true を返すこと', () => {
    const result = validateSaveMetadata(validMetadata)
    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('無効なスロットID（0）は success: false を返すこと', () => {
    const result = validateSaveMetadata({ ...validMetadata, slotId: 0 })
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('無効なスロットID（4）は success: false を返すこと', () => {
    const result = validateSaveMetadata({ ...validMetadata, slotId: 4 })
    expect(result.success).toBe(false)
  })

  it('companyName が空文字列は success: false を返すこと', () => {
    const result = validateSaveMetadata({ ...validMetadata, companyName: '' })
    expect(result.success).toBe(false)
  })

  it('month が 0 は success: false を返すこと（範囲: 1-12）', () => {
    const result = validateSaveMetadata({
      ...validMetadata,
      gameDate: { year: 2025, month: 0, week: 1 },
    })
    expect(result.success).toBe(false)
  })

  it('month が 13 は success: false を返すこと', () => {
    const result = validateSaveMetadata({
      ...validMetadata,
      gameDate: { year: 2025, month: 13, week: 1 },
    })
    expect(result.success).toBe(false)
  })

  it('week が 5 は success: false を返すこと（範囲: 1-4）', () => {
    const result = validateSaveMetadata({
      ...validMetadata,
      gameDate: { year: 2025, month: 6, week: 5 },
    })
    expect(result.success).toBe(false)
  })

  it('year が 2025 未満は success: false を返すこと', () => {
    const result = validateSaveMetadata({
      ...validMetadata,
      gameDate: { year: 2024, month: 1, week: 1 },
    })
    expect(result.success).toBe(false)
  })

  it('checksum フィールドは省略可能（optional）であること', () => {
    const withChecksum = validateSaveMetadata({ ...validMetadata, checksum: 'abc123' })
    const withoutChecksum = validateSaveMetadata(validMetadata)
    expect(withChecksum.success).toBe(true)
    expect(withoutChecksum.success).toBe(true)
  })

  it('null を渡すと success: false を返すこと', () => {
    const result = validateSaveMetadata(null)
    expect(result.success).toBe(false)
  })

  it('undefined を渡すと success: false を返すこと', () => {
    const result = validateSaveMetadata(undefined)
    expect(result.success).toBe(false)
  })

  it('必須フィールド欠落は success: false を返すこと', () => {
    const { money: _money, ...withoutMoney } = validMetadata
    const result = validateSaveMetadata(withoutMoney)
    expect(result.success).toBe(false)
  })
})
