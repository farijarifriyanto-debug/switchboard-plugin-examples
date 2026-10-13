/**
 * Contoh plugin berconfig: tool `greeter` menyapa dengan salaman dari config.
 *
 * Aktifkan lewat objek { src, config } di switchboard.config.jsonc:
 *   "plugins": [
 *     { "src": "./plugins/greeter-config.mjs",
 *       "config": { "greeting": "Halo", "audience": "tim QA" } }
 *   ]
 *
 * Tanpa config, memakai default "Hello" / "developer".
 */
export const plugin = {
  name: 'greeter-config',
  inject: ['tools'],

  apply(ctx, config = {}) {
    const greeting = config.greeting ?? 'Hello'
    const audience = config.audience ?? 'developer'

    ctx.effect(() =>
      ctx.tools.register({
        name: 'greeter',
        description: 'Greet the configured audience. Use once to confirm the plugin config loaded.',
        parameters: { type: 'object', properties: {} },
        execute: () => `${greeting}, ${audience}! (greeter-config plugin)`,
      }),
    )
  },
}
