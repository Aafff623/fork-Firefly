# [HeroUI React Pro](https://heroui.pro/)

[Premium composable components that extend HeroUI — built for production web apps](https://heroui.pro/)

HeroUI Pro is a premium extension of [HeroUI OSS](https://heroui.com) — production-ready, fully composable components that follow the same patterns you already know from HeroUI OSS. New components, themes, and fixes ship regularly as package updates.

## What’s included

- **46+ React components** with **390+ examples** — Command Palette, Data Grid, Sheet, Sidebar, Emoji Picker, Charts, File Tree, KPI cards, and more — each with full documentation
- **React Native** — The same design system with a similar API across iOS and Android (`[heroui-native-pro](https://www.npmjs.com/package/heroui-native-pro)`)
- **Templates** — Production-ready dashboards, mail, chat, and finance apps
- **Premium themes** — Brutalism, Glass, and more. Switch aesthetics in one import
- **Theme Builder** — Create custom themes visually, preview live in the docs, and export the CSS
- **Figma** — Design files for all Pro components + a theme variables sync plugin
- **AI tooling** — MCP server, agent skills, and design taste for AI-assisted development
- **Priority support** — Fast support, prioritized issues, private Discord, and a VIP badge
- **Teams & Enterprise** — Shared themes, centralized billing, SSO, and dedicated support

## Requirements

- [React 19+](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/docs/installation/framework-guides)
- [HeroUI OSS](https://heroui.com/docs/react/getting-started/quick-start) (`@heroui/react` + `@heroui/styles`)

If you have not set up HeroUI OSS yet, follow the [HeroUI quick start](https://heroui.com/docs/react/getting-started/quick-start) first.

## Installation

### 1. Log in

```sh
npx heroui-pro login
```

You can use `bunx heroui-pro login` or `pnpm heroui-pro login` instead.

### 2. Install

```sh
npx heroui-pro install
```

The CLI adds `**@heroui-pro/react**` (and `**heroui-pro**` as needed), downloads Pro artifacts, installs missing peer dependencies, and can configure **pnpm** / **bun** so postinstall scripts stay trusted.

Run `npx heroui-pro` with no arguments for the interactive menu.

### 3. Import styles

In your main CSS (e.g. `globals.css`), keep this order:

```css
@import 'tailwindcss';
@import '@heroui/styles';
@import '@heroui-pro/react/css';
```

### 4. CI / automated installs

For GitHub Actions, Vercel, Netlify, and similar, set `**HEROUI_AUTH_TOKEN**` from a CI/CD token in the [HeroUI dashboard](https://heroui.pro/dashboard). With that env var set, `npm install` (or your PM’s equivalent) can download Pro artifacts without interactive login.

See the full guide: [Installation](https://heroui.pro/docs/react/getting-started/installation).

## CLI (quick reference)

| Command                        | Description                                     |
| ------------------------------ | ----------------------------------------------- |
| `heroui-pro login`             | Log in with GitHub                              |
| `heroui-pro install`           | Add Pro packages, peers, and PM config          |
| `heroui-pro install --yes`     | Non-interactive install                         |
| `heroui-pro install --dry-run` | Preview installs                                |
| `heroui-pro status`            | Login and installed products                    |
| `heroui-pro logout`            | Sign out                                        |
| `heroui-pro docs`              | Open [heroui.pro/docs](https://heroui.pro/docs) |

## Next steps

- [Installation & troubleshooting](https://heroui.pro/docs/react/getting-started/installation)
- [Browse components](https://heroui.pro/docs/react/components/area-chart)
- [Theme Builder](https://heroui.pro/dashboard/themes)
- [Pro UI for agents (MCP)](https://heroui.pro/docs/react/getting-started/mcp-server)

## License

See [LICENSE](./LICENSE).
