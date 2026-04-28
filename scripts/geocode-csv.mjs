#!/usr/bin/env node
// One-shot geocoder for facility CSVs.
// Reads input CSV, geocodes each row's address via Google Maps Geocoding API,
// writes output CSV with Latitude/Longitude columns appended.
//
// Resumable: keeps a JSON cache keyed by full-address string. Crash mid-run -> rerun is cheap.
//
// Usage:
//   GOOGLE_MAPS_API_KEY=xxx node scripts/geocode-csv.mjs <input.csv> <output.csv>
// Defaults: input=seed_import_full_merged.csv  output=seed_import_full_merged_geocoded.csv

import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'

const API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
if (!API_KEY) {
  console.error('ERROR: set GOOGLE_MAPS_API_KEY (or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) in env')
  process.exit(1)
}

const INPUT = process.argv[2] || 'seed_import_full_merged.csv'
const OUTPUT = process.argv[3] || 'seed_import_full_merged_geocoded.csv'
const CACHE_FILE = '.geocode-cache.json'
const FAILED_FILE = 'seed_import_geocode_failures.csv'
const THROTTLE_MS = 50

function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (ch === '"') { inQuotes = false }
      else { cell += ch }
    } else {
      if (ch === '"') { inQuotes = true }
      else if (ch === ',') { row.push(cell); cell = '' }
      else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = '' }
      else if (ch === '\r') { /* skip */ }
      else { cell += ch }
    }
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row) }
  return rows
}

function escapeCsv(v) {
  if (v == null) return ''
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function writeCsv(filePath, header, rows) {
  const lines = [header.map(escapeCsv).join(',')]
  for (const r of rows) lines.push(r.map(escapeCsv).join(','))
  fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf8')
}

function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) return {}
  try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) }
  catch { return {} }
}

let saveTimer = null
function saveCacheDebounced(cache) {
  if (saveTimer) return
  saveTimer = setTimeout(() => {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
    saveTimer = null
  }, 500)
}

async function geocodeOne(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (data.status !== 'OK') {
    const err = new Error(data.status + (data.error_message ? `: ${data.error_message}` : ''))
    err.apiStatus = data.status
    throw err
  }
  const loc = data.results?.[0]?.geometry?.location
  if (!loc || typeof loc.lat !== 'number') throw new Error('NO_LOCATION')
  return { lat: loc.lat, lng: loc.lng, formatted: data.results[0].formatted_address }
}

async function promptYesNo(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(question, ans => { rl.close(); resolve(/^y(es)?$/i.test(ans.trim())) })
  })
}

async function main() {
  const inputPath = path.resolve(INPUT)
  if (!fs.existsSync(inputPath)) {
    console.error(`ERROR: input file not found: ${inputPath}`)
    process.exit(1)
  }
  const raw = fs.readFileSync(inputPath, 'utf8')
  const rows = parseCsv(raw)
  if (rows.length < 2) { console.error('ERROR: CSV has no data rows'); process.exit(1) }
  const header = rows[0]
  const dataRows = rows.slice(1).filter(r => r.some(c => c && c.trim()))

  const idx = name => header.indexOf(name)
  const required = ['Address', 'City', 'Zip']
  for (const c of required) {
    if (idx(c) === -1) { console.error(`ERROR: missing column "${c}"`); process.exit(1) }
  }

  const hasLat = idx('Latitude') !== -1
  const hasLng = idx('Longitude') !== -1
  const outHeader = [...header]
  if (!hasLat) outHeader.push('Latitude')
  if (!hasLng) outHeader.push('Longitude')
  const latIdx = outHeader.indexOf('Latitude')
  const lngIdx = outHeader.indexOf('Longitude')

  const cache = loadCache()
  const cacheHitsAtStart = Object.keys(cache).length
  console.log(`Loaded cache with ${cacheHitsAtStart} entries`)
  console.log(`Input: ${dataRows.length} rows, header has ${header.length} columns`)

  // Determine work
  const toGeocode = []
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    const addr = (row[idx('Address')] || '').trim()
    const city = (row[idx('City')] || '').trim()
    const zip = (row[idx('Zip')] || '').trim()
    const fullAddr = `${addr}, ${city}, AZ ${zip}`.replace(/\s+/g, ' ').trim()
    const existingLat = hasLat ? row[idx('Latitude')] : ''
    const existingLng = hasLng ? row[idx('Longitude')] : ''
    if (existingLat && existingLng && Number.isFinite(parseFloat(existingLat))) continue
    if (cache[fullAddr] && cache[fullAddr].lat) continue
    if (!addr || !city) continue
    toGeocode.push({ rowIndex: i, fullAddr })
  }

  console.log(`Need to geocode: ${toGeocode.length} rows`)
  console.log(`Already cached:  ${dataRows.length - toGeocode.length} rows`)

  if (toGeocode.length > 0) {
    const estCost = (toGeocode.length * 0.005).toFixed(2)
    const proceed = await promptYesNo(`About to make ${toGeocode.length} Geocoding API calls (~$${estCost} estimated). Proceed? [y/N] `)
    if (!proceed) { console.log('Aborted.'); process.exit(0) }
  }

  let success = 0, failed = 0
  const failures = []
  const startTime = Date.now()

  for (let i = 0; i < toGeocode.length; i++) {
    const { rowIndex, fullAddr } = toGeocode[i]
    try {
      const result = await geocodeOne(fullAddr)
      cache[fullAddr] = { lat: result.lat, lng: result.lng, formatted: result.formatted }
      saveCacheDebounced(cache)
      success++
    } catch (err) {
      cache[fullAddr] = { error: err.message, apiStatus: err.apiStatus || 'ERROR' }
      saveCacheDebounced(cache)
      failures.push({ rowIndex, fullAddr, error: err.message })
      failed++
      if (err.apiStatus === 'OVER_QUERY_LIMIT' || err.apiStatus === 'REQUEST_DENIED') {
        console.error(`\nFATAL: ${err.message}. Stopping.`)
        break
      }
    }

    if ((i + 1) % 50 === 0 || i === toGeocode.length - 1) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
      const rate = (i + 1) / parseFloat(elapsed)
      const eta = ((toGeocode.length - i - 1) / rate).toFixed(0)
      process.stdout.write(`\r  ${i + 1}/${toGeocode.length} (✓${success} ✗${failed}) ${elapsed}s elapsed, ~${eta}s remaining   `)
    }

    if (i < toGeocode.length - 1) await new Promise(r => setTimeout(r, THROTTLE_MS))
  }
  process.stdout.write('\n')

  // Final flush of cache
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))

  // Build output rows (use cache for everything)
  const outRows = dataRows.map(row => {
    const out = [...row]
    while (out.length < outHeader.length) out.push('')
    const addr = (row[idx('Address')] || '').trim()
    const city = (row[idx('City')] || '').trim()
    const zip = (row[idx('Zip')] || '').trim()
    const fullAddr = `${addr}, ${city}, AZ ${zip}`.replace(/\s+/g, ' ').trim()
    const cached = cache[fullAddr]
    if (cached && cached.lat) {
      out[latIdx] = cached.lat
      out[lngIdx] = cached.lng
    }
    return out
  })

  writeCsv(OUTPUT, outHeader, outRows)
  console.log(`\nWrote ${OUTPUT} (${outRows.length} rows)`)
  console.log(`Success: ${success} new + ${cacheHitsAtStart} cached`)
  console.log(`Failed:  ${failed}`)

  if (failures.length > 0) {
    const failHeader = ['rowIndex', 'address', 'error']
    const failRows = failures.map(f => [f.rowIndex, f.fullAddr, f.error])
    writeCsv(FAILED_FILE, failHeader, failRows)
    console.log(`Wrote ${FAILED_FILE} with ${failures.length} failures for manual review`)
  }

  // Summary of coords coverage in output
  const withCoords = outRows.filter(r => r[latIdx] && r[lngIdx]).length
  console.log(`Final coverage: ${withCoords}/${outRows.length} rows have coordinates (${(100*withCoords/outRows.length).toFixed(1)}%)`)
}

main().catch(err => { console.error('FATAL:', err); process.exit(1) })
