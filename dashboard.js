import { setupAuth } from './auth-ui.js';
import {
  db, collection, query, orderBy, limit, onSnapshot, friendlyError
} from './firebase-client.js';
import { readingMagnitude, gyroMagnitude } from './sensor-utils.mjs';

const $ = (id) => document.getElementById(id);
let unsubscribe = null;
const SVG_NS = 'http://www.w3.org/2000/svg';
function svgNode(name, attrs = {}, text) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, String(value));
  if (text !== undefined) el.textContent = text;
  return el;
}
function lineChart(id, values, color) {
  const svg = $(id);
  svg.replaceChildren();
  const left = 45, top = 20, width = 566, height = 154;
  for (let i = 0; i <= 4; i++) {
    const y = top + (i / 4) * height;
    svg.append(svgNode('line', {x1:left,y1:y,x2:left+width,y2:y,stroke:'#2b3b51','stroke-width':1}));
  }
  if (!values.length) {
    svg.append(svgNode('text', {x:320,y:107,fill:'#98a9be','font-size':15,'text-anchor':'middle'}, 'Waiting for real sensor data'));
    return;
  }
  const vmax = Math.max(1, ...values) * 1.1;
  svg.append(svgNode('text', {x:8,y:top+8,fill:'#98a9be','font-size':12}, vmax.toFixed(1)));
  svg.append(svgNode('text', {x:24,y:top+height,fill:'#98a9be','font-size':12}, '0'));
  const pts = values.map((value, index) => {
    const x = left + (values.length === 1 ? width/2 : index * width / (values.length - 1));
    const y = top + height - value / vmax * height;
    return [x,y];
  });
  svg.append(svgNode('polyline', {
    points: pts.map(([x,y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' '),
    fill:'none',stroke:color,'stroke-width':3,'stroke-linejoin':'round','stroke-linecap':'round'
  }));
  const [px,py] = pts[pts.length - 1];
  svg.append(svgNode('circle',{cx:px,cy:py,r:5,fill:color,stroke:'#111e31','stroke-width':2}));
}
function formatted(value) {return value === null ? '—' : value.toFixed(2);}
function timeOf(record) {
  const date = record.createdAt?.toDate?.();
  return date ? date.toLocaleTimeString() : 'Pending';
}
function render(records) {
  const oldestFirst = [...records].reverse();
  const acceleration = oldestFirst.map(readingMagnitude).filter((v) => v !== null);
  const rotations = oldestFirst.map(gyroMagnitude).filter((v) => v !== null);
  $('metricRecords').textContent = String(records.length);
  $('metricLatest').textContent = formatted(records.length ? readingMagnitude(records[0]) : null);
  $('metricGyro').textContent = formatted(records.length ? gyroMagnitude(records[0]) : null);
  $('metricPeak').textContent = formatted(acceleration.length ? Math.max(...acceleration) : null);
  lineChart('accChart', acceleration, '#60e6ba');
  lineChart('gyroChart', rotations, '#78a7ff');
  const tbody = $('readingsBody');
  tbody.replaceChildren();
  if (!records.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.className = 'empty';
    td.textContent = 'No readings yet. Sign in on your phone and start motion capture.';
    tr.append(td);
    tbody.append(tr);
    $('liveStatus').textContent = 'Connected — waiting for smartphone readings';
    return;
  }
  $('liveStatus').textContent = `Connected — ${records.length} latest cloud readings available`;
  for (const r of records.slice(0, 20)) {
    const tr = document.createElement('tr');
    [timeOf(r),formatted(r.ax),formatted(r.ay),formatted(r.az),formatted(readingMagnitude(r)),formatted(gyroMagnitude(r))].forEach((value) => {
      const td = document.createElement('td');
      td.textContent = value;
      tr.append(td);
    });
    tbody.append(tr);
  }
}
setupAuth((user) => {
  if (unsubscribe) {unsubscribe();unsubscribe=null;}
  if (!user) return;
  $('liveStatus').textContent='Connecting to Firestore…';
  const readingsQuery = query(
    collection(db,'devices',user.uid,'readings'),
    orderBy('createdAt','desc'),limit(120)
  );
  unsubscribe = onSnapshot(readingsQuery, (snapshot) => {
    const records = snapshot.docs.map((d) => d.data());
    render(records);
  }, (error) => {
    $('liveStatus').textContent = `Error: ${friendlyError(error)}`;
  });
});
