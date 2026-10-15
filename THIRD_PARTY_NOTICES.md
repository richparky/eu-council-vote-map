# Third-party notices

The MIT license covers this project's original code. It does not replace the terms for source data or bundled third-party software.

## Council voting records and population figures

© European Union, 2026. Sources: the Council of the European Union voting-results search and Annex III to the Council's Rules of Procedure, published in EUR-Lex. Per-record and per-period source URLs are retained in `data/`.

Changes: records were extracted, normalized into JSON, sorted, and deduplicated. Population values originally expressed in thousands were converted into persons. Population shares are calculated, not supplied by the Council. Missing country positions are preserved as unknown; official outcomes are retained. Some act titles are already truncated in the source search interface.

Council reuse conditions require source acknowledgement, preservation of meaning, and identification of changes: https://www.consilium.europa.eu/en/about-site/copyright/

## Geographic boundaries

Natural Earth data, distributed through https://github.com/datasets/geo-countries. Natural Earth is public domain; the Geo Countries dataset is distributed under the Open Data Commons Public Domain Dedication and License (PDDL): https://opendatacommons.org/licenses/pddl/1-0/

Changes: selected European land polygons; reduced coordinate precision and dense vertices; corrected ring winding after simplification; mapped France and Norway to ISO3 codes. Present-day geography is provided for navigation, not a claim about historical boundaries or territorial disputes.

## D3 7.9.0

Copyright 2010-2023 Mike Bostock. ISC license. The distribution is bundled in `vendor/d3.v7.min.js` and its license is included in `vendor/D3-LICENSE`.
