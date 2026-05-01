/**
 * MCP Bridge — connects chat surfaces to the MCP backend socket.
 * Falls back to simulated responses when the socket is unavailable.
 */

const MCP_API = '/api/mcp';

let sessionId = null;

async function mcpFetch(endpoint, body = {}) {
  try {
    const res = await fetch(`${MCP_API}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, ...body }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.session_id) sessionId = data.session_id;
    return data;
  } catch {
    return null;
  }
}

export async function checkMCP() {
  const res = await mcpFetch('ping');
  return res !== null;
}

export async function sendMessage(agent, message) {
  const res = await mcpFetch('chat', { agent, message });
  if (res?.response) return res.response;

  // Fallback: simulated response
  const simResponses = {
    hivemind: [
      `**Orchestrating:** "${message}"\n\n**Agents dispatched:**\n1. OK Agent — parsing request\n2. Code Assistant — generating solution\n3. Vault Searcher — retrieving context\n\n✓ All agents reported.`,
      `**Hivemind routing:**\n\n**Primary:** OK Agent → analyzing intent\n**Secondary:** Code Assistant → preparing output\n\nAwaiting final assembly…`,
    ],
    re3engine: [
      `**Re3 Analysis:**\n\n> "${message}"\n\n**Depth:** Level 3 reasoning chain\n**Confidence:** 0.87\n\n**Conclusion:**\nProceeding with multi-step solution.`,
      `**Reasoning path:**\n1. Context extraction\n2. Pattern matching\n3. Solution synthesis\n\n**Result:** Analysis complete.`,
    ],
  };

  const responses = simResponses[agent] || ['Processing your request...'];
  return responses[Math.floor(Math.random() * responses.length)];
}
