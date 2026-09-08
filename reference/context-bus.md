# Context Bus

The context bus is the lightweight cross-space communication surface. Spaces publish compact summaries, subscribe to summaries by type, and can register request handlers for point-to-point data requests.

## Publish Context

```ts
publishSpaceContext({
  spaceId: 'kanban',
  type: 'selection',
  summary: {
    boardId: 'board_123',
    cardIds: ['card_1', 'card_2'],
  },
  timestamp: Date.now(),
})
```

`summary` should stay small and serializable. Put IDs and labels here, not whole documents or files.

## Subscribe

```ts
const unsubscribe = subscribeSpaceContext('selection', (payload) => {
  console.log(payload.spaceId, payload.summary)
})
```

Read the latest payload without subscribing:

```ts
const latest = getLatestSpaceContext('selection')
```

## Request Data

A Space can register a handler:

```ts
const stop = registerContextHandler('kanban', async (request) => {
  if (request.type === 'card.detail') {
    return await loadCard(request.params?.id as string)
  }
})
```

Other Spaces can request data from it:

```ts
const card = await requestSpaceData('kanban', {
  type: 'card.detail',
  params: { id: 'card_1' },
})
```

Handlers may return synchronously or as a promise. Unregister them on unmount.
