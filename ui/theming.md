# Theming

Use these CSS variables in your space's styles. **The host does the rest** — sets the values, owns the theme switcher, flips light/dark, applies user customizations. You just reference the variables.

```vue
<style scoped>
.banner {
  color: var(--app-foreground);
  background: var(--app-card);
  border: 1px solid var(--app-border);
}
</style>
```

## Surface

| Variable | When to use |
|---|---|
| `--app-background` | Page background — the canvas behind everything. |
| `--app-foreground` | Default text color. |
| `--app-muted` | Secondary text — placeholders, captions, timestamps. |
| `--app-border` | Default border — inputs, cards, separators. |
| `--app-surface` | Raised surfaces — sidebars, sticky bars. |
| `--app-canvas-bg` | Receding fill — large empty workspaces, areas that should sit behind content. |
| `--app-card` | Card and panel background. |
| `--app-card-hover` | Card background on hover or active row state. |
| `--app-input-bg` | Background for form controls — Input, Select, Textarea. |
| `--app-status-bg` | Background for inline status chips, count badges. |

## Brand

| Variable | When to use |
|---|---|
| `--app-accent` | Primary brand color — focused buttons, links, focus rings, active tabs. |
| `--app-accent-foreground` | Text laid on top of `--app-accent`. |
| `--app-accent-muted` | Soft accent fill — selection background, ghost-button hover. |

## Status

| Variable | When to use |
|---|---|
| `--app-success` | Success state — confirmations, completed timelines, online dots. |
| `--app-danger` | Error / destructive state — delete buttons, validation messages. |

::: tip Don't hard-code colors
Reach for `var(--app-*)` first. Hex/rgb literals break the moment the host adds a new theme or the user customizes their colors. The whole point of these variables is "the design system" being one declaration away from being overridden.
:::
