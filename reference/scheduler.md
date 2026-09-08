# Scheduler

`useScheduler()` is the host primitive for time-based dispatch. A Space can create, list, update, claim, and report only its own scheduled tasks. Cross-space automation management is host-only authority.

## useScheduler()

```ts
function useScheduler(): {
  create(input: ScheduledTaskInput): Promise<ScheduledTask>
  list(filter?: ScheduledTaskListInput): Promise<ScheduledTask[]>
  get(id: string): Promise<ScheduledTask>
  update(id: string, patch: ScheduledTaskUpdate): Promise<ScheduledTask>
  toggle(id: string, enabled: boolean): Promise<ScheduledTask>
  cancel(id: string): Promise<void>
  runNow(id: string): Promise<ScheduledTask>
  claim(id: string, input: ScheduledClaimInput): Promise<ScheduledClaim>
  report(id: string, input: ScheduledReportInput): Promise<ScheduledTask>
  onFire(ownerSpace: string, handler: (event: ScheduledFireEvent) => void): () => void
}
```

## Create a Task

```ts
const scheduler = useScheduler()

const task = await scheduler.create({
  ownerSpace: 'calendar',
  title: 'Daily agenda',
  schedule: { kind: 'daily', time: '08:00', timezone: 'Europe/Belgrade' },
  action: { kind: 'calendar.sendDailyAgenda' },
  enabled: true,
})
```

The server computes `nextRunAt` from `schedule`.

## Wake and Report

Subscribe to live wake events, claim the task, run it, and report the result.

```ts
const unsubscribe = scheduler.onFire('calendar', async (event) => {
  const claim = await scheduler.claim(event.taskId, {
    deviceId: 'desktop-main',
    scheduledFor: event.scheduledFor,
  })

  try {
    await runAgenda(event.taskId)
    await scheduler.report(event.taskId, {
      deviceId: 'desktop-main',
      outcome: 'success',
      state: { lastScheduledFor: claim.scheduledFor },
    })
  } catch (error) {
    await scheduler.report(event.taskId, {
      deviceId: 'desktop-main',
      outcome: 'error',
      error: String(error),
    })
  }
})
```

Use `list({ due: true })` as the reconnect-time fallback when the live channel drops.

## Lifecycle Helpers

```ts
await scheduler.toggle(task.id, false)     // pause
await scheduler.runNow(task.id)            // fire on next tick
await scheduler.update(task.id, { title: 'Weekday agenda' })
await scheduler.cancel(task.id)            // delete task and active claim
```

Claims reject with an `already_claimed`-style error when another device holds the lease. Claims expire automatically if a device disappears mid-run.
