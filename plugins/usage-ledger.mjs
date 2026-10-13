/**
 * Contoh plugin: mencatat setiap panggilan model ke ledger JSONL.
 *
 * File: .switchboard/usage-ledger.jsonl di workspace aktif (append, satu baris per panggilan).
 * Kolom: ts, model, ttftMs, totalMs, tokPerSec (bila tersedia).
 * Config opsional: { "path": "relative/or/abs.jsonl" }
 *
 * Pola yang diajarkan: event listener + tulis file sendiri (append-only, tanpa tool baru).
 */
import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname, isAbsolute, join } from 'node:path'

export const plugin = {
  name: 'usage-ledger',
  inject: ['workspace'],

  apply(ctx, config = {}) {
    const logger = ctx.logger('usage-ledger')
    const resolve = () => {
      const p = config.path ?? '.switchboard/usage-ledger.jsonl'
      if (isAbsolute(p)) return p
      const root = ctx.workspace?.root ?? process.cwd()
      return join(root, p)
    }

    ctx.on('llm/metrics', (m) => {
      const row = JSON.stringify({
        ts: new Date().toISOString(),
        model: m.model,
        ttftMs: m.ttftMs,
        totalMs: m.totalMs,
        tokPerSec: m.tokPerSec ?? null,
      })
      try {
        const file = resolve()
        mkdirSync(dirname(file), { recursive: true })
        appendFileSync(file, row + '\n')
      } catch (err) {
        logger.warn('failed to append ledger: %s', String(err))
      }
    })
  },
}
