# Telemetry

Telemetry helpers track local product usage with explicit consent. The host owns storage and sync; Spaces call the SDK surface.

## Consent

```ts
isTelemetryEnabled()
setTelemetryConsent(true)
```

## Track Events

```ts
const telemetry = useTelemetry()

await telemetry.trackSessionStart()
await telemetry.trackScreenView('drive.home', 'drive')
await telemetry.trackSpaceEnter('drive')
await telemetry.trackFeature('docs.page.create')
await telemetry.trackSpaceLeave('drive', 12_000)
await telemetry.trackSessionEnd()
```

`trackFeature(key)` is also exported as a top-level helper:

```ts
await trackFeature('kanban.card.move')
```

Known feature keys are exported as `TELEMETRY_FEATURE_KEYS`, and `TelemetryFeatureKey` narrows them for TypeScript.

## Stored Snapshot

```ts
const snapshot = await telemetry.getStoredData()
await telemetry.syncToApi()
await telemetry.clearStoredData()
```

The snapshot includes session counts, screen views, space active milliseconds, and feature action counts.
