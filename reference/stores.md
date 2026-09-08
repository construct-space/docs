# Stores

Store declarations mirror host Pinia stores. The host provides runtime implementations; the SDK provides the public TypeScript contract.

## useAuthStore()

Read-only auth state. Spaces should not own login, logout, or token refresh.

```ts
const auth = useAuthStore()
auth.user
auth.isAuthenticated
auth.userName
auth.userEmail
auth.userAvatar
```

Most Spaces should use [`useAuth()`](/reference/composables/auth#useauth), which returns the same surface.

## usePinnedStore()

Manage user-pinned projects, folders, pages, spaces, links, and tasks.

```ts
const pinned = usePinnedStore()

await pinned.init()
pinned.pinnedItems
pinned.isPinned('project:123')
await pinned.addPin(createProjectPin({ id: 123, name: 'Website', path: '/projects/123' }))
await pinned.togglePin(createLinkPin({ name: 'Docs', url: 'https://docs.lisaos.dev' }))
await pinned.reorder(['a', 'b', 'c'])
```

Pin factory helpers:

| Helper | Creates |
|---|---|
| `createProjectPin(project)` | Project pin |
| `createFolderPin(folder)` | Folder pin |
| `createPagePin(page)` | Page pin |
| `createSpacePin(space)` | Space pin |
| `createLinkPin(link)` | External link pin |
| `createTaskPin(task)` | Task pin |

## usePreferencesStore()

User preferences for toolbar, sidebar, theme, and editor settings.

```ts
const prefs = usePreferencesStore()

await prefs.init()
prefs.theme
prefs.toolbarCollapsed
prefs.sidebarWidth
prefs.editorSettings

await prefs.setTheme('dark')
await prefs.setSidebarCollapsed(true)
await prefs.setEditorSettings({ fontSize: 14 })
```

## useSettingsStore()

App-wide settings grouped by company, system, email, media, security, design, AI, and collaboration.

```ts
const settings = useSettingsStore()

await settings.fetchSettings()
settings.companyName
settings.aiEnabled
settings.autoSaveEnabled
settings.gridSize

await settings.updateSetting(12, { value: 'Europe/Belgrade' })
await settings.updateCompanySettings({ company_name: 'Construct' })
settings.clearError()
```

Use the narrowest update helper available for the settings group you are editing.
