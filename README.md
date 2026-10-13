# Switchboard Plugin Examples

[![npm](https://img.shields.io/npm/v/@botconnector/switchboard?label=switchboard)](https://www.npmjs.com/package/@botconnector/switchboard)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Website](https://img.shields.io/badge/website-botconnector.id-06305A)](https://botconnector.id/id/switchboard)

Contoh plugin kecil untuk [Switchboard](https://github.com/farijarifriyanto-debug/switchboard) — harness agent dari BotConnector tempat semuanya plugin. Setiap file di `plugins/` berdiri sendiri, bisa disalin ke project Anda dan disesuaikan.

## Cara pakai

Tambahkan path file plugin ke blok `plugins` di `switchboard.config.jsonc`:

```jsonc
{
  "plugins": [
    "./plugins/hello-tool.mjs",
    "./plugins/word-count.mjs",
    "./plugins/session-ttft.mjs"
  ]
}
```

Atau lewat flag untuk percobaan cepat:

```bash
sbx info -p ./plugins/hello-tool.mjs          # verifikasi tool terdaftar
sbx chat -p ./plugins/hello-tool.mjs          # pakai di sesi chat
```

## Daftar contoh

| Plugin | Tool / perilaku | Yang didemonstrasikan |
|---|---|---|
| `plugins/hello-tool.mjs` | `hello` | Plugin paling kecil: daftar satu tool tanpa dependencies. Cocok untuk memverifikasi jalur plugin. |
| `plugins/word-count.mjs` | `word_count` | Tool read-only yang memanggil tool bawaan `read_file` lewat `ctx.tools.call()`. Menghitung kata, baris, dan karakter file di workspace. |
| `plugins/session-ttft.mjs` | — (listener) | Subscribe event `llm/metrics` dan mencatat TTFT/total/tok-per-detik tiap panggilan model — tanpa mendaftarkan tool baru. |

## Pola API plugin

```js
export const plugin = {
  name: 'nama-plugin',
  inject: ['tools'],           // service yang dibutuhkan: 'tools', 'llm', dst.

  apply(ctx, config = {}) {
    // daftarkan tool (wajib di dalam ctx.effect agar ikut dibersihkan)
    ctx.effect(() =>
      ctx.tools.register({
        name: 'tool_name',
        description: 'Untuk model: kapan tool ini dipakai.',
        parameters: { type: 'object', properties: { /* JSON Schema */ } },
        execute: async (args) => 'hasil string',
      }),
    )

    // dengarkan event harness
    ctx.on('llm/metrics', (m) => { /* m.model, m.ttftMs, m.totalMs */ })
  },
}
```

Catatan keamanan yang sama dengan Switchboard: `run_command` dan tool yang menulis file melewati approval; tool read-only sebaiknya tetap hanya membaca workspace. Lihat [README Switchboard](https://github.com/farijarifriyanto-debug/switchboard#readme) untuk model approval dan sandbox.

## Uji

Contoh diuji dengan Switchboard 0.4.1:

```bash
npm i -g @botconnector/switchboard
sbx info -p ./plugins/hello-tool.mjs,/plugins/word-count.mjs   # tools hello & word_count muncul
sbx run "Panggil tool word_count pada file sample.txt" -p ./plugins/word-count.mjs --approval off
```

## Lisensi

MIT. Switchboard dan maskot BotConnector/Bico punya lisensi & merek masing-masing — lihat NOTICE di repo Switchboard.
