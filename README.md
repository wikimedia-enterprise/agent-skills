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

The code and skill text in this repository are licensed [Apache-2.0](LICENSE). Content from Wikimedia projects that you retrieve through the API carries its own license, most often CC BY-SA 4.0. See the [privacy policy](https://enterprise.wikimedia.com/privacy/) and the [API License Agreement](https://enterprise.wikimedia.com/terms/).
