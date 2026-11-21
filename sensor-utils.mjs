/** Helpers shared by the real phone sender and offline unit tests. */
export function numericOrNull(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function round3(value) {
  const n = numericOrNull(value);
  return n === null ? null : Math.round(n * 1000) / 1000;
}

export function magnitude3(x, y, z) {
  if ([x, y, z].some((v) => numericOrNull(v) === null)) return null;
  return Math.sqrt(x * x + y * y + z * z);
}

/** Returns null when the browser has not provided real acceleration data. */
export function motionToReading(event) {
  const a = event?.accelerationIncludingGravity ?? event?.acceleration;
  if (!a) return null;
  const ax = round3(a.x), ay = round3(a.y), az = round3(a.z);
  if ([ax, ay, az].some((v) => v === null)) return null;
  const r = event?.rotationRate;
  const gx = round3(r?.alpha), gy = round3(r?.beta), gz = round3(r?.gamma);
  const gyroAvailable = [gx, gy, gz].every((v) => v !== null);
  return {
    source: 'smartphone-web-motion',
    ax, ay, az,
    gx: gyroAvailable ? gx : null,
    gy: gyroAvailable ? gy : null,
    gz: gyroAvailable ? gz : null,
    gyroAvailable
  };
}

export function readingMagnitude(reading) {
  if (!reading) return null;
  return magnitude3(reading.ax, reading.ay, reading.az);
}

export function gyroMagnitude(reading) {
  if (!reading?.gyroAvailable) return null;
  return magnitude3(reading.gx, reading.gy, reading.gz);
}
