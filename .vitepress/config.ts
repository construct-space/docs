import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Construct Docs',
  description: 'Build Spaces on Construct — guides, SDK, UI library.',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'SDK', link: '/reference/' },
      { text: 'UI', link: '/ui/' },
      { text: 'Graph', link: '/graph/' },
      {
        text: 'v1.1.0',
        items: [
          { text: 'Changelog', link: 'https://github.com/construct-space/sdk/releases' },
          { text: 'GitHub', link: 'https://github.com/construct-space/sdk' },
          { text: 'npm', link: 'https://www.npmjs.com/package/@construct-space/sdk' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Anatomy of a Space', link: '/guide/anatomy-of-a-space' },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Tenancy', link: '/guide/tenancy' },
            { text: 'Per-Resource Access', link: '/guide/access' },
          ],
        },
      ],

      '/graph/': [
        {
          text: '@construct-space/graph',
          items: [
            { text: 'Overview', link: '/graph/' },
            { text: 'Defining models', link: '/graph/models' },
            { text: 'Reading & writing', link: '/graph/use-graph' },
            { text: 'Realtime', link: '/graph/realtime' },
            { text: 'Access rules', link: '/graph/access' },
          ],
        },
      ],

      '/ui/': [
        {
          text: '@construct-space/ui',
          items: [
            { text: 'Overview', link: '/ui/' },
            { text: 'Theming', link: '/ui/theming' },
          ],
        },
        {
          text: 'Components',
          items: [
            { text: 'Inputs & Forms', link: '/ui/components/inputs' },
            { text: 'Display', link: '/ui/components/display' },
            { text: 'Overlays', link: '/ui/components/overlays' },
            { text: 'Navigation', link: '/ui/components/navigation' },
            { text: 'Layout', link: '/ui/components/layout' },
            { text: 'Data', link: '/ui/components/data' },
            { text: 'Feedback', link: '/ui/components/feedback' },
          ],
        },
      ],

      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Overview', link: '/reference/' },
            { text: 'Runtime Helpers', link: '/reference/runtime' },
            { text: 'Scheduler', link: '/reference/scheduler' },
            { text: 'Context Bus', link: '/reference/context-bus' },
            { text: 'Telemetry', link: '/reference/telemetry' },
            { text: 'Stores', link: '/reference/stores' },
            { text: 'Schemas', link: '/reference/schemas' },
          ],
        },
        {
          text: 'Composables',
          items: [
            { text: 'Auth & Identity', link: '/reference/composables/auth' },
            { text: 'Organization', link: '/reference/composables/organization' },
            { text: 'Toolbar & Breadcrumb', link: '/reference/composables/layout-panels' },
            { text: 'Routing & Shortcuts', link: '/reference/composables/routing' },
            { text: 'Networking & Data', link: '/reference/composables/networking-data' },
            { text: 'Messaging & Notifications', link: '/reference/composables/messaging' },
            { text: 'Platform & Utilities', link: '/reference/composables/platform' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/construct-space' },
    ],

    footer: {
      message: 'Construct documentation is copyrighted. All rights reserved.',
      copyright: 'Copyright © 2026 Construct. All rights reserved.',
    },

    search: {
      provider: 'local',
    },
  },
})
