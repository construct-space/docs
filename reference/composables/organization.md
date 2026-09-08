# Organization

The org tenant directory: members, structure, roles. All five composables read from the same store and stay in sync.

## useOrg()

The active organization itself.

```ts
function useOrg(): {
  current: Ref<Organization | null>
  isEnabled: Ref<boolean>
  orgId: ComputedRef<string>
  orgName: ComputedRef<string>
  memberCount: Ref<number>
  teamCount: Ref<number>
  departmentCount: Ref<number>
  pendingInviteCount: Ref<number>

  fetchAll(): Promise<void>
  enable(name: string): Promise<void>
  disable(): Promise<void>
  updateOrg(updates: { name?: string; icon?: string }): Promise<Organization | null>
}
```

```ts
const { orgName, memberCount } = useOrg()
// template: <h1>{{ orgName }} ({{ memberCount }} members)</h1>
```

## useOrgMembers()

The member roster — list, invite, update, remove.

```ts
function useOrgMembers(): {
  members: Ref<OrgMember[]>

  invite(data: { email: string; role?: string }): Promise<OrgInvite | null>
  remove(id: string): Promise<boolean>
  update(id: string, patch: Partial<OrgMember>): Promise<OrgMember | null>
  assignRole(memberId: string, roleId: string): Promise<OrgMember | null>
}
```

This is the canonical "people picker" feed in a share dialog:

```ts
const access = useAccess<Folder>()
const { members } = useOrgMembers()
// template:
// <SelectMenu :options="members"
//             @select="(m) => access.grant(folder, m.id, 'viewer')" />
```

See the [Per-Resource Access guide](/guide/access) for the full Drive share flow.

## useOrgTeams()

```ts
function useOrgTeams(): {
  teams: Ref<Team[]>
  members(teamId: string): Ref<TeamMember[]>
  create(data: { name: string }): Promise<Team | null>
  addMember(teamId: string, userId: string): Promise<void>
  removeMember(teamId: string, userId: string): Promise<void>
}
```

## useOrgDepartments()

```ts
function useOrgDepartments(): {
  departments: Ref<Department[]>
  create(data: { name: string }): Promise<Department | null>
  update(id: string, patch: Partial<Department>): Promise<Department | null>
  remove(id: string): Promise<boolean>
}
```

## useOrgRoles()

The role definitions catalog backing `useAuthorization` role names.

```ts
function useOrgRoles(): {
  roles: Ref<OrgRole[]>
  create(data: { name: string; description: string; permissions: string[] }): Promise<OrgRole | null>
  update(id: string, updates: Partial<OrgRole>): Promise<OrgRole | null>
  remove(id: string): Promise<boolean>
}
```

::: tip Hydration
All five composables share the org store. Calling `useOrg().fetchAll()` once hydrates every list. Individual composables auto-fetch on first access; you rarely need to call `fetchAll` manually.
:::
