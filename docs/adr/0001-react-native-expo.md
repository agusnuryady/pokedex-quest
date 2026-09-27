# 0001. React Native with Expo, web as a first-class target

Date: 2026-09-27 · Status: Accepted

## Context

The assessment requires a mobile app that reviewers can try without the Play Store or App Store. Reviewers may be on Android, iOS, or only a laptop. The role is Frontend / Mobile, and React Native with Expo is the requested stack.

## Decision

Build with Expo SDK 57 and Expo Router, and treat the web build as a primary delivery target alongside Android.

## Consequences

- A reviewer can open a URL and play immediately, with nothing to install.
- EAS Build produces an installable Android APK link without Android Studio.
- Every dependency must work on web as well as native. This rules out libraries that need extra native setup, which is part of why the map uses plain Views (see [0003](./0003-procedural-infinite-map.md)).
- iOS without the App Store needs TestFlight and a paid Apple account, so iOS reviewers use the web build or Expo Go.
