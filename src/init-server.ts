import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export async function initServer() {
  const server = new McpServer({
    name: 'xeenon-tokens-mcp-server',
    version: '0.0.1',
  });

  server.registerTool(
    'echo',
    {
      title: 'Echo Tool',
      description: 'Echoes back the provided message',
      inputSchema: { message: z.string() },
    },
    async ({ message }) => ({
      content: [{ type: 'text', text: `Tool echo: ${message}` }],
    })
  );

  return server;
}
