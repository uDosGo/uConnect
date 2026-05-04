// core/src/services/mastra-agent.ts
// Mastra Agent Service - Phase 1 Implementation

import { Agent } from '@mastra/core/agent';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuration
const config = {
  temperature: 0.2,
  maxTokens: 2000,
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY
};

// DSC2 Tool for reasoning
const dsc2Tool = {
  name: 'dsc2_reason',
  description: 'Use DSC2 reasoning engine for complex planning and multi-step problems',
  parameters: {
    type: 'object',
    properties: {
      prompt: { type: 'string', description: 'The reasoning prompt' },
      steps: { type: 'boolean', description: 'Whether to return step-by-step reasoning' }
    },
    required: ['prompt']
  },
  execute: async (params: { prompt: string; steps?: boolean }) => {
    try {
      const response = await fetch('http://localhost:30000/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: params.prompt,
          steps: params.steps || false,
          max_tokens: 4000
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.warn(`DSC2 fallback: ${data.error}`);
        return `[DSC2 unavailable] ${data.fallback || 'Use local reasoning instead'}`;
      }
      
      return data.result;
    } catch (error) {
      console.warn('DSC2 connection failed, using fallback reasoning');
      return `[DSC2 offline] Unable to reason about: ${params.prompt.substring(0, 100)}...`;
    }
  }
};

// Agent definitions
const agents = {
  codegen: new Agent({
    id: 'codegen',
    name: 'codegen',
    instructions: 'You are a code generation expert. Write clean, efficient, well-commented code. Return ONLY the code, no explanations.',
    model: {
      providerId: 'deepseek',
      modelId: 'deepseek-chat',
      apiKey: config.apiKey
    }
  }),
  
  explain: new Agent({
    id: 'explain',
    name: 'explain',
    instructions: 'You explain code concisely. Focus on what it does, how it works, and any edge cases. Keep responses under 200 words.',
    model: {
      providerId: 'deepseek',
      modelId: 'deepseek-chat',
      apiKey: config.apiKey
    }
  }),
  
  refactor: new Agent({
    id: 'refactor',
    name: 'refactor',
    instructions: 'You refactor code for better readability, performance, and maintainability. Suggest specific changes with before/after examples.',
    model: {
      providerId: 'deepseek',
      modelId: 'deepseek-chat',
      apiKey: config.apiKey
    }
  }),
  
  test: new Agent({
    id: 'test',
    name: 'test',
    instructions: 'You generate unit tests. Use the appropriate framework (Jest, Vitest, etc.). Cover edge cases and main functionality.',
    model: {
      providerId: 'deepseek',
      modelId: 'deepseek-chat',
      apiKey: config.apiKey
    }
  }),
  
  // Planning agent with DSC2 integration
  planner: new Agent({
    id: 'planner',
    name: 'planner',
    instructions: 'You are a planning agent. Use the dsc2_reason tool for complex multi-step tasks.',
    model: {
      providerId: 'deepseek',
      modelId: 'deepseek-chat',
      apiKey: config.apiKey
    },
    tools: [dsc2Tool]
  })
};

export async function callAgent(agentName: keyof typeof agents, prompt: string): Promise<string> {
  const agent = agents[agentName];
  
  if (!config.apiKey) {
    console.warn('⚠️ No API key found. Falling back to mock responses.');
    return mockResponse(prompt);
  }
  
  try {
    const response = await agent.generate(prompt);
    return response.text;
  } catch (error) {
    console.error(`Agent ${agentName} failed:`, error);
    return mockResponse(prompt);
  }
}

// Fallback mock (same as current behavior)
function mockResponse(prompt: string): string {
  return `// Mock response for: ${prompt.substring(0, 50)}...
// Set DEEPSEEK_API_KEY in .env for real AI generation.`;
}