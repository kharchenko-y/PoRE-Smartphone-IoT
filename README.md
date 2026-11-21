# PoRE — Smartphone as IoT

A complete source-code starter for the Vilnius University **[PoRE] Smartphone as IoT** assignment.

**Architecture:** iPhone (Safari / DeviceMotion) → Firebase Authentication → Cloud Firestore → live JavaScript dashboard (HTTPS).

The browser on the phone collects real accelerometer and optional gyroscope readings, uploads one measurement every two seconds, and shows the resulting cloud data on a separate dashboard page. **No synthetic readings and no GPS location.**

## Assignment mapping

| Requirement | Implementation |
| --- | --- |
| Smartphone as IoT device | `phone.html` + `phone.js` using real `devicemotion` data |
| Send telemetry to cloud repository | Firebase Cloud Firestore `devices/{uid}/readings/{id}` |
| Web-based dashboard | `dashboard.html` + `dashboard.js` with live updates, two SVG charts, and a recent readings table |
| Free technology stack | HTML, CSS, JavaScript modules, Firebase Spark, GitHub Pages |

## Project files

- `index.html` — navigation and architecture overview
- `phone.html`, `phone.js` — mobile sensor capture and cloud uploader
- `dashboard.html`, `dashboard.js` — real-time Firestore observer and charts
- `sensor-utils.mjs` — validation, sensor conversion and vector magnitude helpers
- `firebase-client.js`, `firebase-config.js`, `auth-ui.js` — Firebase SDK and authentication
- `firestore.rules` — per-user database security rules (must be installed)
- `styles.css` — responsive styles
- `SETUP_RU.md` — detailed setup instructions in Russian
- `TEST_CHECKLIST.md` — actual acceptance test / evidence checklist
- `tests/` — pure JS unit tests

## First run

1. Register a **Web app** in an existing or new Firebase project. The existing `MADT-Lab6-WeatherMap` project may be reused because it already has Firebase Email/Password enabled; use Firestore under a separate collection path.
2. Create a Cloud Firestore database (Spark/free plan is sufficient for a short classroom demonstration). Start in production mode and apply all rules in `firestore.rules` under **Firestore Database > Rules**.
3. Copy your **Web app Firebase config** into `firebase-config.js`. Do not use the Android `google-services.json` or a service account key.
4. Put all root project files on GitHub Pages (public repository → Settings → Pages → Deploy from `main` / root). Wait for a working HTTPS URL.
5. On the iPhone, open `https://YOURNAME.github.io/YOURREPO/phone.html` in **Safari**. Register a dedicated test account, then press **Allow sensors & start** and approve motion access.
6. On the laptop, open `https://YOURNAME.github.io/YOURREPO/dashboard.html` and sign in with the **same account**. Move/tilt the phone and observe cloud readings and charts.
7. Press Stop and capture screenshots of both the phone sender and dashboard showing real values. Optional: show Firestore documents in Firebase Console.

The dashboard is intentionally not public without authentication. To let a lecturer inspect the live data, use a dedicated demo account and share its temporary credentials privately (not in a public GitHub repository). The dashboard's authenticated account must match the sender's account.

## Data schema

Path: `devices/{firebaseAuthUid}/readings/{generatedReadingId}`

```json
{
  "source": "smartphone-web-motion",
  "ax": 0.123,
  "ay": 9.806,
  "az": 0.45,
  "gx": 0.1,
  "gy": 2.3,
  "gz": -1.2,
  "gyroAvailable": true,
  "createdAt": "serverTimestamp()"
}
```

Acceleration is in m/s²; rotation rate is in degrees per second. If the gyroscope values are unavailable, `gx`, `gy`, and `gz` are **null**, `gyroAvailable` is false, and the dashboard correctly shows a dash rather than a fabricated zero. `createdAt` is a Firestore server timestamp, not a user-supplied time.

## Security and privacy

- Firestore rules require authentication and limit reads/creates to the user's own UID path.
- Readings cannot be modified or deleted through the client under these rules.
- Only motion telemetry is transmitted; location, camera, microphone, and contacts are not accessed.
- Transmission stops on Stop, navigation away/hidden tab, or after 120 samples (~4 minutes at 2-second intervals). A pending cloud request may finish after Stop.
- Use a dedicated test account. Do not publish passwords, service account credentials or admin SDK files.
- Firebase Web config values are client identifiers, **not** secret server credentials. Security is enforced by Firebase Auth + Firestore rules.

## Limitations

- The web app **requires HTTPS** to read motion sensors.
- iOS Safari asks for motion permissions after a user click. Certain embedded browsers block motion APIs.
- Browsers cannot reliably collect motion in the background, so data collection deliberately stops when hidden.
- Cloud services, GitHub Pages and their permissions must be configured before end-to-end tests can pass.
- Dashboard only displays the latest 120 readings and the latest 20 table rows; older records remain stored in Firestore.
- The project intentionally does not include a delete-history UI. For classroom data cleanup, use Firestore Console.

## Verification status (2026-11-17)

- **Done:** Source files created and local JavaScript syntax checks performed.
- **Done:** `node --test` — four sensor utility unit tests passed (4/4).
- **Not yet done:** Firebase live authentication, Firestore write/read, iPhone Safari motion permissions and dashboard data flow. These require user cloud setup and physical-device validation.

## Run utility tests

If Node.js is installed:

```bash
npm test
```

No npm dependencies are required for the source or for running these tests. The browser loads Firebase's modular JavaScript SDK via Google's CDN.
