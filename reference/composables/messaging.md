# Messaging

Two composables. Both are write-only — spaces fire one event, the host takes care of the rest (bell, inbox, push delivery, email retry, prefs, multi-window sync).

- **`useNotification()`** — fire one notification into the current user's inbox.
- **`useDelivery()`** — send transactional email from the space.

## useNotification()

One method: `send()`. That's it.

```ts
function useNotification(): {
  send(input: SelfNotifyInput): Promise<SelfNotifyResponse>
}

interface SelfNotifyInput {
  title:   string                      // headline shown in bell + push
  body?:   string                      // preview text
  type?:   string                      // e.g. 'chat.mention', 'board.assigned'; used by mute prefs
  source?: string                      // originating space, defaults to caller
  link?:   string                      // deep link opened on click
  data?:   Record<string, unknown>     // free-form metadata for the recipient surface
}
```

**Use cases**

- **Chat detects an @mention** of the viewer — fire `chat.mention`. The host's bell badges, the OS toast appears, an email follows if the user's prefs allow it.
- **Board assigns a task** to someone — fire `board.assigned` with `link: '/board/123?card=456'`.
- **Doc finishes a long export** — fire `drive.export.ready` so the user knows even if they switched away.
- **Calendar event in 10 minutes** — fire `calendar.upcoming`. Multi-device delivery (desktop + mobile + push) is automatic.

```ts
const notif = useNotification()

await notif.send({
  title: 'Folder shared with you',
  body:  'Flak shared "Marketing 2026"',
  type:  'drive.share',
  link:  '/folders/123',
})
```

The host fans the notification out to every signed-in surface, badges the bell, and emails the user if their prefs allow. **Spaces never read the inbox, mark items as read, or enroll devices** — that's all host concern.

::: tip Sending to other users
You can only fire notifications for the **current user**. Cross-user notifications (e.g. mentioning Alice while you're signed in as Bob) are service-only and not exposed to spaces — the actual sender side runs server-side after the space records the mention in its graph.
:::

## useDelivery()

Outbound transactional email. Sender is always the shared `delivery.lisaos.dev` domain — no per-user DNS setup, no API key in the bundle.

Two ways to call: a single object, or a chainable builder.

```ts
function useDelivery(): {
  send(message: DeliveryMessageInput): Promise<DeliveryMessageResponse>
  message(): DeliveryMessageBuilder
  get(id: string): Promise<DeliveryMessageResponse>
}
```

**Use cases**

- **Folder share** — send a "Flak shared X with you" email to a non-member.
- **Magic-link signin** — email a one-time token link.
- **Invoice / receipt** — attach a generated PDF.
- **Weekly digest** — bulk-fire summaries from a scheduled action.
- **Bounce / complaint follow-up** — look up a prior send via `get(id)`.

```ts
const mail = useDelivery()

// One-shot
await mail.send({
  to: 'alice@example.com',
  subject: 'Folder shared with you',
  html: '<p>Flak shared "Marketing 2026" with you.</p>',
  space: 'Drive',                  // wordmark next to the Construct mark
})

// Chainable — useful when the body is composed from a loop
await mail.message()
  .to('alice@example.com')
  .subject('Folder shared with you')
  .html('<p>…</p>')
  .tag('drive.share')
  .send()
```

::: info Layout is fixed
Every outbound email is wrapped in the Construct-branded chrome (mark + footer). Layout is **not configurable** — the host owns brand consistency across every space's mail. Use `space` to set the wordmark next to the mark; that's the only customization point.
:::

Attachments are base64-encoded; server caps are 10 files, 10 MB each, 15 MB total decoded.

## Pairing with the UI package

Different concerns, different surfaces. Spaces almost never render notifications themselves — that's a host job.

| You want | Where it lives | What you call |
|---|---|---|
| **Fire a push / inbox notification** | SDK | `useNotification().send()` |
| **Send an email** | SDK | `useDelivery().send()` |
| **Transient "File saved" toast** | SDK runtime | [`useToast()`](/reference/runtime#usetoast) |
| **Render a notification card** (host bell, host inbox) | `@construct-space/ui` | `<Notification>` |

```ts
// Toast on save — purely visual, no server round-trip
import { useToast } from '@construct-space/sdk'
useToast().success('File saved')
```
