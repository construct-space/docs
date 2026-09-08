# Layout

7 components for composing the structure of a page — sidebar shell, splits, scrolls, accordions, panel sections, design-tool-style property rows.

## Accordion

Collapsible sections. Single (only one open at a time) or multiple (any open simultaneously).

```ts
interface AccordionOption {
  label: string
  icon?: string
  content?: string       // plain text content
  defaultOpen?: boolean
  disabled?: boolean
  slot?: string          // name a slot for rich content
  value?: string
}

interface Props {
  items?: AccordionOption[]
  type?: 'single' | 'multiple'   // 'single'
  defaultValue?: string | string[]
}
```

```vue
<Accordion
  type="multiple"
  :items="[
    { value: 'general', label: 'General',  defaultOpen: true, slot: 'general' },
    { value: 'advanced', label: 'Advanced', slot: 'advanced' },
  ]"
>
  <template #general>  <GeneralSettings />  </template>
  <template #advanced> <AdvancedSettings /> </template>
</Accordion>
```

## Group

Flex wrapper with gap / direction / alignment props. Saves you writing `flex items-center gap-2` repeatedly.

```ts
interface Props {
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg'    // 'sm'
  direction?: 'row' | 'column'                 // 'row'
  align?: 'start' | 'center' | 'end' | 'stretch'    // 'center'
  justify?: 'start' | 'center' | 'end' | 'between'  // 'start'
  wrap?: boolean
}
```

```vue
<Group gap="md" justify="between">
  <h1>Folders</h1>
  <Group><Button icon="i-lucide-filter" /><Button icon="i-lucide-plus" /></Group>
</Group>
```

## SplitPane

Resizable split with drag handle. Horizontal or vertical.

```ts
interface Props {
  direction?: 'horizontal' | 'vertical'   // 'horizontal'
  initialSize?: number       // 50 (percent)
  minSize?: number           // 10 (percent)
  maxSize?: number           // 90 (percent)
  minPaneSizePx?: number     // px floor for each pane
}
```

Slots: `first`, `second`.

```vue
<SplitPane :initial-size="30" :min-size="20" :max-size="60">
  <template #first>  <FolderTree />  </template>
  <template #second> <FileGrid />    </template>
</SplitPane>
```

## ScrollArea

Themed scrollable container. Custom scrollbar styling that flips with theme — narrow rails on hover, transparent at rest.

```vue
<ScrollArea class="h-96">
  <LongList />
</ScrollArea>
```

No props. The component injects its scrollbar CSS once at first mount, then applies a `cui-scroll` class.

## PanelSection

Section header for design-panel-style sidebars — bold uppercase label + optional action.

```ts
interface Props {
  label: string
  collapsible?: boolean
}
```

Slots: `default` (section body), `action` (right-side button, e.g. `+`).

```vue
<PanelSection label="Layout" collapsible>
  <PropRow><Input v-model="w" prefix="W" /><Input v-model="h" prefix="H" /></PropRow>
</PanelSection>

<PanelSection label="Prototype">
  <template #action><Button variant="ghost" icon="i-lucide-plus" /></template>
  <!-- … -->
</PanelSection>
```

## PropRow

Horizontal row for property controls. Slots laid out in equal columns. Pairs with `PanelSection` to recreate the Figma-style design panel.

```ts
interface Props {
  label?: string        // optional left-aligned label
  cols?: number         // 0 = auto-equal
}
```

```vue
<PropRow>
  <Input v-model="x" prefix="X" />
  <Input v-model="y" prefix="Y" />
</PropRow>

<PropRow label="Opacity">
  <Input v-model="opacity" suffix="%" />
  <Select v-model="blend" :options="blendModes" />
</PropRow>
```

## SidebarLayout

60px icon-only left rail + content slot. Use it for multi-section screens inside your space — settings, billing, admin areas.

```ts
interface NavItem {
  icon: string         // 'i-lucide-home' or 'lucide:home'
  label: string        // tooltip
  to: string           // path inside your space
  active?: boolean
}

interface Props {
  navItems?: NavItem[]
  serviceName?: string
  serviceIcon?: string
  userName?: string
  userAvatar?: string
  accentColor?: string
}
```

Slot `default` is the content panel. Emits `navigate(to)`, `logout`.

```vue
<SidebarLayout
  service-name="Settings"
  service-icon="i-lucide-settings"
  :nav-items="[
    { icon: 'i-lucide-user',   label: 'Profile',  to: '/profile' },
    { icon: 'i-lucide-shield', label: 'Security', to: '/security' },
    { icon: 'i-lucide-bell',   label: 'Notifications', to: '/notifications' },
  ]"
  @navigate="path => nav.to(path)"
>
  <RouterView />
</SidebarLayout>
```

