# Schemas

`@construct-space/sdk/schemas` exports Zod schemas and validation helpers for manifests and common API shapes.

## Manifest Schemas

```ts
import {
  spaceManifestSchema,
  spaceWidgetManifestSchema,
  validateManifest,
  validateWidgetManifest,
} from '@construct-space/sdk/schemas'

const result = validateManifest(manifest)
if (!result.success) {
  console.error(result.error.issues)
}
```

Available manifest schemas:

| Schema | Validates |
|---|---|
| `spaceManifestSchema` | Whole `space.manifest.json` |
| `spaceNavigationSchema` | `navigation` block |
| `spacePageSchema` | Page entries |
| `spaceToolbarItemSchema` | Toolbar item entries |
| `spaceToolbarConfigSchema` | Toolbar config |
| `spaceWidgetManifestSchema` | Widget manifest entries |
| `spacePermissionSchema` | Dotted permission keys such as `folder.create` |

`SpaceManifestInput` is exported as the input type for `spaceManifestSchema`.

## Activity and Pagination

```ts
const activity = validateActivity(input)

const page = paginationSchema.parse({
  page: 1,
  per_page: 50,
  sort_dir: 'desc',
})
```

Exports:

| Export | Use |
|---|---|
| `activitySchema` / `ActivityInput` / `validateActivity()` | Activity payload validation |
| `paginationSchema` / `PaginationInput` | Page/per-page/sort validation |
| `apiResponseSchema(dataSchema)` | Wrap a Zod schema in `{ data, message?, error? }` |
