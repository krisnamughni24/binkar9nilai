# Ekspedisi 9 Nilai P3MD

A gamified front end for the **Survei Pemetaan 9 Nilai P3MD** (Tim Binkar ×
Risdikti × SDM, Senat P3MD). Serdik sign in with their `@p3md.sbm-itb.ac.id`
Google account, rate 27 statements about Serdik P3MDI in general across
three checkpoints, rate 10 soft skills about themselves, pick 3 to
develop, and send everything with one click to a Google Sheet through an
Apps Script receiver.

```
Sign in ─▶ Identity ─▶ 3 Pos (3 × 9 statements, 1-4) ─▶ Soft skill S1-S10 (1-5) + S11 pick 3 ─▶ Kirim jawaban ─▶ Sheet "Jawaban v2"
 (every visit)                                                                (token verified, one per email)
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
email: a second submission is rejected (`already_submitted`) and the earlier
answers are returned, so the site shows them read-only on any device.
ID tokens last one hour, so a serdik who returns later is asked to confirm the
Google account once before sending.

The soft-skill profile and the 9 Nilai summary stay hidden until the answers are sent.
After sign-in the site asks the receiver (`action: "status"`) whether the
account already submitted; if so, it jumps straight to the locked results.

### Setup

1. Create a Google Sheet, e.g. **Hasil Survei 9 Nilai P3MD** (any Google account).
2. In the sheet: **Extensions → Apps Script**. Replace the default code with
   `apps-script/Code.gs`. Check that `CLIENT_ID` matches `config.js`.
3. Select the `setup` function and press **Run** once. Approve the permissions
   (on the "Google hasn't verified this app" screen: *Advanced → Go to … (unsafe)*;
   it is your own script). A tab named **Jawaban v2** with 46 header columns appears.
4. **Deploy → New deployment →** type **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   Press **Deploy** and copy the **Web app URL** (ends with `/exec`).
5. Put that URL in `config.js → submitUrl`, commit and push.
6. Share the sheet with Tim Binkar (Viewer or Editor).

When `Code.gs` changes later, use **Deploy → Manage deployments → Edit →
Version: New version** so the `/exec` URL stays the same.

Sheet tab **Jawaban v2** (46 columns): Waktu kirim, Email, Nama, Grup, Elemen,
Kelas, statements 1-27 (scale 1-4), S1-S10 (scale 1-5), S11 (the three chosen
soft skills as "A, B, C", same format as a Google Forms checkbox),
Terakhir diperbarui, Jumlah kirim.

Instrument v2. The site follows the form's sections: three checkpoints of nine
statements (9 Nilai P3MD 1/3, 2/3, 3/3), then the soft-skill stage numbered
S1-S11. Each statement also maps to one value, used for the results chart:

| Statements | Value |
|---|---|
| 1-3 | Karakter dan Integritas |
| 4-6 | Kepemimpinan |
| 7-9 | Komunikasi dan Adaptabilitas |
| 10-12 | Resiliensi Fisik dan Mental |
| 13-15 | Analytical Thinking dan Problem Solving |
| 16-18 | Manajemen dan Eksekusi |
| 19-21 | Governance dan Etika Publik |
| 22-24 | Nation Building dan Public Purpose |
| 25-27 | Collaboration dan Stakeholder Leadership |

Statements 1-27 describe Serdik P3MDI in general (not the respondent).
S1-S10 are self-ratings. All items are required; S11 needs exactly 3.

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
- **Drafts** live in the sheet, tab **Draf** (one row per email). The site saves
  the whole form after the identity step, after each checkpoint, after S1-S10
  and after S11 (`action: "save"`), and loads it back after sign-in on any
  device (`action: "status"` returns `draft`). "Mulai dari awal" deletes the
  draft (`action: "clear"`); submitting moves it to **Jawaban v2**. Nothing is
  kept in the browser.
- Badges count completed checkpoints only, never the value of an answer,
  so the gamification does not push answers up or down. There are no points.
