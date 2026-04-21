/**
 * OK Commands for uDev CLI
 * 
 * Adds OK (Orchestration Kernel) support to the udev command-line interface
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * OK Command Functions
 */
const okCommands = {
    /**
     * Validate OK contract implementation
     * @param {string} filePath - Path to file to validate
     */
    validate: (filePath) => {
        try {
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                console.error(`❌ File not found: ${filePath}`);
                return;
            }

            // Read and validate the file
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Simple validation - check for OKTool interface
            if (content.includes('implements OKTool') || content.includes('OKTool')) {
                console.log(`✅ File ${filePath} appears to implement OKTool interface`);
            } else {
                console.log(`⚠️  File ${filePath} may not implement OKTool interface`);
            }
        } catch (error) {
            console.error(`❌ Error validating ${filePath}:`, error.message);
        }
    },

    /**
     * List available OK tools
     */
    list: () => {
        console.log('🔧 OK Tools:');
        console.log('  reasoning - Deep reasoning engine');
        console.log('  code - Code generation and analysis');
        console.log('  chat - Conversation and dialogue');
        console.log('');
        console.log('Usage: udev ok list');
    },

    /**
     * Initialize new OK tool project
     * @param {string} toolName - Name of tool to create
     * @param {string} targetDir - Target directory
     */
    init: (toolName, targetDir = '.') => {
        const toolDir = path.join(targetDir, toolName);
        
        // Create directory
        if (!fs.existsSync(toolDir)) {
            fs.mkdirSync(toolDir, { recursive: true });
            console.log(`📁 Created ${toolName} directory`);
        }

        // Create package.json
        const packageJson = {
            name: `@udos/${toolName}`,
            version: "1.0.0",
            description: `OK ${toolName} tool`,
            main: "dist/index.js",
            types: "dist/index.d.ts",
            scripts: {
                build: "tsc",
                start: "node dist/index.js",
                test: "jest"
            },
            dependencies: {
                "@udos/ok-base": "^1.0.0"
            },
            devDependencies: {
                typescript: "^5.0.0",
                jest: "^29.0.0"
            }
        };

        fs.writeFileSync(
            path.join(toolDir, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );
        console.log(`📄 Created package.json`);

        // Create src directory
        const srcDir = path.join(toolDir, 'src');
        fs.mkdirSync(srcDir, { recursive: true });

        // Create main tool file
        const toolContent = `import { OKTool, OKTask, OKResult } from '@udos/ok-base';

class ${toolName.charAt(0).toUpperCase() + toolName.slice(1)} implements OKTool {
    name = '${toolName}';
    capabilities = ['${toolName}'];

    async healthCheck() {
        return {
            status: 'healthy' as const,
            timestamp: new Date()
        };
    }

    async execute(task: OKTask): Promise<OKResult> {
        // TODO: Implement ${toolName} execution
        return {
            output: "`${toolName}` tool response",
            quality: 0.8,
            cost: 0.0,
            metadata: {
                taskId: task.id,
                tool: this.name,
                timestamp: new Date(),
                duration: 0
            }
        };
    }

    getMetadata() {
        return {
            name: this.name,
            version: '1.0.0',
            description: '${toolName} tool',
            capabilities: this.capabilities
        };
    }
}

module.exports = ${toolName.charAt(0).toUpperCase() + toolName.slice(1)};`;

        fs.writeFileSync(
            path.join(srcDir, 'index.ts'),
            toolContent
        );
        console.log(`📄 Created src/index.ts`);

        // Create README
        const readmeContent = `# ${toolName.charAt(0).toUpperCase() + toolName.slice(1)} Tool

OK ${toolName} tool implementation.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
node dist/index.js
\`\`\`

## Development

\`\`\`bash
npm run build
npm start
\`\`\`
`;

        fs.writeFileSync(
            path.join(toolDir, 'README.md'),
            readmeContent
        );
        console.log(`📄 Created README.md`);

        // Create tsconfig.json
        const tsconfig = {
            compilerOptions: {
                target: "ES2020",
                module: "CommonJS",
                outDir: "dist",
                rootDir: "src",
                strict: true,
                esModuleInterop: true,
                skipLibCheck: true,
                forceConsistentCasingInFileNames: true
            },
            include: ["src/**/*"],
            exclude: ["node_modules"]
        };

        fs.writeFileSync(
            path.join(toolDir, 'tsconfig.json'),
            JSON.stringify(tsconfig, null, 2)
        );
        console.log(`📄 Created tsconfig.json`);

        console.log(`✅ OK ${toolName} tool initialized successfully!`);
        console.log(`📍 Location: ${toolDir}`);
        console.log(`🚀 Next: cd ${toolName} && npm install`);
    },

    /**
     * Show OK status
     */
    status: () => {
        console.log('🔧 OK System Status:');
        console.log('  ✅ OK contracts implemented');
        console.log('  ✅ Layer scaffolding created');
        console.log('  ⏳ CLI integration in progress');
        console.log('');
        console.log('Next steps:');
        console.log('  1. Push changes to GitHub');
        console.log('  2. Write integration tests');
        console.log('  3. Test OK trinity workflow');
    },

    /**
     * Help command
     */
    help: () => {
        console.log('📖 OK Commands Help');
        console.log('');
        console.log('Usage:');
        console.log('  udev ok <command> [options]');
        console.log('');
        console.log('Commands:');
        console.log('  list          List available OK tools');
        console.log('  validate      Validate OK contract implementation');
        console.log('  init          Initialize new OK tool project');
        console.log('  status        Show OK system status');
        console.log('  help          Show this help message');
        console.log('');
        console.log('Examples:');
        console.log('  udev ok list');
        console.log('  udev ok validate ./src/tool.ts');
        console.log('  udev ok init reasoning ./my-tool');
    }
};

/**
 * Export OK commands
 */
module.exports = okCommands;
