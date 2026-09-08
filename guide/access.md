# Per-Resource Access

Construct gives each Space its own per-resource access control. Want to share a folder with three specific colleagues? Make a board private to a project team? Open a doc back to the whole org? That's `useAccess` + `defineModel({ acl })`.

## The model in one sentence

**RBAC** asks *"what is this user's role allowed to do?"* — see [`useAuthorization`](/reference/composables/auth#useauthorization).

**ABAC** (what `useAccess` does) asks *"given the attributes of this specific resource — its members, its owner, its state — is this user allowed?"* That's a different question, and it's the one share-with-colleagues UIs need.

## Conventions

These are baked in. Read them once, never think about them again.

::: tip Empty ACL = open to org
A resource with **zero member rows** is visible to everyone in the org (subject to the model's `access:` RBAC rules). Adding the first member **restricts** the resource. Clearing all members opens it back up.
:::

::: tip User-only principals
Construct is a desktop app — no anonymous web link, no public sharing. Sharing means either *"this specific user"* or *"the whole org"* (implicit). Teams and departments are an extension a Space can add on its own ACL model.
:::

::: tip Per-space ACL tables
There is no global access table. Each Space owns its own. Drive's ACL is `FolderMember`, Board's is `BoardMember`, Pages' is `PageMember`. The SDK's `useAccess` composable binds to whichever model your `defineModel` declared.
:::

## Wiring the model

Declare your resource and its ACL side-by-side. The ACL table is just another model — three columns minimum:

```ts {15-22}
// src/models/Folder.ts
import { defineModel, field, access } from '@construct-space/graph'

export const FolderMember = defineModel('folder_member', {
  folder_id: field.string().required().index(),
  user_id:   field.string().required().index(),
  role:      field.string().required(),
}, {
  access: { read: access.member(), create: access.member(),
            update: access.member(), delete: access.member() },
})

export const Folder = defineModel('folder', {
  name:      field.string().required(),
  owner_id:  field.string().required(),
  parent_id: field.string(),
}, {
  access: {                                  // RBAC — coarse CRUD
    read:   access.member(),
    create: access.authenticated(),
    update: access.member(),
    delete: access.owner(),
  },
  acl: {                                     // ABAC — per-resource sharing
    model: FolderMember,
    resourceKey: 'folder_id',
    roles: ['viewer', 'commenter', 'editor', 'owner'],
    rules: {
      // Custom rule. Without a rule, useAccess.can(action, resource)
      // returns true if the actor has any member row on the resource.
      share: (actor, f) => actor.hasRoleAtLeast(f, 'owner'),
    },
  },
  scopes: ['org'],
})
```

That's all the declaration `useAccess<Folder>()` needs.

## The Drive share dialog — full flow

Two composables, no glue.

```vue
<script setup lang="ts">
import { useAccess, useOrgMembers } from '@construct-space/sdk'
import { Modal, Button, SelectMenu } from '@construct-space/ui'
import type { Folder } from '../models/Folder'

const props = defineProps<{ folder: Folder }>()

const access = useAccess<Folder>()
const { members: orgPeople } = useOrgMembers()

const isOpen      = access.isOrgWide(props.folder)
const currentACL  = access.members(props.folder)
const canShare    = access.can('share', props.folder)

async function shareWith(m: { id: string }) {
  await access.grant(props.folder, m.id, 'viewer')
}
async function promote(uid: string, role: string) {
  await access.setRole(props.folder, uid, role)
}
async function removeAccess(uid: string) {
  await access.revoke(props.folder, uid)
}
async function makeOrgWide() {
  await access.openToOrg(props.folder)
}
</script>

<template>
  <Modal v-if="canShare">
    <h3>Share "{{ folder.name }}"</h3>

    <p v-if="isOpen">Open to everyone in your organization.</p>

    <ul v-else>
      <li v-for="m in currentACL" :key="m.user_id">
        {{ m.user_id }} — {{ m.role }}
        <Button @click="promote(m.user_id, 'editor')">Make editor</Button>
        <Button @click="removeAccess(m.user_id)">Remove</Button>
      </li>
    </ul>

    <SelectMenu :options="orgPeople" @select="shareWith" />
    <Button @click="makeOrgWide">Make org-wide</Button>
  </Modal>
</template>
```

That's the entire share dialog. No `provide`/`inject`, no policy engine boot, no permission middleware. The composable knows what model to write to because `defineModel` declared the `acl:` binding.

## Filtering lists by access

For "show me only the folders I can edit" — don't loop `can()`. Use `filter()`:

```ts
const { records: folders } = useData(Folder)
const access = useAccess<Folder>()

const visibleFolders   = access.filter('view', folders.value)
const editableFolders  = access.filter('edit', folders.value)
const sharableFolders  = access.filter('share', folders.value)
```

Each call is a single batched evaluation, not N round-trips.

## The role ladder

`acl.roles: ['viewer', 'commenter', 'editor', 'owner']` defines ordering. `hasRoleAtLeast` is positional:

```ts
access.hasRoleAtLeast(folder, 'editor')
// → true for any user granted 'editor' OR 'owner'
```

Use this inside `rules` so policies read like English:

```ts
rules: {
  comment: (actor, f) => actor.hasRoleAtLeast(f, 'commenter'),
  edit:    (actor, f) => actor.hasRoleAtLeast(f, 'editor'),
  share:   (actor, f) => actor.hasRoleAtLeast(f, 'owner') || f.owner_id === actor.id,
  delete:  (actor, f) => f.owner_id === actor.id,
}
```

When `can(action, resource)` is called and `rules[action]` is missing, the default behavior is *"true if the actor has any member row on the resource"*. So you only write rules for actions whose decision is non-obvious.

## Org-wide vs restricted

Convenience helpers replace counting members yourself:

```ts
access.isOrgWide(folder)       // members.length === 0
access.isRestricted(folder)    // members.length > 0
access.hasAccess(folder, uid)  // uid is in the member set
access.roleOf(folder, uid)     // Ref<string | null>
```

Flipping back to org-wide deletes every member row:

```ts
await access.openToOrg(folder)
```

## When you DON'T need this

If your Space's `scopes` is `app` — single user, no org — `useAccess` is unnecessary. Nobody else can see this user's data anyway. Don't add an ACL model; the boilerplate buys nothing.

For org-scoped Spaces where everything is "org-wide and that's the whole feature" (e.g., a shared announcements board), you also don't need `useAccess` — the model's `access:` RBAC rules handle visibility on their own.

You reach for `useAccess` exactly when *some* rows in an org-scoped resource are restricted to *specific users*. Drive, private docs, project-scoped boards — that's the use case.

## Extending: teams, departments

The SDK doesn't ship team/department principals. Adding them is your model's call:

```ts
export const FolderMember = defineModel('folder_member', {
  folder_id:       field.string().required().index(),
  principal_type:  field.string().required(),  // 'user' | 'team' | 'department'
  principal_id:    field.string().required().index(),
  role:            field.string().required(),
}, { ... })
```

Then write a thin wrapper composable in your Space (`useFolderAccess`) that calls `useAccess<Folder>()` for user grants and your own functions for the team/department cases. The SDK stays narrow; spaces with richer needs extend it.
