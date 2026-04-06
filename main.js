import Map from 'https://cdn.jsdelivr.net/npm/ol@10.8.0/Map.js';
import View from 'https://cdn.jsdelivr.net/npm/ol@10.8.0/View.js';
import TileLayer from 'https://cdn.jsdelivr.net/npm/ol@10.8.0/layer/Tile.js';
import VectorLayer from 'https://cdn.jsdelivr.net/npm/ol@10.8.0/layer/Vector.js';
import VectorSource from 'https://cdn.jsdelivr.net/npm/ol@10.8.0/source/Vector.js';
import OSM from 'https://cdn.jsdelivr.net/npm/ol@10.8.0/source/OSM.js';
import GeoJSON from 'https://cdn.jsdelivr.net/npm/ol@10.8.0/format/GeoJSON.js';
import Style from 'https://cdn.jsdelivr.net/npm/ol@10.8.0/style/Style.js';
import Fill from 'https://cdn.jsdelivr.net/npm/ol@10.8.0/style/Fill.js';
import Stroke from 'https://cdn.jsdelivr.net/npm/ol@10.8.0/style/Stroke.js';
// Massachusetts center coordinates (longitude, latitude)
const massCenter = [139.77, 35.68];

// WKT rectangle
const wkt = 'POLYGON((139.75 36.0, 140.5 36.0, 140.5 35.5, 139.75 35.5, 139.75 36.0))';
const format = new ol.format.WKT();
const feature = format.readFeature(wkt, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'
});

const vectorSource = new ol.source.Vector({
    // features: [feature]
    url: './data/us_districts.geojson',
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

vectorSource.once('change', function () {
  if (vectorSource.getState() === 'ready') {
    map.getView().fit(vectorSource.getExtent(), {
      padding: [20, 20, 20, 20],
      maxZoom: 8,
    });
  }
});

const info = document.getElementById('info');

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
