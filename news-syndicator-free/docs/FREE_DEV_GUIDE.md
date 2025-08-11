# Free Dev Guide: News Syndicator

Goal: publish a zero-cost syndication site from the CLI output.

What you get:

- Static JSON feed from the analyzer report
- Static HTML page that lists items, categories, and connections
- No servers, no paid APIs; can be hosted on GitHub Pages or any static host

## Steps

1) Generate a report

```bash
node ./news-syndicator-free/src/cli.js --mock
```

1) Build the static site

```bash
node ./news-syndicator-free/site/build.js
```

1) Preview locally (simple Node server)

```bash
node ./news-syndicator-free/site/serve.js
```

1) Deploy

- Copy the `news-syndicator-free/site/public/` folder to any static host.
- For GitHub Pages, push the folder to `gh-pages` branch (or configure Pages for the folder).

## Personalization

- Pass `--profile ./news-syndicator-free/profiles/sample.profile.json` when generating the report.
- The build step will embed your latest report into `public/feed.json`.
