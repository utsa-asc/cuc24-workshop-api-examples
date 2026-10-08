# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Docker-based PHP/Apache development environment for a Cascade CMS REST API workshop. Everything that matters runs client-side in the browser: each example is a standalone HTML page that loads `cascade-restapi.js` and calls the Cascade REST API with `fetch()`. Output goes to the browser console (DevTools) — the pages themselves render blank unless noted.

- **Cascade CMS REST API JavaScript Library** (`app/cascade-restapi.js`) - Thin Promise wrapper around the Cascade REST API
- **Workshop Examples** (`app/examples/`) - Numbered HTML exercises demonstrating API operations
- **Swagger UI Documentation** (`app/swagger-ui/`) - OpenAPI spec (`openapi.yaml`) for the Cascade CMS REST API — the source of truth for request/response shapes
- **TinyMCE Integration** (`app/tinymce/`) - Full TinyMCE distribution, served at `/tinymce/`

## Development Commands

```bash
docker-compose up -d     # start
docker-compose down      # stop
```

- Web server: http://localhost:8888 (document root is `app/`)
- Examples: http://localhost:8888/examples/<folder>/<file>.html
- Swagger UI: http://localhost:8888/swagger-ui/

Examples must be served over HTTP (not `file://`) because several load CSV files via relative URLs with PapaParse.

## Architecture

### Docker Services
- **web**: PHP 8.3.3 Apache server serving `app/` on port 8888
- **db** / **phpmyadmin**: MySQL 8.0 and phpMyAdmin, both commented out in `docker-compose.yml` (unused by the examples)

### Cascade CMS API Library (`app/cascade-restapi.js`)

Configuration at the top of the file:
- `cmsUrl` - CMS base URL with trailing slash (currently `https://walledev.it.utsa.edu/`)
- `cmsAPI` - API key, sent as `Authorization: Bearer <key>`. Do not echo or copy this value into docs, commits, or generated reports.

Every function takes a single object `a` and returns a Promise. Assets are addressed either by `id` or by `path` + `siteName`:

| Function | HTTP | Endpoint | Key params | Resolve status key |
|---|---|---|---|---|
| `readAsset(a)` | GET | `read/{type}/{siteName}/{path}` or `read/{type}/{id}`; users: `read/user/{path}` | `type`, `id` \| `path`+`siteName`, `debug` | `read_status` |
| `editAsset(a)` | POST | `edit` | `asset` = the full `apiReturn` from a prior read | `edit_status` |
| `copyAsset(a)` | POST | `copy/{type}/...` | `copyParameters: { newName, destinationContainerIdentifier }` | `copy_status` |
| `moveAsset(a)` | POST | `move/{type}/...` | `moveParameters: { destinationContainerIdentifier, newName? }` (also used to rename) | `move_status` |
| `deleteAsset(a)` | POST | `delete/{type}/...` | `type`, `id` \| `path`+`siteName` | `delete_status` |
| `createAsset(a)` | POST | `create` | `asset: { <type>: {...} }` | `create_status` |
| `listSubscribers(a)` | GET | `listSubscribers/{type}/...` | `type`, `id` \| `path`+`siteName`, `debug` | `listSubscribers_status` |
| `listSites(a)` | GET | `listSites` | none | `listSites_status` |
| `copySite(a)` | POST | `siteCopy` | the whole `a` object is the request body | `edit_status` (sic) |

Response contract:
- Resolve: `{ <op>_status: "Success", sent: a, apiReturn: data, url? }` — `apiReturn` is the raw Cascade JSON; the asset lives at `apiReturn.asset.<assetTypeKey>` (e.g. `asset.page`, `asset.folder`, `asset.xhtmlDataDefinitionBlock`, `asset.symlink`).
- Reject: `{ <op>_status: "Error", error: data.message, sent: a, apiReturn: data }` when Cascade returns `success: false`.

Library quirks to keep in mind:
- Promises only reject on `success: false`. A network failure or non-JSON response is never caught inside the library, so the Promise stays pending forever — wrap with your own `.catch` / timeout when you need to know a crawl finished.
- `editAsset` expects `{ asset: result.apiReturn }` (it posts `a.asset.asset`), i.e. pass the whole read result's `apiReturn`, not the inner asset.
- `debug: true` only logs the fetch URL, and only in `readAsset` / `listSubscribers`.
- Reading a site by name requires double-escaping (`siteName: "%2520"`; see `15.bulk-create-users-sites.html`).
- All block subtypes (`xhtmlDataDefinitionBlock`, `feedBlock`, `indexBlock`, `textBlock`, `xmlBlock`) are read with `type: "block"`; the response key tells you the subtype.
- No helpers for `search`, `publish`, `readAccessRights`, `readAudits`, etc. — they exist in `openapi.yaml` and would need a new function following the same pattern.

### Common Cascade data shapes

- **Folder children**: `apiReturn.asset.folder.children[]` → `{ id, type, path: { path, siteId }, recycled }`. Not recursive — read child folders to go deeper.
- **Structured data**: `asset.<type>.structuredData.structuredDataNodes[]`, nested arbitrarily. Each node has `type` (`text`, `group`, `asset`), `identifier` (field ID from the data definition), and `text` (absent if empty). Asset-chooser nodes carry `blockId/blockPath`, `fileId/filePath`, `pageId/pagePath`, `symlinkId/symlinkPath`. Nodes are always arrays, even for a single field.
- **Tags**: `asset.<type>.tags[]` → `[{ name }]` on every folder-contained asset (pages, blocks, files, ...). Returned by `readAsset`; may be absent or empty when untagged.
- **Subscribers** (relationships): `listSubscribers` returns `apiReturn.subscribers[]` and `apiReturn.manualSubscribers[]`, each an identifier `{ id, type, path: { path, siteId, siteName }, recycled }`. For a block, these are the pages/blocks it is attached to; for a content type, the pages using it.
- **Create from base asset** pattern: `copyAsset` → `readAsset` (copy returns no new ID, so re-read by the destination path + new name) → mutate → `editAsset`.

## Workshop Examples (`app/examples/`)

All files follow the same teaching format: `/* Exercise N */` and `/* Step N.N */` comments, `// fill in` markers on values to change, and hard-coded IDs/paths from the workshop CMS (site `WS-Garza`, etc.). Exercise 1/2 blocks are toggled by commenting/uncommenting.

### `basic-operations/` — single API calls
| File | Demonstrates |
|---|---|
| `01.read.html` | `readAsset` by ID and by path (block) |
| `02.edit.html` | Read → drill into `xhtmlDataDefinitionBlock.structuredData` → change a field → `editAsset` |
| `03.copy.html` | `copyAsset` by ID/folder ID and by path/folder path |
| `04.move.html` | `moveAsset` to a new folder, and rename via `newName` |
| `05.delete.html` | `deleteAsset` by ID and by path |
| `06.create.html` | `createAsset` for a folder (`parentFolderId` + `siteName`) |
| `08.listSubscribers.html` | `listSubscribers` for a block; explains subscribers = relationships |
| `10.listSites.html` | `readAsset` type `site`; commented-out `listSites` → read each site |

### `chained-operations/` — multi-step workflows
| File | Demonstrates |
|---|---|
| `07.create-from-base-asset.html` | Copy base asset → read copy by path → edit metadata title |
| `09.list-folder-children.html` | Read folder → iterate `folder.children` → read each child |
| `09.read-children-links.html` | Same crawl, then rewrites each symlink's `linkURL` domain and edits it (handbook migration) |

### `workshop-scripts/` — bulk operations (use PapaParse 5.1.0 from cdnjs, CSVs in `csv/`)
| File | Demonstrates |
|---|---|
| `11.import-testimonials.html` | CSV (`testimonials.csv`) → copy testimonial base block → fill fields |
| `12.import-programs.html` | CSV (`programs.csv`) → create program blocks incl. image file references |
| `13.import-site-structure.html` | `folders.csv` then `pages.csv` → skeleton folders/pages from base assets |
| `14.bulk-edit-values.html` | `listSubscribers` on a content type → edit metadata and page/block content (dedupes shared blocks) |
| `15.bulk-create-users-sites.html` | `users.csv` → `createAsset` users, `copySite` per user, update site access |
| `16.tiny-mce-test.html` | Plain text → HTML conversion with TinyMCE UI; reads pages from `tldt.csv` (edit commented out) |

### `reporting-operations/` — read-only audits that render a report on the page
| File | Demonstrates |
|---|---|
| `17.block-relationship-report.html` | Recursive folder crawl → table of Block name · Full name · Path (linked to the CMS) · Tags · Used by (count + subscribers, pages first, each linked). Blocks sharing a "Full Name" field value (ignoring case, accents and spacing) are marked Duplicate with links to their twins; set `fullNameField` if auto-detection misses the field. Folders flagged not indexable or not publishable (`shouldBeIndexed` / `shouldBePublished` false), and everything inside them, are skipped and listed under the summary (`skipUnpublishedFolders`) → sortable, filterable table with unused blocks highlighted. "Download report" saves a standalone `.html` (and CSV) via the browser — generated reports are not committed. API calls are throttled (`maxConcurrent`) and wrapped in a timeout. |

Also in this folder: `profile-block-standards.html`, a static guide (not an API example) with naming standards and maintenance practices for the `about/_profile-blocks` blocks, written from a run of the report. Its counts are a snapshot; re-run the report before relying on them. Downloaded `block-report-*.html` files land here too and should not be committed.

### `ucc/` — project-specific (UCC events import)
- `import-events-clean.html` - Event block import from `csv/ucc-events-test-cleaned.csv`, with unicode → HTML entity and line-break conversion (comments still reference testimonials; it was adapted from `11`)
- `16.tiny-mce-test.html` - Duplicate of `workshop-scripts/16.tiny-mce-test.html`
- `csv/clean_csv.py` - Python 3 script that converts non-ASCII characters in a CSV to HTML entities before import

### Conventions for new examples
- One self-contained HTML file per operation, numbered (`NN.name.html`) inside a topic folder.
- Load the library with `<script src="../../cascade-restapi.js"></script>`; external libraries only from cdnjs.
- Put configurable values (`siteName`, folder path, IDs) in `var`s at the top with `// fill in` comments.
- Log results with `console.log(result)` and always attach `.catch(function(error) { console.log(error); })`.
- Numbering has collisions (two `09`s, two `16`s); pick the next free number (currently `18`).

## File Structure Notes

- `mysql-data/` contains persistent database files (unused while `db` is commented out)
- `swagger-ui/openapi.yaml` documents all available Cascade operations and schemas (`ListSubscribersResult`, `Identifier`, `StructuredDataNode`, ...)
- `.DS_Store` files are tracked in git; ignore them in diffs
