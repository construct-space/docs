# Runtime Helpers

Host-injected helpers that are exported from `@construct-space/sdk` but are not core data composables. They only have type declarations in the package; the Construct host provides the implementation at runtime.

## useToast()

Transient feedback in the host shell. This is separate from inbox/push notifications.

```ts
function useToast(): {
  success(message: string, opts?: { description?: string; duration?: number }): void
  error(message: string, opts?: { description?: string; duration?: number }): void
  info(message: string, opts?: { description?: string; duration?: number }): void
  warning(message: string, opts?: { description?: string; duration?: number }): void
}
```

```ts
const toast = useToast()
toast.success('Saved')
toast.error('Upload failed', { description: 'Try again in a moment.' })
```

## notify()

Shortcut for a host notification without first acquiring the notification composable.

```ts
await notify({
  title: 'Export ready',
  body: 'tasks.xlsx is ready to download.',
  level: 'success',
  href: '/exports/latest',
})
```

## useAppTheme() / useTheme()

Read the active host theme mode and resolved `--app-*` CSS variable values. Prefer CSS variables for styling; use this only when component logic needs the mode or token values.

```ts
const theme = useAppTheme()
theme.mode.value      // 'light' | 'dark'
theme.vars.value      // { foreground: '#...', background: '#...', ... }
```

`useTheme()` is a legacy alias.

## Spaces, Skills, Marketplace

```ts
const skills = useSkills()
skills.list.value
skills.byId('summarize')

const spaces = useSpaces()
spaces.installed.value
spaces.byId('drive')

const market = useSpaceMarketplace()
await market.search('kanban')
await market.install('kanban')
```

## Credits and Billing

```ts
const credits = useCredits()
credits.balance.value
await credits.refresh()

const billing = useBilling()
billing.plan.value
billing.status.value
await billing.openPortal()
```

## Menus

Register app menu items or open context menus from a Space.

```ts
const appMenu = useAppMenu()
appMenu.register([{ id: 'export', label: 'Export', icon: 'i-lucide-download', onClick: exportRows }])
appMenu.unregister()

showContextMenu([
  { id: 'rename', label: 'Rename', onClick: rename },
  { id: 'delete', label: 'Delete', onClick: deleteItem },
], { x: event.clientX, y: event.clientY })
```

`useContextMenus().registerContributor(context, fn)` lets a Space contribute menu items for host-defined targets.

## Construct Shell

```ts
const config = useConstructConfig()
config.graphUrl.value
config.apiUrl.value
config.profileId.value

const runtime = getConstructRuntime()
runtime.isDesktop
runtime.version

await useConstructAuth().signIn()
await useConstructAuth().signOut()

const win = useConstructWindow()
win.minimize()
win.maximize()
win.close()
```

Other shell helpers:

| Helper | Use |
|---|---|
| `useUpdater()` | Check whether a desktop update is available |
| `useUserModule()` | Read host role/capability metadata |
| `useContextDB()` | Get a Dexie-style DB scoped to the Space |
| `useDeepLink()` | Subscribe to deep-link events targeting the Space |
| `useDraggableWindow()` | Bind an element as a desktop window drag region |
| `useSidebar()` | Read/toggle the host sidebar width and collapsed state |

## AI Model Picker

Read and change the host-curated active model.

```ts
const models = useAIModel()
models.available.value
models.active.value
models.setActive('openai:gpt-5.2')

isVisionModel(models.active.value ?? '')
```

## Shortcuts

Host keyboard shortcut bindings are available through the shortcut store and helper functions.

```ts
const shortcuts = useShortcutStore()
shortcuts.bindings.value

getKey('command.save')
setKey('command.save', 'cmd+s')
resetKey('command.save')
resetAll()
hasOverride('command.save')
```

`exportJson()` and `importJson(json)` move the shortcut map in and out of user settings.

## useBrain()

Advanced bridge to the host brain sidecar. Returns `null` outside the desktop shell, so guard before use.

```ts
const brain = useBrain()
if (brain?.isReady()) {
  const result = await brain.request('space.describe', { space: 'drive' })
}
```

Use this for host-approved agent/session surfaces. Normal Spaces should expose actions in `actions.ts` and let the agent call them.

`postToolResponse(toolUseId, result)` sends a tool result back to brain for Spaces that handle custom UI tools.

## Host-Wired Components

Most components come from `@construct-space/ui`. The SDK only exposes host-wired components:

```ts
import { ConfirmationModal, SplitPane, ToolbarSlot } from '@construct-space/sdk'
```

These share host state such as modal stacking, panel sizing, or toolbar slots.
