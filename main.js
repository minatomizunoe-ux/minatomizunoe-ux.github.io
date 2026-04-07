// Massachusetts center coordinates (longitude, latitude)
const massCenter = [139.77, 35.68];
// const massCenter = [-11000000, 5000000];

// // WKT rectangle
// const wkt = 'POLYGON((139.75 36.0, 140.5 36.0, 140.5 35.5, 139.75 35.5, 139.75 36.0))';
// const format = new ol.format.WKT();
// const feature = format.readFeature(wkt, {
//     dataProjection: 'EPSG:4326',
//     featureProjection: 'EPSG:3857'
// });
const baseColors5 = [
  '#f7fbff',
  '#c6dbef',
  '#6baed6',
  '#2171b5',
  '#08306b'
];
// expands any class count 3–7 from a light→dark ramp
function getColorRamp(n) {
  const ramps = {
    3: ['#3Bcfd4', '#fc9305', '#f20094'],
    4: ['#3Bcfd4', '#9cc047', '#fc9305', '#f20094'],
    5: ['#3Bcfd4', '#6cc881', '#fc9305', '#f85f4d', '#f20094'],
    6: ['#3Bcfd4', '#58cc9a', '#b9b737', '#fc9305', '#f85f4d', '#f20094'],
    7: ['#3Bcfd4', '#4fcdae', '#84c95f', '#fc9305', '#fa7a2a', '#f44767', '#f20094']
  };
  return ramps[n] || baseColors5;
}

function getNameOfData(n){
    const ramps = {
        'ALL_24': 'All chapters total, 2024',
        'ALL_25': 'All chapters total, 2025',
        'A7_24': 'Chapter 7 total, 2024',
        'A7_25': 'Chapter 7 total, 2025',
        'A11_24': 'Chapter 11 total, 2024',
        'A11_25': 'Chapter 11 total, 2025',
        'A13_24': 'Chapter 13 total, 2024',
        'A13_25': 'Chapter 13 total, 2025',
        'AOTH24': 'Other chapters total, 2024',
        'AOTH25': 'Other chapters total, 2025',
        'A9_24': 'Chapter 9 total, 2024',
        'A9_25': 'Chapter 9 total, 2025',
        'A12_24': 'Chapter 12 total, 2024',
        'A12_25': 'Chapter 12 total, 2025',
        'A15_24': 'Chapter 15 total, 2024',
        'A15_25': 'Chapter 15 total, 2025'
    };
    return ramps[n] || 'Chapter 7 total, 2024'
}

const vectorSource = new ol.source.Vector({
    // features: [feature]
    url: './data/USCourtDistrict1.geojson',
    format: new ol.format.GeoJSON(),
});

const vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#004a99',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0, 123, 255, 0.20)',
        })
    })
});


// Create the map
const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }),
        vectorLayer
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat(massCenter),
        zoom: 8
    })
});

// asynchronized
vectorSource.once('change', function () {
  if (vectorSource.getState() === 'ready') {
    map.getView().fit(vectorSource.getExtent(), {
      padding: [20, 20, 20, 20],
      maxZoom: 8,
    });
    applyClassification();
  }
});

function getNumericValues(fieldName) {
  return vectorSource.getFeatures()
    .map(f => Number(f.get(fieldName)))
    .filter(v => Number.isFinite(v))
    .sort((a, b) => a - b);
}

// equal-interval breaks
function buildBreaks(values, classCount) {
  if (!values.length) return [];
  const min = values[0];
  const max = values[values.length - 1];
  const step = (max - min) / classCount;
  const breaks = [];
  for (let i = 0; i <= classCount; i++) {
    breaks.push(min + step * i);
  }
  return breaks;
}

// quantile
function buildQuantileBreaks(values, classCount) {
  if (!values.length) return [];

  const sorted = [...values].sort((a, b) => a - b);
  const breaks = [sorted[0]];

  for (let i = 1; i < classCount; i++) {
    const idx = Math.floor((i * sorted.length) / classCount);
    breaks.push(sorted[idx]);
  }

  breaks.push(sorted[sorted.length - 1]);

  // make breaks non-decreasing and avoid weird backwards labels
  for (let i = 1; i < breaks.length; i++) {
    if (breaks[i] < breaks[i - 1]) {
      breaks[i] = breaks[i - 1];
    }
  }

  return breaks;
}

function getClassIndex(value, breaks) {
  if (!Number.isFinite(value)) return 0;
  for (let i = 0; i < breaks.length - 1; i++) {
    const low = breaks[i];
    const high = breaks[i + 1];
    const isLast = i === breaks.length - 2;
    if ((value >= low && value < high) || (isLast && value <= high)) {
      return i;
    }
  }
  return 0;
}

// this is for legend
function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function updateLegend(fieldName, breaks, colors) {
  const legend = document.getElementById('legend');
  legend.innerHTML = `<strong>${getNameOfData(fieldName)}</strong><br>`;

  for (let i = 0; i < colors.length; i++) {
    const low = breaks[i];
    const high = breaks[i + 1];
    const label = `${low.toFixed(2)} – ${high.toFixed(2)}`;

    const row = document.createElement('div');
    row.className = 'legend-row';

    const swatch = document.createElement('div');
    swatch.className = 'legend-swatch';
    swatch.style.borderColor = colors[i];
    swatch.style.backgroundColor = hexToRgba(colors[i], 0.28);

    const text = document.createElement('div');
    text.textContent = label;

    row.appendChild(swatch);
    row.appendChild(text);
    legend.appendChild(row);
  }
}

function applyClassification() {
  const fieldName = document.getElementById('fieldSelect').value;
  const classCount = Number(document.getElementById('classCount').value);

  const values = getNumericValues(fieldName);
//   const breaks = buildBreaks(values, classCount); // equal-interval
  const breaks = buildQuantileBreaks(values, classCount);
  const colors = getColorRamp(classCount);

  const styleCache = new Map();

  vectorLayer.setStyle((feature) => {
    const value = Number(feature.get(fieldName));
    const classIndex = getClassIndex(value, breaks);
    const color = colors[classIndex] || colors[0];
    const key = `${classIndex}`;

    if (!styleCache.has(key)) {
      styleCache.set(key, new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: color,
          width: 2,
        }),
        fill: new ol.style.Fill({
          color: hexToRgba(color, 0.28),
        }),
      }));
    }

    return styleCache.get(key);
  });

  updateLegend(fieldName, breaks, colors);
}

document.getElementById('fieldSelect').addEventListener('change', applyClassification);
document.getElementById('classCount').addEventListener('change', applyClassification);



// get info
const info = document.getElementById('info');

// click and show info
map.on('singleclick', function (evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });

  if (!feature) {
    info.textContent = 'Click a feature';
    return;
  }

  const props = feature.getProperties();
  const entries = Object.entries(props).filter(([key]) => key !== 'geometry');
  const firstSeven = entries.slice(0, 7);

  info.textContent = firstSeven
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
});
