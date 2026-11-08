# CLAUDE.md

Agent skills for the Wikimedia Enterprise API, packaged three ways from one tree: plain `SKILL.md` directories under `skills/` (read by the skills CLI and LobeHub Skills), a Claude Code plugin and marketplace (`.claude-plugin/`, `.mcp.json`), and the LobeHub MCP listing for the docs MCP server (`lhm.plugin.json`).

## Rules

- **A skill holds no limits, lifetimes, quotas or prices.** It names the API, the endpoint and the docs URL, and sends the agent to the docs for every number. That is what keeps it correct without edits.
- **Every endpoint path a skill names must exist on the live endpoint list**, and every URL must answer. `npm run check` enforces both, plus the Agent Skills frontmatter rules and the manifest rules below.
- **Public copy follows the Wikimedia Enterprise glossary**: "Wikimedia Enterprise" in full, Snapshot API, On-demand API, Realtime API (in that order), Realtime: Batch as an endpoint of the Realtime API rather than an API of its own, free and paid accounts, Structured Contents marked Beta, no internal shorthand, no em dashes, straight quotes. `npm run check` catches the patterns (its `TERMS` list); wording still needs a reader.
- **Versions.** `.claude-plugin/plugin.json` and its marketplace entry move together. `lhm.plugin.json`'s `version`, `tools` and `resources` mirror the MCP server's registry release: after a release that changed the server, run `npm run sync:lobehub`, then publish the listing with `lhm plugin update`.
- `lhm.plugin.json` `category` is left out: LobeHub doesn't publish its category values.
