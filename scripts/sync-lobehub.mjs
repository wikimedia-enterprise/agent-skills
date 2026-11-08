// Rewrites the server-derived fields of lhm.plugin.json (tools, resources, version) from the live
// docs MCP server and the MCP registry. Owner fields (name, description, homepage, ...) are kept.
// Same data `lhm plugin init --url` reads; run this after a release that changed the MCP server.

import { readFile, writeFile } from 'node:fs/promises';
import { liveCapabilities, registryVersion } from './mcp.mjs';

const path = new URL('../lhm.plugin.json', import.meta.url);
const manifest = JSON.parse(await readFile(path, 'utf8'));
const [{ tools, resources }, version] = await Promise.all([liveCapabilities(), registryVersion()]);

Object.assign(manifest, { version, tools, resources });
await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`lhm.plugin.json: version ${version}, ${tools.length} tools, ${resources.length} resources`);
