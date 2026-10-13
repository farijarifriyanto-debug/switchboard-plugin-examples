/**
 * Contoh plugin paling kecil: tool `hello` menyapa + versi Node berjalan.
 * Cocok untuk memverifikasi jalur plugin sebelum menulis tool nyata.
 */
export const plugin = {
  name: 'hello-tool',
  inject: ['tools'],

  apply(ctx) {
    ctx.effect(() =>
      ctx.tools.register({
        name: 'hello',
        description: 'Greet the user and report the running Node.js version.',
        parameters: { type: 'object', properties: {} },
        execute: () => `Halo dari Switchboard plugin! Node.js ${process.version}`,
      }),
    )
  },
}
