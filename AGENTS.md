# Repository Guidelines

## Project Structure & Module Organization
- `app/` follows Expo Router conventions; feature screens live in nested route folders such as `app/(tabs)/dashboard.tsx`.
- `src/components/` houses shared UI primitives, while `src/screens/` contains screen-specific composition logic.
- `src/store/` centralizes Zustand slices; keep async side effects in `src/services/` alongside Axios API clients.
- Static media belongs in `assets/`; keep reusable theme tokens or config in `src/config/`.
- Add new utilities under `src/lib/` only if they are framework-agnostic.

## Build, Test, and Development Commands
- `npm install` – install required Expo/React Native dependencies.
- `npm start` – launch Expo dev server; use interactive shortcuts (`i`, `a`, `w`) for targets.
- `npm run ios` / `npm run android` / `npm run web` – build and run native/web bundles from the CLI.
- `npm run lint` – run the Expo ESLint preset; fix warnings before committing.
- `npm run reset-project` – clear caches and regenerate the Expo project scaffolding (use sparingly).

## Coding Style & Naming Conventions
- TypeScript everywhere; 2-space indentation, single quotes, trailing commas where valid.
- React components/hooks in PascalCase and camelCase respectively (`NetWorthCard`, `usePlaidLink`).
- Keep file names aligned with default exports; screens end in `.screen.tsx` when moved under `src/screens/`.
- Prefer functional components with hooks; avoid class components.
- Run ESLint on staged files; configure editor to respect `.editorconfig` and `tsconfig.json`.

## Testing Guidelines
- Jest and Testing Library are not wired up yet; when adding tests, colocate `*.test.ts(x)` files under the same directory.
- Mock network calls via MSW or Axios interceptors to keep tests deterministic.
- Target meaningful UI behaviors (loading states, gating by subscription level) rather than implementation details.

## Commit & Pull Request Guidelines
- Use concise, imperative commit subjects (e.g., `Add Plaid link flow skeleton`); include rationale in the body if needed.
- Group related changes; avoid mixing feature work with lint or formatting-only commits.
- Pull requests must describe the change, testing performed, and any follow-up work. Attach screenshots or screen recordings for UI updates.
- Link GitHub issues or Linear tickets when available; request review once CI or lint checks pass locally.

## Security & Configuration Tips
- Never commit `.env` or Plaid keys; rely on `.env.example` for placeholders.
- Guard new screens behind the same auth/verification checks used in `app/_layout.tsx`.
- When storing data locally, route through the async-storage helpers in `src/services/storage` to keep data encrypted and consistent.
