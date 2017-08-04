var places = [["Minneapolis", "MN", "USA"], ["New York", "NY", "USA"], ["San Francisco", "CA", "USA"], ["Los Angeles", "CA", "USA"], ["Indianapolis", "IN", "USA"], ["Dallas", "TX", "USA"]];

function mapLoc(city, state, country) {
    this.city = ko.observable(city);
    this.state = ko.observable(state);
    this.country = ko.observable(country);
}

function model() {
    var self = this;
    self.mapLocs = ko.observableArray("");
    self.query = ko.observable("");
    self.filtered = ko.computed(function () {
        var filter = self.query().toLowerCase();

        if (!filter) {
			initializeMap(places);
			
            return self.mapLocs();
        } else {
            var temp = ko.utils.arrayFilter(self.mapLocs(), function (item) {
                return item.city().toLowerCase().indexOf(filter) !== -1;
            });
            
            var mapResults = [];
            
            for (var i = 0; i < temp.length; ++i) {
				console.log(temp[i].city() + ", " + temp[i].state());
				mapResults.push([temp[i].city(), temp[i].state(), temp[i].country()]);
			}
			
			initializeMap(mapResults);
            
            return temp;
        }
    });
}

function setLocations() {
	for (var i = 0; i < places.length; ++i) {
		locModel.mapLocs.push(new mapLoc(places[i][0], places[i][1], places[i][2]));
	}
}

function initializeMap(locationList) {
  var locations;
  var mapOptions = {disableDefaultUI: true};

  /*
  For the map to be displayed, the googleMap var must be
  appended to #mapDiv in resumeBuilder.js.
  */
  map = new google.maps.Map(document.querySelector('#mapDiv'), mapOptions);

  /*
  locationFinder() returns an array of every location string from the JSONs
  written for bio, education, and work.
  */
  function locationFinder() {
	  
    var locations = [];
  
    locationList.forEach(function (place) {
		locations.push(place[0] + ", " + place[1]);
	});

    return locations;
  }

  /*
  createMapMarker(placeData) reads Google Places search results to create map pins.
  placeData is the object returned from search results containing information
  about a single location.
  */
  function createMapMarker(placeData) {

    // The next lines save location data from the search result object to local variables
    var lat = placeData.geometry.location.lat();  // latitude from the place service
    var lon = placeData.geometry.location.lng();  // longitude from the place service
    var name = placeData.formatted_address;   // name of the place from the place service
    var bounds = window.mapBounds;            // current boundaries of the map window

    // marker is an object with additional data about the pin for a single location
    var marker = new google.maps.Marker({
      map: map,
      position: placeData.geometry.location,
      title: name
    });
    
    marker.addListener('click', toggleBounce);
    
      function toggleBounce() {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }
      }

    // infoWindows are the little helper windows that open when you click
    // or hover over a pin on a map. They usually contain more information
    // about a location.
    var infoWindow = new google.maps.InfoWindow({
      content: name
    });

    // hmmmm, I wonder what this is about...
    google.maps.event.addListener(marker, 'click', function() {
      // your code goes here!
      infoWindow.open(map, marker);
    });

    // this is where the pin actually gets added to the map.
    // bounds.extend() takes in a map location object
    bounds.extend(new google.maps.LatLng(lat, lon));
    // fit the map to the new marker
    map.fitBounds(bounds);
    // center the map
    map.setCenter(bounds.getCenter());
  }
  


  /*
  callback(results, status) makes sure the search returned results for a location.
  If so, it creates a new map marker for that location.
  */
  function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      createMapMarker(results[0]);
    }
  }

  /*
  pinPoster(locations) takes in the array of locations created by locationFinder()
  and fires off Google place searches for each location
  */
  function pinPoster(locations) {

    // creates a Google place search service object. PlacesService does the work of
    // actually searching for location data.
    var service = new google.maps.places.PlacesService(map);

    // Iterates through the array of locations, creates a search object for each location
      locations.forEach(function(place){
      // the search request object
      var request = {
        query: place
      };

      // Actually searches the Google Maps API for location data and runs the callback
      // function with the search results after each search.
      service.textSearch(request, callback);
    });
  }

  // Sets the boundaries of the map based on pin locations
  window.mapBounds = new google.maps.LatLngBounds();

  // locations is an array of location strings returned from locationFinder()
  locations = locationFinder();

  // pinPoster(locations) creates pins on the map for each location in
  // the locations array
  pinPoster(locations);

}
