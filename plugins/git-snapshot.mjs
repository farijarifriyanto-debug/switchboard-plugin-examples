/**
 * Contoh plugin: tool read-only `git_snapshot` — branch, status ringkas, 3 commit terakhir.
 *
 * Memanggil `git` langsung lewat child_process (bukan tool run_command), jadi tidak
 * memicu approval: hanya perintah `git status`/`log` yang tidak menulis apa pun.
 * Batas: hanya untuk workspace yang adalah git repo; error dikembalikan sebagai pesan.
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
const pExecFile = promisify(execFile)

async function git(cwd, args) {
  const { stdout } = await pExecFile('git', args, { cwd, timeout: 5000, maxBuffer: 64 * 1024 })
  return stdout.trim()
}

export const plugin = {
  name: 'git-snapshot',
  inject: ['tools', 'workspace'],

  apply(ctx) {
    ctx.effect(() =>
      ctx.tools.register({
        name: 'git_snapshot',
        description:
          'Read-only git summary of the workspace: current branch, short status, last 3 commits. Fails gracefully outside a git repo.',
        parameters: { type: 'object', properties: {} },
        async execute(_args, toolCtx) {
          const cwd = toolCtx.workspace ?? ctx.workspace?.root ?? process.cwd()
          try {
            const branch = await git(cwd, ['rev-parse', '--abbrev-ref', 'HEAD'])
            const log = await git(cwd, ['log', '--oneline', '-3'])
            let status = '(clean)'
            try {
              const s = await git(cwd, ['status', '--porcelain'])
              if (s) {
                const lines = s.split('\n').filter(Boolean)
                status = lines.slice(0, 10).join('\n')
                if (lines.length > 10) status += `\n… +${lines.length - 10} more`
              }
            } catch { /* status optional */ }
            return `branch: ${branch}\n\nlast commits:\n${log}\n\nstatus:\n${status}`
          } catch (err) {
            return `Not a git repository (or git failed) at ${cwd}: ${String(err.message || err).split('\n')[0]}`
          }
        },
      }),
    )
  },
}
