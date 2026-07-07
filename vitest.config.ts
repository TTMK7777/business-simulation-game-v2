// vitest 専用設定 (vite.config.ts より優先される)
// .claude/worktrees/ (エージェント並行作業用 git worktree) 配下のテストを
// 二重実行しないための exclude。vitest デフォルトは .claude を除外しない。
import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
    test: {
        exclude: [...configDefaults.exclude, '**/.claude/**'],
    },
})
