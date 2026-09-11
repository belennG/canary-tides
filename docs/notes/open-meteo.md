# Open-Meteo Marine API notes

## Endpoint

`https://marine-api.open-meteo.com/v1/marine`

## Params I'm using

- latitude, longitude (required)
- hourly: sea_level_height_msl, ocean_current_velocity, ocean_current_direction,
  wave_height, swell_wave_height
- timezone (auto? or explicit — decide and note why)
- forecast_days (default 7, max 8)
- cell_selection=sea (explicit, defensive — see note below)

## Response shape

- Top-level: latitude, longitude (echoed grid-cell center — may differ
  slightly from what you requested), generationtime_ms, utc_offset_seconds,
  timezone, timezone_abbreviation
- hourly: parallel arrays — one `time: string[]` (ISO8601) plus one array per
  requested variable, all the same length, index-aligned. E.g.
  `hourly.time[3]` and `hourly.sea_level_height_msl[3]` describe the same
  hour.
- hourly_units: same keys as `hourly`, values are unit strings (e.g. "m",
  "km/h") — useful for labeling charts without hardcoding units.

## Coordinates tested

- Las Palmas 28.140169191483295, -15.423226276190842
- Santa Cruz de Tenerife 28.47723545534779, -16.241199818917426
- Open sea 28.691428651962127, -12.4888564453494

## Example response (real, trimmed to 6 of 168 hourly entries)

Captured near Las Palmas (grid cell resolved to `28.125, -15.29`, a few km
from the requested port coordinate — matches the docs' note that the
response echoes the *grid cell center*, not the exact request). Full
`hourly.*` arrays are 168 entries long (7 days × 24h); only the first 6 are
kept here, `...` marks where the rest was cut.

```json
{
  "latitude": 28.125,
  "longitude": -15.2916565,
  "generationtime_ms": 0.1987,
  "utc_offset_seconds": 3600,
  "timezone": "Atlantic/Canary",
  "timezone_abbreviation": "GMT+1",
  "elevation": 4.0,
  "hourly_units": {
    "time": "iso8601",
    "wave_height": "m",
    "sea_level_height_msl": "m",
    "ocean_current_velocity": "km/h",
    "ocean_current_direction": "°",
    "swell_wave_height": "m"
  },
  "hourly": {
    "time": ["2026-09-11T00:00", "2026-09-11T01:00", "2026-09-11T02:00", "2026-09-11T03:00", "2026-09-11T04:00", "2026-09-11T05:00", "..."],
    "wave_height": [1.42, 1.44, 1.48, 1.52, 1.56, 1.60, "..."],
    "sea_level_height_msl": [0.51, 0.82, 0.85, 0.59, 0.12, -0.43, "..."],
    "ocean_current_velocity": [0.9, 0.8, 0.6, 0.5, 0.5, 0.6, "..."],
    "ocean_current_direction": [307, 297, 288, 270, 270, 252, "..."],
    "swell_wave_height": [1.04, 1.06, 1.04, 1.00, 0.98, 1.02, "..."]
  }
}
```

Things worth noting from a real payload, not just the docs prose:

- `elevation` shows up top-level too — not in my original params list above,
  came back unasked-for. Metres, presumably the grid cell's land/seabed
  reference elevation.
- `sea_level_height_msl` goes negative (e.g. `-0.43`, `-1.34` elsewhere in the
  full response) — expected, not an error. The datum is *mean* sea level, so
  low tide relative to the mean reads as negative, high tide as positive.
  `.toFixed(2)`-style display should handle the sign like any other number,
  no special-casing needed.
- `ocean_current_direction` is degrees, `0`/`360` = "current heading north" —
  confirmed the values here (`307`, `297`, `288`...) are all in-range
  integers, no unexpected floats or out-of-range values.

## Forecast vs Historical Forecast

Confirmed by switching modes on the live docs page and reading the generated
URL for each — they're two different base domains, not one endpoint with a
flag:

- **Forecast** (the one this project uses):
  `https://marine-api.open-meteo.com/v1/marine?...&forecast_days=7` — rolling
  window starting today, up to 8 days ahead, whatever the latest model run
  says.
- **Historical Forecast**:
  `https://historical-forecast-api.open-meteo.com/v1/forecast?...&models=marine_best_match&start_date=...&end_date=...`
  — same variables, same response shape, but you give it an explicit past
  date range instead of `forecast_days`. The docs page itself notes coverage
  "starts around 2022, depending on the model" — so this is archived *past
  forecast runs* for the same marine models, not the full ERA5-Ocean
  reanalysis back to 1940 that shows up in the data-sources table. Didn't
  find where that full 1940-present archive is exposed through this API —
  not needed for this project, but worth knowing it's a different thing
  before assuming "historical" means "back to 1940."
- Decision: only the plain Forecast endpoint is needed here. No backfill
  requirement for this app.

## Timezone behavior

- Default is GMT; `timezone=auto` resolves to the location's local zone from
  its coordinates (e.g. a Canary Islands port comes back as
  `Atlantic/Canary`, `GMT+1`) — confirmed in a real response, see example
  below.
- Decision: expose timezone as something the user can set, rather than
  hardcoding one value. It's already just a query param, so this is cheap to
  support, and it matters for anyone outside the Canaries checking what "now"
  means on the tide curve.

## cell_selection

- Defaults to `sea` for this endpoint (prefers an ocean grid cell over land
  near a coast) — set explicitly anyway for clarity/safety

## Rate limits / auth

- No API key for non-commercial use; key only required for commercial /
  reserved capacity — note if you hit any throttling while testing

## Errors

- Non-200 comes back as `{ error: true, reason: "..." }` with HTTP 400 —
  this is what fetchMarine() needs to detect and surface
  