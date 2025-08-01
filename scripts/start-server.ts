import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { initServer } from '../src/init-server';

export async function startServer(args: string[] = process.argv.slice(2)) {
  const server = await initServer();
  await server.connect(new StdioServerTransport());

  return server;
}

startServer().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
