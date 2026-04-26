// Simple test script to verify Re3Chat WebSocket functionality
const WebSocket = require('ws');

console.log('Testing Re3Chat WebSocket server...');

// Create two test clients
const client1 = new WebSocket('ws://localhost:3000');
const client2 = new WebSocket('ws://localhost:3000');

let messagesReceived = 0;

client1.on('open', () => {
  console.log('Client 1 connected');
  client1.send(JSON.stringify({ user: 'TestUser1', text: 'Hello from Client 1' }));
});

client2.on('open', () => {
  console.log('Client 2 connected');
  client2.send(JSON.stringify({ user: 'TestUser2', text: 'Hello from Client 2' }));
});

client1.on('message', (data) => {
  console.log('Client 1 received:', data.toString());
  messagesReceived++;
});

client2.on('message', (data) => {
  console.log('Client 2 received:', data.toString());
  messagesReceived++;
});

// Close after a short delay
setTimeout(() => {
  client1.close();
  client2.close();
  console.log(`Test completed. Total messages received: ${messagesReceived}`);
  if (messagesReceived >= 2) {
    console.log('✅ Re3Chat WebSocket test PASSED');
  } else {
    console.log('❌ Re3Chat WebSocket test FAILED');
  }
}, 2000);