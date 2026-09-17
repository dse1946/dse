function lngLat(coords) {
    return [coords[1], coords[0]];
}

var map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: lngLat([39.0, 22.0]),
    zoom: 6.8,
    maxPitch: 0,
    attributionControl: false
});

map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

function showPopup(lngLatPos, html) {
    new maplibregl.Popup({ offset: 12, closeButton: true })
        .setLngLat(lngLatPos)
        .setHTML(html)
        .addTo(map);
}

function addMarker(coords, className, html) {
    var el = document.createElement('div');
    el.className = className;
    el.addEventListener('click', function (e) {
        e.stopPropagation();
        showPopup(lngLat(coords), html);
    });

    new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(lngLat(coords))
        .addTo(map);
}

function firstLabelLayerId() {
    var layers = map.getStyle().layers || [];
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            return layers[i].id;
        }
    }
    return undefined;
}

map.on('load', function () {
    map.addSource('terrain', {
        type: 'raster-dem',
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        tileSize: 256,
        maxzoom: 15,
        encoding: 'terrarium',
        attribution: 'Terrain © <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md">Mapzen/AWS</a>'
    });

    map.addLayer({
        id: 'color-relief',
        type: 'color-relief',
        source: 'terrain',
        paint: {
            'color-relief-opacity': 0.42,
            'color-relief-color': [
                'interpolate', ['linear'], ['elevation'],
                0, 'rgba(214, 226, 196, 0)',
                80, '#d8e3b8',
                250, '#e6dcb0',
                600, '#ddc48a',
                1100, '#c9a56c',
                1700, '#b88a58',
                2400, '#a0704c'
            ]
        }
    }, firstLabelLayerId());

    map.addLayer({
        id: 'hillshade',
        type: 'hillshade',
        source: 'terrain',
        paint: {
            'hillshade-exaggeration': 0.55,
            'hillshade-illumination-direction': 315,
            'hillshade-shadow-color': '#6b4a32',
            'hillshade-highlight-color': '#fff3dc',
            'hillshade-accent-color': '#8a6844'
        }
    }, firstLabelLayerId());

    var zoneFeatures = zones.map(function (zone) {
        var ring = zone.coords.map(lngLat);
        ring.push(ring[0]);

        return {
            type: 'Feature',
            properties: { name: zone.name },
            geometry: {
                type: 'Polygon',
                coordinates: [ring]
            }
        };
    });

    map.addSource('zones', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: zoneFeatures
        }
    });

    map.addLayer({
        id: 'zones-fill',
        type: 'fill',
        source: 'zones',
        paint: {
            'fill-color': '#cc0000',
            'fill-opacity': 0
        }
    });

    map.addLayer({
        id: 'zones-line',
        type: 'line',
        source: 'zones',
        paint: {
            'line-color': '#cc0000',
            'line-width': 2
        }
    });

    map.on('click', 'zones-fill', function (e) {
        showPopup(e.lngLat, '<b>' + e.features[0].properties.name + '</b>');
    });

    map.on('mouseenter', 'zones-fill', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'zones-fill', function () {
        map.getCanvas().style.cursor = '';
    });
});

events.forEach(function (e) {
    var className = e.type === 'battle' ? 'marker-battle' : 'marker-event';
    var html = '<b>' + e.title + '</b><br><br>' + e.text;

    if (e.type === 'battle') {
        var battle = document.createElement('div');
        battle.className = className;
        battle.textContent = '✖';
        battle.addEventListener('click', function (evt) {
            evt.stopPropagation();
            showPopup(lngLat(e.coords), html);
        });
        new maplibregl.Marker({ element: battle, anchor: 'center' })
            .setLngLat(lngLat(e.coords))
            .addTo(map);
    } else {
        addMarker(e.coords, className, html);
    }
});

headquarters.forEach(function (hq) {
    addMarker(hq.coords, 'marker-hq', '<b>' + hq.name + '</b><br>' + hq.text);
});

var formationClass = {
    division: 'marker-division',
    brigade: 'marker-brigade',
    independent: 'marker-independent',
    battalion: 'marker-battalion',
    staff: 'marker-staff'
};

formations.forEach(function (f) {
    addMarker(f.coords, formationClass[f.type], '<b>' + f.name + '</b>');
});
