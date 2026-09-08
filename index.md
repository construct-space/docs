---
layout: home

hero:
  name: Construct Docs
  text: Build Spaces on Construct
  tagline: Guides, the SDK, and the UI library — everything you need to ship a Space.
  actions:
    - theme: brand
      text: Quick Start
      link: /guide/quick-start
    - theme: alt
      text: SDK
      link: /reference/
    - theme: alt
      text: UI
      link: /ui/
    - theme: alt
      text: Graph
      link: /graph/

features:
  - icon: 📘
    title: Guide
    details: Start here. Anatomy of a Space, tenancy, per-resource access control, dock-icon hooks. The mental model in plain prose.
    link: /guide/introduction
  - icon: 🧩
    title: SDK
    details: 17 composables across auth, org, routing, networking, storage, messaging. Types-only — the host injects runtime via window.__CONSTRUCT__.
    link: /reference/
  - icon: 🎨
    title: UI
    details: 53 components. Buttons, forms, overlays, navigation, tables. CSS-variable themed; works in light + dark.
    link: /ui/
  - icon: 🗂
    title: Graph
    details: Define typed models, get a GraphQL backend. Tenancy, ACL, realtime subscriptions wired in. No SQL, no resolvers.
    link: /graph/
  - icon: 🔒
    title: Per-space access control
    details: Declarative ABAC. defineModel({ acl }) binds a per-resource ACL table. useAccess() handles grants, revokes, role checks. Drive-style sharing in 20 lines.
    link: /guide/access
  - icon: 🏢
    title: Multi-tenant by default
    details: Every row is auto-scoped to the user (personal) or org. No cross-tenant leakage, no per-space wiring.
    link: /guide/tenancy
  - icon: ⚡️
    title: Live reload everywhere
    details: construct dev watches, rebuilds the IIFE, hot-installs into the host. Edit → save → see it.
---
