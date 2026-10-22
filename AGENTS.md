# AGENTS.md — working on Angular Evolution Lab

Instructions for AI coding agents (and humans) changing this repo.

## Environment

- Node **24** (`nvm use` before any `npm` command; `.nvmrc` = 24.22.1). Angular CLI 22 rejects older Node.
- Angular **22.2.3**, TypeScript 6, RxJS 7.8. Zoneless, no SSR. Keep all `@angular/*` packages on the
  same patch version.
- Before using any API you have not used here before, open its `.d.ts` in `node_modules/@angular`
  and confirm name, import path and signature. If it does not exist, say so — never invent it.

## Code rules

- Standalone components only; never write `standalone: true` (it is the default) and never `NgModule`.
- `inject()` only — no constructor injection, no constructors at all in components/services.
- Built-in control flow (`@if`, `@for` with `track`, `@switch`, `@defer`); never `*ngIf` / `*ngFor`.
- OnPush is the v22 default: do not add `changeDetection` unless a demo needs `Eager`, and then add an
  `eslint-disable-next-line` comment explaining why.
- Signals for state; RxJS only for time/cancellation, bridged with `toSignal` / `toObservable`.
- Loading states are discriminated unions (`LoadState<T>`) or the Resource API — never boolean flags.
  Read `resource.value()` only after checking `error()` / `hasValue()` (it throws in error state).
- File names follow the v20+ style guide: `vehicle-list.ts`, not `vehicle-list.component.ts`.
- SCSS with `@use` (never `@import`) and CSS custom properties from `src/styles/_tokens.scss` —
  no hard-coded colours in component styles.
- Each demo lives in a feature folder (`vNN-*`, `lifecycle`, `rxjs`), shows a `<app-code-compare>` and
  has a spec. Code shown as "before" goes in that feature's `snippets.ts` (excluded from `check:legacy`).
- Every demo host on a page gets a stable `id` ending in `-demo`: it is the target of in-app jumps
  (`routerLink` + `fragment`, handled by `AnchorFocus`). Do not rename one without updating its links.
- Explanatory text must describe measured behaviour: if a demo claims an order or a count, its spec
  asserts it.

## Interview questions

Metadata lives in `features/interview/questions.ts`, text in i18n under `interview.q.<id>.{q,short,long}`
and optional code in `features/interview/snippets.ts`. `short` is one sentence to say out loud; `long`
is the reasoning. `interview.spec.ts` fails if a question has no text or links to a route or anchor that
does not exist.

## i18n

Every user-facing string goes through `ngx-translate`. Add the key to **all three** of
`public/i18n/{en,es,de}.json` — `i18n-keys.spec.ts` fails on any missing key or placeholder mismatch.
Route `title`s are i18n keys (see `TranslatedTitleStrategy`).

## Accessibility

Target WCAG 2.1 AA; the E2E suite runs axe on every route in light and dark mode and must report 0
violations. Prefer native elements; use Angular Aria (`shared/ui/tabs|menu|listbox`) for composite
widgets. A visible label must be part of the accessible name (WCAG 2.5.3) — add context with
visually hidden text, not by overriding `aria-label`.

## Testing

- Jest + Testing Library: query by role/label, interact with `user-event`, fake timers via
  `jest.useFakeTimers({ advanceTimers: true })` (plain fake timers block the zoneless scheduler).
- Components using `httpResource` render with `provideAppHttp()` + `provideStaticBackend()`
  (`src/testing/`) so `whenStable()` does not wait on a pending request.
- Coverage must stay ≥ 80 %. E2E specs live in `e2e/`; any console error fails a test.

## Known workaround

`[formField]` on `<input type="date">` throws `NG0950` intermittently in WebKit (22.2.3): bind date
inputs manually (`[value]` + `(input)` → `field().value.set()`), keep validation in the schema.

## Before committing

```bash
npm run lint && npm run lint:styles && npm run format:check && npm run typecheck \
  && npm run test:ci && npm run build && npm run check:legacy && npm run check:zone
```

Commits follow Conventional Commits (enforced by commitlint), one logical change per commit. If you
change `requirements.json`, run `npm run readme:requirements`.
