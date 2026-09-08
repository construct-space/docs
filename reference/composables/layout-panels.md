# Toolbar & Breadcrumb

Host-toolbar contributions: action items, search, and the breadcrumb trail.

::: tip Panels, splitters, popovers — use the UI library
Layout primitives like `<SplitPane>`, `<DashboardPanel>`, `<PanelSection>`, `<Dropdown>`, `<Popover>` live in [`@construct-space/ui`](https://www.npmjs.com/package/@construct-space/ui). They handle positioning, resize, dock state, and edge-collision themselves — no SDK composable needed.
:::

::: tip Theme is plain CSS first
Use the host's CSS custom properties for styling:

```css
color: var(--app-foreground);
background: var(--app-background);
border-color: var(--app-border);
```

The values flip automatically when the user toggles the theme.

If component logic needs the active mode or resolved token values, use [`useAppTheme()`](/reference/runtime#useapptheme--usetheme).
:::

## useToolbar()

Contribute items to the active space's toolbar — buttons, chips, dropdowns, search.

```ts
function useToolbar(): {
  setPageItems(items: ToolbarItem[]): void
  clearPageItems(): void
  setSearch(placeholder: string, handler: (q: string) => void): void
  // …registerItem, executeSearch, toggleCustomize, etc.
}
```

```ts
const tb = useToolbar()
tb.setPageItems([
  { id: 'drive:upload', type: 'action', label: 'Upload', icon: 'i-lucide-upload', onClick: openUploadDialog },
])
tb.setSearch('Search Drive…', (q) => runSearch(q))
```

## useBreadcrumb()

Declare the breadcrumb trail for the active space. The host renders it in the toolbar's left slot. Clicking a crumb fires `nav.to(crumb.to)`.

```ts
function useBreadcrumb(): {
  trail: ComputedRef<Breadcrumb[]>
  set(items: Breadcrumb[]): void
  push(item: Breadcrumb): void
  pop(): Breadcrumb | undefined
  clear(): void
}

interface Breadcrumb {
  label: string
  icon?: string
  iconColor?: string
  to?: string         // path inside this space; omit on the current/leaf crumb
}
```

**Set the full trail when the route changes**

```ts
const nav = useNavigator()
const crumbs = useBreadcrumb()

watchEffect(() => {
  crumbs.set([
    { label: 'Drive', to: '/' },
    { label: folder.value.name, to: `/folders/${folder.value.id}` },
    { label: file.value.name },         // current — no `to`
  ])
})
```

**Push / pop incrementally**

```ts
function openSubfolder(sub: Folder) {
  crumbs.push({ label: sub.name, to: `/folders/${sub.id}` })
  nav.to(`/folders/${sub.id}`)
}

function goBack() {
  crumbs.pop()
  nav.back()
}
```

**Use cases**
- **File browsers** — Drive, Photos, Notes folders.
- **Wizards** — show progress through a multi-step flow.
- **Nested settings** — Settings › Account › Security.
- **Project hierarchy** — Project › Sprint 5 › Story #42.
