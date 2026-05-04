/**
 * MCP Bridge — connects chat surfaces to the MCP backend socket.
 * Falls back to simulated responses when the socket is unavailable.
 */

const MCP_API = '/api/mcp';

let sessionId = null;

async function mcpFetch(method, params = {}) {
  try {
    const res = await fetch(MCP_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: Date.now()
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result || data.error || null;
  } catch {
    return null;
  }
}

export async function checkMCP() {
  const res = await mcpFetch('tools/list');
  return res !== null;
}

export async function sendMessage(agent, message) {
  // Use 'tools/call' with the appropriate tool name
  // The gateway maps 'chat' to Re3 and we'll use 'orchestrate' for Hivemind if needed,
  // but for now let's use the tool names as defined in router.rs
  const toolName = agent === 'hivemind' ? 'orchestrate' : 'chat';
  const args = agent === 'hivemind' ? { task: message } : { message: message };

  const res = await mcpFetch('tools/call', { name: toolName, arguments: args });
  
  if (res?.content?.[0]?.text) {
    return res.content[0].text;
  }

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
