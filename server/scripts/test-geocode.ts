import { dgisGeocode } from '../src/lib/dgis.js'

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  const tests = process.argv.slice(2)
  if (!tests.length) {
    console.error('Usage: npx tsx --env-file=.env scripts/test-geocode.ts "query1" ...')
    process.exit(1)
  }
  for (const q of tests) {
    const c = await dgisGeocode(q)
    console.log(c ? `${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}` : 'MISS', '←', q)
    await sleep(1100)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
