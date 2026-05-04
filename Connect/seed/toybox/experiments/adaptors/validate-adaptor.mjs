#!/usr/bin/env node

import { readFile } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Basic adaptor YAML validator for uDos experiment adaptors
 * Validates structure and required fields using simple parsing
 */

function parseYamlSimple(yamlContent) {
    const result = {}
    let currentSection = null
    let currentList = null
    
    const lines = yamlContent.split('\n')
    
    for (const line of lines) {
        // Skip comments and empty lines
        if (line.trim().startsWith('#') || line.trim() === '') continue
        
        // Section headers (name:)
        const sectionMatch = line.match(/^(\w+):\s*(.*)$/)
        if (sectionMatch) {
            const key = sectionMatch[1]
            const value = sectionMatch[2].trim()
            
            if (value.startsWith('[') || value === '') {
                // Start of list or complex value
                result[key] = []
                currentSection = key
                currentList = result[key]
            } else if (value) {
                result[key] = value
                currentSection = null
                currentList = null
            }
            continue
        }
        
        // List items (starting with -)
        const listItemMatch = line.match(/^\s*-\s*(\w+):\s*(.*)$/)
        if (listItemMatch && currentList !== null) {
            const item = {}
            item[listItemMatch[1]] = listItemMatch[2]
            currentList.push(item)
            continue
        }
        
        // Simple list items
        const simpleListMatch = line.match(/^\s*-\s*(.+)$/)
        if (simpleListMatch && currentList !== null) {
            currentList.push(simpleListMatch[1])
            continue
        }
        
        // Nested properties (with indentation)
        const nestedMatch = line.match(/^\s{2}(\w+):\s*(.*)$/)
        if (nestedMatch && currentSection) {
            if (!result[currentSection].properties) {
                result[currentSection].properties = {}
            }
            result[currentSection].properties[nestedMatch[1]] = nestedMatch[2]
        }
    }
    
    return result
}

async function validateAdaptor(filePath) {
    try {
        const yamlContent = await readFile(filePath, 'utf8')
        const adaptor = parseYamlSimple(yamlContent)
        
        console.log(`🔍 Validating adaptor: ${adaptor.name || 'unknown'}`)
        
        // Basic structure validation
        const requiredFields = ['name', 'version', 'description']
        const missingFields = requiredFields.filter(field => !(field in adaptor))
        
        if (missingFields.length > 0) {
            console.error(`❌ Missing required fields: ${missingFields.join(', ')}`)
            return false
        }
        
        console.log(`   Name: ${adaptor.name}`)
        console.log(`   Version: ${adaptor.version}`)
        console.log(`   Description: ${adaptor.description}`)
        
        // Check for capabilities
        if (adaptor.capabilities && Array.isArray(adaptor.capabilities)) {
            console.log('✅ Capabilities found:', adaptor.capabilities.length, 'items')
        } else {
            console.warn('⚠️  No capabilities section found')
        }
        
        // Check for config
        if (adaptor.config) {
            console.log('✅ Config section found')
            if (adaptor.config.required) {
                console.log('   Required config:', adaptor.config.required.join(', '))
            }
        } else {
            console.warn('⚠️  No config section found')
        }
        
        // Check for commands
        if (adaptor.commands && Array.isArray(adaptor.commands)) {
            console.log('✅ Commands found:', adaptor.commands.length, 'commands')
            adaptor.commands.forEach(cmd => {
                console.log(`   - ${cmd.name || 'unnamed'}`)
            })
        } else {
            console.warn('⚠️  No commands section found')
        }
        
        console.log('✅ Adaptor validation completed successfully!')
        return true
        
    } catch (error) {
        console.error(`❌ Validation failed: ${error.message}`)
        return false
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2)
    
    if (args.length === 0) {
        console.log('Usage: node validate-adaptor.mjs <adaptor.yaml>')
        console.log('Example: node validate-adaptor.mjs wordpress.adaptor.yaml')
        process.exit(1)
    }
    
    const filePath = resolve(__dirname, args[0])
    const success = await validateAdaptor(filePath)
    
    process.exit(success ? 0 : 1)
}

main()