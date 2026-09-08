# @construct-space/graph

Construct's typed data layer. Define models, get a GraphQL backend, talk to it from your space with a small reactive client. Auth, multi-tenant scoping, and per-resource ACL are wired in.

```bash
bun add @construct-space/graph
```

::: tip Bun is required
Same as the rest of the SDK toolchain — install and run with [Bun](https://bun.sh).
:::

## What you get

| | |
|---|---|
| **[Define models](/graph/models)** | `defineModel` + `field` + `relation` — typed schema declared in your space |
| **[Read & write](/graph/use-graph)** | `useGraph(Model)` — `find / findOne / create / update / remove / count` |
| **[Realtime](/graph/realtime)** | `subscribe()` for change feeds; `useGraphList()` for an auto-syncing list |
| **[Access](/graph/access)** | Per-row ACL via `acl:` on `defineModel`; multi-tenant via `scopes:` |

## The 30-second tour

```ts
import { defineModel, field, useGraph } from '@construct-space/graph'

// 1. Define a model
const Note = defineModel('note', {
  title:   field.string().required(),
  content: field.string(),
  color:   field.enum(['yellow', 'pink', 'blue']).default('yellow'),
}, {
  scopes: ['app'],                        // per-user tenancy
  access: {                                  // who can do what
    read: 'owner', create: 'authenticated',
    update: 'owner', delete: 'owner',
  },
})

// 2. Use it
const notes = useGraph(Note)

await notes.create({ title: 'Hello' })
const recent = await notes.find({ orderBy: { created_at: 'desc' }, limit: 10 })
const one    = await notes.findOne(id)
await notes.update(id, { color: 'pink' })
await notes.remove(id)
```

No GraphQL schema to write, no resolvers, no migrations — `defineModel` generates the schema, the host wires auth, the graph service handles storage.

## What this package is not

- **Not a full ORM.** No transactions, no joins beyond declared relations, no raw SQL.
- **Not the storage API.** For files (uploads, downloads, presigned URLs) use the SDK's [`useStorage`](/reference/composables/networking-data#usestorage) — that talks to a different backend.
- **Not a state manager.** Components read via `useGraph` calls or `useGraphList`. No central store.
- **Not auto-imported.** Always `import { useGraph, defineModel } from '@construct-space/graph'`.

## How it fits with the rest

```
your space
  ├── manifest declares the space + its permissions  (SDK)
  ├── models declared with defineModel              (Graph)
  ├── components from @construct-space/ui            (UI)
  └── runtime composables from @construct-space/sdk  (SDK)
        ├── useAuth — who's signed in
        ├── useStorage — file uploads
        └── useAccess<T> — per-row ACL evaluation, reads the acl: block you set here
```

The four packages compose. **Graph owns your typed data.** Everything else stays out of its way.
