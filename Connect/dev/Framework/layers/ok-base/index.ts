/**
 * OK Base Layer - Core Contracts and Types
 * 
 * This module exports the fundamental contracts and types
 * for the OK (Orchestration Kernel) system.
 */

/**
 * OKTool - Standard interface for all OK tools
 */
export interface OKTool {
    name: string;
    capabilities: string[];
    healthCheck(): Promise<HealthStatus>;
    execute(task: OKTask): Promise<OKResult>;
    getMetadata(): ToolMetadata;
}

/**
 * OKOrchestrator - Interface for OK orchestrators
 */
export interface OKOrchestrator {
    registerTool(tool: OKTool): void;
    unregisterTool(name: string): void;
    routeTask(task: OKTask): Promise<OKResult>;
    getAvailableTools(): OKTool[];
    getStatus(): OrchestratorStatus;
}

/**
 * OKTask - Standard task format
 */
export interface OKTask {
    id: string;
    type: string;
    input: any;
    context?: OKContext;
    constraints?: TaskConstraints;
}

/**
 * OKResult - Standard result format
 */
export interface OKResult {
    output: any;
    quality: number;
    cost: number;
    steps?: OKStep[];
    metadata: ResultMetadata;
    warnings?: string[];
}

/**
 * Supporting Types
 */
export type HealthStatus = {
    status: 'healthy' | 'degraded' | 'unhealthy';
    message?: string;
    timestamp: Date;
    details?: any;
};

export type ToolMetadata = {
    name: string;
    version: string;
    description: string;
    capabilities: string[];
    config?: any;
};

export type OKContext = {
    sessionId?: string;
    userId?: string;
    previousTasks?: string[];
    metadata?: any;
};

export type TaskConstraints = {
    maxCost?: number;
    maxTime?: number;
    maxTokens?: number;
    qualityThreshold?: number;
    preferOffline?: boolean;
};

export type OKStep = {
    description: string;
    result?: any;
    duration?: number;
    tool?: string;
};

export type ResultMetadata = {
    taskId: string;
    tool: string;
    timestamp: Date;
    duration: number;
    model?: string;
    tokens?: number;
};

export type OrchestratorStatus = {
    tools: number;
    activeTasks: number;
    queueLength: number;
    uptime: number;
    mode: 'online' | 'offline' | 'degraded';
};

/**
 * Utility Functions
 */

/**
 * Validate OKTool implementation
 * @param tool - Tool to validate
 * @returns true if valid OKTool implementation
 */
export function validateOKTool(tool: any): tool is OKTool {
    return typeof tool.name === 'string' &&
           Array.isArray(tool.capabilities) &&
           typeof tool.healthCheck === 'function' &&
           typeof tool.execute === 'function' &&
           typeof tool.getMetadata === 'function';
}

/**
 * Create standard OKResult
 * @param params - Result parameters
 * @returns OKResult
 */
export function createOKResult(params: {
    output: any;
    quality: number;
    cost: number;
    taskId: string;
    tool: string;
    steps?: OKStep[];
    warnings?: string[];
}): OKResult {
    return {
        output: params.output,
        quality: params.quality,
        cost: params.cost,
        steps: params.steps,
        warnings: params.warnings,
        metadata: {
            taskId: params.taskId,
            tool: params.tool,
            timestamp: new Date(),
            duration: 0 // Will be set by executor
        }
    };
}

/**
 * Create standard OKTask
 * @param params - Task parameters
 * @returns OKTask
 */
export function createOKTask(params: {
    id: string;
    type: string;
    input: any;
    context?: OKContext;
    constraints?: TaskConstraints;
}): OKTask {
    return {
        id: params.id,
        type: params.type,
        input: params.input,
        context: params.context,
        constraints: params.constraints
    };
}

/**
 * Contract Version
 */
export const OK_CONTRACT_VERSION = '1.0.0';
