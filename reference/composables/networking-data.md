# Networking & Data

HTTP client, file storage, per-space KV. For typed models with relations and queries, use [`@construct-space/graph`](https://www.npmjs.com/package/@construct-space/graph).

## useHttp()

Full HTTP client — typed verbs, JSON in/out, query params, retry, interceptors, scoped instances. In Tauri the requests route through the host's Rust `http_fetch` command (reqwest) so CORS is bypassed; on web it falls back to native `fetch`.

::: warning Use this — do not bring another HTTP library
`useHttp` is the SDK's HTTP surface. Don't bundle `axios`, `ky`, `ofetch`, `dio`, etc. — they duplicate the surface, bypass the host's request pipeline (interceptors, auth, retry), and waste bundle space. The shape below covers everything those libraries do.
:::

```ts
function useHttp(): {
  // Verb shortcuts — return parsed body as T; throw on non-2xx
  get<T>(url, config?):  Promise<T>
  delete<T>(url, config?): Promise<T>
  head<T>(url, config?): Promise<T>
  options<T>(url, config?): Promise<T>
  post<T>(url, data?, config?):  Promise<T>
  put<T>(url, data?, config?):   Promise<T>
  patch<T>(url, data?, config?): Promise<T>

  // Full request — returns HttpResponse<T> { data, status, headers, url }
  request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>>

  // Scoped instance — own baseUrl, headers, interceptors
  create(defaults?: HttpClientDefaults): HttpClient

  defaults: HttpClientDefaults
  interceptors: HttpInterceptors
  isHttpError(err): err is HttpError
}
```

### The 90% case

```ts
const http = useHttp()

// GET → typed JSON body
const me = await http.get<User>('/api/me')

// POST JSON
const note = await http.post<Note>('/api/notes', { title: 'Hello' })

// Query params (arrays repeat the key, null/undefined are skipped)
const results = await http.get('/api/search', {
  params: { q: 'foo', tags: ['ts', 'vue'], limit: 20 },
})
```

### Scoped client for a third-party API

`http.create()` returns a child client with its own defaults. Use one per external service so headers and `baseUrl` are set once.

```ts
const stripe = http.create({
  baseUrl: 'https://api.stripe.com/v1',
  headers: { Authorization: `Bearer ${secret}` },
  timeoutMs: 30_000,
})

const charges = await stripe.get('/charges', { params: { limit: 10 } })
```

### Interceptors — auth refresh, logging, request mutation

```ts
http.interceptors.request.use((config) => {
  config.headers = { ...config.headers, 'X-Trace-Id': crypto.randomUUID() }
  return config
})

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.status === 401) {
      await refreshToken()
      return http.request(err.config!)   // retry once
    }
    throw err
  },
)
```

### Retry — idempotent methods, 5xx and network errors

```ts
await http.get('/api/flaky', { retries: 3 })
// up to 4 attempts; exponential backoff capped host-side
```

Custom retry predicate:

```ts
await http.request({
  method: 'POST',
  url: '/api/idempotent-write',
  data: payload,
  retries: 2,
  shouldRetry: (err) => err.status === 503,
})
```

### Cancellation

```ts
const controller = new AbortController()
const promise = http.get('/api/slow', { signal: controller.signal })

setTimeout(() => controller.abort(), 1000)

try {
  await promise
} catch (err) {
  if (http.isHttpError(err) && err.cancelled) {
    // request was cancelled
  }
}
```

### Binary downloads

```ts
const bytes = await http.get<Uint8Array>('/api/files/123', { responseType: 'bytes' })
const blob  = await http.get<Blob>('/api/files/123', { responseType: 'blob' })
```

### FormData uploads

```ts
const form = new FormData()
form.append('file', fileInput.files![0])
form.append('caption', 'My photo')

await http.post('/api/upload', form)   // Content-Type set automatically
```

### Error handling

```ts
try {
  await http.post('/api/notes', payload)
} catch (err) {
  if (http.isHttpError(err)) {
    if (err.isNetworkError) showOffline()
    else if (err.status === 422) showValidation(err.data)
    else throw err
  }
}
```

## useStorage()

File storage. Your space's root is `{space_id}/<path>` — pick whatever path you want inside it. Two spaces can't read each other's files.

```ts
function useStorage(): {
  upload(file: Blob | File, opts?: UploadOptions): Promise<UploadResult>
  presign(opts?: PresignOptions): Promise<PresignResult>
  signedUrl(opts: SignedUrlOptions): Promise<string>
  download(path: string): Promise<Blob>
  delete(path: string): Promise<void>
  list(opts?: ListOptions): Promise<ListResult>
  copy(opts: CopyOptions): Promise<void>
  exists(path: string): Promise<boolean>
  loading: Ref<boolean>
  error: Ref<string | null>
}
```

**Upload a file**

```ts
const storage = useStorage()

// path within your space — root is {space_id}/
const { url, path } = await storage.upload(file, { path: 'reports/q1.pdf' })

// or let it auto-derive from the file name
await storage.upload(file)
```

**List + read**

```ts
const { items } = await storage.list({ prefix: 'reports/' })
const blob = await storage.download('reports/q1.pdf')
```

**Signed URL for sharing**

```ts
const link = await storage.signedUrl({ path: 'reports/q1.pdf', ttlSeconds: 3600 })
```

::: tip Cross-space sharing is host-mediated
There's no cross-space `path`. If a space needs to surface a file to another space (e.g. Drive sharing a doc with Notes), do it through a Graph relation + `useAccess<T>()` grant — not by writing into another space's prefix.
:::

## useLocalStorage()

Per-space, per-profile persistent KV. IndexedDB-backed, namespaced by space id so two spaces can't collide on the same key. Survives reloads.

Use this for view prefs, last-opened-tab, pinned-item ids — UI state the model doesn't need. For shared/typed data, switch to [`@construct-space/graph`](https://www.npmjs.com/package/@construct-space/graph).

```ts
function useLocalStorage(): {
  get<T = unknown>(key: string): Promise<T | null>
  set<T = unknown>(key: string, value: T): Promise<void>
  has(key: string): Promise<boolean>
  del(key: string): Promise<void>
  keys(): Promise<string[]>
  clear(): Promise<void>
}
```

```ts
const local = useLocalStorage()
await local.set('lastFolderId', folder.id)
const last = await local.get<string>('lastFolderId')
```

Storage is **scoped per Space + per profile**. Two profiles installing the same Space see distinct stores. Spaces can't read each other's keys.
