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

// set hover show info
let hoveredFeature = null;
let hoverEnabled = true;
const hoverLabel = document.getElementById('hoverLabel');

// for about
const aboutPanel = document.getElementById('aboutPanel');
const aboutHeader = document.getElementById('aboutHeader');
const aboutToggle = document.getElementById('aboutToggle');

// add listeners
document.getElementById('fieldSelect').addEventListener('change', applyClassification);
document.getElementById('classCount').addEventListener('change', applyClassification);
//  add listener for new palette selector
document.getElementById('paletteSelect').addEventListener('change', applyClassification);

// expands any class count 3–7 from a light→dark ramp
function getColorRamp(n, paletteName = 'turquoisePink') {
  const palettes  ={ 
    turquoisePink: {
      3: ['#3Bcfd4', '#fc9305', '#f20094'],
      4: ['#3Bcfd4', '#9cc047', '#fc9305', '#f20094'],
      5: ['#3Bcfd4', '#6cc881', '#fc9305', '#f85f4d', '#f20094'],
      6: ['#3Bcfd4', '#58cc9a', '#b9b737', '#fc9305', '#f85f4d', '#f20094'],
      7: ['#3Bcfd4', '#4fcdae', '#84c95f', '#fc9305', '#fa7a2a', '#f44767', '#f20094']
    },
    greenYellowRed: {
      3: ['#2A8D08', '#F2E713', '#F91E07'],
      4: ['#2A8D08', '#97bf10', '#F2E713', '#F91E07'],
      5: ['#2A8D08', '#6ea60c', '#F2E713', '#f59b0e', '#F91E07'],
      6: ['#2A8D08', '#54990a', '#b8ce11', '#F2E713', '#f59b0e', '#F91E07'],
      7: ['#2A8D08', '#438f09', '#7fb20d', '#F2E713', '#f7bc11', '#f47a0c', '#F91E07']
    },
    purpleRoseOrange: {
      3: ['#832388', '#E3436B', '#F17C2E'],
      4: ['#832388', '#b4337a', '#E3436B', '#F17C2E'],
      5: ['#832388', '#a62d80', '#E3436B', '#ea614d', '#F17C2E'],
      6: ['#832388', '#962a83', '#c53a76', '#E3436B', '#ea614d', '#F17C2E'],
      7: ['#832388', '#912985', '#af317d', '#E3436B', '#e8535c', '#ed6847', '#F17C2E']
    }
  };
  const selectedPalette = palettes[paletteName] || palettes.turquoisePink;
  return selectedPalette[n] || selectedPalette[5];
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
        'A15_25': 'Chapter 15 total, 2025',
        
        'BALL24': 'Business all chapters total, 2024',
        'BALL25': 'Business all chapters total, 2025',
        'B7_24': 'Business Chapter 7, 2024',
        'B7_25': 'Business Chapter 7, 2025',
        'B11_24': 'Business Chapter 11, 2024',
        'B11_25': 'Business Chapter 11, 2025',
        'B13_24': 'Business Chapter 13, 2024',
        'B13_25': 'Business Chapter 13, 2025',
        'BOTH24': 'Business other chapters total, 2024',
        'BOTH25': 'Business other chapters total, 2025',

        'NALL24': 'Nonbusiness all chapters total, 2024',
        'NALL25': 'Nonbusiness all chapters total, 2025',
        'N7_24': 'Nonbusiness Chapter 7, 2024',
        'N7_25': 'Nonbusiness Chapter 7, 2025',
        'N11_24': 'Nonbusiness Chapter 11, 2024',
        'N11_25': 'Nonbusiness Chapter 11, 2025',
        'N13_24': 'Nonbusiness Chapter 13, 2024',
        'N13_25': 'Nonbusiness Chapter 13, 2025',
        'NOTH24': 'Nonbusiness other chapters total, 2024',
        'NOTH25': 'Nonbusiness other chapters total, 2025',

        'A7SH24': 'Chapter 7 share of ALL_24',
        'A7SH25': 'Chapter 7 share of ALL_25',
        'A11SH24': 'Chapter 11 share of ALL_24',
        'A11SH25': 'Chapter 11 share of ALL_25',
        'A13SH24': 'Chapter 13 share of ALL_24',
        'A13SH25': 'Chapter 13 share of ALL_25',
        'AOTH24S': 'Other chapters share of ALL_24',
        'AOTH25S': 'Other chapters share of ALL_25',
        'A9SH24': 'Chapter 9 share of ALL_24',
        'A9SH25': 'Chapter 9 share of ALL_25',
        'A12SH24': 'Chapter 12 share of ALL_24',
        'A12SH25': 'Chapter 12 share of ALL_25',
        'A15SH24': 'Chapter 15 share of ALL_24',
        'A15SH25': 'Chapter 15 share of ALL_25',
        'B7SH24': 'Business Chapter 7 share of BALL24',
        'B7SH25': 'Business Chapter 7 share of BALL25',
        'B11SH24': 'Business Chapter 11 share of BALL24',
        'B11SH25': 'Business Chapter 11 share of BALL25',
        'B13SH24': 'Business Chapter 13 share of BALL24',
        'B13SH25': 'Business Chapter 13 share of BALL25',
        'BOTH24S': 'Business other chapters share of BALL24',
        'BOTH25S': 'Business other chapters share of BALL25',
        'N7SH24': 'Nonbusiness Chapter 7 share of NALL24',
        'N7SH25': 'Nonbusiness Chapter 7 share of NALL25',
        'N11SH24': 'Nonbusiness Chapter 11 share of NALL24',
        'N11SH25': 'Nonbusiness Chapter 11 share of NALL25',
        'N13SH24': 'Nonbusiness Chapter 13 share of NALL24',
        'N13SH25': 'Nonbusiness Chapter 13 share of NALL25',
        'NOTH24S': 'Nonbusiness other chapters share of NALL24',
        'NOTH25S': 'Nonbusiness other chapters share of NALL25',

        'ALLPC24': 'All chapters per 100 population, 2024',
        'ALLPC25': 'All chapters per 100 population, 2025',
        'A7PC24': 'Chapter 7 per 100 population, 2024',
        'A7PC25': 'Chapter 7 per 100 population, 2025',
        'A11PC24': 'Chapter 11 per 100 population, 2024',
        'A11PC25': 'Chapter 11 per 100 population, 2025',
        'A13PC24': 'Chapter 13 per 100 population, 2024',
        'A13PC25': 'Chapter 13 per 100 population, 2025',
        'AOTHPC24': 'Other chapters per 100 population, 2024',
        'AOTHPC25': 'Other chapters per 100 population, 2025',
        'A9PC24': 'Chapter 9 per 100 population, 2024',
        'A9PC25': 'Chapter 9 per 100 population, 2025',
        'A12PC24': 'Chapter 12 per 100 population, 2024',
        'A12PC25': 'Chapter 12 per 100 population, 2025',
        'A15PC24': 'Chapter 15 per 100 population, 2024',
        'A15PC25': 'Chapter 15 per 100 population, 2025',
        'BALLPC24': 'Business all chapters per 100 population, 2024',
        'BALLPC25': 'Business all chapters per 100 population, 2025',
        'B7PC24': 'Business Chapter 7 per 100 population, 2024',
        'B7PC25': 'Business Chapter 7 per 100 population, 2025',
        'B11PC24': 'Business Chapter 11 per 100 population, 2024',
        'B11PC25': 'Business Chapter 11 per 100 population, 2025',
        'B13PC24': 'Business Chapter 13 per 100 population, 2024',
        'B13PC25': 'Business Chapter 13 per 100 population, 2025',
        'BOTHPC24': 'Business other chapters per 100 population, 2024',
        'BOTHPC25': 'Business other chapters per 100 population, 2025',
        'NALLPC24': 'Nonbusiness all chapters per 100 population, 2024',
        'NALLPC25': 'Nonbusiness all chapters per 100 population, 2025',
        'N7PC24': 'Nonbusiness Chapter 7 per 100 population, 2024',
        'N7PC25': 'Nonbusiness Chapter 7 per 100 population, 2025',
        'N11PC24': 'Nonbusiness Chapter 11 per 100 population, 2024',
        'N11PC25': 'Nonbusiness Chapter 11 per 100 population, 2025',
        'N13PC24': 'Nonbusiness Chapter 13 per 100 population, 2024',
        'N13PC25': 'Nonbusiness Chapter 13 per 100 population, 2025',
        'NOTHPC24': 'Nonbusiness other chapters per 100 population, 2024',
        'NOTHPC25': 'Nonbusiness other chapters per 100 population, 2025',

        'ALLACHG': 'Absolute change in all chapters total',
        'A7ACHG': 'Absolute change in Chapter 7',
        'A11ACHG': 'Absolute change in Chapter 11',
        'A13ACHG': 'Absolute change in Chapter 13',
        'AOTHCHG': 'Absolute change in other chapters total',
        'A9ACHG': 'Absolute change in Chapter 9',
        'A12ACHG': 'Absolute change in Chapter 12',
        'A15ACHG': 'Absolute change in Chapter 15',
        'BALLCHG': 'Absolute change in business all chapters total',
        'B7ACHG': 'Absolute change in business Chapter 7',
        'B11ACHG': 'Absolute change in business Chapter 11',
        'B13ACHG': 'Absolute change in business Chapter 13',
        'BOTHCHG': 'Absolute change in business other chapters total',
        'NALLCHG': 'Absolute change in nonbusiness all chapters total',
        'N7ACHG': 'Absolute change in nonbusiness Chapter 7',
        'N11ACHG': 'Absolute change in nonbusiness Chapter 11',
        'N13ACHG': 'Absolute change in nonbusiness Chapter 13',
        'NOTHCHG': 'Absolute change in nonbusiness other chapters total',

        'ALLPCHG': 'Percent change in all chapters total',
        'A7PCHG': 'Percent change in Chapter 7',
        'A11PCHG': 'Percent change in Chapter 11',
        'A13PCHG': 'Percent change in Chapter 13',
        'AOTHPCHG': 'Percent change in other chapters total',
        'A9PCHG': 'Percent change in Chapter 9',
        'A12PCHG': 'Percent change in Chapter 12',
        'A15PCHG': 'Percent change in Chapter 15',
        'BALLPCHG': 'Percent change in business all chapters total',
        'B7PCHG': 'Percent change in business Chapter 7',
        'B11PCHG': 'Percent change in business Chapter 11',
        'B13PCHG': 'Percent change in business Chapter 13',
        'BOTHPCHG': 'Percent change in business other chapters total',
        'NALLPCHG': 'Percent change in nonbusiness all chapters total',
        'N7PCHG': 'Percent change in nonbusiness Chapter 7',
        'N11PCHG': 'Percent change in nonbusiness Chapter 11',
        'N13PCHG': 'Percent change in nonbusiness Chapter 13',
        'NOTHPCHG': 'Percent change in nonbusiness other chapters total',

        'ALLCCHG': 'Change in all chapters per 100 population',
        'A7CCHG': 'Change in Chapter 7 per 100 population',
        'A11CCHG': 'Change in Chapter 11 per 100 population',
        'A13CCHG': 'Change in Chapter 13 per 100 population',
        'AOTHCCHG': 'Change in other chapters per 100 population',
        'A9CCHG': 'Change in Chapter 9 per 100 population',
        'A12CCHG': 'Change in Chapter 12 per 100 population',
        'A15CCHG': 'Change in Chapter 15 per 100 population',
        'BALLCCHG': 'Change in business all chapters per 100 population',
        'B7CCHG': 'Change in business Chapter 7 per 100 population',
        'B11CCHG': 'Change in business Chapter 11 per 100 population',
        'B13CCHG': 'Change in business Chapter 13 per 100 population',
        'BOTHCCHG': 'Change in business other chapters per 100 population',
        'NALLCCHG': 'Change in nonbusiness all chapters per 100 population',
        'N7CCHG': 'Change in nonbusiness Chapter 7 per 100 population',
        'N11CCHG': 'Change in nonbusiness Chapter 11 per 100 population',
        'N13CCHG': 'Change in nonbusiness Chapter 13 per 100 population',
        'NOTHCCHG': 'Change in nonbusiness other chapters per 100 population'
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
  // const breaks = buildBreaks(values, classCount); // equal-interval
  const breaks = buildQuantileBreaks(values, classCount);
  // const colors = getColorRamp(classCount);
  const paletteName = document.getElementById('paletteSelect').value;
  const colors = getColorRamp(classCount, paletteName);

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



// add function toggle about panel
function toggleAboutPanel() {
  const collapsed = aboutPanel.classList.toggle('collapsed');
  aboutToggle.textContent = collapsed ? '+' : '−';
}

//  show hover label
function getHoverLabelHtml(feature) {
  const fieldName = document.getElementById('fieldSelect').value;

  const districtName =
    feature.get('Initial') || 'District';

  const displayFieldName = getNameOfData(fieldName);
  const value = feature.get(fieldName);

  return `
    <div class="hover-title">${districtName}</div>
    <div class="hover-value">${displayFieldName}: ${value ?? 'N/A'}</div>
  `;
}

// highlight stroke
function getHoverStyle(feature) {
  const color = getFeatureColor(feature);
  // const baseColor = getCurrentFeatureColor(feature);
  const baseFill = getCurrentFeatureFill(feature);

  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: color,
      width: 4,
    }),
    fill: new ol.style.Fill({
      // color: hexToRgba(color, alpha),
      color: baseFill,
    }),
  });
}

// get color of feature
function getFeatureColor(feature) {
  const style = getCurrentFeatureStyle(feature);
  if (!style) return '#333';

  const stroke = style.getStroke();
  if (!stroke) return '#333';

  return stroke.getColor() || '#333';
}

function getCurrentFeatureFill(feature) {
  const style = getCurrentFeatureStyle(feature);
  if (!style) return 'rgba(255,255,255,0.25)';

  const fill = style.getFill();
  if (!fill) return 'rgba(255,255,255,0.25)';

  return fill.getColor() || 'rgba(255,255,255,0.25)';
}

function getCurrentFeatureStyle(feature) {
  const styleFunction = vectorLayer.getStyleFunction();
  if (!styleFunction) return null;

  const resolution = map.getView().getResolution();
  const styleResult = styleFunction(feature, resolution);

  if (Array.isArray(styleResult)) {
    return styleResult[0] || null;
  }

  return styleResult || null;
}

// add trigger / function / listener
document.getElementById('hoverToggle').addEventListener('click', function () {
  hoverEnabled = !hoverEnabled;
  this.textContent = `Hover labels: ${hoverEnabled ? 'On' : 'Off'}`;

  if (!hoverEnabled) {
    if (hoveredFeature) {
      hoveredFeature.setStyle(undefined);
      hoveredFeature = null;
    }
    hoverLabel.style.display = 'none';
  }
});

// add toggle function
aboutToggle.addEventListener('click', function (evt) {
  evt.stopPropagation();
  toggleAboutPanel();
});

aboutHeader.addEventListener('click', toggleAboutPanel);

// hover and show
map.on('pointermove', function (evt) {
  if (!hoverEnabled || evt.dragging) return;

  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });

  // mouse is no longer over a feature
  if (!feature) {
    if (hoveredFeature) {
      hoveredFeature.setStyle(undefined);
      hoveredFeature = null;
    }

    hoverLabel.style.display = 'none';
    return;
  }

  // const currentColor = getFeatureColor(feature);

  // restore previous hovered feature if moved to another one
  if (hoveredFeature && hoveredFeature !== feature) {
    hoveredFeature.setStyle(undefined);
  }

  // set new hovered feature
  if (hoveredFeature !== feature) {
    hoveredFeature = feature;
    hoveredFeature.setStyle(getHoverStyle(feature));
  }

  // update floating label
  hoverLabel.innerHTML = getHoverLabelHtml(feature);
  
  hoverLabel.style.display = 'block';
  hoverLabel.style.left = `${evt.pixel[0] + 15}px`;
  hoverLabel.style.top = `${evt.pixel[1] + 15}px`;

  const color = getFeatureColor(feature);
  hoverLabel.querySelector('.hover-title').style.color = color;
  hoverLabel.style.borderColor = color;
});



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
