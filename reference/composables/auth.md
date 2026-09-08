# Auth & Identity

`useAuth`, `useAuthorization`, `useAccess`. Read who's signed in, check what their role is allowed to do, and control per-resource sharing.

::: tip Tenancy comes first
RBAC and ACL run *on top of* multi-tenancy. Every row is already scoped to the user (personal) or org (org context) before any role/access check fires. Read [Tenancy](/guide/tenancy) first if that's new.
:::

## useAuth()

Proxy to the host auth store. Read-only — spaces never mutate auth state. Login / logout / refresh live in the host; by the time a space mounts, `auth.user` is already populated.

```ts
function useAuth(): {
  user: AuthUser | null
  isAuthenticated: boolean
  userName: string                   // pre-computed display name
  userEmail: string
  userAvatar: string | null
}
```

### Public user fields

Fields available on `auth.user`:

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | UUID. Use this in row stamps (`created_by`, `assignee_id`) and ACL grants. |
| `email` | `string` | Primary email. |
| `username` | `string?` | Optional handle (unique). |
| `first_name` | `string?` | |
| `last_name` | `string?` | |
| `name` | `string?` | Display name — `first_name + last_name` when present, else username. |
| `avatar` | `string?` | Avatar URL. |
| `last_login` | `string?` | ISO timestamp. |
| `created_at` | `string` | ISO timestamp. |
| `updated_at` | `string` | ISO timestamp. |


**Use cases**

- **Greet the user** in a header / dashboard.
- **Author stamps** when creating rows — `created_by: auth.user.id`.
- **Self-vs-other UI** — show "Edit" on your own comment, "Reply" on someone else's.
- **Avatar in the toolbar** — bind `auth.user.avatar` to an `<Avatar>` component.

**Greet by name**

```vue
<script setup>
const auth = useAuth()
const userName = computed(() => auth.user?.name ?? 'Guest')
</script>

<template>
  <h1>Welcome back, {{ userName }}</h1>
</template>
```

**Stamp the author when creating a row**

```ts
const auth = useAuth()
const graph = useGraph()

async function createNote(title: string) {
  await graph.Note.create({
    title,
    created_by: auth.user!.id,
  })
}
```

**"You" vs someone else on a comment thread**

```vue
<script setup>
const auth = useAuth()
const isMine = (c: Comment) => c.author_id === auth.user?.id
</script>

<template>
  <CommentRow v-for="c in comments" :key="c.id" :comment="c">
    <Button v-if="isMine(c)" @click="edit(c)">Edit</Button>
    <Button v-else @click="reply(c)">Reply</Button>
  </CommentRow>
</template>
```

::: tip Read state from the store
Never infer the auth state by catching API errors. If `auth.isAuthenticated` is false, don't call the API. This rule is baked into the rest of the SDK.
:::

## useAuthorization()

::: danger ORG SCOPE ONLY
`useAuthorization()` is meaningful **only when the space is running in an org**. Personal users have no roles, no permissions, no admin — they own their data outright. In personal context every `can*` call returns `true`. **Don't gate purely-personal flows with this composable.**
:::

**RBAC** — role-driven decisions. Answers *"can my role do X on Y?"*. One surface — core check plus CRUD sugar. Argument order matches `useAccess`: always `(action, resource)`. For per-resource decisions, use [`useAccess`](#useaccess).

### Declare your permissions in the manifest

> Only relevant when your manifest's `scopes` includes `'org'`. A space scoped only to `'app'` (personal) doesn't need a `permissions[]` block — there's no role system to wire into.

Before you can call `canCreate('folder')`, your space has to **declare what it gates**. Add a `permissions[]` entry to `space.manifest.json`:

```json
{
  "id": "drive",
  "name": "Drive",
  "version": "1.2.0",
  "scopes": ["app", "org"],
  "permissions": [
    {
      "key": "folder.create",
      "label": "Create folders",
      "description": "Add new folders at any level of the tree"
    },
    { "key": "folder.delete", "label": "Delete folders" },
    { "key": "folder.share",  "label": "Share folders with members" }
  ]
}
```

| Field | What it does |
|---|---|
| `key` | Verb + resource, dotted. `can('create', 'folder')` looks up `folder.create`. Keep it lowercase. |
| `label` | Shown in the host's role editor next to the checkbox. |
| `description` | Optional. Helps admins understand what they're granting. |

The host namespaces keys automatically — at runtime your `folder.create` becomes `drive:folder.create`. You don't write the prefix.

**Convention for keys**

- `<resource>.<action>` for CRUD: `folder.create`, `folder.edit`, `folder.delete`, `folder.share`.
- `<area>.<verb>` for non-CRUD: `settings.manage`, `analytics.view`, `report.export`.

### Don't presume role names

Don't try to seed defaults like `["owner", "admin", "member"]` — every org names its roles differently. One might have `pm` and `dev`; another might have `editor`, `lead`, `intern`. Just declare the permissions; the org's admin decides which of their roles get them.

The host guarantees one thing: the **org owner always has every permission** for every installed space. Otherwise installing your space could lock the owner out. Everything else starts denied and the admin grants it explicitly.

### Where the data lives

The role catalog, the permission catalog, and the role↔permission grants all live in **source-api** — the service that owns org-side identity. The host's `useAuthorization` runtime calls source on your behalf; you never talk to it directly.

```
your space ──useAuthorization──▶ host runtime ──HTTP──▶ source-api
                                                          │
                                                          ▼
                                                 roles, permissions,
                                                 role_permissions,
                                                 user_roles
```

Permission catalog rows are scoped to the org (`org_id` column), so two orgs that install the same space have independent grants.

### How the gate becomes true (org context)

1. **You declare** the permission in the manifest (above).
2. **Host registers** it in source on install. The org owner gets every permission automatically; no other role does.
3. **Admin** ticks the box in the host's role editor — source writes a row in `role_permissions`.
4. **User** holds one of those roles → `useAuthorization().canCreate('folder')` returns `true`.

Until step 3 happens, regular users see the deny path (`v-if` falsey, empty-state CTA, etc.). Don't try/catch around the action — read the gate.

### Personal context

A personal user has no org → no roles → nothing to look up. `useAuthorization` shortcuts to "yes" for everything; the gates just compile away. Your `<Button v-if="canNew">` always renders for personal users.

```ts
function useAuthorization(): {
  // Core — reactive
  can(action: string, resource: string, resourceId?: string|number): Ref<boolean>
  canSync(action: string, resource: string): boolean
  canAny(checks: Array<{ action, resource }>): Ref<boolean>
  canAll(checks: Array<{ action, resource }>): Ref<boolean>

  // CRUD sugar — the four gates spaces actually render
  canView(resource: string): Ref<boolean>
  canCreate(resource: string): Ref<boolean>
  canEdit(resource: string): Ref<boolean>
  canDelete(resource: string): Ref<boolean>

  // Role inspection
  roles: Ref<Role[]>
  hasRole(role: string): Ref<boolean>
  hasPermission(name: string): Ref<boolean>
}
```

**Use cases**

- **CRUD toolbars** — show/hide "New", "Edit", "Delete" based on role.
- **Custom actions** — gate "Publish", "Archive", "Approve" via `can('verb', 'resource')`.
- **Empty-state CTAs** — only show "Create your first folder" when `canCreate('folder')`.
- **Admin-only panes** — `<v-if="hasRole('admin')">` around settings, audit log.
- **Composite gates** — show a wizard step only when the user can do *both* `create` and `publish`.
- **Disabled vs hidden** — bind `:disabled` to the negation for affordance discovery.

**Standard CRUD toolbar**

```vue
<script setup>
const { canCreate, canEdit, canDelete } = useAuthorization()

const canNew  = canCreate('folder')
const canMod  = canEdit('folder')
const canDel  = canDelete('folder')
</script>

<template>
  <Toolbar>
    <Button v-if="canNew" @click="newFolder">New</Button>
    <Button v-if="canMod" @click="rename">Rename</Button>
    <Button v-if="canDel" color="danger" @click="del">Delete</Button>
  </Toolbar>
</template>
```

**Custom verb — "Publish space"**

```vue
<script setup>
const { can } = useAuthorization()
const canPublish = can('publish', 'space')
</script>

<template>
  <Button :disabled="!canPublish" @click="publish">Publish</Button>
</template>
```

**Admin-only settings tab**

```vue
<script setup>
const { hasRole } = useAuthorization()
const isAdmin = hasRole('admin')
</script>

<template>
  <Tabs>
    <Tab label="General" />
    <Tab v-if="isAdmin" label="Billing" />
    <Tab v-if="isAdmin" label="Audit log" />
  </Tabs>
</template>
```

**Composite check — needs both create + publish**

```ts
const { canAll } = useAuthorization()

const canRunWizard = canAll([
  { action: 'create',  resource: 'space' },
  { action: 'publish', resource: 'space' },
])
```

**Empty-state CTA**

```vue
<template>
  <Empty v-if="folders.length === 0">
    <p>No folders yet.</p>
    <Button v-if="canCreate('folder')" @click="newFolder">Create one</Button>
    <p v-else>Ask an admin to set one up.</p>
  </Empty>
</template>
```

::: tip Migrating from v0.10
`usePermissions` was folded into `useAuthorization` in v0.11. `p.ui.canEdit('folders')` is now `canEdit('folders')`. `useCanReactive(resource, action)` is now `can(action, resource)` — argument order normalized.
:::

## useAccess

::: danger ORG SCOPE ONLY
`useAccess()` is meaningful **only when the space is running in an org**. Personal users are the sole owners of their own data — there's no one else to grant access to. In personal context every decision call returns `true`; member lists are empty; mutations are no-ops.
:::

**ABAC** — per-resource decisions. *"Can this user share this folder?"*. Reads from your Space's own ACL model.

```ts
function useAccess<T = unknown>(): {
  // Decisions
  can(action: string, resource: T): Ref<boolean>
  canSync(action: string, resource: T): boolean
  filter(action: string, items: T[]): Ref<T[]>
  decide(action: string, items: T[]): Ref<Map<string, boolean>>

  // Membership
  members(resource: T): Ref<AccessMember[]>
  isOrgWide(resource: T): Ref<boolean>
  isRestricted(resource: T): Ref<boolean>
  hasAccess(resource: T, userId: string): Ref<boolean>
  roleOf(resource: T, userId: string): Ref<string | null>
  hasRoleAtLeast(resource: T, role: string): Ref<boolean>

  // Mutations
  grant(resource: T, userId: string, role: string): Promise<void>
  revoke(resource: T, userId: string): Promise<void>
  setRole(resource: T, userId: string, role: string): Promise<void>
  openToOrg(resource: T): Promise<void>
  transferOwnership(resource: T, toUserId: string): Promise<void>
}

interface AccessMember {
  user_id: string
  role: string
  granted_at?: string
  granted_by?: string
}
```

::: tip Full walkthrough
The [Per-Resource Access](/guide/access) guide covers binding the ACL on the model, the full Drive share dialog, role ladders, and when *not* to reach for `useAccess`. Read that first if you're new to ABAC.
:::

**Use cases**

- **Share dialog** — pick org members, grant/revoke a role on *this* folder/board/doc.
- **Item-level guards** — disable "Edit" on rows the user can't touch (different from role-wide gates).
- **Filtered lists** — only show rows the user has access to.
- **Members panel** — list who has access + their role, with promote/demote/transfer-ownership.
- **Open-to-org toggle** — switch a private folder to org-wide in one call.
- **Ownership transfer** — owner hands the resource to another user.
- **Per-row badges** — show a "shared" or "private" indicator next to each item.

**Share a folder with an org member**

```ts
const access = useAccess<Folder>()

async function shareWith(member: OrgMember) {
  await access.grant(folder, member.user_id, 'viewer')
}
```

**Item-level edit gate (different per row)**

```vue
<script setup>
const access = useAccess<Folder>()

function row(folder: Folder) {
  return {
    canEdit: access.can('edit', folder),
    canDelete: access.can('delete', folder),
  }
}
</script>

<template>
  <Row v-for="f in folders" :key="f.id" :gates="row(f)">
    <Button :disabled="!row(f).canEdit.value">Edit</Button>
  </Row>
</template>
```

**Filter visible items**

```ts
const access = useAccess<Folder>()
const visible = access.filter('view', folders.value)
// visible.value is the subset the current user can see
```

**Decide many at once (single round-trip)**

```ts
const decisions = access.decide('edit', folders.value)
// Ref<Map<folder.id, boolean>>
```

**Members panel — list, promote, revoke**

```vue
<script setup>
const access = useAccess<Folder>()
const members = access.members(folder)
</script>

<template>
  <ul>
    <li v-for="m in members" :key="m.user_id">
      {{ m.user_id }} — {{ m.role }}
      <Button @click="access.setRole(folder, m.user_id, 'editor')">Make editor</Button>
      <Button color="danger" @click="access.revoke(folder, m.user_id)">Remove</Button>
    </li>
  </ul>
</template>
```

**Open private folder to the whole org**

```ts
await access.openToOrg(folder)   // clears the ACL → empty member set = org-wide
```

**Visibility badge per row**

```vue
<template>
  <li v-for="f in folders" :key="f.id">
    <Chip v-if="access.isRestricted(f).value" color="warning">Shared</Chip>
    <Chip v-else color="info">Org-wide</Chip>
  </li>
</template>
```

**Transfer ownership**

```ts
await access.transferOwnership(folder, newOwner.user_id)
```

## Choosing between them

| Question | Use |
|---|---|
| Who is signed in? | `useAuth` |
| Is this comment mine? | `useAuth` — compare `auth.user.id` |
| Can my role edit projects in general? | `useAuthorization` — `canEdit('project')` |
| Show/hide a button based on CRUD perms? | `useAuthorization` — `canCreate('folder')`, etc. |
| Is the user an admin? | `useAuthorization` — `hasRole('admin')` |
| Can the user run a custom action? | `useAuthorization` — `can('publish', 'space')` |
| Can the user do both create AND publish? | `useAuthorization` — `canAll([...])` |
| Can this user share *this* folder? | `useAccess` |
| Can the user edit row X (varies per row)? | `useAccess.can('edit', row)` |
| List items the user can edit | `useAccess.filter('edit', items)` |
| Decide many rows in one round-trip | `useAccess.decide('edit', items)` |
| Add a user to a folder's ACL | `useAccess.grant(folder, userId, role)` |
| Show "shared" vs "org-wide" badge | `useAccess.isRestricted(folder)` |
| Transfer ownership | `useAccess.transferOwnership(...)` |
