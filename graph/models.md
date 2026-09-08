# Defining models

A model is a typed schema. `defineModel(name, fields, options?)` declares it; the host's graph service derives the GraphQL schema + storage tables at install time. You never write SQL.

## defineModel()

```ts
function defineModel(
  name: string,                                          // table / type name
  fields: Record<string, FieldBuilder | RelationBuilder>,
  options?: ModelOptions,
): ModelDef
```

```ts
import { defineModel, field, relation } from '@construct-space/graph'

const Folder = defineModel('folder', {
  name:    field.string().required(),
  color:   field.enum(['blue', 'green', 'pink']).default('blue'),
  parent:  relation.belongsTo(Folder, { nullable: true, onDelete: 'cascade' }),
})
```

**Name rules.** Model and field names must be alphanumeric (underscores allowed) and start with a letter. The validator throws at build time on anything else.

## Field types

```ts
field.string()                          // VARCHAR / TEXT
field.int()                             // INTEGER
field.number()                          // FLOAT
field.boolean()                         // BOOLEAN
field.date()                            // TIMESTAMP
field.json()                            // JSONB — arbitrary structured blob
field.enum(['low', 'mid', 'high'])      // CHECK-constrained string
```

## Field modifiers

All field builders chain. The order doesn't matter.

```ts
field.string().required().unique().index()
field.int().min(0).max(100).default(0)
field.string().email()                  // adds an email-format validator
field.string().url()                    // adds a URL-format validator
```

| Modifier | Effect |
|---|---|
| `.required()` | `NOT NULL` |
| `.unique()` | adds a unique index |
| `.index()` | adds a regular index |
| `.default(value)` | stored as the column default |
| `.email()` | runtime validation on writes |
| `.url()` | runtime validation on writes |
| `.min(n)` / `.max(n)` | range bounds (numbers + string length) |

## Relations

Two kinds. Foreign keys are managed by the graph service.

```ts
relation.belongsTo(target, {
  nullable?: boolean,
  onDelete?: 'cascade' | 'set_null' | 'restrict',
})

relation.hasMany(target)
```

```ts
const Comment = defineModel('comment', {
  body:    field.string().required(),
  post:    relation.belongsTo(Post, { onDelete: 'cascade' }),
})

const Post = defineModel('post', {
  title:    field.string().required(),
  comments: relation.hasMany(Comment),
})
```

`.belongsTo()` creates a `<target>_id` foreign key on this model. `.hasMany()` is the inverse declaration — no column, just lets you fetch related rows.

## ModelOptions

```ts
interface ModelOptions {
  scopes?: Array<'app' | 'org'>            // tenancy boundary (see below)
  access?: {
    read:   AccessLevel
    create: AccessLevel
    update: AccessLevel
    delete: AccessLevel
  }
  acl?: AclBinding                          // per-row ACL — see /graph/access
}

type AccessLevel = 'public' | 'authenticated' | 'owner' | 'member' | 'admin' | 'none'
```

### scopes

Decides the **tenancy boundary** of every row. Same shape and vocabulary as the manifest's `scopes` field — the manifest says where the space can be installed; this says where the model's rows live. See the [Tenancy guide](/guide/tenancy) for the full mental model.

| Value | Rows are keyed by |
|---|---|
| `'app'` | The signed-in user — personal data |
| `'org'` | The active organization |

`scopes` is always an array. List one tenant to pin the model there, or both to adapt to whichever install context is active.

```ts
const Note   = defineModel('note',   { /* … */ }, { scopes: ['app'] })           // personal-only
const Member = defineModel('member', { /* … */ }, { scopes: ['org'] })           // org-only
const Folder = defineModel('folder', { /* … */ }, { scopes: ['app', 'org'] })    // either
```

A `find()` query against `Note` only returns the current user's rows; against `Member`, only the active org's. A `find()` against `Folder` returns the user's rows if the space is installed personally, the org's rows if installed in an org. The tag is enforced server-side — spaces cannot leak across tenants.

For data scoped to a specific project inside an org (Kanban tasks, design files), use `scopes: ['org']` and add a `project_id` field — keeping project as application data rather than a tenant boundary leaves cross-project flows (move, archive) in your control.

### access

Role-level CRUD gates. Evaluated *after* tenancy.

| Level | Meaning |
|---|---|
| `'public'` | Anyone, signed in or not (rarely used in Construct) |
| `'authenticated'` | Any signed-in user |
| `'owner'` | Only the row's `created_by` user |
| `'member'` | Any member of the org (for `org`-scoped models) |
| `'admin'` | Org admin or higher |
| `'none'` | Nobody — disable the op entirely |

```ts
const Note = defineModel('note', { /* … */ }, {
  scopes: ['app'],
  access: {
    read:   'owner',
    create: 'authenticated',
    update: 'owner',
    delete: 'owner',
  },
})
```

For **per-row** sharing (Alice can edit *this* folder but not Bob's), see the [`acl:` binding](/graph/access).

## Cross-space imports

A publisher bundle (e.g. `kanban` + `kanban-admin`) can share models. The owning space declares the table; siblings import.

```ts
// kanban-admin's space
const manifest: DataManifest = {
  version: 1,
  models: [/* this space's own models */],
  bundle_id: 'kanban',
  imports: [
    { from: 'kanban', models: ['Board', 'Card'] },
  ],
}
```

Re-declaring an imported model in `models[]` overrides its access rules locally; the underlying table stays in the source space. **Cross-bundle imports are rejected** at publish time.

## Manifest extraction

The host extracts a `DataManifest` from your registered models at build time. You almost never write one by hand — `defineModel` registers each model, and the CLI runs `extractManifest()` for you.

```ts
import { extractManifest, manifestToJSON } from '@construct-space/graph'

const manifest = extractManifest({ bundle_id: 'kanban', imports: [...] })
const json = manifestToJSON(manifest)
```

This shape is what the host's install pipeline reads to provision your tables.
