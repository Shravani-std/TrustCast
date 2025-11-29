# TrustCast Front-End UI/UX Plan

This document defines the complete visual system, UX flows, and reusable components for the TrustCast interface. It is intended to guide designers and engineers implementing the React + Tailwind front end that lives inside this `frontend` folder.

## 1. High-Level UI Goals

1. Trust-first clarity: immediate device trust state, minimal jargon, tight hierarchy.
2. Actionable alerts: highlight anomalies, prescribe next steps, minimize hunting.
3. Secure admin controls: gated flows for retraining, dataset uploads, threshold edits.
4. Polished fintech aesthetic: clean typography, airy layout, refined micro-interactions.
5. Readable under stress: ergonomic color usage, dense info only where needed, light/dark variants.
6. Scalable/responsive: desktop-first analytics plus essential mobile controls.

## 2. Pages & Main Flows

| Screen | Primary Purpose | Key Elements |
| --- | --- | --- |
| Login / 2FA | Auth entry point | Credentials, TOTP/SMS, remember-device, forgot password |
| Onboarding Quick Tour | First-time admin checklist | 4-step modal: dataset, threshold, live feed, API test |
| Dashboard (Home) | Command center | Countdown backdrop, KPI strip, live trust feed, alerts |
| Devices List | Global device inventory | Search, sort, filters, batch actions |
| Device Details | Deep dive | Trust timeline, anomaly events, export |
| Dataset Upload | Manage data ingest | Drag/drop, preprocessing progress, hashing |
| Model Monitor | Model health | Metrics, confusion matrix, retrain controls, logs |
| API Playground | Contract validation | Endpoint selector, request builder, code snippets |
| Alerts & Incidents | Incident history | Severity filters, triage workflow, bulk actions |
| Settings / Access Control | System config | Thresholds, retention, API keys, roles |
| Audit Logs Viewer | Compliance record | Filters, pagination, export |
| Help & Docs | Support hub | Glossary, docs links, contact |

## 3. Component Inventory (Build Once, Reuse Everywhere)

**Navigation & Layout:** TopNav, Sidebar, Breadcrumbs (global).

**Cards & Stats:** KPICard (4 variants), DeviceCard (compact + expanded).

**Tables & Lists:** DataTable (generic, pagination, column config, row actions), AlertsList / AlertItem.

**Charts & Visuals:** TrustLineChart, Sparkline (4), ConfusionMatrix, Radar/Bar (optional behavior viz).

**Forms & Upload:** FileUploader (drag/drop), FormInput, Select, MultiSelect, DateRangePicker, Switch.

**Controls & Actions:** Primary/Secondary/Ghost buttons, IconButton set (5 styles), ToggleGroup (time range), Modal (4 types), Toast/Notification, ConfirmDialog with type-to-confirm.

**Dev/Debug:** ApiPlayground UI, LogViewer with filters, ModelRetrainCard.

**Security/Account:** MFASetup UI, RoleManagement suite (user list + role assignment).

**Utilities:** SearchBar, Badge (success/warn/error/info), Tooltip (global), EmptyState patterns (3).

Expect roughly 30–40 unique components with Tailwind variants for light/dark themes.

## 4. Interaction Patterns

- Foreground vs background: low-contrast numeric countdown backdrop with fully interactive foreground cards.
- Progressive disclosure: KPIs → device/alert drill downs → detail panes.
- Safety confirmations: typed confirmation for retrain/delete/cooldown actions.
- Contextual help: `?` tooltips for domain-specific vocabulary.
- Row actions: overflow menu with `View`, `Acknowledge`, `Tag`, `Export`.
- Batch operations: multi-select in tables for scans, exports, or acknowledgement.
- Soft auto-save: indicate `Saving…` → `Saved` for settings, reduce form friction.
- Real-time updates: WebSocket feed, small `Last updated 12:05:18 UTC` badge.
- Loading UX: skeleton states for charts/tables, shimmer animation.

## 5. Security UX Must-Haves

1. 2FA-first auth, session timeout, remember device toggle with explanation.
2. Role-based visibility: Admin, Researcher, Read-only; disable sensitive controls when unauthorized.
3. Audit trail surfacing: show recent retrains/uploads/threshold changes in UI and logs.
4. Retrain confirmation modal: typed keyword, cost estimate, cooldown timer.
5. Secure uploads: accepted formats, file size, checksum/hash once uploaded, server validation status.
6. Secrets hygiene: API keys shown once, copy-to-clipboard, rotate button.
7. Least privilege defaults with explicit elevation by admins.
8. Session lock button in TopNav; one-click screen blur.
9. Live security indicators (banner/chip) if backend integrity checks fail.

## 6. Visual System

**Primary Theme (Minimal White Fintech):**
- Background `#FFFFFF`, Panels `#F9FAFB`, Borders `#E6E7EB`.
- Headings `#111827`, Body `#4B5563`, Muted `#9CA3AF`.
- Primary accent `#3B82F6`, Trust accent `#00D1A1`, Danger `#EF4444`.

**Dark Variant (Optional):**
- Background `#000000`, Panels `#0C0C0C` / `#111111`.
- Accent `#00FF9C`, Danger `#FF4E4E`, Countdown overlay ~6% opacity white.

**Typography & Iconography:**
- Fonts: Inter or Manrope (variable). HXL 32px, H2 22px, body 15px, small 12px.
- Line height 1.3–1.5, optical kerning.
- Icons: Lucide/Feather; stroke-consistent.
- Color-coded badges reserved for severity states.

## 7. Layout & Spacing

- 12-column grid, max content width 1200–1400px.
- Gutters: 24px desktop, 16px tablet, 12px mobile.
- Card radius 12px, drop shadow `shadow-lg/10`.
- Spacing tokens: 8px (space-2), 16px (space-4), 24px (space-6), 32px (space-8).

## 8. Data Visualization Guidance

- Trust Trend: line/area with average/min/max, device count tooltip, smoothing toggle.
- Device Distribution: histogram or stacked bars across trust buckets.
- Device Timeline: sparkline per device with anomaly markers.
- Confusion Matrix: hover details for FP/FN definitions.
- Anomaly Severity Treemap (optional) for quick cluster sensemaking.
- KPI sparklines for micro-trends.
- Export buttons (PNG/SVG) and CSV download of raw data.
- Time range controls and smoothing toggle shared across dashboards.

## 9. Accessibility & Inclusivity

- Minimum 4.5:1 contrast for body text; 3:1 for large headings.
- Full keyboard support (tab order, skip links, ARIA labels).
- Live regions for new alerts/incidents.
- High-contrast mode toggle; reduce-motion toggle to disable animations.
- Focus styles: 2px outline with accent color + offset shadow.

## 10. Micro-Interactions & Motion

- Card hover: translateY(-1px) + subtle shadow increase.
- Button press: 80–120ms scale/opacity feedback.
- Chart transitions: eased updates on data refresh.
- Toasts for quick success/failure; modals for destructive confirmations.
- Skeleton shimmer to reduce perceived latency.

## 11. Error & Edge-State Patterns

- Upload errors: message, retry CTA, sample file link.
- Empty dataset/device views: helpful copy, CTA (`Upload dataset`, `Add device`).
- API failure fallback: cached data state + `Retry now`.
- Long-running retrain: progress indicator, ETA, cancel option.

## 12. Implementation & Performance Notes

- React + Tailwind with layout primitives; create `theme.ts` or Tailwind config tokens for colors/spacing.
- Lazy-load heavy modules (charts, logs) via React.lazy/Suspense; code-split pages.
- WebSockets for trust feed, fallback to polling if socket unavailable.
- Cache static assets via Vite + CDN; prefer lightweight chart libs (Recharts/Chart.js) with virtualization for large tables.
- Keep all work scoped to the `frontend` directory per repo convention.

## Deliverables Checklist

- Component library (Storybook optional) covering all components above.
- Page-level compositions matching flows list, desktop + responsive mocks.
- Light and dark theme tokens defined in Tailwind config.
- Interaction specs (tooltips, modals, confirmations) documented in component props.
- Accessibility notes embedded into Storybook docs or MDX.
- Security UX checklist validated against flows (retrain, uploads, secrets, sessions).

Hand this document to designers to produce high-fidelity mocks, or to engineers to begin building directly with Tailwind utility classes and the outlined component system. All changes for this plan are contained inside the `frontend` folder as requested.
