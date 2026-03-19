# ROHolidays (React Native CLI, New Architecture)

Aplicație bare React Native (fără Expo) care afișează sărbători legale din România și calendar ortodox (cruce roșie/neagră), cu notificări locale programabile. New Architecture (Fabric + TurboModules + JSI) este activă pe ambele platforme; Hermes rămâne motorul JS implicit.

## Prerechizite
- Node >= 20.19.4 (testat pe 22.20.0; dacă ai probleme cu native deps, recomand 20 LTS).
- Yarn (Corepack activat în repo, `packageManager: "yarn@3.6.4"`; linker setat pe `node-modules` în `.yarnrc.yml`).
- iOS: Xcode + CocoaPods (`bundle install && bundle exec pod install` în `ios/`).
- Android: Android SDK, emulator/ device, Java 17.

## Comenzi de bază (Yarn-only)
- Pornește Metro: `yarn start`
- Android: `yarn android`
- iOS: `cd ios && bundle exec pod install` (prima dată), apoi `yarn ios`
- Lint: `yarn lint`
- Teste: `yarn test`
- Typecheck: `yarn typecheck`

## Arhitectură
```
src/
  app/        # AppProviders, navigație (React Navigation)
  features/   # home, calendar, settings
  data/       # http client, Zod schema, repository, TanStack Query hooks
  domain/     # tipuri și mapări (cruce roșie/neagră, dedup)
  services/   # notificări (Notifee), settings (AsyncStorage), date utils
  ui/         # componente UI, theming
android/ ios/ # proiecte native reale, newArchEnabled + Hermes ON
```
- TanStack Query + persister în AsyncStorage (fallback la cache dacă rețeaua pică).
- Clean-ish layering: data (fetch + validare), domain (mapări/heuristici), features (UI + useEvents).
- Comentarii în fișierele native explică de ce New Architecture/Hermes rămân active.

## Surse de date
- Legal: `https://date.nager.at/api/v3/PublicHolidays/{year}/RO` (fallback: OpenHolidays).
- Ortodox: `https://orthocal.info/api/feasts?year=YYYY&locale=ro`; listă specială 2025 red-cross: `https://azisespala.ro/data/holidays-2025.json`.
- Model unificat `Event` include `kind`, `level` (RED/BLACK), `source`, `metadata`. Dedup by id; nivelul ortodox derivat heuristico-transparenț (vezi `src/domain/heuristics.ts`).

## Notificări locale (Notifee)
- Permisiuni cerute la runtime; pe Android se creează canal `holidays`.
- Se programează două notificări per eveniment (cu o zi înainte la ora X, în ziua evenimentului la ora Y). ID bazat pe `event.id` ca să evităm duplicate.
- Settings persistate în AsyncStorage, re-programează notificările când modifici opțiunile.

## Background refresh (opțional)
`react-native-background-fetch` nu este inclus pentru a evita setup nativ suplimentar. Stub-ul din `src/services/background.ts` indică pașii; dacă ai nevoie, instalează pachetul și completează integrarea (atenție: iOS e throttled, nu garantează execuție la oră fixă).

## New Architecture & Hermes
- Android: `android/gradle.properties` are `newArchEnabled=true` (Fabric/TurboModules) și `hermesEnabled=true` cu comentarii explicite.
- iOS: `Podfile` setează `ENV['RCT_NEW_ARCH_ENABLED']='1'` și `:new_arch_enabled => true, :hermes_enabled => true` în `use_react_native!`.
- Beneficii: latență UI mai mică, interop nativ prin JSI, viitor-compat (legacy renderer depreciat în RN 0.82+).

## Testare
- Jest + React Native Testing Library; mock pentru fetch/Notifee/AsyncStorage în `jest.setup.js`.
- Acoperire esențială: mapări cruce roșie/neagră, dedup, mappere surse (vezi `__tests__/domain.test.ts`).

## Troubleshooting
- Dacă Yarn se plânge de workspace root în home, asigură-te că există `yarn.lock` local (deja creat) și rulează cu `YARN_IGNORE_PATH=1`.
- Xcode build: rulează `cd ios && bundle exec pod install` după orice schimbare de deps native.
- Android new architecture: dacă întâmpini erori TurboModules/Fabric, curăță cu `cd android && ./gradlew clean` și reconstruieste.
- Watchman indisponibil (ciocnire de permisiuni): rulează testele cu `JEST_DISABLE_WATCHMAN=1 yarn test --runInBand`.

## Limitări & transparență
- Orthocal mapping spre roșu/negru este o euristică; UI menționează explicit posibilă diferență față de calendarul tipărit.
- Azisespala acoperă doar 2025; pentru alți ani ne bazăm pe Orthocal.
- Background refresh nu este activat by default (vezi secțiunea de mai sus).
