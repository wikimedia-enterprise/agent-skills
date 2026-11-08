// Minimal JSON-RPC client for the docs MCP server, enough for the checks and the LobeHub sync.

export const MCP_URL = 'https://enterprise.wikimedia.com/mcp';
export const REGISTRY_URL =
  'https://registry.modelcontextprotocol.io/v0/servers/com.wikimedia.enterprise%2Fdocs/versions/latest';

const PROTOCOL = '2025-06-18';
let nextId = 1;

export async function mcp(method, params = {}) {
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      'MCP-Protocol-Version': PROTOCOL,
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params }),
  });
  if (!res.ok) throw new Error(`${method}: HTTP ${res.status}`);
  const text = await res.text();
  const json = (res.headers.get('content-type') ?? '').includes('text/event-stream')
    ? JSON.parse(text.split('\n').filter((l) => l.startsWith('data: ')).at(-1).slice(6))
    : JSON.parse(text);
  if (json.error) throw new Error(`${method}: ${json.error.code} ${json.error.message}`);
  return json.result;
}

export const initialize = () =>
  mcp('initialize', {
    protocolVersion: PROTOCOL,
    capabilities: {},
    clientInfo: { name: 'agent-skills-check', version: '0.0.0' },
  });

// The listing carries the fields LobeHub's manifest documents for tools and resources.
export async function liveCapabilities() {
  const [{ tools }, { resources }] = await Promise.all([mcp('tools/list'), mcp('resources/list')]);
  return {
    tools: tools.map(({ name, title, description, inputSchema }) => ({ name, title, description, inputSchema })),
    resources: resources.map(({ uri, name, title, description, mimeType }) => ({ uri, name, title, description, mimeType })),
  };
}

export async function registryVersion() {
  const res = await fetch(REGISTRY_URL);
  if (!res.ok) throw new Error(`registry: HTTP ${res.status}`);
  return (await res.json()).server.version;
}
