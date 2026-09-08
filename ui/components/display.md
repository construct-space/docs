# Display

10 components for showing — not capturing — content. Static surfaces, badges, loading placeholders, dividers.

## Avatar

```ts
interface Props {
  src?: string
  alt?: string
  fallback?: string         // initials when src fails
  size?: 'xs' | 'sm' | 'md' | 'lg'   // 'md'
}
```

```vue
<Avatar :src="user.avatar" :fallback="user.name" />
<Avatar fallback="AB" size="lg" />
```

## Badge

```ts
interface Props {
  color?: 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info'   // 'primary'
  variant?: 'solid' | 'soft' | 'subtle' | 'outline'   // 'soft'
  size?: 'xs' | 'sm' | 'md'   // 'sm'
  label?: string
}
```

Slot `default` overrides `label`.

```vue
<Badge color="success">Live</Badge>
<Badge color="warning" variant="outline">Draft</Badge>
<Badge :label="`${count} new`" />
```

## Chip

Like a Badge but with optional icon + remove action. Use for selected tags, filter pills.

```ts
interface Props {
  label?: string
  color?: string                       // CSS color, named, or hex
  removable?: boolean
  icon?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'soft' | 'outline'   // 'soft'
}
```

Emits `remove` when the × is clicked.

```vue
<Chip
  v-for="tag in tags"
  :key="tag"
  :label="tag"
  removable
  @remove="removeTag(tag)"
/>
```

## Card

Surface container with optional header / body / footer regions and a hover-revealed action strip.

```ts
interface Props {
  title?: string
  description?: string
  variant?: 'default' | 'outline' | 'muted'   // 'default'
  hoverable?: boolean
  interactive?: boolean        // cursor-pointer
}
```

Slots: `header` (overrides title/description), `accessory` (right side of header), `default` (body), `footer`, `footer-end`, `actions` (hover-revealed).

```vue
<Card title="Marketing 2026" description="Shared with 4 people" hoverable interactive>
  <template #accessory>
    <Badge color="info">Org</Badge>
  </template>

  <p>Last opened 2 days ago.</p>

  <template #actions>
    <Button variant="ghost" icon="i-lucide-edit" />
    <Button variant="ghost" color="error" icon="i-lucide-trash" />
  </template>
</Card>
```

## Icon

Iconify wrapper. Accepts the `i-lucide-check` / `i-heroicons-home` shorthand and rewrites to Iconify's `lucide:check` / `heroicons:home`.

```ts
interface Props {
  name?: string
}
```

```vue
<Icon name="i-lucide-folder" />
<Icon name="mdi:robot" />        <!-- raw iconify also works -->
```

Invalid / sentence-y values render nothing rather than throw.

## Kbd

Render a keyboard shortcut. Auto-maps `cmd` → `⌘` on Mac, `Ctrl` on Win/Linux. Resolves `alt` / `option` → `⌥`, `shift` → `⇧`, etc.

```ts
interface Props {
  keys: string | string[]
  size?: 'xs' | 'sm' | 'md'   // 'sm'
}
```

```vue
<Kbd keys="cmd+k" />          <!-- ⌘ K -->
<Kbd :keys="['shift', '/']" /> <!-- ⇧ / -->
```

## Progress

Bar (horizontal) or circle (SVG). Indeterminate mode for unknown duration.

```ts
interface Props {
  value?: number              // 0
  max?: number                // 100
  color?: string              // brand by default
  size?: 'xs' | 'sm' | 'md' | 'lg'
  indeterminate?: boolean
  label?: boolean             // show "37%" inline
  variant?: 'bar' | 'circle'  // 'bar'
}
```

```vue
<Progress :value="uploaded" :max="total" label />
<Progress variant="circle" indeterminate size="lg" />
```

## Skeleton

Pulsing loading placeholder. Rectangular, rounded, circle, or multi-line text.

```ts
interface Props {
  width?: string              // CSS length; default '100%'
  height?: string             // CSS length; default '1rem'
  rounded?: boolean
  circle?: boolean
  lines?: number              // when >0, renders that many text-line skeletons
}
```

```vue
<Skeleton circle width="2.5rem" />
<Skeleton :lines="3" />
<Skeleton height="120px" rounded />
```

## Separator

Horizontal or vertical divider, with optional centered label.

```ts
interface Props {
  orientation?: 'horizontal' | 'vertical'   // 'horizontal'
  label?: string
  color?: 'default' | 'accent' | 'success' | 'warning' | 'error' | 'info'   // 'default'
}
```

Slot `default` overrides the label for custom content.

```vue
<Separator />
<Separator label="OR" />
<Separator orientation="vertical" color="accent" />
```

## Empty

Centered empty-state placeholder. Use inside lists / boards when there's nothing to show yet.

```ts
interface Props {
  icon?: string
  title?: string
  description?: string
}
```

Slot `default` is the action area.

```vue
<Empty
  icon="i-lucide-folder-open"
  title="No folders yet"
  description="Create your first folder to start organizing."
>
  <Button @click="newFolder">New folder</Button>
</Empty>
```
