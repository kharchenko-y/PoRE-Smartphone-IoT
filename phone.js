import { setupAuth } from './auth-ui.js';
import { db, collection, addDoc, serverTimestamp, friendlyError } from './firebase-client.js';
import { motionToReading, readingMagnitude, gyroMagnitude } from './sensor-utils.mjs';

const $ = (id) => document.getElementById(id);
const UPLOAD_INTERVAL_MS = 2000;
const MAX_SAMPLES_PER_SESSION = 120;
let user = null;
let streaming = false;
let latestReading = null;
let lastMotionAt = 0;
let sentCount = 0;
let timer = null;
let startupTimer = null;
let inFlight = false;
let sessionToken = 0;

function status(message) { $('sensorStatus').textContent = message; }
function format(value) { return value === null ? '—' : value.toFixed(2); }
function updateLive(reading) {
  const a = readingMagnitude(reading);
  const g = gyroMagnitude(reading);
  $('accValue').textContent = format(a);
  $('gyroValue').textContent = format(g);
}
function onMotion(event) {
  const reading = motionToReading(event);
  if (!reading) return;
  latestReading = reading;
  lastMotionAt = Date.now();
  updateLive(reading);
}
function stopStreaming(message = 'Stopped. No background uploads.') {
  streaming = false;
  sessionToken++;
  window.removeEventListener('devicemotion', onMotion);
  if (timer !== null) window.clearInterval(timer);
  if (startupTimer !== null) window.clearTimeout(startupTimer);
  timer = null;
  startupTimer = null;
  latestReading = null;
  $('startButton').disabled = !user;
  $('stopButton').disabled = true;
  status(message);
}

async function upload() {
  if (!streaming || !user || !latestReading || inFlight) return;
  if (sentCount >= MAX_SAMPLES_PER_SESSION) {
    stopStreaming('Session limit reached (120 readings). Start a new session if needed.');
    return;
  }
  if (Date.now() - lastMotionAt > 5000) {
    stopStreaming('Motion updates stopped. Keep Safari visible and try again.');
    return;
  }
  inFlight = true;
  const token = sessionToken;
  const snapshot = { ...latestReading };
  try {
    await addDoc(collection(db, 'devices', user.uid, 'readings'), {
      ...snapshot,
      createdAt: serverTimestamp()
    });
    // A previously started network request can finish after Stop or Sign out.
    // Do not update the UI or the next session with an old result.
    if (token !== sessionToken) return;
    sentCount++;
    $('sentCount').textContent = String(sentCount);
    $('lastUpload').textContent = new Date().toLocaleTimeString();
    if (streaming && token === sessionToken) {
      status(`Sending actual phone sensor measurements — ${sentCount}/${MAX_SAMPLES_PER_SESSION} received by cloud.`);
    }
    if (sentCount >= MAX_SAMPLES_PER_SESSION && streaming) stopStreaming('120 readings sent. Upload stopped automatically.');
  } catch (error) {
    if (streaming && token === sessionToken) stopStreaming(`Cloud upload failed: ${friendlyError(error)}`);
  } finally { inFlight = false; }
}

async function startStreaming() {
  if (streaming || !user) return;
  if (!window.isSecureContext) {
    status('HTTPS required for motion sensors. Use GitHub Pages, not an insecure HTTP address.');
    return;
  }
  if (typeof DeviceMotionEvent === 'undefined') {
    status('DeviceMotion is not supported in this browser. Open the page in Safari on the iPhone.');
    return;
  }
  // On iOS the permission prompt must be triggered directly by a user click.
  // Do not add asynchronous work before this request.
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      const result = await DeviceMotionEvent.requestPermission();
      if (result !== 'granted') {
        status('Motion permission denied. Allow motion access in iOS Settings/Safari and retry.');
        return;
      }
    } catch (error) {
      status(`Motion permission error: ${error.message}`);
      return;
    }
  }
  streaming = true;
  sessionToken++;
  sentCount = 0;
  latestReading = null;
  lastMotionAt = 0;
  $('sentCount').textContent = '0';
  $('lastUpload').textContent = '—';
  $('accValue').textContent = '—';
  $('gyroValue').textContent = '—';
  $('startButton').disabled = true;
  $('stopButton').disabled = false;
  status('Waiting for actual motion readings. Move or tilt the phone.');
  window.addEventListener('devicemotion', onMotion);
  const token = sessionToken;
  startupTimer = window.setTimeout(() => {
    if (streaming && token === sessionToken && !latestReading) {
      stopStreaming('No accelerometer data received. Try Safari (not an in-app browser) and enable motion permissions.');
    }
  }, 6000);
  timer = window.setInterval(() => { void upload(); }, UPLOAD_INTERVAL_MS);
}

$('startButton').addEventListener('click', () => void startStreaming());
$('stopButton').addEventListener('click', () => stopStreaming());
document.addEventListener('visibilitychange', () => {
  if (document.hidden && streaming) stopStreaming('Paused automatically because the page was hidden.');
});
window.addEventListener('pagehide', () => { if (streaming) stopStreaming(); });
setupAuth((nextUser) => {
  if (streaming) stopStreaming('Account changed — uploads stopped.');
  user = nextUser;
  $('startButton').disabled = !user;
});
