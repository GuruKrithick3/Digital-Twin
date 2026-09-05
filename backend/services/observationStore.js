/**
 * Real Observation Data Store
 * ============================================================
 * Loads NCPOR hourly meteorological CSVs for Maitri & Bharati
 * and serves them to the rest of the platform.
 *
 * Files (expected in ../../data/observations):
 *   maitri.csv   -> station 'maitri'
 *   bharati.csv  -> station 'bharati'
 *
 * CSV layout (header row, case-insensitive):
 *   obstime,tempr,ap,ws,wd,rh
 *     obstime  datetime (MM-DD-YYYY | DD-MM-YYYY, 12/24 h)  — order auto-detected
 *     tempr    temperature °C
 *     ap       atmospheric pressure hPa
 *     ws       wind speed m/s
 *     wd       wind direction degrees (0-360; -999 = missing)
 *     rh       relative humidity % (-999 = missing)
 *
 * If a station CSV is missing the store falls back to `null` and the
 * caller (sensorSimulator) falls back to seed data.
 */

const fs = require('fs');
const path = require('path');

const OBS_DIR = path.join(__dirname, '..', 'data', 'observations');
const FILES = {
  maitri: 'maitri.csv',
  bharati: 'bharati.csv'
};

const MISSING_SENTINEL = -900; // -999 (and anything at/below this) => missing
const MAX_SERIES_POINTS = 800; // downsample target for "all" range

let store = null;

// ---------------------------------------------------------------------------
// CSV / datetime parsing
// ---------------------------------------------------------------------------

function trimQuotes(v) {
  return typeof v === 'string' ? v.trim().replace(/^"|"$/g, '').trim() : v;
}

function parseFloatOrNull(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (s === '') return null;
  const n = Number(s);
  if (Number.isNaN(n)) return null;
  return n;
}

function replaceSentinel(n, sentinel = MISSING_SENTINEL) {
  if (n == null) return null;
  return n <= sentinel ? null : n;
}

function parseDateTime(raw, order) {
  const s = String(raw).trim();
  if (!s) return null;

  const m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?/);
  if (!m) return null;

  let day = Number(m[1]);
  let month = Number(m[2]);
  if (order === 'dayFirst') { day = Number(m[1]); month = Number(m[2]); }
  else { day = Number(m[2]); month = Number(m[1]); }

  let hour = Number(m[4]);
  const minute = Number(m[5]);
  const second = m[6] ? Number(m[6]) : 0;
  const ampm = m[7] ? m[7].toUpperCase() : null;

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (hour < 0 || hour > 23 || minute > 59 || second > 59) return null;

  if (ampm) {
    if (hour < 1 || hour > 12) return null;
    if (hour === 12) hour = ampm === 'AM' ? 0 : 12;
    else if (ampm === 'PM') hour += 12;
  }

  let year = Number(m[3]);
  if (year < 100) year += 2000;

  const d = new Date(year, month - 1, day, hour, minute, second, 0);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Auto-detect whether timestamps are day-first (DD-MM-YYYY) or month-first
// (MM-DD-YYYY) by scoring monotonic increase (a time series must be ordered).
function detectDateOrder(rows) {
  const tries = { monthFirst: 0, dayFirst: 0 };

  for (const [label, order] of Object.entries({ monthFirst: 'monthFirst', dayFirst: 'dayFirst' })) {
    let score = 0;
    let prev = null;
    for (const r of rows) {
      const t = parseDateTime(r.obstime, order);
      if (!t) continue;
      if (prev) {
        const delta = t.getTime() - prev.getTime();
        if (delta > 0) score += 1;
        else if (delta < 0) score -= 1;
      }
      prev = t;
      if (score < 0) break; // clearly wrong order
    }
    tries[label] = score;
  }

  return tries.dayFirst > tries.monthFirst ? 'dayFirst' : 'monthFirst';
}

function parseCsv(text) {
  // Split into lines, tolerating CRLF and a possible trailing empty line.
  const lines = String(text).split(/\r?\n/);
  const header = lines[0] || '';
  const cols = header.split(',').map(c => trimQuotes(c).toLowerCase());

  const indexOf = (name) => {
    const i = cols.indexOf(name.toLowerCase());
    return i;
  };
  const iObstime = indexOf('obstime');
  const iTempr = indexOf('tempr');
  const iAp = indexOf('ap');
  const iWs = indexOf('ws');
  const iWd = indexOf('wd');
  const iRh = indexOf('rh');

  if (iObstime === -1) return { rows: [], skipped: 0, error: `header must contain 'obstime'. Found: ${cols.join(', ')}` };

  const rows = [];
  let skipped = 0;

  for (let li = 1; li < lines.length; li++) {
    const line = lines[li].trim();
    if (!line) continue;
    const fields = line.split(',').map(f => trimQuotes(f));
    if (fields.length < 2) { skipped++; continue; }

    // Preserve every metric present; poles for absent columns -> null.
    const get = (idx) => (idx === -1 ? null : fields[idx] !== undefined ? fields[idx] : null);

    const row = {
      obstime: get(iObstime),
      tempr: iTempr === -1 ? null : parseFloatOrNull(get(iTempr)),
      ap: iAp === -1 ? null : parseFloatOrNull(get(iAp)),
      ws: iWs === -1 ? null : parseFloatOrNull(get(iWs)),
      wd: iWd === -1 ? null : parseFloatOrNull(get(iWd)),
      rh: iRh === -1 ? null : parseFloatOrNull(get(iRh))
    };

    if (row.obstime == null || row.obstime === '') { skipped++; continue; }
    rows.push(row);
  }

  return { rows, skipped, error: null };
}

function loadStationData(stationKey) {
  const possibleNames = [
    FILES[stationKey],
    `${stationKey}.csv`,
    `${stationKey}_data.csv`,
    `${stationKey}_observation.csv`,
    `${stationKey}_observations.csv`
  ].filter(Boolean);

  let filePath = null;
  for (const name of possibleNames) {
    const candidate = path.join(OBS_DIR, name);
    if (fs.existsSync(candidate)) {
      filePath = candidate;
      break;
    }
  }

  if (!filePath) {
    console.warn(`[ObservationStore] No CSV found for '${stationKey}' in ${OBS_DIR}. Using seed fallback.`);
    return null;
  }

  const text = fs.readFileSync(filePath, 'utf8');
  const { rows, skipped, error } = parseCsv(text);
  if (error || rows.length === 0) {
    console.warn(`[ObservationStore] Could not parse ${filePath}: ${error || 'no data rows'}`);
    return null;
  }

  const order = detectDateOrder(rows);
  const records = [];

  let skippedRows = skipped;
  for (const r of rows) {
    const time = parseDateTime(r.obstime, order);
    if (!time) { skippedRows++; continue; }
    records.push({
      time,
      tempr: replaceSentinel(r.tempr),
      ap: replaceSentinel(r.ap),
      ws: replaceSentinel(r.ws),
      wd: replaceSentinel(r.wd),
      rh: replaceSentinel(r.rh),
      _raw: r
    });
  }

  records.sort((a, b) => a.time.getTime() - b.time.getTime());

  console.log(
    `[ObservationStore] Loaded ${records.length} records for '${stationKey}' from ${path.basename(filePath)} ` +
    `(${order}, ${records[0] ? records[0].time.toLocaleString() : 'n/a'} -> ${records[records.length - 1] ? records[records.length - 1].time.toLocaleString() : 'n/a'}, skipped: ${skippedRows})`
  );

  return { station: stationKey, records, order, skipped: skippedRows };
}

function getStore() {
  if (!store) {
    store = {
      maitri: loadStationData('maitri'),
      bharati: loadStationData('bharati')
    };
  }
  return store;
}

// Keep "load all at boot" option for scripts; lazy getStore is used by requests.
function loadAll() {
  return getStore();
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

function compass(deg) {
  if (deg == null || Number.isNaN(deg)) return null;
  const normalized = ((deg % 360) + 360) % 360;
  return COMPASS[Math.round(normalized / 22.5) % 16];
}

function computeRiskScore(tempr, ws) {
  if (tempr == null && ws == null) return 0;
  const t = tempr == null ? 0 : tempr;
  const w = ws == null ? 0 : ws;
  if (t < -35 || w > 75) return 90;
  if (t < -25 || w > 50) return 70;
  if (t < -20 || w > 30) return 45;
  return 20;
}

function getLatestRecord(stationKey) {
  const data = getStore()[stationKey];
  if (!data || !data.records.length) return null;
  return data.records[data.records.length - 1];
}

// Latest record, but fill missing wd/rh from the most recent valid value.
function getLatestEnvironment(stationKey) {
  const data = getStore()[stationKey];
  if (!data || !data.records.length) return null;

  const records = data.records;
  const latest = records[records.length - 1];

  let wd = latest.wd;
  let rh = latest.rh;
  for (let i = records.length - 1; i >= 0; i--) {
    if (wd == null && records[i].wd != null) wd = records[i].wd;
    if (rh == null && records[i].rh != null) rh = records[i].rh;
    if (wd != null && rh != null) break;
  }

  return {
    temperature: latest.tempr,
    humidity: rh,
    pressure: latest.ap,
    windSpeed: latest.ws,
    windDirectionDeg: wd,
    windDirection: compass(wd),
    radiation: null,
    visibility: null,
    riskScore: computeRiskScore(latest.tempr, latest.ws),
    timestamp: latest.time.toISOString(),
    isRealData: true
  };
}

function getRangeRecords(stationKey, rangeHours) {
  const data = getStore()[stationKey];
  if (!data) return [];
  if (!rangeHours || rangeHours === Infinity) return data.records;

  const endTs = data.records[data.records.length - 1].time.getTime();
  const startTs = endTs - rangeHours * 3600 * 1000;
  const out = [];
  for (const r of data.records) {
    if (r.time.getTime() >= startTs) out.push(r);
  }
  return out;
}

// Downsample records to at most ~maxPoints evenly spaced buckets (mean).
function seriesForRange(stationKey, range) {
  const rangeHours = { '24h': 24, '7d': 24 * 7, '30d': 24 * 30, all: Infinity }[range] || 24 * 7;
  const records = getRangeRecords(stationKey, rangeHours);
  const target = rangeHours === Infinity ? MAX_SERIES_POINTS : records.length;

  const out = [];
  if (records.length === 0) return { resolution: 'hourly', points: out };

  const bucketSize = Math.max(1, Math.ceil(records.length / target));
  for (let i = 0; i < records.length; i += bucketSize) {
    const slice = records.slice(i, i + bucketSize);
    const t0 = slice[0].time;

    const avg = (key) => {
      let sum = 0;
      let n = 0;
      for (const r of slice) {
        if (r[key] == null) continue;
        sum += r[key]; n++;
      }
      return n ? Number((sum / n).toFixed(2)) : null;
    };

    out.push({
      time: t0.toISOString(),
      label: t0.toISOString(),
      temperature: avg('tempr'),
      pressure: avg('ap'),
      windSpeed: avg('ws'),
      windDirection: avg('wd'),
      humidity: avg('rh')
    });
  }

  const resolution = bucketSize === 1 ? 'hourly' : `${bucketSize}-record bucket`;
  const hasRealTempr = out.some(p => p.temperature !== null);
  const hasRealAp = out.some(p => p.pressure !== null);
  const hasRealWs = out.some(p => p.windSpeed !== null);
  const hasRealWd = out.some(p => p.windDirection !== null);
  const hasRealRh = out.some(p => p.humidity !== null);

  return {
    resolution,
    points: out,
    metricRealStatus: {
      temperature: hasRealTempr,
      pressure: hasRealAp,
      windSpeed: hasRealWs,
      windDirection: hasRealWd,
      humidity: hasRealRh
    }
  };
}

function statsForStation(stationKey) {
  const data = getStore()[stationKey];
  if (!data) return null;

  const metrics = [
    { key: 'temperature', field: 'tempr', unit: '°C', label: 'Air Temperature' },
    { key: 'pressure', field: 'ap', unit: 'hPa', label: 'Atmospheric Pressure' },
    { key: 'windSpeed', field: 'ws', unit: 'm/s', label: 'Wind Speed' },
    { key: 'windDirection', field: 'wd', unit: 'deg', label: 'Wind Direction' },
    { key: 'humidity', field: 'rh', unit: '%', label: 'Relative Humidity' }
  ];

  const stats = {};
  for (const m of metrics) {
    let sum = 0;
    let n = 0;
    let min = Infinity;
    let max = -Infinity;
    let first = null;

    for (const r of data.records) {
      const v = r[m.field];
      if (v == null) continue;
      if (first === null) first = v;
      sum += v; n++;
      if (v < min) min = v;
      if (v > max) max = v;
    }

    if (n === 0) {
      stats[m.key] = { label: m.label, unit: m.unit, count: 0, missing: data.records.length, min: null, max: null, avg: null, stdDev: null, latest: null };
      continue;
    }

    const avg = sum / n;
    let sq = 0;
    for (const r of data.records) {
      const v = r[m.field];
      if (v != null) sq += (v - avg) * (v - avg);
    }
    const stdDev = Math.sqrt(sq / n);

    stats[m.key] = {
      label: m.label,
      unit: m.unit,
      count: n,
      missing: data.records.length - n,
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      avg: Number(avg.toFixed(2)),
      stdDev: Number(stdDev.toFixed(2)),
      latest: roundLatest(data.records, m.field)
    };
  }

  return {
    stats,
    coverage: {
      station: stationKey,
      file: FILES[stationKey],
      recordCount: data.records.length,
      skippedRows: data.skipped,
      start: data.records[0].time.toISOString(),
      end: data.records[data.records.length - 1].time.toISOString()
    }
  };
}

function roundLatest(records, field) {
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i][field] != null) return Number(Number(records[i][field]).toFixed(2));
  }
  return null;
}

function getCoverage(stationKey) {
  const data = getStore()[stationKey];
  if (!data) return null;
  return {
    station: stationKey,
    file: FILES[stationKey],
    recordCount: data.records.length,
    skippedRows: data.skipped,
    start: data.records[0].time.toISOString(),
    end: data.records[data.records.length - 1].time.toISOString()
  };
}

module.exports = {
  loadAll,
  getLatestEnvironment,
  getLatestRecord,
  getRangeRecords,
  seriesForRange,
  statsForStation,
  getCoverage,
  compass
};