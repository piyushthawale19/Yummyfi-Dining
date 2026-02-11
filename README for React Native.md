# 📱 Monorepo Extension: React Web + React Native (Expo) + Firebase

This README is intended to be used **as a prompt for a VS Code AI Agent**
(Copilot, Cursor, Continue, Cody, etc.). It also documents a concrete,
non-breaking plan to add an Expo mobile app and shared packages to this
repository while keeping the existing web app unchanged.

⚠️ **Important**: The web app already exists and is in production.  
The goal is to **extend** the repo safely, not rewrite it.

---

## 🧠 Role & Context (For AI Agent)

You are a **senior full-stack engineer** experienced with:

- React (Vite)
- React Native (Expo)
- Firebase (Auth + Firestore)
- Turborepo / Monorepos
- TypeScript

You are working inside an **existing repository** that already contains:

- A React.js web app
- User authentication
- Admin authentication & protected routes
- Firebase integration

Your task is to **add a React Native app and shared packages**
without breaking existing functionality.

---

## 🎯 Objective

Extend the current repository into a **monorepo** by:

1. Keeping the existing **React web app unchanged**
2. Adding a **React Native (Expo) mobile app** for order tracking
3. Introducing **shared packages** for Firebase and TypeScript types
4. Refactoring Firebase initialization only if required, without changing behavior

---

## 🛑 Critical Constraints (Must Follow)

- ❌ Do NOT rewrite or redesign the web app
- ❌ Do NOT modify existing auth flows
- ❌ Do NOT change admin logic
- ❌ Do NOT rename existing files or routes
- ❌ Do NOT add admin access to mobile
- ✅ Only additive and non-breaking changes are allowed

Note: All changes are additive. Where possible, keep the current
`src/firebase.ts` file as a thin re-exporting shim to avoid touching many files.

---

## 🗂 Target Repository Structure

```
repo/
├─ apps/
│  ├─ web/            # EXISTING — leave intact
│  └─ mobile/         # NEW — Expo React Native app
│
├─ packages/
│  ├─ firebase/       # NEW — shared Firebase init
│  └─ types/          # NEW — shared TypeScript types
│
├─ turbo.json
├─ package.json
└─ tsconfig.base.json
```

---

## 🔥 Shared Firebase Package (`packages/firebase`)

Create a shared Firebase package that:

- Exports:
  - `app`
  - `auth`
  - `db`
- Works in **both Web (Vite)** and **Mobile (Expo)**
- Uses environment variables only
- Matches the existing Firebase project exactly

### If Firebase is already initialized in the web app:
- Extract it carefully
- Keep behavior identical
- Update imports without changing logic

Implementation notes (specific to this repo):
- The existing web init lives in `src/firebase.ts` and uses `import.meta.env.VITE_FIREBASE_*`.
- Create `packages/firebase/src/index.ts` that exposes `app`, `auth`, and `db`.
- Keep `src/firebase.ts` as a thin shim that re-exports from `packages/firebase` to
  avoid touching many files in the web app.
- Provide two adapter entrypoints in the package:
  - `packages/firebase/web.ts` — re-exports and keeps `signInWithPopup` usage.
  - `packages/firebase/expo.ts` — implements `signInWithGoogleExpo()` using
    `expo-auth-session` and upload helpers for Expo (converts file URIs to Blob/base64).

---

## 📦 Shared Types Package (`packages/types`)

Create shared types that can be used by both apps.

Example:

```ts
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered";

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  createdAt: any;
  delivery?: {
    lat: number;
    lng: number;
    updatedAt: any;
  };
}
```

⚠️ Do not break existing web types or imports.

Implementation notes:
- Copy the definitions from `src/types/index.ts` into `packages/types/src/index.ts`.
- Export the same type names (`Order`, `OrderStatus`, `Product`, `CartItem`, etc.).
- Update web imports to point to the new package; to minimize churn, add a thin
  local re-export file `src/types-shim.ts` that imports from `packages/types`.

---

## 📱 Mobile App (Expo – NEW)

Create a **React Native app using Expo** with the following:

### Features

- Firebase Google Sign-In (User only)
- Persistent authentication
- Fetch orders where:
  ```ts
  order.userId === auth.currentUser.uid
  ```
- Real-time updates using `onSnapshot`
- Screens:
  - Login
  - Orders list
  - Order tracking (status, optional map)

### Restrictions

- ❌ No admin access
- ❌ No Firestore writes
- ❌ No cart or checkout
- ❌ No admin email logic

This app is **read-only** and for **order tracking only**.

Mobile implementation decisions (based on this codebase):
- Workflow: **Expo managed** (recommended) — keeps setup simple and works with
  `expo-auth-session`.
- Firebase SDK: reuse the same `firebase` web SDK version used by the web app
  and implement a small adapter in `packages/firebase/expo.ts` to handle Google
  sign-in via `expo-auth-session` and convert tokens to Firebase credentials.
- Storage / uploads: web code uses DOM `File` and `FileReader`; for mobile provide
  `uploadFileExpo(uri)` that reads file URIs via `expo-file-system` and uploads
  a Blob to Firebase Storage.

---

## 🔐 Authentication Rules

### Web App
- User + Admin supported
- Admin logic remains untouched

### Mobile App
- User-only authentication
- Identity based on `auth.currentUser.uid`
- No role-based access

Important: The mobile app must NOT include any admin logic or admin email checks.
Admin checks in the web app are implemented client-side using `adminConfig`; do
not import or reuse this in mobile.

---

## 🌍 Environment Variables

Use the **same Firebase project**.

- Web: `VITE_*`
- Mobile (Expo): `EXPO_PUBLIC_*`

No secrets should be hardcoded.

Mapping guidance:
- Web continues to read `VITE_FIREBASE_*` (no change).
- Mobile reads `EXPO_PUBLIC_FIREBASE_*` and the `packages/firebase` loader will
  prefer `process.env.EXPO_PUBLIC_FIREBASE_*` when running inside Expo.
- Do NOT commit secrets. If your repo `.env` currently contains live keys, rotate
  them before publishing.

---

## ⚙️ Tooling Requirements

- Turborepo
- TypeScript everywhere
- Shared base `tsconfig`
- Path aliases for shared packages
- Clean imports
- Isolated builds

Minimal workspace changes:
- Add `package.json` workspaces or configure your package manager to include
  `apps/*` and `packages/*`.
- Add `tsconfig.base.json` with shared compilerOptions and `paths` pointing to
  `packages/*` so imports like `@myrepo/types` or `@myrepo/firebase` resolve.

---

## ✅ Acceptance Criteria

- Web app runs exactly as before
- Mobile app runs via Expo (Android/iOS)
- Both apps use the same Firebase project
- Shared packages compile and are reused
- No admin logic exists in mobile

Acceptance checklist tailored to this repo:
- `src/firebase.ts` remains a working shim so the web app runs exactly as before.
- `packages/types` exports the same types used by web (`Order`, `Product`, etc.).
- `apps/mobile` (Expo) can `npm install` and `expo start` and sign-in with a
  non-admin user to view their orders.
- Mobile only reads orders where `order.userId === auth.currentUser.uid` via
  `onSnapshot` and shows live updates.

---

## 🧪 Quality Expectations

- Minimal diff to existing web code
- Clear comments for any refactor
- No duplicated Firebase config
- Clean separation of concerns

Known issues & blockers (discovered in this codebase):
- The web code uses `signInWithPopup(auth, googleProvider)` (browser popup).
  Expo requires `expo-auth-session` or native Google sign-in; the adapter will
  replace popups on mobile only.
- The web app uses `localStorage` and `File`/`FileReader` for uploads — mobile
  must use `AsyncStorage` and `expo-file-system`/Blob conversions. Those are
  implemented only in `packages/firebase/expo.ts` and `apps/mobile`.
- Vite `import.meta.env` is web-specific; mobile will use `EXPO_PUBLIC_*` env
  variables and the shared package will detect the environment.

---

## 🟢 Final Note

This README **is the prompt**.

Follow it strictly.  
When unsure, prefer **not changing existing code**.

Build clean, incremental, and production-ready.

---

## Concrete next steps (what I will do first)

- Create `packages/types` and copy the types from `src/types/index.ts`.
- Create `packages/firebase` with `src/index.ts`, `web.ts` (re-exports), and
  `expo.ts` (mobile adapters). Keep `src/firebase.ts` as a shim that re-exports
  from `packages/firebase/web` so the web app is unchanged.
- Scaffold `apps/mobile` using an Expo managed template and add a minimal
  `AuthContext` that uses `packages/firebase/expo`.

If you approve, I will scaffold the packages and mobile app next and run a
local verification. Confirm and I'll proceed to generate the scaffolded files.
