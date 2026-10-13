/**
 * Contoh plugin: tool `word_count` menghitung jumlah kata di file workspace.
 *
 * Demonstrasi: mendaftarkan satu tool read-only dengan memanggil tool bawaan
 * `read_file` lewat ToolsService (inject: ['tools']).
 * Aktifkan dengan menambahkan path file ini ke `plugins` di switchboard.config.jsonc:
 *   "plugins": [ "./plugins/word-count.mjs" ]
 */
export const plugin = {
  name: 'word-count',
  inject: ['tools'],

  apply(ctx) {
    ctx.effect(() =>
      ctx.tools.register({
        name: 'word_count',
        description:
          'Count words, lines and characters in a file inside the workspace. Read-only.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path relative to the workspace' },
          },
          required: ['path'],
        },
        async execute(args) {
          const text = await ctx.tools.call('read_file', { path: args.path })
          const words = text.split(/\s+/).filter(Boolean).length
          const lines = text.split('\n').length
          return `${args.path}: ${words} kata, ${lines} baris, ${text.length} karakter`
        },
      }),
    )
  },
}
