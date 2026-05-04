# AGENTS.md

## Commands

```bash
npm install          # install dependencies
npm start            # dev server at http://localhost:4200
npm run build        # production build → dist/
npm run watch        # dev watch build (--configuration development)
npm test             # run all unit tests (Vitest via Angular builder)
npx prettier --write .   # format
npx prettier --check .   # check formatting
npx tsc --noEmit -p tsconfig.app.json    # typecheck app
npx tsc --noEmit -p tsconfig.spec.json  # typecheck tests
```

No `lint` script exists — ESLint is not configured.  
No dedicated `tsc` script — call `tsc` directly as above.  
Use **npm only** (`"packageManager": "npm@10.8.2"` pinned).

## Focused tests

Vitest globals are injected via `tsconfig.spec.json`. Use `.only` in spec files (`it.only`, `describe.only`) — no CLI filter flag is wired up.

## Architecture

Single Angular 21 app (not a monorepo):

```
src/app/
  app.ts / app.html / app.scss   — root standalone component
  app.config.ts                  — providers (see below)
  app.routes.ts                  — lazy-loaded routes with authGuard
  core/
    auth/                        — auth.service.ts, auth.guard.ts, auth.interceptor.ts, jwt.util.ts
    models/                      — auth.model.ts, user.model.ts, establishment.model.ts
    services/                    — establishment.service.ts
  features/
    auth/login/                  — login.ts / .html / .scss
    auth/register/               — register.ts / .html / .scss
    landing/                     — landing.ts / .html / .scss
    landing/map/                 — map.ts / .html / .scss  (Leaflet map)
    welcome/                     — welcome.ts / .html / .scss
    estabelecimentos/            — meus-estabelecimentos.ts / .html / .scss
  shared/
    components/navbar/           — navbar.ts / .html / .scss
    ui/                          — button.directive.ts, input.directive.ts, label.directive.ts (spartan-ng derived)
src/environments/
  environment.ts                 — { production: false, apiUrl: 'https://localhost:7016/api' }
  environment.prod.ts            — swapped in automatically by ng build (production config)
```

### Providers in `app.config.ts`

- `provideRouter(...)` with routes
- `provideBrowserGlobalErrorListeners()`
- `provideHttpClient(withInterceptors([authInterceptor]))` — **already configured; do not add again**

### Routes (`app.routes.ts`)

All routes use `loadComponent` (lazy). Protected routes use `authGuard`:  
`bem-vindo`, `meus-estabelecimentos`, `avaliar`, `cadastrar-estabelecimento`.  
Wildcard `**` redirects to root.

## Key dependencies

- **Tailwind CSS v3** + PostCSS — configured via `tailwind.config.js` / `postcss.config.js`. Content glob: `./src/**/*.{html,ts}`. Dark mode: `class`. Color palette uses CSS custom properties (`hsl(var(--primary))` etc. — spartan-ng convention).
- **spartan-ng** (`@spartan-ng/brain`, `ui-core`, form-field/label/radiogroup brains) — headless UI primitives. Shared UI directives in `src/app/shared/ui/` are derived from these.
- **Leaflet** (`leaflet` + `@bluehalo/ngx-leaflet`) — map in `features/landing/map/`. Leaflet images are automatically copied to `assets/leaflet/` at build time via `angular.json` asset glob — do not add a manual copy step.
- **`@angular/forms`** — available; use reactive forms.
- **`@angular/cdk`** — available for utility primitives.

## Critical conventions

- **Standalone components only** — no NgModules. Imports go directly in `@Component({ imports: [...] })`.
- **File naming has no `.component.` infix** — Angular 21 CLI generates `feature.ts`, `feature.html`, `feature.scss`. Follow this for all new files.
- **Always use `.scss`** — `"style": "scss"` and `inlineStyleLanguage: "scss"` set globally in `angular.json`.
- **Strict TypeScript** — `strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `strictTemplates`, `strictInjectionParameters` all enabled.
- **Prettier config** (`.prettierrc`): `printWidth: 100`, `singleQuote: true`, Angular parser for `.html`.
- **`ng build` defaults to production** (`defaultConfiguration: "production"`). Use `npm run watch` for dev builds.
- **Build budgets**: initial bundle warns at 1 MB / errors at 2 MB; component styles warn at 10 kB / error at 20 kB.
- **Environment API URL** (`https://localhost:7016/api`) is a placeholder in both `environment.ts` and `environment.prod.ts` — the prod value has not been updated yet.
