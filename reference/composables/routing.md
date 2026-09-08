# Routing & Shortcuts

One navigator for the space's own pages, plus per-space keybindings.

## useNavigator()

GetX-style navigation. Verb-first, terse, awaitable. Replaces the older `useRoute` + `useRouter` + `navigateTo` trio with a single composable.

```ts
function useNavigator(): {
  // Reactive state
  current: Ref<SpaceRoute>
  params: ComputedRef<Record<string, string>>
  query: ComputedRef<Record<string, string>>
  arguments: ComputedRef<unknown>

  // Push
  to<T = unknown>(path: string, opts?: NavigateOptions): Promise<T | undefined>
  // Replace
  off(path: string, opts?: NavigateOptions): Promise<void>
  // Clear stack + push
  offAll(path: string, opts?: NavigateOptions): Promise<void>

  // Pop
  back<T = unknown>(result?: T): void
  until(predicate: (route: SpaceRoute) => boolean): void

  forward(): void
  go(delta: number): void
  isCurrent(path: string): boolean
}
```

### The basics

```ts
const nav = useNavigator()

nav.to('/folders/123')                 // push
nav.off('/list')                       // replace current (no new history entry)
nav.offAll('/home')                    // clear stack and push
nav.back()                             // pop
nav.go(-2)                             // pop two
```

### Reactive route state

```ts
const nav = useNavigator()

// Path params (/detail/:id → { id: '42' })
const folderId = computed(() => nav.params.value.id)

// Query string
const sort = computed(() => nav.query.value.sort ?? 'name')

// Whole route
watch(nav.current, (route) => {
  console.log('moved to', route.path)
})
```

### Picker pattern — awaiting `back(result)`

`nav.to()` returns a promise that resolves when the destination calls `nav.back(result)`. Lets you write pickers that read like sync code.

```ts
// In the caller — opens the picker, waits for a result
async function chooseAssignee() {
  const userId = await nav.to<string>('/pick-user')
  if (userId) form.assigneeId = userId
}

// In the picker page
function pick(user: User) {
  nav.back(user.id)   // resolves the awaiting nav.to() with this value
}
```

### Passing arbitrary args (not in the URL)

For data heavier than what should sit in the URL — pre-filled form state, opened-from context, etc.

```ts
// Caller
nav.to('/edit', { arguments: { draft: existingDraft, source: 'list' } })

// Destination
const nav = useNavigator()
const args = nav.arguments.value as { draft: Note; source: string }
```

Arguments survive push/replace but **not** a page refresh — they're in-memory only. Use the URL (`params` / `query`) for anything that must be shareable or bookmarkable.

### Pop until predicate

After a multi-step flow, pop back to a known page in one call.

```ts
// At the end of an onboarding wizard
nav.until(route => route.path === '/dashboard')
```

### Use cases

- **Detail navigation** — `nav.to('/folders/' + id)` from a list row.
- **Wizard / multi-step flow** — `nav.to('/step-2')`, eventually `nav.until(r => r.path === '/dashboard')`.
- **Picker / chooser** — `await nav.to('/pick-color')` then `nav.back(color)` inside.
- **Replace after login** — `nav.offAll('/home')` once the auth flow completes.
- **Cancel a stack** — wizard's cancel button: `nav.until(r => r.path === '/start')` then `nav.back()`.
- **Inline filters** — `nav.off(nav.current.value.path, { query: { sort: 'name' } })`.

## useSpaceShortcuts()

Register keybindings that fire only while this space is active. Auto-cleaned up on unmount.

```ts
function useSpaceShortcuts(shortcuts: SpaceShortcut[]): void

interface SpaceShortcut {
  key: string                     // e.g. 'cmd+s', 'shift+/'
  label: string                   // shown in command palette
  group?: string
  when?: () => boolean
  onPress: () => void
}
```

```ts
useSpaceShortcuts([
  { key: 'cmd+n', label: 'New folder', onPress: newFolder },
  { key: 'cmd+shift+s', label: 'Share folder', when: () => !!selected.value, onPress: openShare },
])
```

Combos use the standard modifier syntax: `cmd`, `ctrl`, `alt`, `shift` joined with `+`. On non-Mac, `cmd` is auto-aliased to `ctrl`.

## Filesystem-based routing

Inside a space, route definitions are derived from `src/pages/` at build time:

```
src/pages/
├── index.vue              → /
├── folders/
│   ├── index.vue          → /folders
│   └── [id].vue           → /folders/:id
└── settings.vue           → /settings
```

The CLI generates `src/entry.ts` from `space.manifest.json` + this directory tree. You never write a routes file by hand.
