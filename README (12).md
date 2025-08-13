# News Syndicator (Free)

A zero-cost, exportable Node.js project that:

- Fetches and parses RSS feeds (no paid APIs)
- Builds a CUE-CLARION-MDU-style knowledge trie of connections
- Scores items for thematic resonance using a golden-ratio harmonic
- Finds logical connections across items and seeds
- Supports optional personalization via a simple JSON profile
- Outputs a portable JSON report for syndication

## Quick start

Requires Node 18+.

Examples:

```bash
# Mock demo (no network):
node ./news-syndicator-free/src/cli.js --mock

# Real feeds (network):
node ./news-syndicator-free/src/cli.js \
  https://hnrss.org/frontpage \
  https://www.reddit.com/r/Futurology/.rss

# With personalization profile
node ./news-syndicator-free/src/cli.js --profile ./news-syndicator-free/profiles/sample.profile.json --mock
```

The report is saved to `news-syndicator-free/output/report.json`.

## Personalization profile (optional)

A profile JSON can weight categories and interests and provide a personality vector.

```json
{
  "name": "Demo User",
  "interests": ["cooperative", "mesh", "golden ratio", "direct action"],
  "categoryWeights": {
    "economic_democracy": 1.3,
    "technological_liberation": 1.2,
    "mathematical_foundation": 1.1
  },
  "personality": {
    "openness": 0.8,
    "conscientiousness": 0.6,
    "extraversion": 0.4,
    "agreeableness": 0.7,
    "neuroticism": 0.3
  }
}
```

## What’s inside

- `src/rss.js` – minimal HTTP(S) fetcher using built-ins
- `src/parse.js` – tiny RSS XML parser extracting common fields
- `src/knowledge.js` – knowledge trie + CUE-CLARION seeds + harmonics
- `src/personalize.js` – profile-based adjustments
- `src/analyzer.js` – scoring, connections, report assembly
- `src/cli.js` – orchestrates everything and writes the report
- `profiles/sample.profile.json` – example profile
 - `site/build.js` – generates a static site (index.html, feed.json, feed.xml)
 - `site/serve.js` – tiny static server (default port 8080)

## Notes

- You can swap the tiny parser with a full RSS parser library later if desired.
- No paid services. Everything uses built-in Node.js.

### Build a static site

```bash
node ./news-syndicator-free/src/cli.js --mock
node ./news-syndicator-free/site/build.js
node ./news-syndicator-free/site/serve.js # serves on http://localhost:8080
```

If 8080 is in use, run with:

```bash
PORT=8081 node ./news-syndicator-free/site/serve.js
```
