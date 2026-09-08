# Reference

Public contracts exported by `@construct-space/sdk`. Pick a section.

::: tip Surface boundary
The SDK exposes host contracts that are safe for sandboxed Spaces. It does not expose the whole desktop app or unrestricted assistant orchestration. Spaces declare actions in `actions.ts`; the agent calls those actions instead of giving every Space direct control over assistant turns.
:::

## Core Composables

| Group | Count | What it covers |
|---|---|---|
| [Auth & Identity](/reference/composables/auth) | 3 | Read user, check role permissions (RBAC), per-resource ACL (ABAC) |
| [Organization](/reference/composables/organization) | 5 | Org tenant directory — members, teams, departments, roles |
| [Toolbar & Breadcrumb](/reference/composables/layout-panels) | 2 | Contribute toolbar items + declare breadcrumb trail. Panels/popovers live in `@construct-space/ui`. |
| [Routing & Shortcuts](/reference/composables/routing) | 2 | `useNavigator` (GetX-style) + per-space keybinds |
| [Networking & Data](/reference/composables/networking-data) | 3 | HTTP client (full), file storage, per-space KV |
| [Messaging](/reference/composables/messaging) | 2 | Fire notifications + send email — Spaces don't manage inbox or render toasts |
| [Utilities](/reference/composables/platform) | 6 | Google Fonts, markdown, date format, downloads, export, import |

## Host Runtime

| Section | What it covers |
|---|---|
| [Runtime helpers](/reference/runtime) | Toasts, theme, installed spaces, marketplace, credits, billing, menus, Construct shell helpers, AI model picker, shortcuts, brain bridge |
| [Scheduler](/reference/scheduler) | Space-owned scheduled tasks, claims, reports, and live fire events |
| [Context Bus](/reference/context-bus) | Cross-space context publishing, subscriptions, request handlers |
| [Telemetry](/reference/telemetry) | Local telemetry consent, screen/space/feature tracking, sync |
| [Stores](/reference/stores) | Auth, pinned items, preferences, settings, and pin factory helpers |
| [Schemas](/reference/schemas) | Zod validation helpers for manifests, widgets, activities, pagination, and API responses |

## Quick links

- **Most common starting point**: [`useAuth`](/reference/composables/auth#useauth), [`useStorage`](/reference/composables/networking-data#usestorage), [`useLocalStorage`](/reference/composables/networking-data#uselocalstorage)
- **For sharing a resource**: [`useAccess`](/reference/composables/auth#useaccess) — see the [walkthrough](/guide/access)
- **For scheduled work**: [`useScheduler`](/reference/scheduler#usescheduler)
- **For host helpers**: [`useToast`](/reference/runtime#usetoast), [`useAppTheme`](/reference/runtime#useapptheme--usetheme), [`useBrain`](/reference/runtime#usebrain)
- **For typed models**: use [`@construct-space/graph`](https://www.npmjs.com/package/@construct-space/graph)
- **For exposing actions to the agent**: write them in `actions.ts`. The agent calls them via `space_run_action`. You never call the agent.
