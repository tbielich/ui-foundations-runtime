/**
 * Read-only MCP exposure contract: privileged handlers must not be registered.
 * Uses the actual SDK protocol with in-memory transports.
 */
import { it } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../src/server.js';

it('read-only profile exposes only approved tools and denies guessed privileged calls', async () => {
  const { server } = await createServer({
    version: '0.1.0', rootPath: '/tmp/nonexistent-uif-fixture', profile: 'read-only',
  });
  const client = new Client({ name: 'read-only-test', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  try {
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    const listed = await client.listTools();
    const names = listed.tools.map((tool) => tool.name);
    for (const allowed of [
      'search_foundations', 'get_component', 'get_token', 'get_pattern',
      'get_rule', 'validate_token_name', 'diagnose_drift', 'health_check',
    ]) {
      assert.ok(names.includes(allowed), `missing read-only tool: ${allowed}`);
    }
    for (const forbidden of ['apply_token_fix', 'validate_system']) {
      assert.ok(!names.includes(forbidden), `privileged tool exposed: ${forbidden}`);
      await assert.rejects(
        () => client.callTool({ name: forbidden, arguments: {} }),
        /not found|unknown|not registered|does not exist/i,
      );
    }
  } finally {
    await client.close();
    await server.close();
  }
});

it('full profile retains existing tool registration for backwards compatibility', async () => {
  const { server } = await createServer({
    version: '0.1.0', rootPath: '/tmp/nonexistent-uif-fixture', profile: 'full',
  });
  const client = new Client({ name: 'full-test', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  try {
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    const names = (await client.listTools()).tools.map((tool) => tool.name);
    assert.ok(names.includes('apply_token_fix'));
    assert.ok(names.includes('validate_system'));
  } finally {
    await client.close();
    await server.close();
  }
});
