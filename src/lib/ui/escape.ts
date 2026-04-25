// XSS対策: HTMLエスケープ用ユーティリティ
// テンプレートリテラルで動的データを HTML 文字列に注入する際に使用する。
// 文字列以外（null/undefined/数値/オブジェクト）は安全に文字列化される。

export function escapeHtml(unsafe: any): string {
    if (unsafe === null || unsafe === undefined) return ''
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}
