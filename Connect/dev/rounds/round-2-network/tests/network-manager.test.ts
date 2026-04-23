/**
 * Network Manager Operator Tests
 * Test suite for LAN & Network Resilience functionality
 * Cycle 1, Round 2
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { NetworkManager, NetworkInterface } from '../implementation/network-manager.js';
import os from 'node:os';

describe('Network Manager - Round 2', () => {
  let networkManager: NetworkManager;

  beforeAll(() => {
    networkManager = new NetworkManager();
  });

  afterAll(() => {
    networkManager.cleanup();
  });

  describe('Interface Management', () => {
    it('should load network interfaces', () => {
      const interfaces = networkManager['interfaces'];
      expect(Array.isArray(interfaces)).toBe(true);
      expect(interfaces.length).toBeGreaterThan(0);
    });

    it('should get active interface', () => {
      const activeInterface = networkManager.getActiveInterface();
      if (activeInterface) {
        expect(activeInterface).toHaveProperty('name');
        expect(activeInterface).toHaveProperty('status');
        expect(['up', 'down', 'unknown']).toContain(activeInterface.status);
      }
    });

    it('should handle interfaces with various properties', () => {
      const interfaces = networkManager['interfaces'];
      for (const iface of interfaces) {
        expect(iface).toHaveProperty('name');
        expect(iface).toHaveProperty('type');
        expect(iface).toHaveProperty('ipv4');
        expect(iface).toHaveProperty('ipv6');
        expect(iface).toHaveProperty('mac');
        expect(iface).toHaveProperty('status');
      }
    });
  });

  describe('Fallback Configuration', () => {
    it('should get default fallback IP', () => {
      const fallbackIP = networkManager.getFallbackIP();
      expect(typeof fallbackIP).toBe('string');
      expect(fallbackIP).toMatch(/^\d+\.\d+\.\d+\.\d+$/);
    });

    it('should set and get custom fallback IP', () => {
      const testIP = '192.168.1.200';
      networkManager.setFallbackIP(testIP);
      const currentIP = networkManager.getFallbackIP();
      expect(currentIP).toBe(testIP);
    });

    it('should handle IP conflict detection', async () => {
      await expect(networkManager.checkIPConflicts()).resolves.not.toThrow();
    });
  });

  describe('Service Discovery', () => {
    it('should start service discovery without throwing', async () => {
      await expect(networkManager.startServiceDiscovery()).resolves.not.toThrow();
    });

    it('should handle different platforms', async () => {
      const platform = os.platform();
      await networkManager.startServiceDiscovery();
      // Service discovery should work on all platforms
      expect(['linux', 'darwin', 'win32']).toContain(platform);
    });
  });

  describe('Peer Discovery', () => {
    it('should discover peers without throwing', async () => {
      const peers = await networkManager.discoverPeers(1000);
      expect(Array.isArray(peers)).toBe(true);
    });

    it('should handle timeout parameter', async () => {
      const peers1 = await networkManager.discoverPeers(500);
      const peers2 = await networkManager.discoverPeers(2000);
      expect(Array.isArray(peers1)).toBe(true);
      expect(Array.isArray(peers2)).toBe(true);
    });

    it('should return array of peer identifiers', async () => {
      const peers = await networkManager.discoverPeers(1000);
      peers.forEach(peer => {
        expect(typeof peer).toBe('string');
      });
    });
  });

  describe('Network Failure Handling', () => {
    it('should handle network failure without throwing', async () => {
      await expect(networkManager.handleNetworkFailure()).resolves.not.toThrow();
    });

    it('should attempt reconnection', async () => {
      // Mock a failure scenario
      const spy = jest.spyOn(console, 'log');
      await networkManager.handleNetworkFailure();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should handle missing active interface', async () => {
      // Save original interfaces
      const originalInterfaces = networkManager['interfaces'];
      
      // Temporarily set no active interfaces
      networkManager['interfaces'] = [];
      
      await networkManager.handleNetworkFailure();
      
      // Restore original interfaces
      networkManager['interfaces'] = originalInterfaces;
    });
  });

  describe('Resource Management', () => {
    it('should cleanup resources', () => {
      expect(() => networkManager.cleanup()).not.toThrow();
    });

    it('should clear health check timer', () => {
      networkManager.cleanup();
      expect(networkManager['healthCheckTimer']).toBeNull();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete network lifecycle', async () => {
      // Start with discovery
      await networkManager.startServiceDiscovery();
      
      // Discover peers
      const peers = await networkManager.discoverPeers();
      
      // Check conflicts
      await networkManager.checkIPConflicts();
      
      // Handle potential failure
      await networkManager.handleNetworkFailure();
      
      // Cleanup
      networkManager.cleanup();
      
      expect(true).toBe(true); // If we get here, all steps worked
    });

    it('should maintain state across operations', async () => {
      const initialFallback = networkManager.getFallbackIP();
      
      await networkManager.discoverPeers();
      await networkManager.checkIPConflicts();
      
      const finalFallback = networkManager.getFallbackIP();
      
      expect(initialFallback).toBe(finalFallback);
    });
  });
});

// Additional operator test for CLI integration
describe('CLI Integration', () => {
  it('should provide network status information', () => {
    const status = networkManager.getActiveInterface();
    const fallback = networkManager.getFallbackIP();
    
    expect(typeof fallback).toBe('string');
    expect(status).toBeDefined();
  });
});
