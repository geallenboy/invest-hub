# Repository Guidelines

## Project Structure & Module Organization
The Next.js 16 app lives under `src/app`, with route handlers, `layout.tsx`, global styles in `globals.css`, and shared providers in `providers.tsx`. Reusable UI building blocks belong in `src/components`, split into `ui` for generic widgets and `wallet` for RainbowKit/Wagmi flows. Cross-cutting helpers sit in `src/lib` (e.g. `cn` and Wagmi config). Static assets go in `public/`. Keep feature assets and stories co-located with the component they support.

## Build, Test & Development Commands
Use `pnpm install` to sync dependencies (pnpm is the repo default). `pnpm dev` starts the dev server at `http://localhost:3000` with HMR. `pnpm build` produces an optimized bundle; run it before tagging releases. `pnpm start` serves the production build locally. `pnpm lint` runs ESLint using the Next config—fix all errors before publishing changes.

## Coding Style & Naming Conventions
All code is TypeScript-first; prefer React Server Components unless interactivity demands `use client`. Follow a 2-space indent, single quotes, and keep imports ordered by package → absolute → relative. Compose Tailwind utility classes for styling; hoist shared class sets via `cn` in `src/lib/utils.ts`. Name components in PascalCase, hooks in camelCase starting with `use`, and files matching the exported symbol (e.g. `AccountInfo.tsx`).

## Testing Guidelines
Automated tests are not yet configured; introduce them with Vitest or Testing Library when adding critical logic. Place test files beside the source (`ComponentName.test.tsx`) and ensure they run via a future `pnpm test` script. Until then, validate flows manually by exercising wallet connect features against the dev server and capture findings in the PR description.

## Commit & Pull Request Guidelines
History is sparse—keep commits small, focused, and written in the imperative mood (e.g. `feat: add portfolio card`). Reference issue IDs when applicable and include context in the body. Pull requests should outline the problem, the solution, manual validation steps, and attach screenshots/GIFs for UI changes. Confirm `pnpm lint` (and tests, once added) before requesting review.

## Environment & Security
Store API keys and RPC endpoints in `.env.local`; never commit env files. Review RainbowKit/Wagmi configuration changes with security in mind, and rotate credentials immediately if exposed.
