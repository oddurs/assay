# Security Policy

## Supported versions

stylegraph is pre-1.0. Only the latest published version receives fixes.

| Version | Supported |
| ------- | --------- |
| 0.2.x   | yes       |
| < 0.2   | no        |

## Reporting a vulnerability

Report privately through GitHub Security Advisories:

**https://github.com/stylegraphjs/stylegraph/security/advisories/new**

Please do not open a public issue for a security report.

Include what you can: affected version, reproduction steps, and impact.

## What to expect

- **Acknowledgement** within 3 working days.
- **An assessment** — whether it is accepted, and a rough severity — within
  10 working days.
- **A fix or a public advisory** once a patch is available, crediting you unless
  you would rather stay anonymous.

## Scope

stylegraph reads source files and writes reports. It executes no project code, makes
no network requests, and sends nothing anywhere. Findings of most interest are
therefore ones where analysing a hostile repository could read files outside the
analysed root, or where a crafted config could cause arbitrary code execution
(for example through `stylegraph.config.js`, which is imported by design).
