import test from 'node:test';
import assert from 'node:assert/strict';
import { motionToReading, magnitude3, readingMagnitude, gyroMagnitude, round3 } from '../sensor-utils.mjs';

test('real accelerometer and gyro values are parsed', () => {
  const reading = motionToReading({
    accelerationIncludingGravity:{x:0,y:9.81,z:0},
    rotationRate:{alpha:30,beta:0,gamma:-5}
  });
  assert.equal(reading.source,'smartphone-web-motion');
  assert.equal(reading.ay,9.81);
  assert.equal(reading.gyroAvailable,true);
  assert.equal(reading.gx,30);
  assert.equal(readingMagnitude(reading),9.81);
});
test('missing or invalid sensor data is not fabricated', () => {
  assert.equal(motionToReading({}),null);
  assert.equal(motionToReading({accelerationIncludingGravity:{x:null,y:9.81,z:1}}),null);
  assert.equal(motionToReading({accelerationIncludingGravity:{x:NaN,y:9.81,z:1}}),null);
});
test('missing gyro remains null, not a fake zero', () => {
  const reading = motionToReading({acceleration:{x:1,y:2,z:3}});
  assert.equal(reading.gyroAvailable,false);
  assert.equal(reading.gx,null);
  assert.equal(gyroMagnitude(reading),null);
  assert.equal(readingMagnitude(reading),Math.sqrt(14));
});
test('numeric rounding and magnitude are predictable', () => {
  assert.equal(round3(1.23456),1.235);
  assert.equal(magnitude3(3,4,0),5);
  assert.equal(magnitude3(null,0,0),null);
});
