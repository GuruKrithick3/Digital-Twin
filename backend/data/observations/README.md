# Real Observation Data (NCPOR / IMD)

Place the real station observation CSVs in this folder with these exact file names:

```
maitri_data.csv  -> file name may be anything, but must contain a `station` column? No.
```

**Exact file names expected by the loader:**

| File | Station |
|------|---------|
| `maitri.csv`   | Maitri   |
| `bharati.csv`  | Bharati  |

If a file is missing, the backend silently falls back to the static seed
data so the platform keeps working until the real file is added.

## Required column layout (header row, case-insensitive, order-independent)

```
obstime,tempr,ap,ws,wd,rh
```

| Column    | Meaning                                   | Unit              | Missing sentinel |
|-----------|-------------------------------------------|-------------------|------------------|
| `obstime` | timestamp of the hourly reading           | datetime          | –                |
| `tempr`   | air temperature                           | °C                | –                |
| `ap`      | atmospheric (station) pressure            | hPa               | –                |
| `ws`      | wind speed                                | m/s               | –                |
| `wd`      | wind direction                            | degrees (0–360)   | `-999`           |
| `rh`      | relative humidity                         | %                 | `-999`           |

Example rows:

```
obstime,tempr,ap,ws,wd,rh
01-01-2012 01:00:00 AM,‒28.4,984.5,8.9,210.0,-999
01-01-2012 02:00:00 AM,-28.1,984.6,9.4,215.0,68
```

## Parsing rules (handled automatically by the loader)

- `obstime` accepts `MM-DD-YYYY` or `DD-MM-YYYY` (the loader auto-detects which
  order the file uses), with `HH:MM:SS` or `HH:MM`, and `AM`/`PM` suffixes or
  24-hour times. Examples: `01-01-2012 01:00:00 AM`, `01/01/2012 13:00`,
  `01.01.2012 06:00:00`.
- `-999` (or anything ≤ -900) in `wd` / `rh` is treated as a missing value and
  shown as a gap / "N/A" in the UI instead of being plotted.
- Rows that cannot be parsed are skipped and counted.
- Data may span a full year or longer (hourly resolution is ideal); the API
  downsamples automatically for large ranges.

## API

- `GET /api/observations/current?station=maitri`
- `GET /api/observations/series?station=maitri&range=24h|7d|30d|all`
- `GET /api/observations/stats?station=maitri`