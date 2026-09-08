# Utilities

Pure helpers. No host privilege required — just useful enough that every Space ends up wanting them, so the SDK ships one shared implementation instead of letting every Space reinvent it.

## useGoogleFonts()

Reactive Google Fonts catalog with search + load.

**Use cases**
- **Pages** — typography panel; per-block font picker on headings, body, code.
- **Design** — text layer font property; live preview while scrubbing the picker.
- **Resume / Cards** — let the end user re-skin a template before exporting to PDF.
- **Whiteboard / Mind-map** — pick a font per sticky-note theme.
- **Email template editor** — match the brand sample sent through `useDelivery()`.

```ts
function useGoogleFonts(): {
  fonts: Ref<GoogleFont[]>
  fontOptions: ComputedRef<Array<{ label: string; value: string }>>
  search(q: string): GoogleFont[]
  load(family: string, variants?: string[]): Promise<void>
  preloadCached(): Promise<void>
  isFontLoaded(family: string): boolean
  isLoading: Ref<boolean>
  isLoaded: Ref<boolean>
}
```

**Load on mount, swap at runtime**

```ts
const fonts = useGoogleFonts()
onMounted(async () => {
  await fonts.load('Inter', ['400', '500', '700'])
  await fonts.load('JetBrains Mono', ['400'])
})
```

**Font picker bound to a Select**

```vue
<script setup>
const fonts = useGoogleFonts()
const family = ref('Inter')
watch(family, (f) => fonts.load(f))
</script>

<template>
  <Select v-model="family" :options="fonts.fontOptions.value" />
  <p :style="{ fontFamily: family }">The quick brown fox…</p>
</template>
```

**Search-as-you-type**

```ts
const q = ref('')
const matches = computed(() => fonts.search(q.value).slice(0, 20))
```

**Skip the @font-face round-trip if already cached**

```ts
if (!fonts.isFontLoaded('Inter')) {
  await fonts.load('Inter')
}
```

::: tip Pages and Design space lean on this
Multi-typeface surfaces (rich-text docs, design canvases) need to swap fonts per element. The catalog ships pre-fetched so search is local; only the actual `@font-face` injection hits the network.
:::

## useMarkdown()

Markdown → safe HTML, using the host's configured renderer (syntax-highlighted, sanitized, embed-friendly). Two flavours: full and streaming.

**Use cases**
- **Notes / Docs** — render the saved markdown body to display mode.
- **Chat / Threads** — render each user message; switch to streaming variant for live AI replies.
- **Comment threads** — render a single line via `renderMarkdown()` with the inline preset.
- **README viewer** — render a project's repo README inside a space.
- **Changelog / release notes** — render server-supplied markdown into a modal.
- **Agent output** — token-by-token render via `renderStreamingMarkdown()` survives half-closed fences and links.

```ts
function useMarkdown(): {
  renderMarkdown(md: string): string
  renderStreamingMarkdown(md: string): string
  initModules(): Promise<void>
}
```

**Render a note**

```vue
<script setup>
const { renderMarkdown } = useMarkdown()
const html = computed(() => renderMarkdown(note.value.content))
</script>

<template>
  <article class="prose" v-html="html" />
</template>
```

`v-html` is safe — the renderer sanitizes by default and escapes raw HTML in the source.

**Stream tokens from an agent**

The streaming variant tolerates partial input — half-closed code fences, dangling links, unclosed emphasis — and renders something readable at every keystroke:

```ts
const { renderStreamingMarkdown } = useMarkdown()
const buffer = ref('')

for await (const chunk of stream) {
  buffer.value += chunk
}

const html = computed(() => renderStreamingMarkdown(buffer.value))
```

**One-shot import without the composable**

```ts
import { renderMarkdown } from '@construct-space/sdk'
const html = renderMarkdown('# Hello\n```ts\nconst x = 1\n```')
```

**Preload heavy modules**

`initModules()` warms the syntax-highlighter grammar bundle. Useful before the user opens a code-heavy doc:

```ts
await useMarkdown().initModules()
```

## useDateFormat()

Locale-aware date strings. The host owns the locale — spaces just call and get the user's preferred format.

**Use cases**
- **File list / inbox row** — `relative()` for "3m ago", switches to absolute after a week.
- **Notifications bell** — `relative()` per item, full timestamp in a tooltip.
- **Calendar / Events** — `formatDateRange()` for multi-day events.
- **Audit log / activity feed** — `formatDateTime()` for exact "who did what when".
- **Kanban card** — `formatDateNoYear()` on due dates within the current year.
- **Export filenames** — `formatDateShort()` for `"report-2026-03-14.csv"` style names.

```ts
function useDateFormat(): {
  formatDate(date: string | Date): string
  formatDateShort(date: string | Date): string
  formatDateNoYear(date: string | Date): string
  formatDateRange(start: string | Date, end: string | Date): string
  formatDateTime(date: string | Date): string
  relative(date: string | Date): string
}
```

**Inbox row — relative time**

```ts
const dates = useDateFormat()
const label = computed(() => dates.relative(notification.created_at))
// → "3 minutes ago" / "tomorrow" / "last week"
```

**File list — short date, no year for this year**

```vue
<template>
  <span class="text-muted">{{ dates.formatDateNoYear(file.updated_at) }}</span>
</template>
```

**Event card — range across days**

```ts
dates.formatDateRange(event.start, event.end)
// → "Mar 14 – Mar 16, 2026"
```

**Audit log — full timestamp**

```ts
dates.formatDateTime(entry.created_at)
// → "Mar 14, 2026, 9:42 AM"
```

**Mix relative + absolute in a tooltip**

```vue
<Tooltip :content="dates.formatDateTime(file.updated_at)">
  {{ dates.relative(file.updated_at) }}
</Tooltip>
```

## useDownload()

Save a blob / string / remote URL to the user's disk. In Tauri this opens the native save dialog; on web it uses an anchor + `revokeObjectURL`. One call, both hosts.

```ts
function useDownload(): {
  save(data: Blob | string | Uint8Array, opts: DownloadOptions): Promise<void>
  saveUrl(url: string, opts: DownloadOptions): Promise<void>
}

interface DownloadOptions {
  filename: string
  contentType?: string   // inferred from extension when omitted
}
```

**Use cases**
- **CSV / JSON export** — table rows out to a file (see the pairing with `useExport` below).
- **Generated PDF / invoice** — server returns a blob, user saves it.
- **Save attachment from a chat / inbox** — remote URL → user's disk.
- **Export logs / debug bundle** — for support tickets.
- **"Download all" archives** — bundled zip from server.

**Save a generated text file**

```ts
const { save } = useDownload()
await save('hello world', { filename: 'note.txt' })
```

**Save a remote attachment**

```ts
await useDownload().saveUrl(attachment.url, { filename: attachment.name })
```

**Save a server-generated PDF**

```ts
const blob = await useHttp().get<Blob>('/api/reports/q1.pdf', { responseType: 'blob' })
await useDownload().save(blob, { filename: 'q1-report.pdf' })
```

## useExport() / useImport()

One pair for moving tabular data in and out of a space. Parsers + serializers live in the host so spaces don't each bundle 30–200 KB of format code.

### Supported formats

| Format | Extension | MIME | Notes |
|---|---|---|---|
| `csv` | `.csv` | `text/csv` | Default `,` delimiter; override per call |
| `tsv` | `.tsv` | `text/tab-separated-values` | Tab-delimited |
| `json` | `.json` | `application/json` | Array of objects; `pretty: true` for 2-space indent |
| `xlsx` | `.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | Excel binary; pass `sheet` to target a tab |
| `markdown` | `.md` | `text/markdown` | GitHub-style table |

Both composables expose the same `formats: DataFormatInfo[]` array — feed it into a `<Select>` to let users pick the format.

### useExport()

```ts
function useExport(): {
  formats: DataFormatInfo[]
  generate(rows: Array<Record<string, unknown>>, opts: ExportOptions): Promise<string | Blob>
  save(rows, opts: ExportOptions & { filename: string }): Promise<void>
}
```

**Use cases**
- **Table export** — Kanban, contacts, audit log → CSV / Excel.
- **Backup snapshot** — JSON dump of a space's rows.
- **Report generation** — agent runs an action, returns rows, space exports them.
- **Markdown report** — paste a table into a wiki / Notes.

**Headline pairing: export rows to a file**

```ts
import { useExport, useDateFormat } from '@construct-space/sdk'

async function exportTasks(tasks: Task[], format: DataFormat) {
  const exp = useExport()
  const dates = useDateFormat()

  await exp.save(
    tasks.map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      assignee: t.assignee?.name ?? '',
      due: t.due_at ? dates.formatDateShort(t.due_at) : '',
    })),
    {
      format,                                            // 'csv' | 'xlsx' | 'json' | …
      filename: `tasks-${new Date().toISOString().slice(0, 10)}`,
      columns: ['id', 'title', 'status', 'assignee', 'due'],
    },
  )
}
```

**Format picker bound to a Select**

```vue
<script setup>
const exp = useExport()
const format = ref<DataFormat>('csv')
</script>

<template>
  <Select
    v-model="format"
    :options="exp.formats.map(f => ({ label: f.label, value: f.format }))"
  />
  <Button @click="exportTasks(tasks, format)">Export</Button>
</template>
```

**Rename headers without touching the row keys**

```ts
exp.generate(rows, {
  format: 'csv',
  columns: [
    { key: 'id',         label: 'ID' },
    { key: 'created_at', label: 'Created' },
    { key: 'total',      label: 'Amount (USD)' },
  ],
})
```

**Pretty JSON backup**

```ts
const json = await exp.generate(rows, { format: 'json', pretty: true })
await useDownload().save(json as string, { filename: 'backup.json' })
```

**Excel with a named sheet**

```ts
await exp.save(rows, { format: 'xlsx', sheet: 'Q1 Tasks', filename: 'tasks' })
```

### useImport()

```ts
function useImport(): {
  formats: DataFormatInfo[]
  parse<T = Record<string, unknown>>(input: string | File | Blob, opts?: ImportOptions): Promise<T[]>
}
```

**Use cases**
- **Bulk import** — CSV / Excel → array → graph models.
- **Restore from backup** — JSON dump back into a space.
- **Migration** — pull rows out of one space, push into another.

**Parse an uploaded file — format auto-detected**

```vue
<script setup>
const imp = useImport()
const rows = ref<Contact[]>([])

async function onUpload(file: File) {
  rows.value = await imp.parse<Contact>(file, { trim: true, dynamicTyping: true })
}
</script>

<template>
  <FileInput :accept="imp.formats.map(f => f.extension).join(',')" @change="onUpload" />
</template>
```

**Force a format (e.g. paste-from-clipboard text)**

```ts
const rows = await imp.parse(pasted, { format: 'tsv' })
```

**Custom delimiter — semicolon CSV from European exports**

```ts
const rows = await imp.parse(text, { format: 'csv', delimiter: ';' })
```

**Specific sheet from an Excel workbook**

```ts
const rows = await imp.parse(file, { format: 'xlsx', sheet: 'Contacts' })
```
