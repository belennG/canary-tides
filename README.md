# Canary Islands Tides & Currents

## What it is

A single-page app that visualises marine conditions around the seven Canary Islands. The archipelago sits in the path of the Canary Current — a major eastern-boundary current that shapes Atlantic shipping routes and drives coastal upwelling — which makes it a compact, real-world subject for a tides-and-currents tool.

Pick a port or click anywhere at sea and you get:

- a tide curve for the next 7 days, with the current water level and a countdown to the next high/low;
ocean current speed and direction, drawn as vector arrows on the map;
wave and swell summary and sea-surface temperature;
- a time scrubber that moves the "now" line on every chart and re-poses every current arrow on the map in sync;
- compare mode to overlay tide curves from several locations;
- shareable URLs — the selected spots and scrub time live in the query string.

## Tech

| Concern | Choice |
| ------- | ------ |
| Framework | Vue 3, Composition API, &lt;script setup&gt; |
| Language | TypeScript |
| Build | Vite |
| Map | Leaflet + OpenStreetMap tiles (no wrapper library — Leaflet is driven imperatively from Vue watchers) |
| State | Pinia for cross-view state, composables for feature logic |
| Routing / shareable state | Vue Router, query-string sync |
| Charts | Hand-rolled SVG (tide curve), optionally uPlot/Chart.js later |
| Data | Open-Meteo Marine API — forecast + ERA5-Ocean archive, no API key |
| Tests | Vitest + Vue Test Utils |
| Hosting | Netlify / Vercel |
| Data source | Open-Meteo Marine API, hourly variables: sea_level_height_msl, ocean_current_velocity, ocean_current_direction, wave_height, swell_wave_height, sea_surface_temperature. Free for non-commercial use, no key required. Observed tide-gauge data from Puertos del Estado (REDMAR network, stations at Las Palmas, Santa Cruz de Tenerife, Arrecife, La Gomera, El Hierro and others) is a possible later enhancement. |

## Status

Portfolio project, built in public. See the milestones and issues for the plan.
