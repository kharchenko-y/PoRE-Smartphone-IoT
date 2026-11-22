# PoRE — Smartphone as IoT

A completed and tested project for the Vilnius University **[PoRE] Smartphone as IoT** assignment.

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
- `tests/` — pure JS unit tests

## Live demo

- [Project website](https://kharchenko-y.github.io/PoRE-Smartphone-IoT/)
- [Phone sender](https://kharchenko-y.github.io/PoRE-Smartphone-IoT/phone.html) — open in Safari on an iPhone
- [Live dashboard](https://kharchenko-y.github.io/PoRE-Smartphone-IoT/dashboard.html) — view readings and charts

Sign in to the sender and dashboard with the **same Firebase Email/Password account**. The dashboard is intentionally private: readings are visible only to the account that generated them. For a live classroom demonstration, provide dedicated demo-account credentials privately, never in this repository.

## Development and deployment

The site uses plain HTML/CSS/JavaScript with Firebase's modular SDK loaded from Google's CDN. GitHub Pages deploys the `main` branch over HTTPS. The Firebase Web configuration is in `firebase-config.js`; access to telemetry is controlled by Firebase Authentication and the rules in `firestore.rules`.

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
- Live operation requires the configured Firebase project, available cloud services, and access to the appropriate test account.
- Dashboard only displays the latest 120 readings and the latest 20 table rows; older records remain stored in Firestore.
- The project intentionally does not include a delete-history UI. For classroom data cleanup, use Firestore Console.

## Verification status

- JavaScript unit tests: 4/4 passed.
- Tested on a physical iPhone using Safari.
- Firebase Authentication and Cloud Firestore verified.
- 50 real telemetry readings displayed on the dashboard.
- Live acceleration and rotation charts verified.
- Deployed successfully using GitHub Pages.

## Run utility tests

If Node.js is installed:

```bash
npm test
```

No npm dependencies are required for the source or for running these tests. The browser loads Firebase's modular JavaScript SDK via Google's CDN.
