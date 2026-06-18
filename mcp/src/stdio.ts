import { pathToFileURL } from 'node:url'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createEditorialBackend } from './backend.ts'
import { loadMcpEnv } from './env.ts'
import { createEditorialMcpServer } from './server.ts'
import { createMcpSupabaseClients } from './supabase.ts'

export async function startStdioServer() {
    const env = loadMcpEnv()
    const { publicSupabase, adminSupabase } = createMcpSupabaseClients(env)
    const backend = createEditorialBackend({
        env,
        publicSupabase,
        adminSupabase,
    })
    const server = createEditorialMcpServer({
        backend,
        allowLocalAdmin: true,
    })
    const transport = new StdioServerTransport()

    await server.connect(transport)
    return { server, transport }
}

async function main() {
    await startStdioServer()
    console.error('Agri Updates MCP stdio server is running.')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
