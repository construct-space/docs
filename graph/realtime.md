# Realtime

Subscribe to changes on a model — `created`, `updated`, `deleted` events stream from the graph service as they happen. Use `subscribe()` directly when you want to react to events, or `useGraphList()` for an array that stays synced without writing the subscription wiring yourself.

## subscribe()

```ts
function subscribe(
  options: SubscribeOptions<T> | SubscribeHandler<T>,
): GraphSubscription

interface SubscribeOptions<T> {
  where?: WhereClause          // server-side filter on events
  cursor?: number              // resume from a known event id
  signal?: AbortSignal
  retryMs?: number             // backoff between reconnects
  onEvent: SubscribeHandler<T>
  onError?: (error: unknown) => void
}

type SubscribeHandler<T> = (event: GraphChangeEvent<T>) => void

interface GraphChangeEvent<T> {
  id: number
  action: 'created' | 'updated' | 'deleted'
  model: string
  record?: T                   // present for created + updated
  previousRecord?: T           // present for updated + deleted
  createdAt?: string
}

type GraphSubscription = () => void   // call to stop
```

```ts
const notes = useGraph(Note)

const stop = notes.subscribe({
  where: { archived: false },
  onEvent: (e) => {
    if (e.action === 'created') console.log('new note:', e.record)
    if (e.action === 'deleted') console.log('removed:', e.previousRecord)
  },
  onError: console.warn,
})

onUnmounted(stop)
```

Auto-reconnects on transient drops (configurable via `retryMs`). `onError` only fires for unrecoverable errors (auth revoked, server permanently rejected).

::: tip Always pair with `onUnmounted(stop)`
Leaking subscriptions = leaking SSE connections. Same rule as the SDK's notification stream.
:::

## useGraphList()

When you want an array that mirrors a query and stays live — list pages, kanban columns, comment threads — use `useGraphList()` instead of wiring `find()` + `subscribe()` yourself.

```ts
function useGraphList<T>(
  model: ModelDef,
  options?: GraphListOptions<T>,
): GraphList<T>

interface GraphListOptions<T> extends FindOptions {
  // Subscribed by default. Pass `subscribe: false` to disable.
  subscribe?: boolean
  // Custom predicate to keep rows that didn't match `where` after a server update.
  matches?: (row: T) => boolean
}

interface GraphList<T> {
  items: T[]                     // reactive array
  loading: boolean
  error: unknown | null
  load(options?: FindOptions): Promise<T[]>
  refresh(): Promise<T[]>
  create(input: Partial<T>): Promise<T>
  update(id: string, input: Partial<T>): Promise<T>
  remove(id: string): Promise<boolean>
  applyEvent(event: GraphChangeEvent<T>): void
  start(): GraphSubscription
  stop(): void
}
```

```ts
const list = useGraphList(Note, {
  where:   { archived: false },
  orderBy: { created_at: 'desc' },
  limit:   50,
})

onMounted(async () => {
  await list.load()
  list.start()                   // subscribe — incoming events upsert into list.items
})

onUnmounted(list.stop)

// list.items is the reactive array — bind directly:
// template: <NoteCard v-for="n in list.items" :key="n.id" :note="n" />

// Mutations on the list also update list.items in place
await list.create({ title: 'New note' })
await list.update(id, { color: 'pink' })
await list.remove(id)
```

### Use cases

- **Live list view** — Drive folder contents, Kanban column, inbox feed.
- **Multi-window consistency** — two windows on the same space stay in sync.
- **Optimistic UI** — `create()` / `update()` / `remove()` patch `items` immediately and reconcile with the server response.
- **Pagination** — `await list.load({ offset: page * 50 })` replaces the page; subscription stays attached.

### createGraphList() — bring-your-own client

Same shape as `useGraphList`, but you pass the client. Useful in tests, or when binding to a `useGraph` instance that uses a non-active `spaceId`.

```ts
import { useGraph, createGraphList } from '@construct-space/graph'

const client = useGraph<Note>(Note, { spaceId: 'other-space' })
const list   = createGraphList(client, { orderBy: { created_at: 'desc' } })
```
