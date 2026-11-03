# Ekspedisi 9 Nilai P3MD

A gamified front end for the **Survei Pemetaan 9 Nilai P3MD** Google Form.
Serdik sign in with their `@p3md.sbm-itb.ac.id` Google account, answer the 71
statements as a 9-checkpoint "expedition", and finish by opening the official
Google Form with every answer pre-filled. The Google Form stays the single
source of truth for responses.

```
Sign in with Google ─▶ Identity ─▶ Bagian A (9) ─▶ 9 Pos (62) ─▶ Pre-filled Google Form ─▶ Submit
   (domain check)                                                  (authuser = signed-in email)
```

## Files

| File         | Purpose                                                                 |
|--------------|-------------------------------------------------------------------------|
| `index.html` | The whole app (HTML, CSS, JS). No build step.                           |
| `config.js`  | Google Client ID, allowed domain, Google Form id and the 75 entry ids. |
| `README.md`  | This guide.                                                             |

## Setup

### 1. Push to GitHub and deploy on Vercel

1. Create a new GitHub repository and push this folder to it.
2. In Vercel: **Add New → Project → Import** the repository.
   Framework preset: **Other**. No build command, no output directory.
3. Deploy and note the production URL, e.g. `https://ekspedisi-9-nilai.vercel.app`.

The sign-in button will show "Tombol masuk belum aktif" until step 2 is done.

### 2. Create the Google OAuth Client ID

Do this while signed in with a **@p3md.sbm-itb.ac.id** account if possible,
so the project belongs to the P3MD Workspace organization.

1. Open <https://console.cloud.google.com/> and create a project, e.g. `ekspedisi-9-nilai`.
2. **APIs & Services → OAuth consent screen**
   - User type: **Internal** (only accounts in the P3MD organization can sign in;
     Google enforces this before our own domain check). This option only appears
     when the project belongs to the Workspace organization.
     If you must use **External**, publish the app; our domain check still applies.
   - App name: `Ekspedisi 9 Nilai P3MD`, support email: yours. Scopes: none beyond the defaults.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `https://<your-vercel-domain>` (exact production URL, no trailing slash)
     - `http://localhost:8765` (optional, for local testing)
   - Authorized redirect URIs: leave empty (the popup flow does not need one).
4. Copy the **Client ID** (ends with `.apps.googleusercontent.com`) into
   `config.js` → `googleClientId`, commit, and push. Vercel redeploys automatically.

> The Client ID is public by design. Never add a client secret, service-account
> key, or any other secret to this repository.

### 3. Lock down the Google Form (form owner)

In the form's **Settings → Responses**:

- **Collect email addresses: Verified**
- **Restrict to users in P3MD organization**
- **Limit to 1 response**

These settings are the real guard. The sign-in screen on the site is a
convenience gate that stops people from filling everything in with the wrong
account; it decodes Google's ID token in the browser and does not verify its
signature on a server.

### 4. Test once

1. Open the site, sign in, and fill the expedition with a recognisable pattern
   (Pos 1 all 1s, Pos 2 all 2s, ...).
2. Press **Buka & kirim di Google Form** and check on each form page that the
   answers land on the right questions.
3. Do **not** press Submit during the test (it would use up your one response).
   If you do, ask the form owner to delete that response.

## One-click submission (Apps Script receiver)

When `config.js → submitUrl` is set, the final step shows a single
**Kirim jawaban** button. Answers go straight to a Google Sheet through
`apps-script/Code.gs`; the Google Form is no longer opened.

How identity stays trustworthy: the browser sends the Google ID token from
sign-in, and the script verifies it with Google (`oauth2.googleapis.com/tokeninfo`)
before writing: audience must equal our Client ID, email must be verified,
domain must be `p3md.sbm-itb.ac.id`, token must not be expired. One row per
email; sending again updates that row and increments "Jumlah kirim".
ID tokens last one hour, so a serdik who returns later is asked to confirm the
Google account once before sending.

Points, rank and the reflection radar stay hidden until the answers are sent.

### Setup

1. Create a Google Sheet, e.g. **Hasil Survei 9 Nilai P3MD** (any Google account).
2. In the sheet: **Extensions → Apps Script**. Replace the default code with
   `apps-script/Code.gs`. Check that `CLIENT_ID` matches `config.js`.
3. Select the `setup` function and press **Run** once. Approve the permissions
   (on the "Google hasn't verified this app" screen: *Advanced → Go to … (unsafe)*;
   it is your own script). A sheet named **Jawaban** with 79 header columns appears.
4. **Deploy → New deployment →** type **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   Press **Deploy** and copy the **Web app URL** (ends with `/exec`).
5. Put that URL in `config.js → submitUrl`, commit and push.
6. Share the sheet with Tim Binkar (Viewer or Editor).

When `Code.gs` changes later, use **Deploy → Manage deployments → Edit →
Version: New version** so the `/exec` URL stays the same.

Sheet columns: Waktu kirim, Email, Nama, Grup, Elemen, Kelas, A1–A9, B1–B62,
Terakhir diperbarui, Jumlah kirim. Optional items B8 and B10 may be empty.
Scoring notes for analysis: B38, B45, B55, B57 are reverse-worded;
B20, B30, B39, B62 are validity (social-desirability) checks.

## Local development

```bash
python3 -m http.server 8765
# open http://localhost:8765
```

Google sign-in does not work from `file://`; serve the folder over HTTP and add
`http://localhost:8765` to the Client ID's authorized origins.

## Maintenance

- **Form questions changed?** Generate a new pre-filled link
  (form ⋮ → *Get pre-filled link*, fill every question), and replace
  `config.js → form.entries` with the 75 `entry.<id>` numbers in order.
- **Question text** lives in `index.html` in the `B` array (Bagian B) and the
  `VALUES` array (Bagian A). Keep the order identical to the form.
- **Drafts** are stored in the browser's `localStorage`, keyed by the signed-in
  email, so two people on one device never share answers. "Ganti akun" signs out
  and shows a fresh draft for the next person.
- Points and badges count answered items only, never the value of an answer,
  so the gamification does not push answers up or down.
