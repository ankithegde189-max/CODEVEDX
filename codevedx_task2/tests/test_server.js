import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'child_process';

test('Backend Express API Server', async (t) => {
  // Start server on test port 3001
  const server = spawn('node', ['server.js'], {
    env: { ...process.env, PORT: '3001' }
  });

  // Wait for the server to be listening
  await new Promise((resolve) => {
    server.stdout.on('data', (data) => {
      if (data.toString().includes('Server is running')) {
        resolve();
      }
    });
  });

  // Helper for POSTing JSON
  async function postJSON(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.json();
  }

  await t.test('POST /api/analyze - evaluates single password correctly', async () => {
    const result = await postJSON('http://localhost:3001/api/analyze', { password: 'Password123!' });
    
    assert.strictEqual(result.password, 'Password123!');
    assert.ok(result.entropy > 0);
    assert.ok(result.strength);
    assert.ok(result.patterns);
    assert.ok(result.policy);
    assert.ok(result.dictionary);
    assert.ok(result.brute_force);
    
    assert.strictEqual(result.policy.corp_policy.passed, true);
    assert.strictEqual(result.dictionary.vulnerable, true); // password123! is a mutation
  });

  await t.test('POST /api/batch - audits multiple passwords correctly', async () => {
    const result = await postJSON('http://localhost:3001/api/batch', {
      passwords: ['123456', 'SuperSecretPass2026$']
    });

    assert.strictEqual(result.summary.total, 2);
    assert.strictEqual(result.summary.weak, 1);
    assert.strictEqual(result.summary.strong, 1);
    assert.strictEqual(result.results.length, 2);
  });

  await t.test('GET /api/crack - streams cracking events via SSE', async () => {
    // Hash for "password"
    const hash = '5e88837c7398b9a7857855362f910455a02574a394435d148af7c4a87d76b851';
    
    const res = await fetch(`http://localhost:3001/api/crack?hash=${hash}`);
    assert.strictEqual(res.headers.get('content-type'), 'text/event-stream');
    
    const body = await res.text();
    const lines = body.split('\n').filter(line => line.startsWith('data: '));
    const events = lines.map(line => JSON.parse(line.slice(6)));
    
    assert.ok(events.length >= 2);
    assert.strictEqual(events[0].type, 'log');
    
    const resultEvent = events.find(e => e.type === 'result');
    assert.ok(resultEvent);
    assert.strictEqual(resultEvent.success, true);
    assert.strictEqual(resultEvent.plaintext, 'password');
  });

  // Clean up: terminate server process
  server.kill();
  await new Promise((resolve) => server.on('close', resolve));
});
