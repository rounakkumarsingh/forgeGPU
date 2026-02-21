import { build } from 'bun'
import tailwind from 'bun-plugin-tailwind'

const result = await build({
  entrypoints: ['./src/ui/index.html'],
  outdir: './dist',
  minify: true,
  plugins: [tailwind],
  target: 'browser',
})

if (!result.success) {
  console.error('Build failed')
  for (const message of result.logs) {
    console.error(message)
  }
  process.exit(1)
}

console.log('UI Build successful!')
