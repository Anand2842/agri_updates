import { config } from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envCandidates = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '../.env.local'),
  path.resolve(__dirname, '../../.env.local'),
  path.resolve(__dirname, '../../../.env.local'),
]

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    config({ path: envPath })
  }
}

config()

export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required`)
  }
  return value
}

export function optionalEnv(name: string): string | undefined {
  return process.env[name] || undefined
}
