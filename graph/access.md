# Access rules

Graph supports two layers of access control. They run in order: tenancy first, then access. ABAC sits on top via the `acl:` binding.

```
incoming request
  ↓
  ① scopes — is this row in your tenant (user / org)?
  ↓
  ② access    — does your role allow this CRUD verb?
  ↓
  ③ acl       — for a specific row: do you have a member entry?
  ↓
  → granted / denied
```

Step ① is set via `scopes:` (see [Tenancy](/guide/tenancy)). Step ② is set via `access:`. Step ③ is set via `acl:`.

## access: — role-based CRUD

Each operation gets one access level. Evaluated *after* tenancy.

```ts
defineModel('note', { /* … */ }, {
  access: {
    read:   'owner',
    create: 'authenticated',
    update: 'owner',
    delete: 'owner',
  },
})
```

| Level | Who can do it |
|---|---|
| `'public'` | Anyone, signed in or not |
| `'authenticated'` | Any signed-in user |
| `'owner'` | The row's `created_by` user |
| `'member'` | Any member of the active org (for `org`-scoped models) |
| `'admin'` | Org admin or higher |
| `'none'` | No-one — disable the op entirely |

There's also `access` helpers if you prefer:

```ts
import { access } from '@construct-space/graph'

defineModel('note', { /* … */ }, {
  access: {
    read:   access.owner(),
    create: access.authenticated(),
    update: access.owner(),
    delete: access.owner(),
  },
})
```

Same effect, more explicit at the call site.

## acl: — per-row sharing

When *some* rows of a model should be shared with specific users (Drive folders, design files, kanban boards), bind an **ACL model**. The base model's `access` rules still apply (any signed-in user can read folders they own); the ACL adds "Alice has been granted editor on *this specific row*."

```ts
// 1. Define the ACL table — one row per (resource, user) grant
const FolderMember = defineModel('folder_member', {
  folder:      relation.belongsTo(Folder, { onDelete: 'cascade' }),
  user_id:     field.string().required().index(),
  role:        field.enum(['viewer', 'editor', 'admin']).required(),
  invited_by:  field.string(),
  invited_at:  field.date(),
})

// 2. Bind it on the main model
const Folder = defineModel('folder', {
  name:     field.string().required(),
  parent:   relation.belongsTo(Folder, { nullable: true }),
}, {
  scopes: ['org'],
  access: { read: 'member', create: 'member', update: 'owner', delete: 'admin' },
  acl: {
    model:       FolderMember,
    resourceKey: 'folder_id',                  // FK column on FolderMember
    roles:       ['viewer', 'editor', 'admin'],
    rules: {
      view:   () => true,                                // any org member sees org-wide folders
      edit:   { atLeast: 'editor' },
      delete: { atLeast: 'admin' },
      share:  { atLeast: 'admin' },
    },
  },
})
```

The SDK's [`useAccess<Folder>()`](/reference/composables/auth#useaccess) reads from `FolderMember` and evaluates `rules` at call time. The space never queries the ACL table directly — it just calls `access.grant(folder, userId, 'editor')`, `access.can('edit', folder)`, etc.

### AclBinding

```ts
interface AclBinding {
  model: ModelDef                       // the ACL table
  resourceKey: string                   // FK column pointing at this resource's id
  roles: readonly string[]              // low → high; used by hasRoleAtLeast()
  rules?: Record<string, (actor: ActorContext, resource: any) => boolean>
  userField?: string                    // default 'user_id'
  roleField?: string                    // default 'role'
  inviterField?: string                 // default 'invited_by'
  invitedAtField?: string               // default 'invited_at'
}
```

### Convention: empty member set = org-wide

A folder with **no rows** in `FolderMember` is open to the whole org (the `access.read: 'member'` rule lets anyone in). Adding the first member row flips it to restricted — only listed users can read it. Clearing all rows opens it back up.

This means "share with Alice" and "make private" are the same operation: write a row. "Open to org" is `revoke()` everyone.

### Custom predicates

When `{ atLeast: 'editor' }` isn't expressive enough, pass a function:

```ts
acl: {
  // …
  rules: {
    delete: (actor, folder) => actor.hasRole('admin') && folder.created_by !== actor.id,
    // — admins can delete folders, but not their own (force a transfer first)
  },
},
```

`actor` is the `ActorContext` — `id`, `roles[]`, plus `.hasRole(name)`, `.hasAccess(resource, role?)`, `.hasRoleAtLeast(resource, role)`.

## Picking the right layer

| Need | Set |
|---|---|
| Personal-only data (notes, drafts) | `scopes: ['app']` |
| Org-wide, role-gated tables (members, settings) | `scopes: ['org']` + `access:` |
| Shared with specific users per row (folders, docs, boards) | `scopes: ['org']` + `access:` + `acl:` |
| Anyone-can-see, no auth (rare) | `access: { read: 'public', ... }` |
| Disable an op entirely | `access: { ...: 'none' }` |

::: warning Personal context skips ACL
A personal user (no org) is the sole owner of their own data. `useAccess` short-circuits to `true` outside an org. Don't put delete-gates behind `useAccess` for `scopes: ['app']` models — the user always wins.
:::

See the [Per-Resource Access guide](/guide/access) for the full Drive share-dialog walkthrough.
