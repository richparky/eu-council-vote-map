# EU Council Vote Map

An English, open-source interactive map of voting in the **Council of the European Union**.

Build a coalition by clicking countries, or select a real historical legislative act to see votes in favour, votes against, abstentions, and non-participating countries. Population shares use the official voting population table applicable **on the date of the vote**.

## Features

- Clickable map and accessible country buttons; no account needed.
- Current EU-27 coalition simulator using the 55% country / 65% population rule and the four-member blocking-minority rule.
- **1,748 distinct official voting records**, dated **22 December 2009–13 October 2026**.
- Search by title, document number, interinstitutional file, or policy area; filter by year.
- **20 population periods**: annual updates, Croatia's accession, the November 2014 rules change, and the UK withdrawal.
- Country-by-country table, official source links, inspectable JSON, and shareable historical-vote URLs (`?vote=…`).
- Static HTML, CSS, and JavaScript. D3 is vendored; the app makes no third-party runtime requests. No tracking, backend, build step, or production npm dependencies. The simulator selection is saved in browser-local storage.

## Run locally

Requires Node.js 20 or newer. Clone the repository, then:

```sh
npm start
```

Open the printed local URL (normally http://127.0.0.1:4173). **Do not open `index.html` directly**: browsers require HTTP for loading the local JSON and JavaScript modules. Any ordinary static HTTP server also works.

No `npm install` is necessary to run the website or its data/model checks. The Playwright development dependency is only needed for importing future voting records.

```sh
npm test
npm run validate:data
```

## Publish with GitHub Pages

In the repository, open **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/ (root)**, then save. The app works at a repository subpath without changing its URLs. The workflow in this repository checks calculations and snapshot integrity; it does not require deployment credentials.

## Data provenance and coverage

Snapshot retrieved on **15 October 2026** from the [official Council voting-results search](https://www.consilium.europa.eu/en/general-secretariat/corporate-policies/transparency/voting-results/). All 89 result pages and 1,762 reported source entries were read. Fourteen exact duplicate entries were removed, leaving 1,748 records. The source can list several procedural votes for the same act; distinct actions or voting distributions are retained.

This is the complete **search snapshot**, not every Council decision ever made. Votes available only in the separate public register, unpublished deliberations, and later updates are not included. The older official bulk-download dataset is marked discontinued. Some titles are truncated by the source interface itself.

Every record retains the original document search link and archive page number. The app reports the Council's official outcome rather than inventing an outcome from headline percentages.

### Population calculations

`data/populations.json` contains the Council's Annex III figures, including their applicability intervals and EUR-Lex CELEX references. The source tables are annual legal voting population bases; they are not interchangeable with later demographic estimates. Percentages are calculated from the country counts, not added from rounded source percentages.

- Croatia appears from **1 July 2013**; earlier EU-27 includes the UK and excludes Croatia.
- The UK appears through **31 January 2020**. The 2020 decision includes separate EU-28 and EU-27 population tables.
- The 2013 accession table adds Croatia to the preceding table; all other country entries stay unchanged.
- The two large headline shares use **all EU members and the full EU population** on that date. Non-participation can change the legal voting denominator; these are deliberately descriptive whole-EU measures.
- Ten source records omit some member states from all categories, including an enhanced-cooperation vote. These countries appear as **Not recorded** with a patterned fill. No position is inferred.
- The 2009–2010 table lists rounded thousands; its country entries sum to 300 more persons than its separately published EU total. Both are preserved and the difference is recorded explicitly.
- Population profiles stop at **1 January 2027**; missing future profiles fail validation instead of silently using today's figures.

The simulator uses unrounded integer comparisons for the 55%/65% thresholds. Before 1 November 2014, qualified majority used a weighted-vote system. Transitional use of that system could be requested until 31 March 2017. Unanimity, reinforced QMV, opt-outs, and enhanced cooperation are not re-adjudicated by the historical view. See the [official voting rules](https://www.consilium.europa.eu/en/council-eu/how-does-the-council-vote/qualified-majority/).

### Files

| File | Purpose |
| --- | --- |
| `app.js`, `styles.css`, `index.html` | English interface and map |
| `model.js` | Pure population and coalition calculations |
| `data/votes.json` | Normalized historical votes |
| `data/populations.json` | Dated official population profiles |
| `data/manifest.json` | Snapshot coverage and provenance |
| `data/europe.geojson` | Simplified Natural Earth geometry |
| `scripts/import-votes.mjs` | Reproducible public-archive importer |
| `scripts/import-populations.py` | Rebuild the known population profiles from official publications |
| `tests/model.test.js` | Membership dates and majority edge cases |

## Refresh the snapshot

Vote import uses a visible browser because the Council website can require browser verification. It does not bypass a verification challenge. Install the development dependency and a supported browser:

```sh
npm install
npx playwright install chromium
npm run import:votes
npm run validate:data
npm test
```

The importer pauses for you to complete any website verification. It reads successive official result pages, checks the per-category country counts and reported total result count, and writes only after a complete traversal. Inspect the diff before committing. The site can change, so selectors and the known rule list may need maintenance. This snapshot is not a live feed, and no automated scraping schedule is enabled.

To rebuild existing population profiles (Python 3, standard library only):

```sh
python scripts/import-populations.py
npm run validate:data
```

The script downloads the explicitly listed official CELEX documents using the EU Publications Office's content-negotiated endpoint. Add and verify a new period when the Council publishes a new Annex III decision; never substitute a demographic estimate for a voting population table.

## License and attribution

Original code: **MIT**, copyright 2026 richparky. Council data: **© European Union, 2026**, reused with attribution; transformations are described above. Geographic data: Natural Earth / Geo Countries (public domain / PDDL). D3: ISC. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Independent project; not affiliated with or endorsed by the European Union.
