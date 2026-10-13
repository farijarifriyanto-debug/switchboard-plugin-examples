/**
 * Contoh plugin dua tool: catatan kerja di workspace.
 *
 * - notes_add  — tambah satu baris ke .switchboard/notes.md (WRITE, digate approval harness
 *                lewat risk:'risky' — jangan pernah bypass approval untuk tool tulis)
 * - notes_list — baca isi catatan (read-only)
 *
 * Config opsional: { "file": "relative/or/abs.md" }
 */
import { appendFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, isAbsolute, join } from 'node:path'

export const plugin = {
  name: 'notes',
  inject: ['tools', 'workspace'],

  apply(ctx, config = {}) {
    const fileRel = config.file ?? '.switchboard/notes.md'
    const resolve = () => {
      if (isAbsolute(fileRel)) return fileRel
      return join(ctx.workspace?.root ?? process.cwd(), fileRel)
    }

    ctx.effect(() => {
      const offAdd = ctx.tools.register({
        name: 'notes_add',
        description: 'Append one note line (with timestamp) to the workspace notes file. Mutating — will ask for approval.',
        risk: 'risky',
        parameters: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'The note to append (one line)' },
          },
          required: ['text'],
        },
        execute(args) {
          const file = resolve()
          mkdirSync(dirname(file), { recursive: true })
          const line = `- ${new Date().toISOString()} ${args.text.replace(/\n/g, ' ')}`
          appendFileSync(file, line + '\n')
          return `Noted in ${fileRel}: ${args.text}`
        },
      })

      const offList = ctx.tools.register({
        name: 'notes_list',
        description: 'List the workspace notes file contents (read-only).',
        parameters: { type: 'object', properties: {} },
        execute() {
          const file = resolve()
          if (!existsSync(file)) return `No notes yet at ${fileRel}. Use notes_add to create the first one.`
          return readFileSync(file, 'utf8')
        },
      })

      return () => { offAdd(); offList() }
    })
  },
}
