var locModel = new model();

var googleMap = '<div id="map"></div>';

var map;

$(document).ready(function () {
    setLocations();
    ko.applyBindings(locModel);
    initializeMap(places);
});

// listen for resizing of the window and adjust map bounds
window.addEventListener('resize', function(e) {
	map.fitBounds(window.mapBounds);
});

// display Google maps
$("mapDiv").append(googleMap);
