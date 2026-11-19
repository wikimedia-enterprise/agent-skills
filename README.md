# Wikimedia Enterprise agent skills

Agent skills for building with the [Wikimedia Enterprise API](https://enterprise.wikimedia.com/docs/), the Wikimedia Foundation's API for Wikipedia and other Wikimedia project data as structured JSON. The skill tells a coding agent which API fits a job and where the exact facts live; the [docs MCP server](https://enterprise.wikimedia.com/docs/agents/) supplies the request and response shapes.

## Install

**Any agent that reads `SKILL.md`** (Claude Code, Codex, Cursor, Gemini CLI and others), with the [skills CLI](https://skills.sh/):

```bash
npx skills add wikimedia-enterprise/agent-skills
```

**Claude Code**, as a plugin that adds the skill and connects the docs MCP server in one step:

```bash
claude plugin marketplace add wikimedia-enterprise/agent-skills
claude plugin install wikimedia-enterprise@wikimedia-enterprise
```

Claude Code doesn't auto-update plugins from this marketplace unless you turn it on: in `/plugin`, open **Marketplaces**, select `wikimedia-enterprise` and enable auto-update. Otherwise, update by hand and restart Claude Code:

```bash
claude plugin marketplace update wikimedia-enterprise
claude plugin update wikimedia-enterprise@wikimedia-enterprise
```

**The docs MCP server on its own**: `https://enterprise.wikimedia.com/mcp`, Streamable HTTP, no account needed. Setup for each client is in [AI Agents and MCP](https://enterprise.wikimedia.com/docs/agents/).

## What's included

| Skill | Use it for |
| :-- | :-- |
| [`wikimedia-enterprise-api`](skills/wikimedia-enterprise-api/SKILL.md) | Choosing between the Snapshot API, On-demand API and Realtime API, authentication, identifiers, and working practices for each API, with pointers to the docs for every detail |

The skill holds no limits, quotas or prices. It sends the agent to the docs for those, so it stays correct as the API changes.

## Using the API

You need a Wikimedia Enterprise account. A [free account](https://dashboard.enterprise.wikimedia.com/signup/) needs no credit card; [pricing](https://enterprise.wikimedia.com/pricing/) compares free and paid accounts. Start with [Getting Started](https://enterprise.wikimedia.com/docs/), or use the [Go SDK](https://github.com/wikimedia-enterprise/wme-sdk-go) or the [Python SDK](https://github.com/wikimedia-enterprise/wme-sdk-python).

## Checks

```bash
npm run check          # skill frontmatter, manifests, endpoint paths, terms and every URL, against production
npm run sync:lobehub   # refresh lhm.plugin.json from the live MCP server and the MCP registry
```

Node.js 22 or later, no dependencies. `check` needs network access.

## License

Copyright 2026 Wikimedia, LLC. Licensed under the [Apache License 2.0](LICENSE). See [NOTICE](NOTICE).

This tool is not covered under Wikimedia Enterprise SLA.

Content from Wikimedia projects that you retrieve through the API carries its own license, most often CC BY-SA 4.0. Use of the APIs is subject to the [API License Agreement](https://enterprise.wikimedia.com/terms/).
