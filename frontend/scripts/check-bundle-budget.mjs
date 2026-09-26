import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const assetsDirectory = resolve('dist/assets')
const javascriptFiles = readdirSync(assetsDirectory)
  .filter((file) => file.endsWith('.js'))
  .map((file) => ({ file, bytes: statSync(join(assetsDirectory, file)).size }))

const totalBytes = javascriptFiles.reduce((total, asset) => total + asset.bytes, 0)
const largestAsset = javascriptFiles.reduce((largest, asset) => (asset.bytes > largest.bytes ? asset : largest), { file: 'none', bytes: 0 })
const manifest = JSON.parse(readFileSync(resolve('dist/.vite/manifest.json'), 'utf8'))
const initialFiles = new Set()

const collectInitialFiles = (manifestKey) => {
  const chunk = manifest[manifestKey]
  if (!chunk || initialFiles.has(chunk.file)) return
  initialFiles.add(chunk.file)
  chunk.imports?.forEach(collectInitialFiles)
}

collectInitialFiles('index.html')
const initialBytes = javascriptFiles
  .filter(({ file }) => initialFiles.has(`assets/${file}`))
  .reduce((total, asset) => total + asset.bytes, 0)
const asyncBytes = totalBytes - initialBytes
const maxChunkBytes = 1.1 * 1024 * 1024
const maxInitialBytes = 1 * 1024 * 1024
const maxAsyncBytes = 2 * 1024 * 1024
const failures = []

if (largestAsset.bytes > maxChunkBytes) failures.push(`${largestAsset.file} is larger than 1.1 MiB`)
if (initialBytes > maxInitialBytes) failures.push(`initial JavaScript is larger than 1 MiB`)
if (asyncBytes > maxAsyncBytes) failures.push(`lazy JavaScript is larger than 2 MiB`)

console.log(`Bundle budget: ${(initialBytes / 1024).toFixed(1)} KiB initial + ${(asyncBytes / 1024).toFixed(1)} KiB lazy JavaScript across ${javascriptFiles.length} chunks`)
console.log(`Largest chunk: ${largestAsset.file} (${(largestAsset.bytes / 1024).toFixed(1)} KiB)`)

if (failures.length) {
  console.error(`Bundle budget exceeded: ${failures.join('; ')}`)
  process.exitCode = 1
}
