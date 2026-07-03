# Phase 01: Gather Old Exams

Download UHR's full official archive of old Högskoleprovet exams (2013–2026) from studera.nu into a local, git-ignored cache so later phases can study real format/difficulty/style patterns. Read the root `README.md` in this playbook folder first — it defines the copyright boundary this whole initiative operates under. This phase only downloads and catalogs; no analysis or app changes happen here.

## Known exam-date landing pages (fetched 2026-07-02 from `https://www.studera.nu/hogskoleprov/om/forbereda/tidigare/`)

Each is an intermediate page (not a direct PDF) that links to that date's actual prov/facit/normering PDFs:

```
/hogskoleprov/resultat/resultat/senaste/                              (18 april 2026)
/hogskoleprov/fpn/provfragor-facit-och-normering-hosten-2025/          (19 oktober 2025)
/hogskoleprov/fpn/provfragor-och-facit-varen-2025/                     (5 april 2025)
/hogskoleprov/fpn/provfragor-och-facit-hosten-2024/                    (20 oktober 2024)
/hogskoleprov/fpn/provfragor-och-facit-varen-2024/                     (13 april 2024)
/hogskoleprov/fpn/provfragor-och-facit-hosten-2023/                    (22 oktober 2023)
/hogskoleprov/fpn/provfragor-och-facit-varen-2023/                     (25 mars 2023)
/hogskoleprov/fpn/provfragor-och-facit-hosten-2022-23-okt/             (23 oktober 2022)
/hogskoleprov/fpn/provfragor-och-facit-varen-2022-7-maj/               (7 maj 2022)
/hogskoleprov/fpn/provfragor-och-facit-varen-2022-12-mars/             (12 mars 2022)
/hogskoleprov/fpn/provfragor-och-facit-hosten-2021-24-oktober/         (24 oktober 2021)
/hogskoleprov/fpn/provfragor-och-facit-varen-2021-8-maj/               (8 maj 2021)
/hogskoleprov/fpn/provfragor-och-facit-varen-2021-13-mars/             (13 mars 2021)
/hogskoleprov/fpn/provfragor-och-facit-hosten-2020/                    (25 oktober 2020)
/hogskoleprov/fpn/provfragor-och-facit-hosten-2019/                    (20 oktober 2019)
/hogskoleprov/fpn/provfragor-och-facit-varen-2019/                     (6 april 2019)
/hogskoleprov/fpn/provfragor-och-facit-hosten-2018/                    (21 oktober 2018)
/hogskoleprov/fpn/facit-och-provfragor-varen-2018/                     (14 april 2018)
/hogskoleprov/fpn/facit-och-provfragor-hosten-2017/                    (21 oktober 2017)
/hogskoleprov/fpn/provfragor-varen-2017/                               (1 april 2017)
/hogskoleprov/fpn/provfragor-hosten-2016/                              (29 oktober 2016)
/hogskoleprov/provfragor-hosten-2016/provfragor-varen-2016/            (4 april 2016)
/hogskoleprov/fpn/facit-provfragor-och-normering-hosten-2015/          (24 oktober 2015)
/hogskoleprov/fpn/facit-provfragor-och-normering-varen-2015/           (28 mars 2015)
/hogskoleprov/fpn/facit-provfragor-och-normering-hosten-2014/          (25 oktober 2014)
/hogskoleprov/fpn/facit-provfragor-och-normering-varen-2014/           (5 april 2014)
/hogskoleprov/fpn/facit-provfragor-och-normering-hosten-2013/          (26 oktober 2013)
```

All are relative to `https://www.studera.nu`. If `/hogskoleprov/om/forbereda/tidigare/` has changed since this was captured, re-fetch it first and reconcile against this list.

## Tasks

- [x] For each of the 27 landing pages above, fetch it and extract the direct PDF URL(s) it links to (prov/provhäfte, facit, and — for recent ones — normering/scoring table). Build a table in this file (as the completion note) of: date, landing page, and every PDF URL found. Note any landing page that 404s, redirects, or has no PDF links — don't guess a substitute URL, just log it as missing.

  **Completion note:** All 27 landing pages returned HTTP 200 (re-verified: none 404s or redirects). First re-fetched `/hogskoleprov/om/forbereda/tidigare/` to confirm the doc's landing-page list is still current — it matched exactly (26 dated entries plus the "senaste" page for 2026-04-18). Initial link extraction used the WebFetch tool, which worked correctly on 26/27 pages but **hallucinated fabricated `example.com` PDF URLs** on the `facit-och-provfragor-varen-2018/` page instead of the real ones — caught by spot-checking that page with a direct `curl` fetch + `grep -oE 'href="[^"]*\.pdf"'`. Given that failure mode, all 27 landing pages were re-scraped via raw `curl` + `grep` for reliability (not just the one that failed), then cross-checked against the earlier WebFetch output where available — they matched everywhere WebFetch hadn't hallucinated. 25 of the 27 pages link their normering (scoring table) PDFs from a separate `/hogskoleprov/fpn/normeringstabeller-*/` sub-page rather than the main landing page (only the two most recent dates, 2025-10-19 and 2026-04-18, link normering PDFs directly); all 25 normering sub-pages were fetched and scraped the same way. One normering-page URL had to be found by full-text search rather than pattern grep: 2014-10-25's link used the singular `normeringstabell-hosten-2014` (not the `normeringstabeller` plural used everywhere else).

  Every one of the 231 kept PDF URLs (of 233 raw links found; 2 excluded as noise — see task 2 note) is cataloged below, grouped by date. No landing page 404'd, redirected to an unrelated page, or had zero PDF links — full coverage, no missing dates.

  | Date | Season | Landing page | PDF URLs found (kept) |
  |---|---|---|---|
  | 2026-04-18 | vår | `/hogskoleprov/resultat/resultat/senaste/` | 8 |
  | 2025-10-19 | höst | `/hogskoleprov/fpn/provfragor-facit-och-normering-hosten-2025/` | 8 |
  | 2025-04-05 | vår | `/hogskoleprov/fpn/provfragor-och-facit-varen-2025/` | 8 |
  | 2024-10-20 | höst | `/hogskoleprov/fpn/provfragor-och-facit-hosten-2024/` | 8 |
  | 2024-04-13 | vår | `/hogskoleprov/fpn/provfragor-och-facit-varen-2024/` | 8 |
  | 2023-10-22 | höst | `/hogskoleprov/fpn/provfragor-och-facit-hosten-2023/` | 8 |
  | 2023-03-25 | vår | `/hogskoleprov/fpn/provfragor-och-facit-varen-2023/` | 8 |
  | 2022-10-23 | höst | `/hogskoleprov/fpn/provfragor-och-facit-hosten-2022-23-okt/` | 8 |
  | 2022-05-07 | vår | `/hogskoleprov/fpn/provfragor-och-facit-varen-2022-7-maj/` | 8 |
  | 2022-03-12 | vår | `/hogskoleprov/fpn/provfragor-och-facit-varen-2022-12-mars/` | 8 |
  | 2021-10-24 | höst | `/hogskoleprov/fpn/provfragor-och-facit-hosten-2021-24-oktober/` | 8 |
  | 2021-05-08 | vår | `/hogskoleprov/fpn/provfragor-och-facit-varen-2021-8-maj/` | 8 |
  | 2021-03-13 | vår | `/hogskoleprov/fpn/provfragor-och-facit-varen-2021-13-mars/` | 8 |
  | 2020-10-25 | höst | `/hogskoleprov/fpn/provfragor-och-facit-hosten-2020/` | 8 |
  | 2019-10-20 | höst | `/hogskoleprov/fpn/provfragor-och-facit-hosten-2019/` | 11 |
  | 2019-04-06 | vår | `/hogskoleprov/fpn/provfragor-och-facit-varen-2019/` | 8 |
  | 2018-10-21 | höst | `/hogskoleprov/fpn/provfragor-och-facit-hosten-2018/` | 8 |
  | 2018-04-14 | vår | `/hogskoleprov/fpn/facit-och-provfragor-varen-2018/` | 18 |
  | 2017-10-21 | höst | `/hogskoleprov/fpn/facit-och-provfragor-hosten-2017/` | 8 |
  | 2017-04-01 | vår | `/hogskoleprov/fpn/provfragor-varen-2017/` | 8 |
  | 2016-10-29 | höst | `/hogskoleprov/fpn/provfragor-hosten-2016/` | 8 |
  | 2016-04-04 | vår | `/hogskoleprov/provfragor-hosten-2016/provfragor-varen-2016/` | 8 |
  | 2015-10-24 | höst | `/hogskoleprov/fpn/facit-provfragor-och-normering-hosten-2015/` | 8 |
  | 2015-03-28 | vår | `/hogskoleprov/fpn/facit-provfragor-och-normering-varen-2015/` | 8 |
  | 2014-10-25 | höst | `/hogskoleprov/fpn/facit-provfragor-och-normering-hosten-2014/` | 8 |
  | 2014-04-05 | vår | `/hogskoleprov/fpn/facit-provfragor-och-normering-varen-2014/` | 8 |
  | 2013-10-26 | höst | `/hogskoleprov/fpn/facit-provfragor-och-normering-hosten-2013/` | 8 |

  **Per-date PDF URL detail** (all relative to `https://www.studera.nu`, categorized `[prov]`/`[facit]`/`[normering]`):

  **2026-04-18** (`/hogskoleprov/resultat/resultat/senaste/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2026-04-18/hogskoleprovet-facit-26a.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt2026-18-april/norm26a_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt2026-18-april/norm26a_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt2026-18-april/norm26a_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2026-04-18/provpass-2-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2026-04-18/provpass-3-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2026-04-18/provpass-4-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2026-04-18/provpass-5-kvant.pdf`

  **2025-10-19** (`/hogskoleprov/fpn/provfragor-facit-och-normering-hosten-2025/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2025-10-19/hp-25b.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht2025-19-oktober/norm25b_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht2025-19-oktober/norm25b_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht2025-19-oktober/norm25b_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2025-10-19/provpass-1-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2025-10-19/provpass-3-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2025-10-19/provpass-4-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2025-10-19/provpass-5-verb-utan-elf.pdf`

  **2025-04-05** (`/hogskoleprov/fpn/provfragor-och-facit-varen-2025/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2025-04-05/hogskoleprovet-facit-25a.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt2025-5-april/norm25a_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt2025-5-april/norm25a_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt2025-5-april/norm25a_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2025-04-05/provpass-2-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2025-04-05/provpass-3-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2025-04-05/provpass-4-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2025-04-05/provpass-5-kvant.pdf`

  **2024-10-20** (`/hogskoleprov/fpn/provfragor-och-facit-hosten-2024/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2024-10-20/hogskoleprovet-facit-24b.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht2024-20-oktober/norm24b_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht2024-20-oktober/norm24b_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht2024-20-oktober/norm24b_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2024-10-20/provpass-1-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2024-10-20/provpass-3-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2024-10-20/provpass-4-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2024-10-20/provpass-5-verb-utan-elf.pdf`

  **2024-04-13** (`/hogskoleprov/fpn/provfragor-och-facit-varen-2024/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2024-04-13/hogskoleprovet-facit-24a.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt2024-13-april/norm24a_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt2024-13-april/norm24a_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt2024-13-april/norm24a_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2024-04-13/provpass-1-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2024-04-13/provpass-2-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2024-04-13/provpass-4-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2024-04-13/provpass-5-kvant.pdf`

  **2023-10-22** (`/hogskoleprov/fpn/provfragor-och-facit-hosten-2023/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2023-10-22/hogskoleprovet-facit-23b.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2023/norm23b_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2023-10-22/norm23b_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2023-10-22/norm23b_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2023-10-22/provpass-2-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2023-10-22/provpass-3-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2023-10-22/provpass-4-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2023-10-22/provpass-5-verb_utan-elf.pdf`

  **2023-03-25** (`/hogskoleprov/fpn/provfragor-och-facit-varen-2023/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2023-03-25/hogskoleprovet-facit-23a.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt-2023-25-mars/norm23a_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt-2023-25-mars/norm23a_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt-2023-25-mars/norm23a_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2023-03-25/provpass-2-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2023-03-25/provpass-3-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2023-03-25/provpass-4-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2023-03-25/provpass-5-verb-utan-elf.pdf`

  **2022-10-23** (`/hogskoleprov/fpn/provfragor-och-facit-hosten-2022-23-okt/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2022-10-23/hogskoleprovet-facit-22b.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht2022/norm22b_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht2022/norm22b_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht2022/norm22b_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2022-10-23/provpass-1-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2022-10-23/provpass-2-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2022-10-23/provpass-4-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2022-10-23/provpass-5-verb-utan-elf.pdf`

  **2022-05-07** (`/hogskoleprov/fpn/provfragor-och-facit-varen-2022-7-maj/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2022-05-07/hogskoleprovet-facit-22a2-7-maj.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt2022-7-maj/norm22a2_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt2022-7-maj/norm22a2_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt2022-7-maj/norm22a2_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2022-05-07/provpass-1-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2022-05-07/provpass-3-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2022-05-07/provpass-4-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2022-05-07/provpass-5-verb-utan-elf.pdf`

  **2022-03-12** (`/hogskoleprov/fpn/provfragor-och-facit-varen-2022-12-mars/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2022-03-12/hogskoleprovet-facit-22a1.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt-2022-12-mars/norm22a1_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt-2022-12-mars/norm22a1_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt-2022-12-mars/norm22a1_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2022-03-12/provpass-2-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2022-03-12/provpass-3-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2022-03-12/provpass-4-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2022-03-12/provpass-5-kvant.pdf`

  **2021-10-24** (`/hogskoleprov/fpn/provfragor-och-facit-hosten-2021-24-oktober/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2021-10-24/hogskoleprovet-facit-21-b.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2021/norm21b_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2021/norm21b_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2021/norm21b_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2021-10-24/211024-provpass-1-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2021-10-24/211024-provpass-2-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2021-10-24/211024-provpass-4-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2021-10-24/211024-provpass-5-verb-utan-elf.pdf`

  **2021-05-08** (`/hogskoleprov/fpn/provfragor-och-facit-varen-2021-8-maj/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2021-05-08/hogskoleprovet-facit-21a2.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt2021-8-maj/norm21a_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt2021-8-maj/norm21a_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt2021-8-maj/norm21a_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2021-05-08/provpass-1-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2021-05-08/provpass-2-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2021-05-08/provpass-4-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2021-05-08/provpass-5-kvant.pdf`

  **2021-03-13** (`/hogskoleprov/fpn/provfragor-och-facit-varen-2021-13-mars/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2021-03-13/hogskoleprovet-facit-21a1.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt-2021-13-mars/norm21a_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt-2021-13-mars/norm21a_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt-2021-13-mars/norm21a_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2021-03-13/hogskoleprovet-2021-03-13-del-3_kvantitativ-del.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2021-03-13/hogskoleprovet-2021-03-13-del-5_kvantitativ-del.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2021-03-13/provpass-1-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2021-03-13/provpass-4-verb-utan-elf.pdf`

  **2020-10-25** (`/hogskoleprov/fpn/provfragor-och-facit-hosten-2020/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2020-10-25/facit-hp-2020-10-25.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2020/norm20b_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2020/norm20b_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2020/norm20b_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2020-10-25/hogskoleprovet-2020-10-25-del-2_verbal-del-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2020-10-25/hogskoleprovet-2020-10-25-del-3_kvantitativ-del.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2020-10-25/hogskoleprovet-2020-10-25-del-4_verbal-del-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2020-10-25/hogskoleprovet-2020-10-25-del-5_kvantitativ-del.pdf`

  **2019-10-20** (`/hogskoleprov/fpn/provfragor-och-facit-hosten-2019/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2019-10-20/hogskoleprovet-facit-19b---version-1.pdf`
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2019-10-20/hogskoleprovet-facit-19b---version-2.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2019/norm19b_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2019/norm19b_kvant_v1.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2019/norm19b_kvant_v2.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2019/norm19b_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2019-10-20/hogskoleprovet-2019-10-20-del-1_kvantitativ-del-version-1.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2019-10-20/hogskoleprovet-2019-10-20-del-3_verbal-del-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2019-10-20/provpass-1-2-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2019-10-20/provpass-4-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2019-10-20/provpass-5-verb-utan-elf.pdf`

  **2019-04-06** (`/hogskoleprov/fpn/provfragor-och-facit-varen-2019/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2019-04-06/facit-hogskoleprovet-vt-2019.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt-2019/norm19a_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt-2019/norm19a_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt-2019/norm19a_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2019-04-06/hogskoleprovet-2019-04-06-del-2_kvantitativ-del2.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2019-04-06/hogskoleprovet-2019-04-06-del-5_kvantitativ-del.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2019-04-06/provpass-1-verb-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2019-04-06/provpass-4-verb-utan-elf.pdf`

  **2018-10-21** (`/hogskoleprov/fpn/provfragor-och-facit-hosten-2018/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-10-21/facit-ht18.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2018/norm18b_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2018/norm18b_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2018/norm18b_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-10-21/hogskoleprovet-2018-10-21-del-2_kvantitativ-del.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-10-21/hogskoleprovet-2018-10-21-del-3_verbal-del-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-10-21/hogskoleprovet-2018-10-21-del-4_kvantitativ-del.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-10-21/hogskoleprovet-2018-10-21-del-5_verbal-del-utan-elf.pdf`

  **2018-04-14** (`/hogskoleprov/fpn/facit-och-provfragor-varen-2018/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-04-14/nyare-facit/facit-version-1-18a-111.pdf`
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-04-14/nyare-facit/facit-version-2-18a-112.pdf`
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-04-14/nyare-facit/facit-version-3-18a-121.pdf`
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-04-14/nyare-facit/facit-version-4-18a-122.pdf`
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-04-14/nyare-facit/facit-version-5-18a-211.pdf`
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-04-14/nyare-facit/facit-version-6-18a-212.pdf`
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-04-14/nyare-facit/facit-version-7-18a-221.pdf`
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-04-14/nyare-facit/facit-version-8-18a-222.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt-2018/norm18a_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt-2018/norm18a_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt-2018/norm18a_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-04-14/provpass-1-kvant-version-1.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-04-14/provpass-1-kvant-version-2.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-04-14/provpass-2-verbal-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-04-14/provpass-4-kvant-version-1.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-04-14/provpass-4-kvant-version-2.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-04-14/provpass-5-verbal-version-1-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2018-04-14/provpass-5-verbal-version-2-utan-elf.pdf`

  **2017-10-21** (`/hogskoleprov/fpn/facit-och-provfragor-hosten-2017/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2017-10-21/facit-version-1.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2017/norm17b_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2017/norm17b_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2017/norm17b_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2017-10-21/provpass-1-verbal-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2017-10-21/provpass-3-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2017-10-21/provpass-4-verbal-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2017-10-21/provpass-5-kvant-version-1.pdf`

  **2017-04-01** (`/hogskoleprov/fpn/provfragor-varen-2017/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2017-04-01/facit-a.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt-2017/norm17a_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt-2017/norm17a_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-vt-2017/norm17a_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2017-04-01/provpass-1-kvant-a.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2017-04-01/provpass-3-verbal-a-utan-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2017-04-01/provpass-4-kvant-a.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2017-04-01/provpass-5-verbal-a-utan-elf.pdf`

  **2016-10-29** (`/hogskoleprov/fpn/provfragor-hosten-2016/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2016-10-29/facit-version-1-16b.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2016/norm_16b_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2016/norm_16b_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/normering-ht-2016/norm_16b_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2016-10-29/provpass-2/provpass-2-verbal_2016-11-05.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2016-10-29/provpass-3/provpass-3-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2016-10-29/provpass-4/provpass-4-verbal_2016-11-05.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2016-10-29/provpass-5-v1/provpass-5-kvant-p-version-1.pdf`

  **2016-04-04** (`/hogskoleprov/provfragor-hosten-2016/provfragor-varen-2016/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2016-04-09/facit-varen-2016/facit-vt2016.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/norm-16a_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/norm-16a_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/norm-16a_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2016-04-09/fragor/provpass-2-verbal.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2016-04-09/fragor/provpass-3-kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2016-04-09/fragor/provpass-4-verbal.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2016-04-09/fragor/provpass-5-kvant.pdf`

  **2015-10-24** (`/hogskoleprov/fpn/facit-provfragor-och-normering-hosten-2015/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2015-10-24/facit.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/norm15b_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/norm15b_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/norm15b_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2015-10-24/provpass1verb-ej-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2015-10-24/provpass3kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2015-10-24/provpass4verb-ej-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2015-10-24/provpass5kvant.pdf`

  **2015-03-28** (`/hogskoleprov/fpn/facit-provfragor-och-normering-varen-2015/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2015-03-28/facit-.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/norm15a_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/norm15a_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/norm15a_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2015-03-28/provpass2kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2015-03-28/provpass3verbuelf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2015-03-28/provpass4kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2015-03-28/provpass5verbuelf.pdf`

  **2014-10-25** (`/hogskoleprov/fpn/facit-provfragor-och-normering-hosten-2014/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2014-10-25/facit14b.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/norm14b_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/norm14b_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/norm14b_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2014-10-25/provpass1verbej-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2014-10-25/provpass2kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2014-10-25/provpass4verbej-elf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2014-10-25/provpass5kvant.pdf`

  **2014-04-05** (`/hogskoleprov/fpn/facit-provfragor-och-normering-varen-2014/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2014-04-05/facit.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/norm14a_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/norm14a_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/norm14a_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2014-04-05/provpass1kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2014-04-05/provpass3verb14auelf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2014-04-05/provpass4kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2014-04-05/provpass5verb14auelf.pdf`

  **2013-10-26** (`/hogskoleprov/fpn/facit-provfragor-och-normering-hosten-2013/`):
  - [facit] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2013-10-26/facit13b.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/norm13b_helaprovet.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/norm13b_kvant.pdf`
  - [normering] `https://www.studera.nu/globalassets/05-hogskoleprovet/normeringstabeller/norm13b_verb.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2013-10-26/provpass1verbutanelf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2013-10-26/provpass3kvant.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2013-10-26/provpass4verbutanelf.pdf`
  - [prov] `https://www.studera.nu/globalassets/05-hogskoleprovet/hp-2013-10-26/provpass5kvant.pdf`

- [x] Download every PDF found into `Reference/raw-exams/<YYYY-MM-DD>/`, named descriptively (e.g. `prov.pdf`, `facit.pdf`, `normering.pdf`). Use `curl -sL -o <path> <url>` or equivalent — this is a lot of files, batch it efficiently (a loop, not 50+ individual tool calls). After downloading, verify each file is actually a PDF (`file <path>` should say PDF, not HTML — some of these sites soft-404 with a 200 status page instead of erroring) and re-fetch or flag any that came back wrong.

  **Completion note:** Downloaded all 233 raw PDF URLs in one batched `curl -sL -o` loop (one `Bash` tool call, not per-file calls) into `Reference/raw-exams/<YYYY-MM-DD>/`. Kept UHR's own filenames rather than renaming to a flat `prov.pdf`/`facit.pdf` scheme — UHR's naming already disambiguates provpass number, subtest type, and (for the two dates with parallel test forms, 2018-04-14 and 2019-10-20) version number, which a generic rename would have destroyed. 2 of the 233 downloads were then deleted as noise, not exam content for that sitting: `2015-10-24/facit-exempelprov.pdf` (verified via `pdftotext` to be the generic "ELF example test" answer key reused across the instructions booklet, not that sitting's real facit) and `2016-04-04/kallor-vt-2016.pdf` (a källförteckning/source-citation doc, same category as the `kallhanv.pdf`/`kallforteckning-*.pdf` files already excluded from every other date's download list — anvisningar, ELF example-test PDFs, blank svarshäfte templates, and källhänvisning docs were excluded across all 27 dates as administrative/instructional boilerplate, not exam content).

  All 231 kept files verified with `file -b` — every single one reported `PDF document` (versions 1.5–1.7, all zip-deflate encoded); **zero soft-404s** despite the risk flagged in the task (some UHR pages do return 200-status HTML error pages instead of erroring, but none of the 231 URLs hit that failure mode). One classification bug caught and fixed during the batch: `2025-10-19/hp-25b.pdf` (that sitting's facit) doesn't contain "facit" in its filename, so the automated prov/facit/normering categorizer initially miscategorized it as a prov file — corrected by cross-referencing the earlier page-content fetch, which had explicitly labeled it "Facit."

- [x] Write `Reference/raw-exams/MANIFEST.md`: one row per exam date with columns for date, season (vår/höst), which file types were successfully downloaded, file sizes, and a status column (complete / partial / missing — with why). This is the index later phases will read to know what's actually available — don't let it drift from what's actually on disk.

  **Completion note:** Wrote `Reference/raw-exams/MANIFEST.md` with a 27-row table (one per exam date), columns for season, prov/facit/normering counts (as `n/expected` — e.g. `4/4`, `1/1`, `3/3`), per-date folder size, and status — all 27 rows are `complete`. Cross-checked every count against what's actually on disk (`ls`/`du` per folder) rather than the download log, per the task's own drift warning. The manifest also documents the naming-quirk dates (2016-10-29 and 2017-10-21's provpass-5 says "version 1" for a slot UHR only ever published once; 2018-04-14's 8 parallel facit/provpass versions; 2019-10-20's 2 kvant versions; 2021-03-13/2021-05-08 both internally using UHR's `21a`-prefixed normering filenames despite being distinct dates/URLs) and the excluded-boilerplate categories, so later phases reading the manifest don't mistake either for a data error.

- [x] Spot-check: open 3–4 of the downloaded PDFs (spread across different years) and confirm they're actually readable Högskoleprovet exam content (not, say, a login wall or an unrelated document) before trusting the whole batch. Note what you saw in a completion note — subtest structure visible, roughly how many pages, whether it's the exam booklet, the facit, or both.

  **Completion note:** Ran `pdftotext`/`pdfinfo` (local Homebrew `poppler`) on 6 files spanning the oldest date, the multi-version year, and the newest date:
  - `2013-10-26/provpass3kvant.pdf` (23 pages) — genuine Kvantitativ del booklet; page 1's subtest breakdown reads XYZ 12 uppgifter/12 min, KVA 10/10 min, NOG 6/10 min, DTK 12/23 min — matches the app's XYZ/KVA/NOG/DTK subtest model exactly.
  - `2018-04-14/provpass-1-kvant-version-1.pdf` (23 pages) — same quant structure; confirms the "multi-version" quirk is real parallel exam content, not a duplicate upload.
  - `2021-10-24/hogskoleprovet-facit-21-b.pdf` (1 page) — genuine facit: maps Provpass 1/2/4/5 to DYS (delprovsystem) 1–4, alternating kvant/verbal, then lists 40 answer-key rows per pass.
  - `2025-10-19/provpass-3-verb-utan-elf.pdf` (11 pages) — genuine Verbal del booklet; page 1 shows ORD (10 uppgifter/3 min), LÄS, MEK — confirms the verbal subtest model still holds in the most recent archived sitting.
  - `2026-04-18/norm26a_helaprovet.pdf` (1 page) — genuine normering fördelningstabell issued by Umeå universitet's Institutionen för tillämpad utbildningsvetenskap (the body that scores Högskoleprovet), listing normerad poäng 0.00–2.00 with provdeltagare counts/percentiles.
  - `2016-10-29/facit-version-1-16b.pdf` — same Provpass→DYS mapping structure as the 2021 facit, confirming the facit format is stable across a 5-year span.

  No login walls, no unrelated documents, no truncated/corrupt content anywhere in the spot-check. Combined with the full-archive `file`-type verification in task 2 (231/231 typed as `PDF document`), the batch is trustworthy.

- [x] Report final counts: how many of the 27 dates got a complete download, how many partial, how many failed, and total disk usage of `Reference/raw-exams/`. If more than a handful failed, note the pattern (site structure changed? rate-limited? specific years unavailable?) rather than silently moving on.

  **Completion note:** **27/27 complete, 0 partial, 0 failed.** No landing page 404'd or redirected, no date is missing any of its prov/facit/normering files, and no downloaded file failed the `file`-type PDF check. Total archive size: **179 MB** (182,792 KB) across 231 PDFs in 27 date folders. There is no failure pattern to report — UHR's archive structure turned out to be consistent across the full 2013–2026 span (a `hp-<date>/` folder for prov+facit, a `normeringstabeller/` tree for scoring tables), with only cosmetic naming drift between years (dash vs. no-dash slugs, singular vs. plural "normeringstabell(er)", occasional multi-version dates) rather than any structural break or access restriction. The one real risk encountered was tool-level, not site-level: the WebFetch tool hallucinated fabricated URLs on one of 27 pages (see task 1 note) — mitigated by switching to direct `curl` + `grep` extraction for all pages, which is what actually produced the 100% completion rate.
