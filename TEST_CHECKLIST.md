# PoRE Smartphone as IoT — acceptance checklist

> Tick a row only after actual testing on the deployed HTTPS site.

- [ ] `phone.html` opens on iPhone Safari over HTTPS.
- [ ] New test user can register or sign in with Firebase Authentication.
- [ ] Safari prompts for motion access after pressing Allow sensors & start.
- [ ] The displayed acceleration readings change when the physical phone moves.
- [ ] Sent-to-cloud counter increases (every ~2 seconds).
- [ ] Firebase Cloud Firestore contains corresponding documents under `devices/{uid}/readings`.
- [ ] `dashboard.html` opens on laptop over HTTPS.
- [ ] Dashboard account is the same as phone account.
- [ ] Record count, graph and readings table update from Firestore automatically.
- [ ] Stop prevents new uploads; switching away from the sender pauses collection.
- [ ] Unauthorized account cannot read another user's readings (validate in Firestore rules test).
- [ ] Screenshots captured: phone sender, live dashboard, Firestore documents.
- [ ] Teacher can access demo (account details given privately if needed).
- [ ] Moodle submission completed; status checked.

## Evidence suggestions

1. Screenshot of the phone reading panel with an upload count above zero.
2. Screenshot of the laptop dashboard with a non-empty chart/table.
3. Screenshot of Firebase > Firestore Database > Data listing stored telemetry.

## Local code checks already completed

- `npm test`: **4/4 pass** (pure sensor conversion and validation).
- `node --check`: syntax checked for all local JS modules.

These checks **do not substitute** for real iPhone, Firebase or HTTPS tests.
