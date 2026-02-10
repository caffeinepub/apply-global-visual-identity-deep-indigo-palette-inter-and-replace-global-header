# Specification

## Summary
**Goal:** Restore reliable actor initialization and authorization so logged-in users can manage CRM contacts and owner-managed organization members (invitations/membership) without “client not ready” failures.

**Planned changes:**
- Fix backend actor initialization to work for normal Internet Identity users without requiring any missing/invalid secret token, and prevent the UI from getting stuck in a permanent “client not ready” state.
- Add clear frontend error + retry handling when actor initialization fails, and gate contact/member mutations until the backend client is ready.
- Align CRM contact create/update/delete payloads with backend expectations (derive caller-based fields in the backend) and refresh the contact list automatically after mutations.
- Implement owner-managed organization membership in the backend: create/list/revoke invitations, accept invitation by logged-in principal, and list members with proper permission checks.
- Replace the static Team/Settings UI with a functional Team management UI wired to member/invitation APIs (invite, view members, view pending invites, revoke/remove, update role if supported).
- Update onboarding/profile bootstrapping so users without profiles or without accepted membership see a clear next step (accept invite / create profile) and auth/protected routes update correctly after completion.

**User-visible outcome:** After logging in with Internet Identity, users can reliably create/update/delete CRM contacts, and organization admins/owners can invite and manage members via the Team page; invited users can accept invitations, complete profile setup when eligible, and access org pages according to membership/role without manual refreshes.
