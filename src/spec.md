# Specification

## Summary
**Goal:** Enable CRM report generation (Sales, Financial, Customer Success, Projects) with PDF/CSV export, filters, scheduling, and per-organization stored report history.

**Planned changes:**
- Add backend APIs to generate the four report types from existing CRM data, supporting manual generation and storing report metadata and file content per organization for later download.
- Add backend support for exporting generated reports in CSV and PDF formats, recording the chosen format in report history.
- Implement backend report scheduling (daily, weekly, monthly, custom) with enable/disable and delete, generating scheduled reports automatically and storing them in the same history as manual runs.
- Add filter support for report generation (at minimum date range), applying filters to both manual and scheduled runs and storing the effective period/range used.
- Update the frontend Reports page at `/relatorios` to use real backend data via React Query: list report types, generate reports (PDF/CSV) with feedback, display downloadable history, and manage schedules (create + enable/disable).
- Extend the frontend DataClient/backend bindings with typed methods for report history, report generation, report download, and schedule CRUD; ensure the Reports page uses these methods (no direct actor calls).

**User-visible outcome:** Users can filter and generate CRM reports as PDF or CSV, download previously generated reports from history, and set up automated scheduled reports with results saved for later download.
