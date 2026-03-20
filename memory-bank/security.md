# Security — Web Draw

## Software Versions
| Software | Target Version | Notes |
|---|---|---|
| PHP | 8.2+ | For `save.php` |
| HTML5 | Living Standard | |
| JavaScript | ES2022 | Native modules |
| CSS3 | — | |

## Security Considerations

### PHP Backend (`server/save.php`)
- Validate MIME type of uploaded images (must be `image/png`).
- Limit upload size (sync with `php.ini` `upload_max_filesize`).
- Store uploads outside webroot or in a dedicated, non-executable directory.
- Sanitise filenames — use server-generated UUID filenames, never user-supplied names.
- Set `Content-Type: application/json` on all responses.
- Set CORS header: `Access-Control-Allow-Origin: same-origin`.

### iframe Overlay
- Set `sandbox="allow-scripts allow-same-origin"` on iframe only if needed; prefer restrictive sandbox.
- Do not relay user credentials into the iframe URL.

### Content Security Policy (recommended header)
```
Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; frame-src *;
```

## Security Patches & Issues
_None identified yet. Run scan when codebase is complete._
