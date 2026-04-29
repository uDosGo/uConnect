"use strict";
/**
 * uDos MCP Client - HTTP Transport
 *
 * HTTP/REST transport for browser and Node.js environments
 * Useful when connecting via mcp-gateway
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPTransport = void 0;
/**
 * HTTP transport implementation
 * Provides HTTP/REST-based communication with the MCP server via gateway
 */
class HTTPTransport {
    constructor(config) {
        this.listeners = new Set();
        this.pendingRequests = new Map();
        this.config = {
            timeout: 5000,
            maxReconnectDelay: 10000,
            ...config,
        };
    }
    /**
     * Connect to the HTTP endpoint
     * For HTTP, this is mostly a no-op since each request is independent
     */
    async connect() {
        this.notifier('connect');
        // HTTP is connectionless, so we just test connectivity
        await this.testConnection();
    }
    /**
     * Disconnect from the HTTP endpoint
     */
    async disconnect() {
        // Clear all pending requests
        for (const [, value] of this.pendingRequests) {
            clearTimeout(value.timeout);
            value.reject(new Error('Disconnected'));
        }
        this.pendingRequests.clear();
        this.notifier('disconnect');
    }
    /**
     * Check if connected
     * For HTTP, we return true if the endpoint is reachable
     */
    isConnected() {
        // HTTP is connectionless, so we assume connected if last request succeeded
        // In a real implementation, we might want to track this differently
        return true;
    }
    /**
     * Send a message to the server
     * For HTTP transport, we use POST requests
     */
    async send(message) {
        // For HTTP transport, send is the same as request since we need to send and receive
        if (message.type !== 'request') {
            throw new Error('HTTP transport only supports request messages');
        }
        await this.sendHTTP(message);
    }
    /**
     * Send a request and wait for response
     */
    async request(request) {
        return this.sendHTTP(request);
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
     * Test connection to the endpoint
     */
    async testConnection() {
        try {
            const response = await fetch(`${this.config.endpoint}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(this.config.timeout || 5000),
            });
            if (!response.ok) {
                throw new Error(`Connection test failed: ${response.statusText}`);
            }
        }
        catch (error) {
            this.notifier('error', undefined, error);
            throw error;
        }
    }
    /**
     * Send HTTP request to the gateway
     */
    async sendHTTP(request) {
        // Determine if we're in Node.js or browser
        const isNode = typeof window === 'undefined';
        try {
            // Build the request body
            const body = JSON.stringify(request);
            // Use fetch API (works in both Node 18+ and browsers)
            const response = await fetch(`${this.config.endpoint}/mcp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body,
                signal: AbortSignal.timeout(this.config.timeout || 5000),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            const responseBody = await response.json();
            // For HTTP transport, we expect the response to be direct
            if (responseBody.type !== 'response') {
                throw new Error('Invalid response type from server');
            }
            if (responseBody.error) {
                throw new Error(responseBody.error.message);
            }
            return responseBody;
        }
        catch (error) {
            this.notifier('error', undefined, error);
            throw error;
        }
    }
}
exports.HTTPTransport = HTTPTransport;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90cmFuc3BvcnRzL2h0dHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7OztHQUtHOzs7QUFZSDs7O0dBR0c7QUFDSCxNQUFhLGFBQWE7SUFLeEIsWUFBWSxNQUFrQjtRQUh0QixjQUFTLEdBQWdDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDbkQsb0JBQWUsR0FBaUgsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUdoSixJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ1osT0FBTyxFQUFFLElBQUk7WUFDYixpQkFBaUIsRUFBRSxLQUFLO1lBQ3hCLEdBQUcsTUFBTTtTQUNWLENBQUM7SUFDSixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLE9BQU87UUFDWCxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pCLHVEQUF1RDtRQUN2RCxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsVUFBVTtRQUNkLDZCQUE2QjtRQUM3QixLQUFLLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUM3QyxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzVCLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBQ0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUU3QixJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxXQUFXO1FBQ1QsMkVBQTJFO1FBQzNFLG9FQUFvRTtRQUNwRSxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENB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QUUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUM7YUFDekQsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDakIsTUFBTSxTQUFTLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxRQUFRLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRSxDQUFDLENBQUM7WUFDM0QsQ0FBQztZQUVELE1BQU0sWUFBWSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBb0IsQ0FBQztZQUU3RCwwREFBMEQ7WUFDMUQsSUFBSSxZQUFZLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBRSxDQUFDO2dCQUNyQyxNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7WUFDdkQsQ0FBQztZQUVELElBQUksWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUN2QixNQUFNLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUMsQ0FBQztZQUVELE9BQU8sWUFBWSxDQUFDO1FBQ3RCLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQWMsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sS0FBSyxDQUFDO1FBQ2QsQ0FBQztJQUNILENBQUM7Q0FDRjtBQS9KRCxzQ0ErSkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIHVEb3MgTUNQIENsaWVudCAtIEhUVFAgVHJhbnNwb3J0XG4gKiBcbiAqIEhUVFAvUkVTVCB0cmFuc3BvcnQgZm9yIGJyb3dzZXIgYW5kIE5vZGUuanMgZW52aXJvbm1lbnRzXG4gKiBVc2VmdWwgd2hlbiBjb25uZWN0aW5nIHZpYSBtY3AtZ2F0ZXdheVxuICovXG5cbmltcG9ydCB7IE1DUE1lc3NhZ2UsIE1DUFJlcXVlc3QsIE1DUFJlc3BvbnNlIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgVHJhbnNwb3J0LCBUcmFuc3BvcnRDb25maWcsIFRyYW5zcG9ydEV2ZW50TGlzdGVuZXIsIFRyYW5zcG9ydEV2ZW50LCBUcmFuc3BvcnRFdmVudFR5cGUgfSBmcm9tICcuL2Jhc2UnO1xuXG4vKipcbiAqIEhUVFAgdHJhbnNwb3J0IGNvbmZpZ3VyYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIVFRQQ29uZmlnIGV4dGVuZHMgVHJhbnNwb3J0Q29uZmlnIHtcbiAgZW5kcG9pbnQ6IHN0cmluZztcbn1cblxuLyoqXG4gKiBIVFRQIHRyYW5zcG9ydCBpbXBsZW1lbnRhdGlvblxuICogUHJvdmlkZXMgSFRUUC9SRVNULWJhc2VkIGNvbW11bmljYXRpb24gd2l0aCB0aGUgTUNQIHNlcnZlciB2aWEgZ2F0ZXdheVxuICovXG5leHBvcnQgY2xhc3MgSFRUUFRyYW5zcG9ydCBpbXBsZW1lbnRzIFRyYW5zcG9ydCB7XG4gIHByaXZhdGUgY29uZmlnOiBIVFRQQ29uZmlnO1xuICBwcml2YXRlIGxpc3RlbmVyczogU2V0PFRyYW5zcG9ydEV2ZW50TGlzdGVuZXI+ID0gbmV3IFNldCgpO1xuICBwcml2YXRlIHBlbmRpbmdSZXF1ZXN0czogTWFwPHN0cmluZywgeyByZXNvbHZlOiAocjogTUNQUmVzcG9uc2U8YW55PikgPT4gdm9pZDsgcmVqZWN0OiAoZTogRXJyb3IpID0+IHZvaWQ7IHRpbWVvdXQ6IE5vZGVKUy5UaW1lb3V0IH0+ID0gbmV3IE1hcCgpO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSFRUUENvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgdGltZW91dDogNTAwMCxcbiAgICAgIG1heFJlY29ubmVjdERlbGF5OiAxMDAwMCxcbiAgICAgIC4uLmNvbmZpZyxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbm5lY3QgdG8gdGhlIEhUVFAgZW5kcG9pbnRcbiAgICogRm9yIEhUVFAsIHRoaXMgaXMgbW9zdGx5IGEgbm8tb3Agc2luY2UgZWFjaCByZXF1ZXN0IGlzIGluZGVwZW5kZW50XG4gICAqL1xuICBhc3luYyBjb25uZWN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMubm90aWZpZXIoJ2Nvbm5lY3QnKTtcbiAgICAvLyBIVFRQIGlzIGNvbm5lY3Rpb25sZXNzLCBzbyB3ZSBqdXN0IHRlc3QgY29ubmVjdGl2aXR5XG4gICAgYXdhaXQgdGhpcy50ZXN0Q29ubmVjdGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc2Nvbm5lY3QgZnJvbSB0aGUgSFRUUCBlbmRwb2ludFxuICAgKi9cbiAgYXN5bmMgZGlzY29ubmVjdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBDbGVhciBhbGwgcGVuZGluZyByZXF1ZXN0c1xuICAgIGZvciAoY29uc3QgWywgdmFsdWVdIG9mIHRoaXMucGVuZGluZ1JlcXVlc3RzKSB7XG4gICAgICBjbGVhclRpbWVvdXQodmFsdWUudGltZW91dCk7XG4gICAgICB2YWx1ZS5yZWplY3QobmV3IEVycm9yKCdEaXNjb25uZWN0ZWQnKSk7XG4gICAgfVxuICAgIHRoaXMucGVuZGluZ1JlcXVlc3RzLmNsZWFyKCk7XG4gICAgXG4gICAgdGhpcy5ub3RpZmllcignZGlzY29ubmVjdCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGNvbm5lY3RlZFxuICAgKiBGb3IgSFRUUCwgd2UgcmV0dXJuIHRydWUgaWYgdGhlIGVuZHBvaW50IGlzIHJlYWNoYWJsZVxuICAgKi9cbiAgaXNDb25uZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgLy8gSFRUUCBpcyBjb25uZWN0aW9ubGVzcywgc28gd2UgYXNzdW1lIGNvbm5lY3RlZCBpZiBsYXN0IHJlcXVlc3Qgc3VjY2VlZGVkXG4gICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB3ZSBtaWdodCB3YW50IHRvIHRyYWNrIHRoaXMgZGlmZmVyZW50bHlcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIGEgbWVzc2FnZSB0byB0aGUgc2VydmVyXG4gICAqIEZvciBIVFRQIHRyYW5zcG9ydCwgd2UgdXNlIFBPU1QgcmVxdWVzdHNcbiAgICovXG4gIGFzeW5jIHNlbmQobWVzc2FnZTogTUNQTWVzc2FnZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIEZvciBIVFRQIHRyYW5zcG9ydCwgc2VuZCBpcyB0aGUgc2FtZSBhcyByZXF1ZXN0IHNpbmNlIHdlIG5lZWQgdG8gc2VuZCBhbmQgcmVjZWl2ZVxuICAgIGlmIChtZXNzYWdlLnR5cGUgIT09ICdyZXF1ZXN0Jykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdIVFRQIHRyYW5zcG9ydCBvbmx5IHN1cHBvcnRzIHJlcXVlc3QgbWVzc2FnZXMnKTtcbiAgICB9XG4gICAgXG4gICAgYXdhaXQgdGhpcy5zZW5kSFRUUChtZXNzYWdlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIGEgcmVxdWVzdCBhbmQgd2FpdCBmb3IgcmVzcG9uc2VcbiAgICovXG4gIGFzeW5jIHJlcXVlc3Q8VD4ocmVxdWVzdDogTUNQUmVxdWVzdCk6IFByb21pc2U8TUNQUmVzcG9uc2U8VD4+IHtcbiAgICByZXR1cm4gdGhpcy5zZW5kSFRUUDxUPihyZXF1ZXN0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgZXZlbnQgbGlzdGVuZXJcbiAgICovXG4gIG9uKGxpc3RlbmVyOiBUcmFuc3BvcnRFdmVudExpc3RlbmVyKTogKCkgPT4gdm9pZCB7XG4gICAgdGhpcy5saXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgICByZXR1cm4gKCkgPT4gdGhpcy5saXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJcbiAgICovXG4gIG9mZihsaXN0ZW5lcjogVHJhbnNwb3J0RXZlbnRMaXN0ZW5lcik6IHZvaWQge1xuICAgIHRoaXMubGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gIH1cblxuICAvKipcbiAgICogTm90aWZ5IGFsbCBsaXN0ZW5lcnMgb2YgYW4gZXZlbnRcbiAgICovXG4gIHByaXZhdGUgbm90aWZpZXIodHlwZTogVHJhbnNwb3J0RXZlbnRUeXBlLCBkYXRhPzogYW55LCBlcnJvcj86IEVycm9yKTogdm9pZCB7XG4gICAgY29uc3QgZXZlbnQ6IFRyYW5zcG9ydEV2ZW50ID0geyB0eXBlLCBkYXRhLCBlcnJvciwgdGltZXN0YW1wOiBuZXcgRGF0ZSgpIH07XG4gICAgdGhpcy5saXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxpc3RlbmVyKGV2ZW50KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignVHJhbnNwb3J0IGxpc3RlbmVyIGVycm9yOicsIGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRlc3QgY29ubmVjdGlvbiB0byB0aGUgZW5kcG9pbnRcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgdGVzdENvbm5lY3Rpb24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7dGhpcy5jb25maWcuZW5kcG9pbnR9L2hlYWx0aGAsIHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgc2lnbmFsOiBBYm9ydFNpZ25hbC50aW1lb3V0KHRoaXMuY29uZmlnLnRpbWVvdXQgfHwgNTAwMCksXG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbm5lY3Rpb24gdGVzdCBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5ub3RpZmllcignZXJyb3InLCB1bmRlZmluZWQsIGVycm9yIGFzIEVycm9yKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIEhUVFAgcmVxdWVzdCB0byB0aGUgZ2F0ZXdheVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBzZW5kSFRUUDxUPihyZXF1ZXN0OiBNQ1BSZXF1ZXN0KTogUHJvbWlzZTxNQ1BSZXNwb25zZTxUPj4ge1xuICAgIC8vIERldGVybWluZSBpZiB3ZSdyZSBpbiBOb2RlLmpzIG9yIGJyb3dzZXJcbiAgICBjb25zdCBpc05vZGUgPSB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJztcbiAgICBcbiAgICB0cnkge1xuICAgICAgLy8gQnVpbGQgdGhlIHJlcXVlc3QgYm9keVxuICAgICAgY29uc3QgYm9keSA9IEpTT04uc3RyaW5naWZ5KHJlcXVlc3QpO1xuICAgICAgXG4gICAgICAvLyBVc2UgZmV0Y2ggQVBJICh3b3JrcyBpbiBib3RoIE5vZGUgMTgrIGFuZCBicm93c2VycylcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7dGhpcy5jb25maWcuZW5kcG9pbnR9L21jcGAsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHksXG4gICAgICAgIHNpZ25hbDogQWJvcnRTaWduYWwudGltZW91dCh0aGlzLmNvbmZpZy50aW1lb3V0IHx8IDUwMDApLFxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc3QgZXJyb3JUZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgJHtyZXNwb25zZS5zdGF0dXN9OiAke2Vycm9yVGV4dH1gKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY29uc3QgcmVzcG9uc2VCb2R5ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpIGFzIE1DUFJlc3BvbnNlPFQ+O1xuICAgICAgXG4gICAgICAvLyBGb3IgSFRUUCB0cmFuc3BvcnQsIHdlIGV4cGVjdCB0aGUgcmVzcG9uc2UgdG8gYmUgZGlyZWN0XG4gICAgICBpZiAocmVzcG9uc2VCb2R5LnR5cGUgIT09ICdyZXNwb25zZScpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHJlc3BvbnNlIHR5cGUgZnJvbSBzZXJ2ZXInKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKHJlc3BvbnNlQm9keS5lcnJvcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzcG9uc2VCb2R5LmVycm9yLm1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gcmVzcG9uc2VCb2R5O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLm5vdGlmaWVyKCdlcnJvcicsIHVuZGVmaW5lZCwgZXJyb3IgYXMgRXJyb3IpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG59XG4iXX0=