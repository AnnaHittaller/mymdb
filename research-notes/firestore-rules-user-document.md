# Firestore: owner-only `users/{uid}`

**Question:** Rules, indexes, and pitfalls so a user can only read/write their own document (embedded `movies[]`).

**Today:** `composables/useFirestore.ts` — `setDoc` (register), `updateDoc`+`arrayUnion` (add), `getDoc` then full-array `updateDoc` (remove/update, `timestamp: new Date()`). VueFire `useDocument(users/{uid})`. No `firestore.rules` in repo. Client filters `movies`; no server queries on array fields.

## Rules

Match **document ID** to `request.auth.uid` on every op (Firebase’s sample `allow create: if request.auth != null` is **not** enough: any signed-in user could create `/users/{someoneElse}`). Split **get vs list**: owner `get` is enough for VueFire; **deny `list`** so `getDocs(collection(users))` cannot enumerate profiles. Pin `uid`; optional: pin `email` to `request.auth.token.email`. Cap `movies.size` in rules — rules **cannot loop** elements (max **1000 expressions**/request). Do not `get()` other docs.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
    match /users/{userId} {
      allow get: if request.auth != null && request.auth.uid == userId;
      allow list: if false;
      allow create: if isSelf(userId)
        && request.resource.data.uid == userId
        && request.resource.data.keys().hasOnly(['uid','username','email','theme','movies'])
        && request.resource.data.movies.size() <= 2000;
      allow update: if isSelf(userId) && resource.data.uid == userId
        && request.resource.data.uid == resource.data.uid
        && request.resource.data.movies is list
        && request.resource.data.movies.size() <= 2000;
      allow delete: if isSelf(userId);
    }
    function isSelf(userId) { return request.auth != null && request.auth.uid == userId; }
  }
}
```

## Indexes

No composite indexes: access is `doc(users, uid)`, not collection queries. Default indexing still indexes **`movies` (large array of maps)** → write cost + **40,000 index entries/doc**. Exempt collection `users`, field `movies` (all index modes). Do not add `array-contains` on whole movie maps (needs exact map, including timestamp).

## Limits & timestamps

No max array length. Hard caps: **1 MiB/doc**, **40k index entries**, field depth 20. Roughly a few thousand `UserMovie`s before 1 MiB (poster strings dominate). TypeScript `timestamp: Date`; SDK **writes `Date` as Timestamp**, **reads Timestamp** (`toDate()` — already assumed in commented `pages/index.vue`). `arrayUnion` equality is the **whole map**; a new `Date()` makes the same movie a **new element** (duplicates). `arrayRemove` is imported but unused: it also needs that exact map (Timestamp ≠ `Date`). Prefer `Timestamp.fromDate` / `serverTimestamp()` only at **document** fields — **not** inside `arrayUnion` maps.

## Breakage vs current writes

- **`arrayUnion` add + full-array rewrite remove/update:** two tabs → last full rewrite **drops** the other tab’s add. `arrayUnion` of *different* movies *would* merge; mixing with stale `getDoc` rewrite will not. Use a **transaction** (or always rewrite from a transaction snapshot) for remove/update.
- **`setDoc` without merge** replaces the whole user doc (wipes `movies` if reused after register).
- Rules that validate `movies[i]` or uniqueness will **deny** large lists (1000-expression cap).
- Owner rules + a `query(collection(users), where(...))` (imported on `pages/index.vue`) **fail closed** — not a filter.
- Concurrent edits to **one** doc: last write wins; not 500 writes/s sequential-ID hotspot.

**Default later:** keep one doc + array until size/races hurt; then `users/{uid}/movies/{movieId}` (rules: `uid` + `movieId == resource.id`).
