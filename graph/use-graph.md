# Reading & writing

`useGraph(Model)` returns a typed client for one model — `find / findOne / create / update / remove / count`, plus subscribe and raw GraphQL escape hatches.

## useGraph()

```ts
function useGraph<T>(model: ModelDef, options?: { spaceId?: string }): GraphClient<T>

interface GraphClient<T> {
  find(options?: FindOptions): Promise<T[]>
  findOne(id: string): Promise<T | null>
  create(input: Partial<T>): Promise<T>
  update(id: string, input: Partial<T>): Promise<T>
  remove(id: string): Promise<boolean>
  count(options?: FindOptions): Promise<number>
  subscribe(options: SubscribeOptions<T> | SubscribeHandler<T>): GraphSubscription
  query(query: string, variables?: Record<string, unknown>): Promise<any>
  mutate(mutation: string, variables?: Record<string, unknown>): Promise<any>
}
```

Inside a Construct space the client auto-configures from the host's runtime (`globalThis.construct`) — `spaceId`, `projectId`, and the auth token are picked up automatically. The `options.spaceId` override is for the rare case you want a different space's bound client (e.g. an admin space reading its sibling's rows in the same bundle).

```ts
const notes = useGraph(Note)
const all   = await notes.find()
```

## FindOptions

```ts
interface FindOptions {
  where?: WhereClause
  orderBy?: OrderByClause          // { field: 'asc' | 'desc' }
  limit?: number
  offset?: number
  include?: string[]               // relations to eager-load
}
```

### where

Mongo-style operators. Equality is the default — pass a value directly.

```ts
await notes.find({ where: { color: 'pink' } })

await notes.find({
  where: {
    color:      { $in: ['pink', 'yellow'] },
    title:      { $like: '2026' },
    created_at: { $gte: '2026-01-01' },
    archived:   { $null: false },
  },
})
```

| Operator | Meaning |
|---|---|
| `$gt`, `$gte`, `$lt`, `$lte` | Comparison |
| `$ne` | Not equal |
| `$in`, `$nin` | Membership |
| `$like` | Substring (use `%` for literal-`%` only — fragment matched as substring) |
| `$null` | `{$null: true}` = IS NULL; `{$null: false}` = IS NOT NULL |

### orderBy / limit / offset

```ts
await notes.find({
  orderBy: { created_at: 'desc' },
  limit:   20,
  offset:  page * 20,
})
```

### include

Eager-load relations declared with `relation.belongsTo` / `hasMany`.

```ts
await posts.find({ include: ['comments', 'author'] })
// each row has post.comments[] and post.author populated
```

## Writes

All writes go through GraphQL mutations; the host injects auth before forwarding.

```ts
// Create — id, created_at, updated_at, created_by are auto-set
const note = await notes.create({ title: 'Hello', content: 'World' })

// Update — partial, only listed fields change
await notes.update(note.id, { color: 'pink' })

// Remove — returns true on success
await notes.remove(note.id)
```

Required + range + email/url validations declared on the model run **before** the mutation hits the database; you get an `Error` back with the message naming the field.

## Count

```ts
const unread = await notes.count({ where: { read: false } })
```

Same `where` shape as `find`; just returns the integer.

## Raw GraphQL escape hatches

When the typed surface doesn't fit — multi-model joins, custom resolvers your space has registered, aggregations.

```ts
const { data } = await notes.query<{ stats: { count: number } }>(
  `query Stats($spaceId: ID!) { stats(spaceId: $spaceId) { count } }`,
  { spaceId: 'note' },
)

await notes.mutate(
  `mutation Archive($ids: [ID!]!) { archiveMany(ids: $ids) }`,
  { ids: [...] },
)
```

## Errors

```ts
import { UnauthorizedError } from '@construct-space/graph'

try {
  await notes.find()
} catch (e) {
  if (e instanceof UnauthorizedError) {
    // user is signed out — show a sign-in CTA, don't retry
  } else {
    throw e
  }
}
```

`UnauthorizedError` is raised on 401s. Anything else surfaces as a plain `Error` with the GraphQL response body trimmed in the message.

## configure() — outside a space

Inside a Construct space you don't call `configure()` — the host has already wired it. Outside (a Node script, a CLI tool, an isolated test) call it once before the first `useGraph`:

```ts
import { configure, useGraph } from '@construct-space/graph'

configure({
  spaceId: 'note',
  url: 'https://graph.lisaos.dev',      // optional — defaults here
  getAccessToken: async () => process.env.GRAPH_TOKEN!,
})
```
