import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';

// Window controls
const appWindow = getCurrentWindow();
document.getElementById('minimize-btn')?.addEventListener('click', () => appWindow.minimize());
document.getElementById('maximize-btn')?.addEventListener('click', () => appWindow.toggleMaximize());
document.getElementById('close-btn')?.addEventListener('click', () => appWindow.close());

// Auto-hide titlebar
let titlebarTimeout;
const titlebar = document.getElementById('titlebar');
function showTitlebar() {
    titlebar?.classList.remove('hide');
    clearTimeout(titlebarTimeout);
    titlebarTimeout = setTimeout(() => {
        if (!titlebar?.matches(':hover')) titlebar?.classList.add('hide');
    }, 1500);
}
window.addEventListener('mousemove', showTitlebar);
window.addEventListener('scroll', showTitlebar);
showTitlebar();

// Connection handling
let connected = false;
const statusDot = document.querySelector('.status-dot');
const statusText = document.getElementById('status-text');
const connectBtn = document.getElementById('connect-btn');

async function connectToCore() {
    try {
        await invoke('connect_core');
        connected = true;
        statusDot?.classList.remove('disconnected');
        statusDot?.classList.add('connected');
        statusText.textContent = 'Connected';
        connectBtn.textContent = 'Disconnect';
        connectBtn.style.background = 'var(--error)';
    } catch (err) {
        console.error('Connection failed:', err);
        statusText.textContent = 'Connection failed';
        setTimeout(() => {
            if (!connected) statusText.textContent = 'Disconnected';
        }, 3000);
    }
}

async function disconnectFromCore() {
    await invoke('disconnect');
    connected = false;
    statusDot?.classList.remove('connected');
    statusDot?.classList.add('disconnected');
    statusText.textContent = 'Disconnected';
    connectBtn.textContent = 'Connect';
    connectBtn.style.background = '';
}

connectBtn?.addEventListener('click', () => {
    if (connected) disconnectFromCore();
    else connectToCore();
});

// Load dashboard
async function loadDashboard() {
    try {
        // Try to load gauge demo first for demonstration
        const udx = await invoke('load_udx_from_vault', { filename: 'gauge-demo.udx' });
        renderDashboard(udx);
    } catch (err) {
        console.log('Gauge demo not found, loading regular dashboard:', err);
        try {
            const udx = await invoke('load_udx_from_vault', { filename: 'dashboard.udx' });
            renderDashboard(udx);
        } catch (err2) {
            console.error('Failed to load dashboard:', err2);
            document.getElementById('app').innerHTML = '<div class="loading">Dashboard not found. Create ~/Code/Vault/.udx/dashboard.udx</div>';
        }
    }
}

function renderDashboard(udx) {
    let html = `<h1>${udx.title}</h1>`;
    if (udx.description) html += `<p>${udx.description}</p>`;
    if (udx.blocks) {
        for (const block of udx.blocks) {
            if (block.type === 'teletext-page') {
                html += `<div class="teletext-page"><pre>${block.extra.content || ''}</pre></div>`;
            } else if (block.type === 'list') {
                html += `<div class="teletext-list"><pre>${block.extra.items || ''}</pre></div>`;
            } else if (block.type === 'gauge') {
                html += renderGauge(block.extra);
            } else {
                html += `<div class="teletext-block">${JSON.stringify(block)}</div>`;
            }
        }
    }
    document.getElementById('app').innerHTML = html;
}

// Gauge Plugin Renderer
function renderGauge(extra) {
    const value = Math.min(100, Math.max(0, extra.value || 0));
    const label = extra.label || 'Metric';
    const units = extra.units || '';
    
    return `
        <div style="
            background: rgba(0, 0, 0, 0.1);
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
            <div style="
                text-align: center;
                margin-bottom: 10px;
                font-size: 0.9em;
                font-weight: 500;
            ">${label}</div>
            <div style="
                height: 20px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                overflow: hidden;
                margin-bottom: 8px;
            ">
                <div style="
                    height: 100%;
                    width: ${value}%;
                    background: linear-gradient(90deg, #4a90e2, #00bcd4);
                    border-radius: 10px;
                    transition: width 0.5s ease;
                "></div>
            </div>
            <div style="
                text-align: center;
                font-family: monospace;
                font-size: 1.1em;
                font-weight: 600;
                color: #4a90e2;
            ">${value}${units}</div>
        </div>
    `;
}

// Listen to core events
listen('core-event', (event) => {
    const payload = event.payload.data;
    console.log('Core event:', payload);
    // Update UI based on event type
    if (payload.type === 'health') {
        // Could update a health widget
    }
});

// Theme loading
async function loadTheme(themeName) {
    try {
        console.log(`Loading theme: ${themeName}`);
        
        // Try to fetch the theme CSS
        const response = await fetch(`themes/${themeName}.css`);
        
        if (response.ok) {
            const css = await response.text();
            console.log(`Theme ${themeName} loaded successfully, length: ${css.length}`);
            
            const style = document.createElement('style');
            style.id = 'current-theme';
            style.textContent = css;
            
            // Remove old theme
            const oldTheme = document.getElementById('current-theme');
            if (oldTheme) oldTheme.remove();
            
            // Add new theme
            document.head.appendChild(style);
            
            // Save preference
            localStorage.setItem('theme', themeName);
            
            console.log(`Theme ${themeName} applied successfully`);
            return true;
        } else {
            // Fallback to default theme if theme not found
            console.warn(`Theme ${themeName} not found (HTTP ${response.status}), using default styling`);
            return false;
        }
    } catch (err) {
        console.error('Failed to load theme:', err);
        return false;
    }
}

// Load saved theme on startup
const savedTheme = localStorage.getItem('theme') || 'modern';
console.log(`Attempting to load saved theme: ${savedTheme}`);
loadTheme(savedTheme).then(success => {
    if (!success) {
        console.log('Falling back to inline styles for demo');
        // Add some basic inline styles for the gauges to work even without CSS
        addFallbackStyles();
    }
}).catch(() => {
    console.log('Using fallback styles for demo');
    addFallbackStyles();
});

function addFallbackStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .gauge-plugin {
            background: rgba(0, 0, 0, 0.1);
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .gauge-label {
            text-align: center;
            margin-bottom: 8px;
            font-size: 0.9em;
        }
        .gauge-container {
            height: 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            overflow: hidden;
        }
        .gauge-fill {
            height: 100%;
            background: linear-gradient(90deg, #4a90e2, #00bcd4);
            border-radius: 10px;
            transition: width 0.3s ease;
        }
        .gauge-value {
            text-align: center;
            margin-top: 5px;
            font-family: monospace;
        }
    `;
    document.head.appendChild(style);
}

// Start
loadDashboard();