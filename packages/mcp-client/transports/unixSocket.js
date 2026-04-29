"use strict";
/**
 * uDos MCP Client - Unix Socket Transport
 *
 * Unix domain socket transport for Electron/Node.js environments
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnixSocketTransport = void 0;
const net = __importStar(require("net"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
/**
 * Unix socket transport implementation
 * Provides bidirectional communication over a Unix domain socket
 */
class UnixSocketTransport {
    constructor(config) {
        this.listeners = new Set();
        this.reconnectTimeout = null;
        this.reconnectAttempts = 0;
        this.config = {
            reconnect: true,
            maxReconnectDelay: 10000,
            ...config,
        };
    }
    /**
     * Connect to the Unix socket
     */
    async connect() {
        if (this.socket && !this.socket.destroyed) {
            // Already connected
            return;
        }
        // Ensure socket path exists and is valid
        this.ensureSocketPath();
        return new Promise((resolve, reject) => {
            this.notifier('connect');
            const sock = net.createConnection(this.config.socketPath, () => {
                this.socket = sock;
                this.reconnectAttempts = 0;
                this.notifier('connect');
                resolve();
            });
            sock.on('error', (error) => {
                this.handleConnectionError(error, reject);
            });
            sock.on('close', () => {
                this.handleConnectionClose();
            });
            sock.on('end', () => {
                this.handleConnectionClose();
            });
            // Set timeout
            sock.setTimeout(this.config.timeout || 5000, () => {
                sock.destroy(new Error('Connection timeout'));
            });
            // Setup data handler
            let buffer = Buffer.alloc(0);
            sock.on('data', (data) => {
                buffer = Buffer.concat([buffer, data]);
                this.handleIncomingData(buffer);
            });
        });
    }
    /**
     * Disconnect from the socket
     */
    async disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.socket) {
            this.socket.destroy();
            this.socket = undefined;
        }
        this.notifier('disconnect');
    }
    /**
     * Check if connected
     */
    isConnected() {
        return this.socket !== undefined && !this.socket.destroyed;
    }
    /**
     * Send a message to the server
     */
    async send(message) {
        if (!this.socket || this.socket.destroyed) {
            throw new Error('Not connected to socket');
        }
        return new Promise((resolve, reject) => {
            const messageStr = JSON.stringify(message) + '\n';
            this.socket.write(messageStr, 'utf8', (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    /**
     * Send a request and wait for response
     */
    async request(request) {
        if (!this.socket || this.socket.destroyed) {
            throw new Error('Not connected to socket');
        }
        // Send the request
        await this.send(request);
        // Wait for response with matching id
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Request timeout: ${request.method}`));
            }, this.config.timeout || 5000);
            const listener = (event) => {
                if (event.type === 'message' && event.message.type === 'response') {
                    const response = event.message;
                    if (response.id === request.id) {
                        clearTimeout(timeout);
                        this.listeners.delete(listener);
                        if (response.error) {
                            reject(new Error(response.error.message));
                        }
                        else {
                            resolve(response);
                        }
                    }
                }
            };
            this.listeners.add(listener);
        });
    }
    /**
     * Add event listener
     */
    on(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    /**
     * Remove event listener
     */
    off(listener) {
        this.listeners.delete(listener);
    }
    /**
     * Notify all listeners of an event
     */
    notifier(type, data, error) {
        const event = { type, data, error, timestamp: new Date() };
        this.listeners.forEach((listener) => {
            try {
                listener(event);
            }
            catch (e) {
                console.error('Transport listener error:', e);
            }
        });
    }
    /**
     * Handle incoming data (message framing)
     * Messages are newline-delimited JSON
     */
    handleIncomingData(buffer) {
        let offset = 0;
        while (offset < buffer.length) {
            // Find the next newline
            const newlineIndex = buffer.indexOf('\n', offset);
            if (newlineIndex === -1) {
                // No complete message yet
                break;
            }
            // Extract complete message
            const messageStr = buffer.subarray(offset, newlineIndex).toString('utf8');
            offset = newlineIndex + 1;
            if (messageStr.trim()) {
                try {
                    const message = JSON.parse(messageStr);
                    this.notifier('message', message);
                }
                catch (e) {
                    console.error('Failed to parse MCP message:', e, messageStr);
                }
            }
        }
        // Keep remaining incomplete data
        if (offset > 0 && offset < buffer.length) {
            const remaining = buffer.subarray(offset);
            // Reset buffer with remaining data
            // Note: This is simplified - in production, we'd need to maintain state
        }
    }
    /**
     * Handle connection error
     */
    handleConnectionError(error, reject) {
        this.notifier('error', undefined, error);
        if (this.config.reconnect && this.reconnectAttempts < UnixSocketTransport.MAX_RECONNECT_ATTEMPTS) {
            this.scheduleReconnect();
        }
        reject(error);
    }
    /**
     * Handle connection close
     */
    handleConnectionClose() {
        this.notifier('disconnect');
        if (this.config.reconnect && this.reconnectAttempts < UnixSocketTransport.MAX_RECONNECT_ATTEMPTS) {
            this.scheduleReconnect();
        }
        this.socket = undefined;
    }
    /**
     * Schedule reconnection with exponential backoff
     */
    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = Math.min(UnixSocketTransport.RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts), this.config.maxReconnectDelay || 10000);
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        this.reconnectTimeout = setTimeout(async () => {
            try {
                await this.connect();
            }
            catch (e) {
                // Error is already handled in handleConnectionError
            }
        }, delay);
    }
    /**
     * Ensure socket path exists and is a valid socket
     */
    ensureSocketPath() {
        const socketPath = this.config.socketPath;
        // Expand ~ in path
        const expandedPath = socketPath.replace(/^~/, os.homedir());
        // Check if socket file exists
        if (!fs.existsSync(expandedPath)) {
            // Try to create parent directory if it doesn't exist
            const dir = path.dirname(expandedPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }
        // Update config with expanded path
        this.config.socketPath = expandedPath;
    }
}
exports.UnixSocketTransport = UnixSocketTransport;
UnixSocketTransport.MAX_RECONNECT_ATTEMPTS = 5;
UnixSocketTransport.RECONNECT_DELAY = 1000; // ms
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5peFNvY2tldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90cmFuc3BvcnRzL3VuaXhTb2NrZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0dBSUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILHlDQUEyQjtBQUMzQix1Q0FBeUI7QUFDekIsMkNBQTZCO0FBQzdCLHVDQUF5QjtBQVd6Qjs7O0dBR0c7QUFDSCxNQUFhLG1CQUFtQjtJQVM5QixZQUFZLE1BQXdCO1FBTjVCLGNBQVMsR0FBZ0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNuRCxxQkFBZ0IsR0FBMEIsSUFBSSxDQUFDO1FBQy9DLHNCQUFpQixHQUFHLENBQUMsQ0FBQztRQUs1QixJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ1osU0FBUyxFQUFFLElBQUk7WUFDZixpQkFBaUIsRUFBRSxLQUFLO1lBQ3hCLEdBQUcsTUFBTTtTQUNWLENBQUM7SUFDSixDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsT0FBTztRQUNYLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDMUMsb0JBQW9CO1lBQ3BCLE9BQU87UUFDVCxDQUFDO1FBRUQseUNBQXlDO1FBQ3pDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRXhCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDckMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFnQixDQUFDLENBQUM7WUFFaEMsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRTtnQkFDN0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFD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Q0FBQztZQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ1gsb0RBQW9EO1lBQ3RELENBQUM7UUFDSCxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDWixDQUFDO0lBRUQ7O09BRUc7SUFDSyxnQkFBZ0I7UUFDdEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7UUFFMUMsbUJBQW1CO1FBQ25CLE1BQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRTVELDhCQUE4QjtRQUM5QixJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO1lBQ2pDLHFEQUFxRDtZQUNyRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3hCLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDekMsQ0FBQztRQUNILENBQUM7UUFFRCxtQ0FBbUM7UUFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDO0lBQ3hDLENBQUM7O0FBelJILGtEQTBSQztBQXBSeUIsMENBQXNCLEdBQUcsQ0FBQyxBQUFKLENBQUs7QUFDM0IsbUNBQWUsR0FBRyxJQUFJLEFBQVAsQ0FBUSxDQUFDLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIHVEb3MgTUNQIENsaWVudCAtIFVuaXggU29ja2V0IFRyYW5zcG9ydFxuICogXG4gKiBVbml4IGRvbWFpbiBzb2NrZXQgdHJhbnNwb3J0IGZvciBFbGVjdHJvbi9Ob2RlLmpzIGVudmlyb25tZW50c1xuICovXG5cbmltcG9ydCAqIGFzIG5ldCBmcm9tICduZXQnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcbmltcG9ydCB7IE1DUE1lc3NhZ2UsIE1DUFJlcXVlc3QsIE1DUFJlc3BvbnNlIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgVHJhbnNwb3J0LCBUcmFuc3BvcnRDb25maWcsIFRyYW5zcG9ydEV2ZW50TGlzdGVuZXIgfSBmcm9tICcuL2Jhc2UnO1xuXG4vKipcbiAqIFVuaXggc29ja2V0IHRyYW5zcG9ydCBjb25maWd1cmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVW5peFNvY2tldENvbmZpZyBleHRlbmRzIFRyYW5zcG9ydENvbmZpZyB7XG4gIHNvY2tldFBhdGg6IHN0cmluZztcbn1cblxuLyoqXG4gKiBVbml4IHNvY2tldCB0cmFuc3BvcnQgaW1wbGVtZW50YXRpb25cbiAqIFByb3ZpZGVzIGJpZGlyZWN0aW9uYWwgY29tbXVuaWNhdGlvbiBvdmVyIGEgVW5peCBkb21haW4gc29ja2V0XG4gKi9cbmV4cG9ydCBjbGFzcyBVbml4U29ja2V0VHJhbnNwb3J0IGltcGxlbWVudHMgVHJhbnNwb3J0IHtcbiAgcHJpdmF0ZSBzb2NrZXQ/OiBuZXQuU29ja2V0O1xuICBwcml2YXRlIGNvbmZpZzogVW5peFNvY2tldENvbmZpZztcbiAgcHJpdmF0ZSBsaXN0ZW5lcnM6IFNldDxUcmFuc3BvcnRFdmVudExpc3RlbmVyPiA9IG5ldyBTZXQoKTtcbiAgcHJpdmF0ZSByZWNvbm5lY3RUaW1lb3V0OiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHJlY29ubmVjdEF0dGVtcHRzID0gMDtcbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgTUFYX1JFQ09OTkVDVF9BVFRFTVBUUyA9IDU7XG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IFJFQ09OTkVDVF9ERUxBWSA9IDEwMDA7IC8vIG1zXG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBVbml4U29ja2V0Q29uZmlnKSB7XG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICByZWNvbm5lY3Q6IHRydWUsXG4gICAgICBtYXhSZWNvbm5lY3REZWxheTogMTAwMDAsXG4gICAgICAuLi5jb25maWcsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25uZWN0IHRvIHRoZSBVbml4IHNvY2tldFxuICAgKi9cbiAgYXN5bmMgY29ubmVjdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5zb2NrZXQgJiYgIXRoaXMuc29ja2V0LmRlc3Ryb3llZCkge1xuICAgICAgLy8gQWxyZWFkeSBjb25uZWN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBFbnN1cmUgc29ja2V0IHBhdGggZXhpc3RzIGFuZCBpcyB2YWxpZFxuICAgIHRoaXMuZW5zdXJlU29ja2V0UGF0aCgpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMubm90aWZpZXIoJ2Nvbm5lY3QnIGFzIGFueSk7XG5cbiAgICAgIGNvbnN0IHNvY2sgPSBuZXQuY3JlYXRlQ29ubmVjdGlvbih0aGlzLmNvbmZpZy5zb2NrZXRQYXRoLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuc29ja2V0ID0gc29jaztcbiAgICAgICAgdGhpcy5yZWNvbm5lY3RBdHRlbXB0cyA9IDA7XG4gICAgICAgIHRoaXMubm90aWZpZXIoJ2Nvbm5lY3QnKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIHNvY2sub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICAgIHRoaXMuaGFuZGxlQ29ubmVjdGlvbkVycm9yKGVycm9yLCByZWplY3QpO1xuICAgICAgfSk7XG5cbiAgICAgIHNvY2sub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICB0aGlzLmhhbmRsZUNvbm5lY3Rpb25DbG9zZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIHNvY2sub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgdGhpcy5oYW5kbGVDb25uZWN0aW9uQ2xvc2UoKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBTZXQgdGltZW91dFxuICAgICAgc29jay5zZXRUaW1lb3V0KHRoaXMuY29uZmlnLnRpbWVvdXQgfHwgNTAwMCwgKCkgPT4ge1xuICAgICAgICBzb2NrLmRlc3Ryb3kobmV3IEVycm9yKCdDb25uZWN0aW9uIHRpbWVvdXQnKSk7XG4gICAgICB9KTtcblxuICAgICAgLy8gU2V0dXAgZGF0YSBoYW5kbGVyXG4gICAgICBsZXQgYnVmZmVyID0gQnVmZmVyLmFsbG9jKDApO1xuICAgICAgc29jay5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAgIGJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoW2J1ZmZlciwgZGF0YV0pO1xuICAgICAgICB0aGlzLmhhbmRsZUluY29taW5nRGF0YShidWZmZXIpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGlzY29ubmVjdCBmcm9tIHRoZSBzb2NrZXRcbiAgICovXG4gIGFzeW5jIGRpc2Nvbm5lY3QoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMucmVjb25uZWN0VGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMucmVjb25uZWN0VGltZW91dCk7XG4gICAgICB0aGlzLnJlY29ubmVjdFRpbWVvdXQgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNvY2tldCkge1xuICAgICAgdGhpcy5zb2NrZXQuZGVzdHJveSgpO1xuICAgICAgdGhpcy5zb2NrZXQgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdGhpcy5ub3RpZmllcignZGlzY29ubmVjdCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGNvbm5lY3RlZFxuICAgKi9cbiAgaXNDb25uZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0ICE9PSB1bmRlZmluZWQgJiYgIXRoaXMuc29ja2V0LmRlc3Ryb3llZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIGEgbWVzc2FnZSB0byB0aGUgc2VydmVyXG4gICAqL1xuICBhc3luYyBzZW5kKG1lc3NhZ2U6IE1DUE1lc3NhZ2UpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuc29ja2V0IHx8IHRoaXMuc29ja2V0LmRlc3Ryb3llZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgY29ubmVjdGVkIHRvIHNvY2tldCcpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBtZXNzYWdlU3RyID0gSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkgKyAnXFxuJztcbiAgICAgIHRoaXMuc29ja2V0IS53cml0ZShtZXNzYWdlU3RyLCAndXRmOCcsIChlcnJvcikgPT4ge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBhIHJlcXVlc3QgYW5kIHdhaXQgZm9yIHJlc3BvbnNlXG4gICAqL1xuICBhc3luYyByZXF1ZXN0PFQ+KHJlcXVlc3Q6IE1DUFJlcXVlc3QpOiBQcm9taXNlPE1DUFJlc3BvbnNlPFQ+PiB7XG4gICAgaWYgKCF0aGlzLnNvY2tldCB8fCB0aGlzLnNvY2tldC5kZXN0cm95ZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGNvbm5lY3RlZCB0byBzb2NrZXQnKTtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgYXdhaXQgdGhpcy5zZW5kKHJlcXVlc3QpO1xuXG4gICAgLy8gV2FpdCBmb3IgcmVzcG9uc2Ugd2l0aCBtYXRjaGluZyBpZFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFJlcXVlc3QgdGltZW91dDogJHtyZXF1ZXN0Lm1ldGhvZH1gKSk7XG4gICAgICB9LCB0aGlzLmNvbmZpZy50aW1lb3V0IHx8IDUwMDApO1xuXG4gICAgICBjb25zdCBsaXN0ZW5lcjogVHJhbnNwb3J0RXZlbnRMaXN0ZW5lciA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ21lc3NhZ2UnICYmIChldmVudCBhcyBhbnkpLm1lc3NhZ2UudHlwZSA9PT0gJ3Jlc3BvbnNlJykge1xuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gKGV2ZW50IGFzIGFueSkubWVzc2FnZSBhcyBNQ1BSZXNwb25zZTxUPjtcbiAgICAgICAgICBpZiAocmVzcG9uc2UuaWQgPT09IHJlcXVlc3QuaWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UuZXJyb3IpIHtcbiAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihyZXNwb25zZS5lcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHRoaXMubGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGV2ZW50IGxpc3RlbmVyXG4gICAqL1xuICBvbihsaXN0ZW5lcjogVHJhbnNwb3J0RXZlbnRMaXN0ZW5lcik6ICgpID0+IHZvaWQge1xuICAgIHRoaXMubGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgcmV0dXJuICgpID0+IHRoaXMubGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVyXG4gICAqL1xuICBvZmYobGlzdGVuZXI6IFRyYW5zcG9ydEV2ZW50TGlzdGVuZXIpOiB2b2lkIHtcbiAgICB0aGlzLmxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vdGlmeSBhbGwgbGlzdGVuZXJzIG9mIGFuIGV2ZW50XG4gICAqL1xuICBwcml2YXRlIG5vdGlmaWVyKHR5cGU6ICdjb25uZWN0JyB8ICdkaXNjb25uZWN0JyB8ICdlcnJvcicgfCAnbWVzc2FnZScsIGRhdGE/OiBhbnksIGVycm9yPzogRXJyb3IpOiB2b2lkIHtcbiAgICBjb25zdCBldmVudCA9IHsgdHlwZSwgZGF0YSwgZXJyb3IsIHRpbWVzdGFtcDogbmV3IERhdGUoKSB9O1xuICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBsaXN0ZW5lcihldmVudCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RyYW5zcG9ydCBsaXN0ZW5lciBlcnJvcjonLCBlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgaW5jb21pbmcgZGF0YSAobWVzc2FnZSBmcmFtaW5nKVxuICAgKiBNZXNzYWdlcyBhcmUgbmV3bGluZS1kZWxpbWl0ZWQgSlNPTlxuICAgKi9cbiAgcHJpdmF0ZSBoYW5kbGVJbmNvbWluZ0RhdGEoYnVmZmVyOiBCdWZmZXIpOiB2b2lkIHtcbiAgICBsZXQgb2Zmc2V0ID0gMDtcbiAgICBcbiAgICB3aGlsZSAob2Zmc2V0IDwgYnVmZmVyLmxlbmd0aCkge1xuICAgICAgLy8gRmluZCB0aGUgbmV4dCBuZXdsaW5lXG4gICAgICBjb25zdCBuZXdsaW5lSW5kZXggPSBidWZmZXIuaW5kZXhPZignXFxuJywgb2Zmc2V0KTtcbiAgICAgIFxuICAgICAgaWYgKG5ld2xpbmVJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgLy8gTm8gY29tcGxldGUgbWVzc2FnZSB5ZXRcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8vIEV4dHJhY3QgY29tcGxldGUgbWVzc2FnZVxuICAgICAgY29uc3QgbWVzc2FnZVN0ciA9IGJ1ZmZlci5zdWJhcnJheShvZmZzZXQsIG5ld2xpbmVJbmRleCkudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgIG9mZnNldCA9IG5ld2xpbmVJbmRleCArIDE7XG5cbiAgICAgIGlmIChtZXNzYWdlU3RyLnRyaW0oKSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IG1lc3NhZ2U6IE1DUE1lc3NhZ2UgPSBKU09OLnBhcnNlKG1lc3NhZ2VTdHIpO1xuICAgICAgICAgIHRoaXMubm90aWZpZXIoJ21lc3NhZ2UnLCBtZXNzYWdlIGFzIGFueSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcGFyc2UgTUNQIG1lc3NhZ2U6JywgZSwgbWVzc2FnZVN0cik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBLZWVwIHJlbWFpbmluZyBpbmNvbXBsZXRlIGRhdGFcbiAgICBpZiAob2Zmc2V0ID4gMCAmJiBvZmZzZXQgPCBidWZmZXIubGVuZ3RoKSB7XG4gICAgICBjb25zdCByZW1haW5pbmcgPSBidWZmZXIuc3ViYXJyYXkob2Zmc2V0KTtcbiAgICAgIC8vIFJlc2V0IGJ1ZmZlciB3aXRoIHJlbWFpbmluZyBkYXRhXG4gICAgICAvLyBOb3RlOiBUaGlzIGlzIHNpbXBsaWZpZWQgLSBpbiBwcm9kdWN0aW9uLCB3ZSdkIG5lZWQgdG8gbWFpbnRhaW4gc3RhdGVcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGNvbm5lY3Rpb24gZXJyb3JcbiAgICovXG4gIHByaXZhdGUgaGFuZGxlQ29ubmVjdGlvbkVycm9yKGVycm9yOiBFcnJvciwgcmVqZWN0OiAoZTogRXJyb3IpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLm5vdGlmaWVyKCdlcnJvcicsIHVuZGVmaW5lZCwgZXJyb3IpO1xuICAgIFxuICAgIGlmICh0aGlzLmNvbmZpZy5yZWNvbm5lY3QgJiYgdGhpcy5yZWNvbm5lY3RBdHRlbXB0cyA8IFVuaXhTb2NrZXRUcmFuc3BvcnQuTUFYX1JFQ09OTkVDVF9BVFRFTVBUUykge1xuICAgICAgdGhpcy5zY2hlZHVsZVJlY29ubmVjdCgpO1xuICAgIH1cblxuICAgIHJlamVjdChlcnJvcik7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGNvbm5lY3Rpb24gY2xvc2VcbiAgICovXG4gIHByaXZhdGUgaGFuZGxlQ29ubmVjdGlvbkNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMubm90aWZpZXIoJ2Rpc2Nvbm5lY3QnKTtcbiAgICBcbiAgICBpZiAodGhpcy5jb25maWcucmVjb25uZWN0ICYmIHRoaXMucmVjb25uZWN0QXR0ZW1wdHMgPCBVbml4U29ja2V0VHJhbnNwb3J0Lk1BWF9SRUNPTk5FQ1RfQVRURU1QVFMpIHtcbiAgICAgIHRoaXMuc2NoZWR1bGVSZWNvbm5lY3QoKTtcbiAgICB9XG5cbiAgICB0aGlzLnNvY2tldCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY2hlZHVsZSByZWNvbm5lY3Rpb24gd2l0aCBleHBvbmVudGlhbCBiYWNrb2ZmXG4gICAqL1xuICBwcml2YXRlIHNjaGVkdWxlUmVjb25uZWN0KCk6IHZvaWQge1xuICAgIHRoaXMucmVjb25uZWN0QXR0ZW1wdHMrKztcbiAgICBjb25zdCBkZWxheSA9IE1hdGgubWluKFxuICAgICAgVW5peFNvY2tldFRyYW5zcG9ydC5SRUNPTk5FQ1RfREVMQVkgKiBNYXRoLnBvdygyLCB0aGlzLnJlY29ubmVjdEF0dGVtcHRzKSxcbiAgICAgIHRoaXMuY29uZmlnLm1heFJlY29ubmVjdERlbGF5IHx8IDEwMDAwXG4gICAgKTtcblxuICAgIGlmICh0aGlzLnJlY29ubmVjdFRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlY29ubmVjdFRpbWVvdXQpO1xuICAgIH1cblxuICAgIHRoaXMucmVjb25uZWN0VGltZW91dCA9IHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5jb25uZWN0KCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIEVycm9yIGlzIGFscmVhZHkgaGFuZGxlZCBpbiBoYW5kbGVDb25uZWN0aW9uRXJyb3JcbiAgICAgIH1cbiAgICB9LCBkZWxheSk7XG4gIH1cblxuICAvKipcbiAgICogRW5zdXJlIHNvY2tldCBwYXRoIGV4aXN0cyBhbmQgaXMgYSB2YWxpZCBzb2NrZXRcbiAgICovXG4gIHByaXZhdGUgZW5zdXJlU29ja2V0UGF0aCgpOiB2b2lkIHtcbiAgICBjb25zdCBzb2NrZXRQYXRoID0gdGhpcy5jb25maWcuc29ja2V0UGF0aDtcbiAgICBcbiAgICAvLyBFeHBhbmQgfiBpbiBwYXRoXG4gICAgY29uc3QgZXhwYW5kZWRQYXRoID0gc29ja2V0UGF0aC5yZXBsYWNlKC9efi8sIG9zLmhvbWVkaXIoKSk7XG4gICAgXG4gICAgLy8gQ2hlY2sgaWYgc29ja2V0IGZpbGUgZXhpc3RzXG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGV4cGFuZGVkUGF0aCkpIHtcbiAgICAgIC8vIFRyeSB0byBjcmVhdGUgcGFyZW50IGRpcmVjdG9yeSBpZiBpdCBkb2Vzbid0IGV4aXN0XG4gICAgICBjb25zdCBkaXIgPSBwYXRoLmRpcm5hbWUoZXhwYW5kZWRQYXRoKTtcbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyhkaXIpKSB7XG4gICAgICAgIGZzLm1rZGlyU3luYyhkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBjb25maWcgd2l0aCBleHBhbmRlZCBwYXRoXG4gICAgdGhpcy5jb25maWcuc29ja2V0UGF0aCA9IGV4cGFuZGVkUGF0aDtcbiAgfVxufVxuIl19