# Changelog

All notable changes to LeakGuard are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **CFAA-focused Terms of Service** — Expanded legal terms from 5 to 10 sections (ES, EN, RU, HE) covering authorization under the Computer Fraud and Abuse Act, defensive-use prohibitions, AS IS disclaimer, indemnification, limitation of liability, Delaware governing law and arbitration, OFAC export compliance, audit logging with K-Anonymity, and ethical use / zero-retention of breach samples. Required because the previous terms were too generic for an OSINT platform that queries leaked data and exposed the project to US liability risk.
- **Mandatory legal consent checkbox on login** — CFAA-style warranty text in all four UI languages; login, registration, and demo access are blocked until the user accepts. Closes a gap where demo bypassed consent and the prior checkbox only said “accept terms” without representing lawful ownership of queried assets.
- **Auth consent helper and tests** — `frontend/src/app/login/auth-consent.ts` plus Vitest coverage for consent gating and `termsData` structure.

### Fixed

- **Credential leak in exposure scan API** — Removed uncensored `normalized` field from `POST /api/v1/exposure/scan` responses. UI censorship was ineffective because DevTools/curl could read plaintext passwords in the JSON payload.

### Changed

- **Hash-only consulted scan history** — `consulted_scans` no longer stores plaintext `query`; only `query_hash` and scan metadata. Dashboard shows search type and anonymized hash prefix instead of the raw query string.
- **Privacy claims in ToS** — Removed the inaccurate statement that LeakGuard does not store search queries; section 9 now describes security/audit logging aligned with backend `consulted_scans` behavior (metadata and hashed queries). Section 5 clarifies server-side censorship before API responses.
