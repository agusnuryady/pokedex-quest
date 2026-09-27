# Deployment

Pokédex Quest ships two ways, neither through an app store:

| Target | Service | What the reviewer gets |
|---|---|---|
| Web | Vercel | A URL that opens in any browser |
| Android | EAS Build (Expo) | A link to download and install an APK |

Both build from the same code. Run `npm run validate` before deploying.

## Web on Vercel

The repository already contains `vercel.json`, which tells Vercel how to build (`expo export --platform web`), where the output is (`dist`), and to send every path to `index.html` so links like `/pokemon/25` work when opened directly or refreshed.

### Option A: connect the GitHub repository (recommended)

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. Choose **Add New → Project** and import the `pokedex-quest` repository.
3. Leave the framework preset as **Other**. The build settings come from `vercel.json`, so nothing needs to be typed in.
4. Choose **Deploy**. The first build takes about two minutes.
5. Copy the production URL (for example `https://pokedex-quest.vercel.app`) into the README's "Try it" table.

Every push to `main` now redeploys automatically, and every pull request gets its own preview URL.

### Option B: deploy from the terminal

```bash
npx vercel@latest login
npx vercel@latest --prod
```

Accept the defaults when asked; `vercel.json` supplies the build settings.

### Check the deployment

- Open the URL in a private window, so no saved progress is used.
- Open `/pokemon/25` directly and refresh it. It should load Pikachu, not a 404.
- Open `/battle` directly. It should send you back to the map.

## Android APK with EAS Build

EAS builds the app in Expo's cloud, so Android Studio is not needed. The `preview` profile in `eas.json` produces an installable `.apk` with an internal distribution link.

### One-time setup

```bash
npx eas-cli@latest login
npx eas-cli@latest init
```

`init` creates the project on expo.dev and writes its `projectId` into `app.json`. Commit that change.

Check the Android package name in `app.json` (`android.package`) before the first build. It is permanent for an installed app.

### Build

```bash
npx eas-cli@latest build --platform android --profile preview
```

When asked to generate a new Android keystore, answer yes; EAS stores it for you. On the free plan the build may wait in a queue, and usually finishes within 10 to 30 minutes. When it finishes, the terminal prints a build page URL and a QR code.

### Share it

The build page on expo.dev has an **Install** button and a QR code. Anyone with the link can install the APK. Put the link in the README's "Try it" table.

### What a reviewer sees when installing

Because the APK does not come from the Play Store, Android shows two warnings. Both are expected:

1. **"Install unknown apps"**: Android asks to allow installs from the browser. Allow it for this install.
2. **Google Play Protect, "unrecognised developer"**: choose **More details → Install anyway**.

## iOS

Installing on iPhone outside the App Store requires TestFlight and a paid Apple Developer account, so iOS reviewers should use the web version. Developers can also run the app in Expo Go with `npm start`.
