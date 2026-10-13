/**
 * Contoh plugin: mencatat TTFT (time to first token) tiap panggilan model
 * ke log plugin — menunjukkan cara subscribe event harness tanpa tool baru.
 */
export const plugin = {
  name: 'session-ttft',

  apply(ctx) {
    const logger = ctx.logger('session-ttft')
    ctx.on('llm/metrics', (m) => {
      logger.info('model=%s ttft=%dms total=%dms tok/s=%s', m.model, m.ttftMs, m.totalMs, m.tokPerSec ?? '-')
    })
  },
}
