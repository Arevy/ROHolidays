# ADR 0001 – New Architecture, Query cache & Notifee

## Context
- React Native 0.83.1 default activează New Architecture (Fabric renderer + TurboModules/JSI). Legacy renderer este depreciat și eliminat în 0.82+, deci dezactivarea ar crește riscul de incompatibilități pe viitor.
- Hermes este motorul JS implicit și oferă startup mai rapid + bundle mai mic.
- Datele de sărbători se actualizează rar, dar vrem offline-ish și fallback la cache.
- Notificările locale trebuie programate nativ (Android/iOS) fără Expo; Notifee are suport bun pentru ambele, inclusiv canale Android și scheduling.

## Decizie
- **New Architecture ON**: `newArchEnabled=true` în `android/gradle.properties`, `RCT_NEW_ARCH_ENABLED=1` și `:new_arch_enabled => true` în Podfile. Comentarii în fișiere explică motivul.
- **Hermes ON**: păstrat explicit în ambele platforme pentru perf.
- **TanStack Query + MMKV Persister**: folosit pentru fetch + cache + offline fallback; storage sincron și foarte rapid pentru cold-start bun.
- **Zustand + MMKV**: state client global (settings) cu selector pattern pentru a reduce re-randările pe ecrane care nu consumă toate câmpurile.
- **Notifee pentru notificări**: programăm 2 notificări per eveniment (cu 1 zi înainte și în ziua evenimentului), deduplicate prin `event.id`.
- **Background refresh**: opțional, nu inclus în build implicit pentru a evita setup nativ suplimentar; lăsăm stub și documentație.

## Consecințe
- Buildurile Android/iOS folosesc Fabric/TurboModules; librăriile care nu suportă NA ar putea eșua, dar majoritatea moderne sunt compatibile.
- Necesită CocoaPods + pod install pentru iOS (Hermes & Fabric pods).
- Cache-ul MMKV rămâne ușor de versionat/invalidat prin key naming; citirea sincronă reduce latența la restaurarea cache-ului.
- Notificările depind de permisiunile utilizatorului; dacă sunt refuzate, aplicația funcționează fără scheduling.
