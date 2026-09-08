# Tenancy

Construct is multi-tenant by default. Every row your space writes to the graph is automatically tagged with **who owns it**, and queries are filtered to that owner without you doing anything.

## Two tenants

| Tenant | Owner | Tagged with |
|---|---|---|
| **`'app'`** (personal) | The signed-in user | `user_uuid` |
| **`'org'`** | The active organization | `org_uuid` |

The tenant is set per model when you call [`defineModel`](/graph/models#scopes) via the `scopes` field. The host then enforces the tag on every write and filters every read. The space code is the same in either tenant.

::: tip Don't confuse with manifest `scopes`
The manifest's `scopes: ['app', 'org']` declares **where the space can be installed**. A model's `scopes: ['app', 'org']` declares **who owns its rows**. Same vocabulary, different layer — one is about install context, the other about data ownership.
:::

## What this means in practice

When a space writes a row:

```ts
await graph.Note.create({ title: 'Hello' })
```

The host adds the owner tag transparently:

```
inserts INTO notes (id, title, owner_type, owner_id, ...)
       VALUES      ('…', 'Hello', 'user', '<your-uuid>', …)
```

When the same space queries:

```ts
const notes = await graph.Note.list()
```

Only rows matching the current owner come back. A personal user can't see another user's notes. An org member can't see another org's notes. **No cross-tenant leakage is possible from a space.**

## Switching context

The same space binary serves both modes. If the user opens the space in their personal profile they see their personal rows; switching to an org reloads with the org's rows. The space doesn't branch on context — the graph just returns the right slice.

You can read which context you're in:

```ts
import { useOrg } from '@construct-space/sdk'

const { orgId, isOrg } = useOrg()
// isOrg.value === false → personal
// isOrg.value === true  → org, orgId.value is the UUID
```

But you usually don't need to. The tenancy is enforced below you.

## How to do it

You don't write tenancy code — you **declare** it on each model and the host enforces it. One field on `defineModel`:

```ts
defineModel('note', { /* fields */ }, {
  scopes: ['app'],                  // or ['org'], or ['app', 'org']
})
```

`scopes` is always an array — same shape as the manifest's `scopes`. A model that lists both works in either install mode; the host picks the matching tenant at runtime.

### Personal-only — `scopes: ['app']`

Rows always belong to whoever signed in. If the space is installed in an org, this model still writes to per-user buckets.

```ts
import { defineModel, field, useGraph } from '@construct-space/graph'

const Note = defineModel('note', {
  title:   field.string().required(),
  content: field.string(),
}, {
  scopes: ['app'],
})

const notes = useGraph(Note)
await notes.create({ title: 'Hello' })          // tagged with your user_uuid
const mine = await notes.find()                 // only your notes come back
```

### Org-only — `scopes: ['org']`

Rows always belong to the active org. If the space is installed personally there is no org context, so writes fail. Pair with a manifest that only declares `scopes: ['org']`.

```ts
const Folder = defineModel('folder', {
  name:    field.string().required(),
}, {
  scopes: ['org'],
  access: {
    read:   'member',
    create: 'member',
    update: 'owner',
    delete: 'admin',
  },
})

const folders = useGraph(Folder)
await folders.create({ name: 'Marketing 2026' })  // tagged with the active org_uuid
```

### Both — `scopes: ['app', 'org']`

The same model adapts to the install context. Useful when the space ships as `scopes: ['app', 'org']` and the data shape is the same in either tenant.

```ts
const Folder = defineModel('folder', {
  name: field.string().required(),
}, {
  scopes: ['app', 'org'],
})
```

- Installed personally → rows tagged with `user_uuid`.
- Installed in an org → rows tagged with `org_uuid`.

The space code is identical in both cases. The host picks the active tenant per request.

### Choosing scopes

| If the row is… | Use |
|---|---|
| Only meaningful to one user | `['app']` |
| Only meaningful to an org | `['org']` |
| Either, depending on install | `['app', 'org']` |

Match each model's `scopes` to what your manifest's `scopes` declares. A model with `scopes: ['org']` in a space that lists `scopes: ['app']` is a build error — there's no tenant to write into.

::: tip Per-project data inside an org
If your space cares about data scoped to *a specific project inside an org* (e.g. Kanban tasks for one project), use `scopes: ['org']` and include a `project_id` field on the model. Filter your queries with `where: { project_id }`. Keeping project as application data — not as a tenant boundary — leaves you in control of cross-project flows.
:::

## Implications for permissions

- **Personal context** — no roles, no admin, no `useAuthorization` / `useAccess` evaluation. The user owns everything they create.
- **Org context** — RBAC (`useAuthorization`) and per-resource ACL (`useAccess`) both apply on top of the org tenancy. First the row has to belong to the org; *then* the role/ACL check decides if this user can touch it.

See [Auth & Identity](/reference/composables/auth) for the full role/permission model.

## What the space ID gets you

Tenancy isolates **users from each other** and **orgs from each other**. The space ID separates your space's rows from another space's rows inside the same tenant. So:

```
A user's tenant
├── Drive space rows      ← invisible to Notes
├── Notes space rows      ← invisible to Drive
└── Kanban space rows     ← invisible to both
```

Two different spaces can't read each other's data even when installed by the same user / org. That's enforced the same way (`source_space` column on every row), without you doing anything.

## Further reading

- [Defining models](/graph/models) — the full `defineModel` reference including `scopes:`, `access:`, and relations.
- [Access rules](/graph/access) — how tenancy, role-based CRUD, and per-row ACL stack on top of each other.
- [Per-Resource Access](/guide/access) — sharing rows *within* a tenant (the share-folder-with-Alice flow).
