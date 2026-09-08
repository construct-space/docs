# Inputs & Forms

17 components for capturing user input. All support `v-model`, all flip with theme, all share the size scale (`xs` / `sm` / `md` / `lg` where applicable).

## Button

```ts
interface Props {
  icon?: string
  trailingIcon?: string
  variant?: 'solid' | 'soft' | 'ghost' | 'outline' | 'link'   // 'solid'
  color?: 'primary' | 'neutral' | 'warning' | 'info' | 'success' | 'error'   // 'primary'
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg'   // 'md'
  loading?: boolean
  disabled?: boolean
  block?: boolean         // full-width
  to?: string             // makes it an <RouterLink>
  label?: string
}
```

Slots: `default`, `leading`, `trailing`.

```vue
<Button icon="i-lucide-upload" @click="upload">Upload</Button>
<Button variant="ghost" color="error" trailing-icon="i-lucide-trash">Delete</Button>
<Button :loading="saving">Save</Button>
```

## Input

```ts
interface Props {
  modelValue?: string | number
  type?: string                 // 'text'
  placeholder?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'   // 'md'
  disabled?: boolean
  required?: boolean
  icon?: string                 // leading icon
  trailingIcon?: string
  prefix?: string               // e.g. 'W' for width
  suffix?: string               // e.g. '%'
  variant?: 'outline' | 'soft' | 'none'   // 'outline'
  autofocus?: boolean
}
```

```vue
<Input v-model="name" placeholder="Folder name" />
<Input v-model="width" type="number" prefix="W" suffix="px" />
<Input v-model="search" icon="i-lucide-search" placeholder="Search…" />
```

## Textarea

```ts
interface Props {
  modelValue?: string
  placeholder?: string
  rows?: number               // 3
  size?: 'xs' | 'sm' | 'md' | 'lg'
  disabled?: boolean
  autoresize?: boolean        // grows with content
  variant?: 'outline' | 'none'
}
```

```vue
<Textarea v-model="description" :rows="5" autoresize />
```

## Checkbox

```ts
interface Props {
  modelValue?: boolean
  label?: string
  disabled?: boolean
  color?: string
}
```

```vue
<Checkbox v-model="agreed" label="I agree to the terms" />
```

## Switch

```ts
interface Props {
  modelValue?: boolean
  label?: string
  disabled?: boolean
  size?: 'xs' | 'sm' | 'md'
}
```

```vue
<Switch v-model="dark" label="Dark mode" />
```

## RadioGroup

```ts
interface RadioOption {
  value: string
  label: string
  description?: string
  icon?: string
  disabled?: boolean
}

interface Props {
  modelValue?: string
  options?: RadioOption[]
  orientation?: 'vertical' | 'horizontal'   // 'vertical'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'card'
  disabled?: boolean
}
```

```vue
<RadioGroup
  v-model="plan"
  variant="card"
  :options="[
    { value: 'free',  label: 'Free',  description: '5 spaces' },
    { value: 'pro',   label: 'Pro',   description: 'Unlimited' },
  ]"
/>
```

## Slider

```ts
interface Props {
  modelValue?: number       // 0
  min?: number              // 0
  max?: number              // 100
  step?: number             // 1
  disabled?: boolean
  size?: 'xs' | 'sm' | 'md'
}
```

```vue
<Slider v-model="volume" :max="100" />
```

## Select

Native `<select>` styled to match the rest of the kit. Fast to render, no JS popup.

```ts
interface SelectOption { label: string; value: string | number | null; disabled?: boolean }

interface Props {
  modelValue?: string | number | null | (string | number | null)[]
  options?: SelectOption[] | string[]
  placeholder?: string                            // 'Select...'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  disabled?: boolean
  multiple?: boolean
  icon?: string
  variant?: 'outline' | 'soft' | 'none'
  valueAttribute?: string                         // 'value'
  optionAttribute?: string                        // 'label'
}
```

```vue
<Select v-model="folder" :options="folders" placeholder="Choose folder" />
```

## SelectMenu

Custom popup version of `Select` with optional search and rich rows (icon + description).

```ts
interface Props extends SelectProps {
  searchable?: boolean
}
```

```vue
<SelectMenu
  v-model="member"
  searchable
  :options="members.map(m => ({ value: m.id, label: m.name, icon: m.avatar }))"
/>
```

## MultiSelect

Pick multiple values. Renders selections as chips inside the trigger.

```ts
interface Props {
  modelValue?: string[]
  options?: { label: string; value: string; disabled?: boolean }[] | string[]
  placeholder?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  disabled?: boolean
  searchable?: boolean         // true
  max?: number                 // hard cap on selections
}
```

```vue
<MultiSelect v-model="tags" :options="allTags" :max="5" />
```

## Autocomplete

Input + dropdown of matching suggestions.

```ts
interface Props {
  modelValue?: string | number | null
  options?: { label: string; value: string | number; disabled?: boolean }[] | string[]
  placeholder?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  disabled?: boolean
  icon?: string
  emptyText?: string           // 'No results'
  clearable?: boolean
}
```

```vue
<Autocomplete v-model="cityId" :options="cities" placeholder="Search cities…" clearable />
```

## ColorPicker

Self-contained HSV/HEX picker with optional alpha and preset swatches. No external color libs.

```ts
interface Props {
  modelValue?: string           // '#FF0000'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  alpha?: boolean
  presets?: string[]
}
```

Emits `update:modelValue` continuously and `change` on commit.

```vue
<ColorPicker v-model="brand" alpha :presets="['#4f8af5', '#ff6b6b', '#10b981']" />
```

## DatePicker

Input with calendar dropdown. Accepts free-form typing (ISO, slash, dash, pure-digit formats — `19820607` etc.); 2-digit years pivot at `currentYear + 10`.

```ts
interface Props {
  modelValue?: string | null     // ISO 'YYYY-MM-DD'
  placeholder?: string           // 'MM/DD/YYYY'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  disabled?: boolean
  min?: string                   // ISO bound
  max?: string                   // ISO bound
  format?: 'iso' | 'locale'
  typeable?: boolean             // true — allow free-form text entry
}
```

```vue
<DatePicker v-model="due" min="2026-01-01" />
```

## Calendar

Full month/week/day view with events. Apple Calendar style.

```ts
interface CalendarEvent {
  id: string | number
  title: string
  start: Date
  end: Date
  color?: string
  allDay?: boolean
}

interface Props {
  modelValue?: Date                       // selected date
  view?: 'month' | 'week' | 'day'         // 'month'
  events?: CalendarEvent[]
  weekStartsOn?: 0 | 1                    // 1 (Monday)
}
```

Emits: `update:modelValue`, `update:view`, `select-date`, `select-range`, `create-event`.

```vue
<Calendar
  v-model="selectedDate"
  v-model:view="view"
  :events="meetings"
  @create-event="openComposer"
/>
```

## FileInput

Drop zone + click-to-browse.

```ts
interface Props {
  modelValue?: File | File[] | null
  accept?: string                // e.g. '.csv,image/*'
  multiple?: boolean
  disabled?: boolean
}
```

```vue
<FileInput v-model="file" accept="image/*" />
<FileInput v-model="files" accept=".csv" multiple />
```

## ToggleGroup

Segmented control / button group. Single or multi.

```ts
interface ToggleOption { label: string; value: string; icon?: string; disabled?: boolean }

interface Props {
  modelValue?: string | string[]
  options: ToggleOption[] | string[]
  multiple?: boolean
  size?: 'xs' | 'sm' | 'md'
  disabled?: boolean
}
```

```vue
<ToggleGroup
  v-model="align"
  :options="[
    { value: 'left',   icon: 'i-lucide-align-left' },
    { value: 'center', icon: 'i-lucide-align-center' },
    { value: 'right',  icon: 'i-lucide-align-right' },
  ]"
/>
```

## FormField

Wraps a control with label / description / help / error. Use `layout="row"` for inline label + control (design-panel style).

```ts
interface Props {
  label?: string
  name?: string
  description?: string
  help?: string
  error?: string
  required?: boolean
  layout?: 'col' | 'row'         // 'col'
}
```

```vue
<FormField label="Email" required :error="errors.email">
  <Input v-model="form.email" type="email" />
</FormField>

<FormField label="Width" layout="row" help="In pixels">
  <Input v-model="form.width" type="number" suffix="px" />
</FormField>
```
