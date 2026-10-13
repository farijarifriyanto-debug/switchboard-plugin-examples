#!/usr/bin/env node
/**
 * Plugin catalog helper for switchboard-plugin-examples.
 *
 *   node scripts/catalog.mjs list                # list plugins in catalog.json
 *   node scripts/catalog.mjs show <name>         # details + how to enable
 *   node scripts/catalog.mjs install <name>      # copy plugin to ~/.switchboard/plugins/
 *                                                # and print the config line to add
 *   node scripts/catalog.mjs print-config <name> # print plugins[] entry for switchboard.config.jsonc
 */
import { readFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const catalog = JSON.parse(readFileSync(join(root, 'catalog.json'), 'utf8'))

function find(name) {
  const p = catalog.plugins.find((x) => x.name === name)
  if (!p) {
    console.error(`Plugin "${name}" not found. Run: node scripts/catalog.mjs list`)
    process.exit(1)
  }
  return p
}

function resolveFile(p) {
  const file = join(root, p.file)
  if (!existsSync(file)) {
    console.error(`catalog.json points to a missing file: ${p.file}`)
    process.exit(1)
  }
  return file
}

const [, , cmd, name] = process.argv

switch (cmd) {
  case 'list': {
    console.log(`Switchboard plugin catalog — ${catalog.plugins.length} plugin(s)\n`)
    for (const p of catalog.plugins) {
      const tools = p.tools.length ? `tools: ${p.tools.join(', ')}` : 'no tools'
      const events = p.events.length ? ` events: ${p.events.join(', ')}` : ''
      console.log(`  ${p.name.padEnd(14)} v${p.version}  ${tools}${events}`)
      console.log(`  ${''.padEnd(14)} ${p.description}\n`)
    }
    console.log('Enable: node scripts/catalog.mjs install <name>')
    break
  }
  case 'show': {
    const p = find(name)
    resolveFile(p)
    console.log(JSON.stringify(p, null, 2))
    console.log(`\nSource: ${p.file}`)
    console.log(`Tested with: ${p.testedWith}`)
    console.log('\nEnable (one-off):')
    console.log(`  sbx info -p ./${p.file}`)
    console.log('\nEnable (persistent) — add to switchboard.config.jsonc:')
    console.log(`  "plugins": [ "./${p.file}" ]`)
    break
  }
  case 'install': {
    const p = find(name)
    const src = resolveFile(p)
    const destDir = join(homedir(), '.switchboard', 'plugins')
    mkdirSync(destDir, { recursive: true })
    const dest = join(destDir, `${p.name}.mjs`)
    copyFileSync(src, dest)
    console.log(`Installed ${p.name} v${p.version} -> ${dest}`)
    console.log('\nAdd this line to the "plugins" array in ~/.switchboard/config.jsonc:')
    console.log(`  "${dest}"`)
    console.log('\nOr keep it project-local:')
    console.log(`  sbx info -p ${dest}`)
    break
  }
  case 'print-config': {
    const p = find(name)
    resolveFile(p)
    console.log(`"./${p.file}"`)
    break
  }
  default:
    console.log('Usage: node scripts/catalog.mjs <list|show|install|print-config> [plugin-name]')
    process.exit(cmd ? 1 : 0)
}
