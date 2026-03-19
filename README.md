# ROHolidays (React Native CLI, New Architecture)

A bare React Native app (no Expo) that displays Romanian public holidays and the Orthodox calendar (red/black cross), with configurable local notifications. New Architecture (Fabric + TurboModules + JSI) is enabled on both platforms; Hermes remains the default JS engine.

## Prerequisites
- Node >= 20.19.4 (tested on 22.20.0; if you hit native dependency issues, use Node 20 LTS).
- Yarn (Corepack enabled in this repo, `packageManager: "yarn@3.6.4"`; linker is set to `node-modules` in `.yarnrc.yml`).
- iOS: Xcode + CocoaPods (`bundle install && bundle exec pod install` in `ios/`).
- Android: Android SDK, emulator/device, Java 17.

## Basic commands (Yarn-only)
- Start Metro: `yarn start`
- Android: `yarn android`
- iOS: `cd ios && bundle exec pod install` (first time), then `yarn ios`
- Lint: `yarn lint`
- Tests: `yarn test`
- Typecheck: `yarn typecheck`

## Architecture
```
src/
  app/        # AppProviders, navigation (React Navigation)
  features/   # home, calendar, settings
  data/       # HTTP client, Zod schemas, repositories, TanStack Query hooks
  domain/     # types and mappers (red/black cross, dedup)
  services/   # notifications (Notifee), settings (AsyncStorage), date utils
  ui/         # UI components, theming
android/ ios/ # real native projects, newArchEnabled + Hermes ON
```
- TanStack Query + AsyncStorage persister (cache fallback when the network fails).
- Clean-ish layering: data (fetch + validation), domain (mappers/heuristics), features (UI + useEvents).
- Comments in native config files explain why New Architecture/Hermes stay enabled.

## Data sources
- Legal: `https://date.nager.at/api/v3/PublicHolidays/{year}/RO` (fallback: OpenHolidays).
- Orthodox: `https://orthocal.info/api/feasts?year=YYYY&locale=ro`; special 2025 red-cross list: `https://azisespala.ro/data/holidays-2025.json`.
- Unified `Event` model includes `kind`, `level` (RED/BLACK), `source`, `metadata`. Dedup is by id; Orthodox level is derived transparently via heuristics (see `src/domain/heuristics.ts`).

## Local notifications (Notifee)
- Permissions are requested at runtime; on Android the `holidays` channel is created.
- Two notifications are scheduled per event (one day before at hour X, and on the event day at hour Y). IDs are based on `event.id` to avoid duplicates.
- Settings are persisted in AsyncStorage; notifications are rescheduled when settings change.

## Background refresh (optional)
`react-native-background-fetch` is not included to avoid extra native setup. The stub in `src/services/background.ts` shows the integration steps; if needed, install the package and complete the integration (note: iOS is throttled and does not guarantee exact-time execution).

## New Architecture & Hermes
- Android: `android/gradle.properties` has `newArchEnabled=true` (Fabric/TurboModules) and `hermesEnabled=true` with explicit comments.
- iOS: `Podfile` sets `ENV['RCT_NEW_ARCH_ENABLED']='1'` and `:new_arch_enabled => true, :hermes_enabled => true` in `use_react_native!`.
- Benefits: lower UI latency, native interop via JSI, future compatibility (legacy renderer deprecated in RN 0.82+).

## Testing
- Jest + React Native Testing Library; fetch/Notifee/AsyncStorage mocks in `jest.setup.js`.
- Core coverage: red/black cross mapping, dedup, source mappers (see `__tests__/domain.test.ts`).

## Troubleshooting
- If Yarn complains about workspace root from your home folder, make sure local `yarn.lock` exists (already created) and run with `YARN_IGNORE_PATH=1`.
- Xcode build: run `cd ios && bundle exec pod install` after any native dependency change.
- Android New Architecture: if you hit TurboModules/Fabric issues, clean with `cd android && ./gradlew clean` and rebuild.
- If Watchman is unavailable (permissions conflict), run tests with `JEST_DISABLE_WATCHMAN=1 yarn test --runInBand`.

## Limitations & transparency
- Orthocal red/black mapping is heuristic; the UI explicitly mentions it may differ from printed local calendars.
- Azisespala covers only 2025; for other years the app relies on Orthocal.
- Background refresh is not enabled by default (see section above).
