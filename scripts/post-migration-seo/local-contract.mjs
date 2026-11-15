import fs from 'node:fs'
import { spawn, spawnSync } from 'node:child_process'

const output = 'test-results/post-migration-seo'
const origin = 'http://127.0.0.1:3221'
fs.mkdirSync(output, { recursive: true })
const inventory = spawnSync(process.execPath, ['scripts/post-migration-seo/inventory.cjs', output + '/inventory.json'], { stdio: 'inherit' })
if (inventory.status !== 0) throw Error('Inventory generation failed')
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3221'], { stdio: ['ignore', fs.openSync(output + '/server.log', 'w'), fs.openSync(output + '/server-error.log', 'w')] })
try {
  let ready = false
  for (let i = 0; i < 160; i++) {
    if (server.exitCode !== null) throw Error('Local server exited; inspect server-error.log')
    try { if ((await fetch(origin)).ok) { ready = true; break } } catch {}
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  if (!ready) throw Error('Local server did not become ready')
  const check = spawnSync('python3', ['scripts/post-migration-seo/verify.py', '--inventory', output + '/inventory.json', '--origin', origin, '--mode', 'staging', '--output', output + '/candidate-staging.json'], { stdio: 'inherit' })
  if (check.status !== 0) throw Error('Staging SEO contract failed')
} finally { server.kill('SIGTERM') }
