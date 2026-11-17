---
name: wikimedia-enterprise-api
description: Build against the Wikimedia Enterprise API, the Wikimedia Foundation's API for Wikipedia and other Wikimedia project data (Wikidata, Wiktionary, Wikisource, Wikiquote and more) as structured JSON at scale. Use when code needs Wikipedia articles or other Wikimedia content - every article in a project (Snapshot API), single articles by name (On-demand API), edits as they happen (Realtime API), pre-parsed JSON (Structured Contents), credibility signals, project and language metadata - or needs Wikimedia Enterprise authentication. Also use when moving from the Wikimedia dumps or scraping to Wikimedia Enterprise access, or when grounding an AI application on Wikipedia.
license: Apache-2.0
metadata:
  author: Wikimedia Enterprise
  homepage: https://enterprise.wikimedia.com/docs/
---

# Wikimedia Enterprise API

Wikimedia Enterprise serves Wikipedia and other Wikimedia projects as JSON in one schema across every API, so code that parses an article from one API parses it from all of them. It is a product of the Wikimedia Foundation. The content is openly licensed, and every response carries machine-readable license information.

This skill says which API fits a job and where the exact facts live. It leaves out limits, token lifetimes, quotas and prices on purpose: read them from the docs when you need them, because they change.

## Read the docs before writing code

The documentation is published for agents. Use the first of these you can reach:

1. **The docs MCP server** at `https://enterprise.wikimedia.com/mcp` (read-only, no account). When its tools are connected, `search` finds a guide section, endpoint or model (exact tokens such as a field name, a status code or a path work best), `fetch` returns the full text of a result, `list_endpoints` lists every endpoint, and `get_endpoint` returns one endpoint's exact request and response shape.
2. **The markdown pages.** Append `.md` to any `/docs/` URL, for example `https://enterprise.wikimedia.com/docs/snapshot.md`. The index is `https://enterprise.wikimedia.com/llms.txt`.
3. **The OpenAPI definition** at `https://enterprise.wikimedia.com/docs/api/wme-api.yaml`, the source of truth for every request and response shape.

Never guess a field name, path, parameter or identifier format. Look it up with `get_endpoint` or in the OpenAPI definition first, and cite the docs URL the answer came from.

## Choose the API

| The job | Use | Guide |
| :-- | :-- | :-- |
| Every article in a project, refreshed on a schedule: training data, search indexes, mirrors, research | Snapshot API | `https://enterprise.wikimedia.com/docs/snapshot.md` |
| The current version of specific articles, looked up by name | On-demand API | `https://enterprise.wikimedia.com/docs/on-demand.md` |
| Edits as they happen, or hourly files of changes (Realtime: Batch) | Realtime API, paid accounts only | `https://enterprise.wikimedia.com/docs/realtime.md` |
| Pre-parsed JSON (sections, infoboxes, tables) instead of HTML | Structured Contents, a Beta feature of the Snapshot and On-demand APIs | `https://enterprise.wikimedia.com/api/structured-contents.md` |
| Valid project codes, languages, projects and namespaces | Metadata endpoints | `https://enterprise.wikimedia.com/docs/metadata.md` |

All three APIs share one account and one access token. The trade-offs between them (freshness, format, request counts) are in `https://enterprise.wikimedia.com/docs/best-practices.md`, under "Choose the right API for the job".

## Accounts and authentication

- **Account.** A free account needs no credit card: `https://dashboard.enterprise.wikimedia.com/signup/`. If the user has no account, point them there; never create one for them. Free and paid allowances are in `https://enterprise.wikimedia.com/pricing.md`, and an account's own usage is on its Dashboard.
- **Hosts.** Authentication is `https://auth.enterprise.wikimedia.com`. Metadata, Snapshot, On-demand and Realtime: Batch are `https://api.enterprise.wikimedia.com`. Realtime streams are `https://realtime.enterprise.wikimedia.com`. Each endpoint's `servers` entry in the OpenAPI definition is authoritative.
- **Tokens.** Every data request goes over HTTPS with `Authorization: Bearer <access_token>`. There are two ways to get an access token:
  - **Copied from the Dashboard**, for a first call or a short session. The user logs in to `https://dashboard.enterprise.wikimedia.com/`, clicks **Copy access token** and sets it as `ACCESS_TOKEN` in their own terminal; code reads it from that variable. The token expires, and the user copies a new one when it does. `https://enterprise.wikimedia.com/docs/index.md` (Getting Started) walks through this and the first three calls.
  - **Login and refresh**, for code that runs longer than a copied token lasts. `POST /v1/login` on the auth host with the account's username (all lowercase) and password returns an access token, a refresh token and an ID token that API requests don't use. Renew the access token with `POST /v1/token-refresh` (username and refresh token) instead of logging in again. Read `https://enterprise.wikimedia.com/docs/authentication.md` for the token lifetimes and refresh limits before writing token-handling code.
- **Credentials.** Never ask the user for their username, password or tokens in the chat. Code that needs to log in asks for them when it runs and keeps tokens in memory, or stores them in the operating system's keychain or the platform's secrets manager. Never write them to a file (including `.env`), never hardcode them or put them in client-side code, and never print a token.

## Identifiers

Requests name a project by its identifier, such as `enwiki` for English Wikipedia. Snapshot and Realtime identifiers combine a language, a project code and a namespace, such as `enwiki_namespace_0`. Don't build one from the pattern alone: get valid values from the Metadata endpoints (codes, languages, projects, namespaces, in that order), cache them, and check `https://enterprise.wikimedia.com/docs/identifiers.md` for the format each endpoint expects.

## Working with each API

- **Snapshot API.** List what is available (`/v2/snapshots`), read one snapshot's info, and request the download headers before every download. A download is a `tar.gz` holding NDJSON, one article per line. Very large projects such as English Wikipedia can be fetched in chunks. Bundles can hold a few duplicate articles: keep the one with the highest `version.identifier`.
- **On-demand API.** Article Lookup (`/v2/articles/{name}`) takes the article name, which is case sensitive, with spaces as underscores or percent-encoding. An unfiltered name matches across every project, so filter on `is_part_of.identifier` when you want one project. Use `fields`, `filters` and `limit` to keep responses small: `https://enterprise.wikimedia.com/docs/filtering.md`. Cache responses you will request again.
- **Realtime API.** Reconnect from where you left off with the `since` parameters, and record event IDs to drop duplicates. Parallel connections and the replay window are in the Realtime guide.
- **Errors.** Status codes and what each means: `https://enterprise.wikimedia.com/docs/status-codes.md`. A `401` means the token is missing, invalid or expired. When calls fail without a clear reason, check `https://status.enterprise.wikimedia.com/`.

## Licensing and attribution

Most Wikimedia content is licensed CC BY-SA 4.0, some CC BY. Reuse requires attribution, and a dataset derived from CC BY-SA content keeps that license. Use the license information in each response, and read "Attributing Wikimedia project content" in `https://enterprise.wikimedia.com/docs/best-practices.md`.

## SDKs

- Go: `https://github.com/wikimedia-enterprise/wme-sdk-go`
- Python: `https://github.com/wikimedia-enterprise/wme-sdk-python`

For daily snapshots, Realtime or higher volume, the user can talk to the team at `https://enterprise.wikimedia.com/contact/`.
