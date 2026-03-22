import { createCanvas } from 'canvas'
import { load } from 'opentype.js'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'public', 'icons')

const font = await load(join(root, 'node_modules/@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff'))

function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#06060A'
  ctx.fillRect(0, 0, size, size)

  // Measure RCL at target font size to centre it
  const fontSize = size * 0.56
  const path = font.getPath('RCL', 0, 0, fontSize)
  const bb = path.getBoundingBox()
  const textW = bb.x2 - bb.x1
  const textH = bb.y2 - bb.y1

  const x = (size - textW) / 2 - bb.x1
  const y = (size - textH) / 2 - bb.y1

  const centredPath = font.getPath('RCL', x, y, fontSize)
  centredPath.fill = '#e8ff47'
  centredPath.draw(ctx)

  return canvas.toBuffer('image/png')
}

const icons = [
  { file: 'icon-192.png',          size: 192 },
  { file: 'icon-512.png',          size: 512 },
  { file: 'icon-maskable-192.png', size: 192 },
  { file: 'icon-maskable-512.png', size: 512 },
  { file: 'apple-touch-icon.png',  size: 180 },
]

for (const { file, size } of icons) {
  const buf = generateIcon(size)
  writeFileSync(join(outDir, file), buf)
  console.log(`✓ ${file} (${size}×${size})`)
}

console.log('\nAll icons generated.')
