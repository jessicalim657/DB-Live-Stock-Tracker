# Dental Boutique Stock -- deployment guide

No terminal, no Node.js install, no local dev tools needed. Everything below
happens through GitHub's and Vercel's websites, plus Firebase's console.

## 1. Set up the shared database (Firebase) -- ~5 minutes

1. Go to https://console.firebase.google.com and sign in with any Google account.
2. Click **Add project**, name it (e.g. `dental-boutique-stock`), keep clicking through the defaults.
3. On the project overview page, click the **`</>`** (web) icon to register a web app. Any nickname is fine.
4. Firebase shows you a `firebaseConfig` object. Copy each value into `src/firebase.js` in this project, replacing the `"REPLACE_ME"` placeholders.
5. In the left sidebar: **Build -> Firestore Database -> Create database**. Pick a region near you, and choose **test mode** to start.
6. Go to the **Rules** tab of Firestore and paste in the contents of `firestore.rules` (included in this project), then click **Publish**.

## 2. Put the code on GitHub -- ~5 minutes

1. Go to https://github.com and create a free account if you don't have one.
2. Click **New repository**. Name it anything (e.g. `dental-boutique-stock`). Keep it private if you'd like. Create it.
3. On the empty repo page, click **uploading an existing file**.
4. Drag in every file and folder from this project (keeping the folder structure -- `src/`, `public/`, `package.json`, etc.) and commit.

## 3. Deploy it with Vercel -- ~3 minutes

1. Go to https://vercel.com and sign up using your GitHub account (this lets Vercel see your repos).
2. Click **Add New -> Project**, and select the repo you just created.
3. Vercel will auto-detect this as a Vite project -- you shouldn't need to change any settings. Click **Deploy**.
4. After a minute, you'll get a real URL like `https://dental-boutique-stock.vercel.app`. That's your app, live on the internet.

## 4. Install it on each room's phone

1. Open that URL on the phone's browser.
2. **iPhone (Safari):** tap the Share icon -> "Add to Home Screen".
   **Android (Chrome):** tap the menu (⋮) -> "Install app" (or you'll see an automatic install banner).
3. An app icon appears on the home screen. Opening it launches full-screen, no browser bar.
4. The first time, go to **Report low stock** and set which room this phone belongs to -- it'll remember from then on.

## Making future changes

Whenever Claude (or you) edits `src/App.jsx` again, re-upload the changed file(s) to
the same GitHub repo (GitHub's web UI lets you edit or replace a file directly,
or drag a new version in) -- Vercel automatically redeploys within about a
minute of any change to the repo. No redeploy button to remember.

## If something looks broken

- **Blank white screen:** almost always means `src/firebase.js` still has
  `"REPLACE_ME"` values in it, or one of them was copied with a typo.
- **"Couldn't reach the database" message in the app:** same as above, or
  Firestore rules weren't published yet.
