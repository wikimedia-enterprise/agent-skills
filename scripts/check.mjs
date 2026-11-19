// Every check this repo has: skill frontmatter against the Agent Skills spec, manifests against
// each other and the live docs MCP server, endpoint paths against the live endpoint list, prose
// terms, and every URL. Exits 1 on any failure. Needs network access; no dependencies.

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { MCP_URL, initialize, liveCapabilities, mcp, registryVersion } from './mcp.mjs';

const root = new URL('..', import.meta.url).pathname;
const read = (p) => readFile(join(root, p), 'utf8');
const readJson = async (p) => JSON.parse(await read(p));

const failures = [];
const fail = (where, msg) => failures.push(`${where}: ${msg}`);

// Agent Skills spec, https://agentskills.io/specification
const SKILL_KEYS = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools']);
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const fields = {};
  for (const line of m[1].split('\n')) {
    const top = line.match(/^([a-z-]+):\s*(.*)$/);
    if (top) fields[top[1]] = top[2];
  }
  return { fields, body: text.slice(m[0].length) };
}

const skillDirs = (await readdir(join(root, 'skills'), { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name);
const skills = [];
for (const dir of skillDirs) {
  const where = `skills/${dir}/SKILL.md`;
  const text = await read(where);
  skills.push({ where, text });
  const fm = frontmatter(text);
  if (!fm) { fail(where, 'no frontmatter'); continue; }
  const { name, description, compatibility } = fm.fields;
  for (const key of Object.keys(fm.fields)) if (!SKILL_KEYS.has(key)) fail(where, `unknown frontmatter key "${key}"`);
  if (!name || name.length > 64 || !NAME_RE.test(name)) fail(where, `name "${name}" breaks the spec's name rule`);
  if (name !== dir) fail(where, `name "${name}" must equal its directory "${dir}"`);
  if (!description || description.length > 1024) fail(where, `description is ${description?.length ?? 0} chars (1-1024)`);
  if (compatibility && compatibility.length > 500) fail(where, 'compatibility over 500 chars');
  if (fm.body.split('\n').length > 500) fail(where, 'body over 500 lines');
}

// Claude Code plugin and marketplace agree with each other and with .mcp.json.
const plugin = await readJson('.claude-plugin/plugin.json');
const market = await readJson('.claude-plugin/marketplace.json');
const mcpJson = await readJson('.mcp.json');
const lhm = await readJson('lhm.plugin.json');
const entry = market.plugins.find((p) => p.source === './');
if (!entry) fail('marketplace.json', 'no plugin entry with source "./"');
else {
  if (entry.name !== plugin.name) fail('marketplace.json', `entry name "${entry.name}" != plugin.json "${plugin.name}"`);
}
// No version anywhere, so Claude Code versions the plugin by commit and every push reaches
// installed copies (code.claude.com/docs/en/plugins/host-marketplace.md, Release a new version).
if ('version' in plugin) fail('plugin.json', 'remove "version": a set version holds installs at their cached copy');
if (entry && 'version' in entry) fail('marketplace.json', 'remove the entry "version": a set version holds installs at their cached copy');
for (const [key, server] of Object.entries(mcpJson.mcpServers)) {
  if (server.type !== 'http') fail('.mcp.json', `${key}: type must be "http" (a url without it is read as stdio)`);
  if (server.url !== MCP_URL) fail('.mcp.json', `${key}: url ${server.url} != ${MCP_URL}`);
}

// LobeHub manifest, per https://lobehub.com/publish-mcp/skill.md (references/manifest.md).
if (!/^[\da-z][\d_a-z-]*$/.test(lhm.identifier ?? '')) fail('lhm.plugin.json', `identifier "${lhm.identifier}" breaks LobeHub's pattern`);
for (const key of ['name', 'version']) if (!lhm[key]) fail('lhm.plugin.json', `missing ${key}`);
for (const key of ['authorUrl', 'cloudEndpoint', 'homepage']) {
  if (lhm[key] && !/^https:\/\//.test(lhm[key])) fail('lhm.plugin.json', `${key} must be an absolute https URL`);
}
if (lhm.cloudEndpoint !== MCP_URL) fail('lhm.plugin.json', `cloudEndpoint ${lhm.cloudEndpoint} != ${MCP_URL}`);

const [live, version, init, endpoints] = await Promise.all([
  liveCapabilities(),
  registryVersion(),
  initialize(),
  mcp('tools/call', { name: 'list_endpoints', arguments: {} }),
]);
const sync = 'run `npm run sync:lobehub`';
if (lhm.version !== version) fail('lhm.plugin.json', `version ${lhm.version} != MCP registry ${version}; ${sync}`);
if (JSON.stringify(lhm.tools) !== JSON.stringify(live.tools)) fail('lhm.plugin.json', `tools differ from the live server; ${sync}`);
if (JSON.stringify(lhm.resources) !== JSON.stringify(live.resources)) fail('lhm.plugin.json', `resources differ from the live server; ${sync}`);
if (!init.serverInfo?.name) fail(MCP_URL, 'initialize returned no serverInfo');

// Every endpoint path a skill names exists on the live endpoint list.
const paths = new Set(endpoints.structuredContent.endpoints.map((e) => e.path));
for (const { where, text } of skills) {
  for (const [, path] of text.matchAll(/`(?:[A-Z]+ )?(\/v\d+\/[^`\s]*)`/g)) {
    if (!paths.has(path)) fail(where, `endpoint ${path} is not on the live endpoint list`);
  }
}

// Public prose: the Wikimedia Enterprise glossary rules that a pattern can catch.
const TERMS = [
  [/—/, 'em dash'],
  [/[‘’“”]/, 'curly quote'],
  [/\b(WME|WMF|SC)\b/, 'internal shorthand'],
  [/\btiers?\b/i, '"tier" (say free and paid accounts)'],
  [/\b(free )?trial\b/i, '"trial" (say free account)'],
  [/\bBatch(es)? API\b/, '"Batch API" (it is Realtime: Batch)'],
  [/\bOn-Demand\b|\bOndemand\b|\bon-demand API\b/, 'On-demand spelling'],
  [/\b[Rr]eal-[Tt]ime API\b|\bRealTime\b/, 'Realtime API spelling'],
];
const proseFiles = ['README.md', 'CLAUDE.md', ...skills.map((s) => s.where), '.claude-plugin/plugin.json', '.claude-plugin/marketplace.json', 'lhm.plugin.json'];
const texts = Object.fromEntries(await Promise.all(proseFiles.map(async (f) => [f, await read(f)])));
for (const [file, text] of Object.entries(texts)) {
  text.split('\n').forEach((line, i) => {
    for (const [re, label] of TERMS) if (re.test(line)) fail(`${file}:${i + 1}`, label);
  });
}

// Every URL answers 200. The MCP endpoint is POST-only and was checked by initialize above. The
// bare API hosts refuse an unauthenticated GET, so for those any HTTP answer counts.
const API_HOSTS = /^https:\/\/(auth|api|realtime)\.enterprise\.wikimedia\.com\/?$/;
const urls = new Set();
for (const text of Object.values(texts)) {
  for (const [url] of text.matchAll(/https:\/\/[^\s"'`)<>\]]+/g)) urls.add(url.replace(/[.,;:]+$/, ''));
}
urls.delete(MCP_URL);
const results = await Promise.all(
  [...urls].map(async (url) => {
    try {
      const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'agent-skills-link-check' } });
      return [url, res.status];
    } catch (err) {
      return [url, err.cause?.code ?? err.message];
    }
  }),
);
for (const [url, status] of results) {
  if (status === 200 || (API_HOSTS.test(url) && typeof status === 'number')) continue;
  fail(url, `answered ${status}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  console.error(`\n${failures.length} problem(s)`);
  process.exit(1);
}
console.log(`ok: ${skills.length} skill(s), ${urls.size + 1} URLs, ${live.tools.length} tools, ${paths.size} endpoint paths`);
