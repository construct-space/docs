# Feedback

One component spaces render: **Alert** — in-flow banner for form errors, deprecation notices, and similar persistent messages.

| Need | Where |
|---|---|
| In-flow banner inside your space | `<Alert />` (below) |
| Transient toast — "File saved", "Copied" | [`useToast()`](/reference/runtime#usetoast). Host mounts the container. |
| Push / inbox notification | [`useNotification`](/reference/composables/messaging#usenotification) (SDK). Host renders. |

## Alert

Banner with color variants, optional icon + close button. Inline; renders wherever you put it.

```ts
interface Props {
  title?: string
  description?: string
  icon?: string
  color?: 'info' | 'success' | 'warning' | 'error'   // 'info'
  closable?: boolean
}
```

Emits `close`.

```vue
<Alert
  color="warning"
  icon="i-lucide-alert-triangle"
  title="Your trial ends in 3 days"
  description="Upgrade to keep your folders synced."
  closable
  @close="dismissed = true"
/>
```
