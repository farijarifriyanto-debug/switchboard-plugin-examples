# Contributing a plugin to the catalog

This repository doubles as the **official starter catalog** for Switchboard plugins. Two ways to contribute:

## 1. Fix or improve an existing plugin

Open a PR against `plugins/<name>.mjs`. Behaviour changes need a check against a real Switchboard install:

```bash
npm i -g @botconnector/switchboard   # if you don't have sbx yet
sbx info -p ./plugins/<name>.mjs     # your tool must appear under "tools"
```

Paste the `sbx info` output (or the `sbx run` transcript for an end-to-end tool call) in the PR description.

## 2. Add a new plugin

1. **Write the plugin** as a single ES module in `plugins/<name>.mjs` exporting `plugin = { name, inject?, apply }`. Follow the API of Switchboard's own `plugins/echo-tool.mjs` (upstream repo). Rules:
   - One plugin, one file, no runtime dependencies beyond Node builtins.
   - Register tools inside `ctx.effect(() => …)` so cleanup works.
   - Read-only tools must stay read-only; anything that writes or runs shell must rely on Switchboard's approval flow (do not bypass it).
   - No network calls unless the plugin's whole purpose is a network tool — say so in the description.
   - No secrets, no telemetry, no phone-home.

2. **Test it** against a real install and note the version:
   ```bash
   sbx info -p ./plugins/<name>.mjs    # tool registered?
   sbx run "…" -p ./plugins/<name>.mjs --approval off   # end-to-end (optional but preferred)
   ```

3. **Register it in `catalog.json`** — copy an existing entry and fill:
   - `name` — same as the plugin's `name` field and file name
   - `version` — semver, start at `1.0.0`
   - `file` — `plugins/<name>.mjs`
   - `description` — one sentence, what it does and when to use it
   - `tools` — array of tool names registered (empty if none)
   - `events` — array of harness events listened to (empty if none)
   - `injects` — service names in `inject: [...]`
   - `tags` — lowercase keywords
   - `testedWith` — exact Switchboard version, e.g. `switchboard 0.4.1`

4. **Validate locally:**
   ```bash
   node scripts/catalog.mjs list          # your plugin appears
   node scripts/catalog.mjs show <name>   # file exists, config snippet correct
   ```

5. Open a PR with: what the plugin does, the `sbx info`/`sbx run` evidence, and the Switchboard version.

## What gets accepted

- Plugins that are generally useful (productivity, observability, integrations) or teach a clear API pattern.
- Plugins tied to one person's private workflow — usually better kept in your own repo; link it in the PR discussion instead.

## What gets rejected

- Core-harness changes disguised as plugins (open an issue on [switchboard](https://github.com/farijarifriyanto-debug/switchboard) instead).
- Plugins that bypass approval flows, disable sandboxing, or exfiltrate data.
- Duplicates of an existing catalog entry with cosmetic differences.
- PRs without test evidence against a real Switchboard install.
