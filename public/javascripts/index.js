var map;
var markers = [];
var infoWindows = [];
var openWindow;
var startLocation;
var endLocation;
var directionsService;
var directionsDisplay1, directionsDisplay2, directionsDisplay3;
var stationsVisible = true;

function initialize() {
  map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 16,
    styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }]},
             { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }]}],
    disableDefaultUI: true});

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geo_success, geo_error, geo_options);
  } else {
    alert("HTML5 location failed");
    geo_error();
  }

  endLocation = new google.maps.Marker();

  for (var index = 0; index < data.stationBeanList.length; ++index) {
    var curStation = data.stationBeanList[index];

    markers[index] = new google.maps.Marker({
      position: {lat: curStation.latitude, lng: curStation.longitude},
      map: map,
      icon: '/images/cycling.png',
      title: curStation.stationName
    });

    infoWindows[index] = new google.maps.InfoWindow({
      content: "<h3>" + curStation.stationName + "</h3>" +
               "<p><b>Available Bikes:</b> " + curStation.availableBikes + "</p>" +
               "<p><b>Available Docks:</b> " + curStation.availableDocks + "</p>"
    });

    google.maps.event.addListener(markers[index], 'click', function(key) {
      return function(){
        if (openWindow) {
          openWindow.close();
        }
        infoWindows[key].open(map, markers[key]);
        openWindow = infoWindows[key];
      };
    }(index));
  }

  var start_input = (document.getElementById('start-input'));
  google.maps.event.addListener(map, 'click', function(e) {
    if (openWindow) {
      openWindow.close();
    }
    if (startLocation) {
      startLocation.setMap(null);
    }

    startLocation = new google.maps.Marker({position: e.latLng, map: map});
    map.panTo(startLocation.getPosition());
  });

  var end_input = (document.getElementById('end-input'));
  var get_directions  = (document.getElementById('get-directions'));
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(start_input);
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(end_input);
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(get_directions);
  map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(document.getElementById('panel'));
  var autocomplete_start = new google.maps.places.Autocomplete(start_input);
  autocomplete_start.bindTo('bounds', map);
  var autocomplete_end = new google.maps.places.Autocomplete(end_input);
  autocomplete_end.bindTo('bounds', map);

  google.maps.event.addListener(autocomplete_start, 'place_changed', function() {
    startLocation.setPosition(autocomplete_start.getPlace().geometry.location);
    startLocation.setIcon('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=A|FE6256|000000');
  });
  google.maps.event.addListener(autocomplete_end, 'place_changed', function() {
    endLocation.setPosition(autocomplete_end.getPlace().geometry.location);
    endLocation.setIcon('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=B|FE6256|000000');
    endLocation.setMap(map);
  });

  directionsService = new google.maps.DirectionsService();
  directionsDisplay1 = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: true,
    preserveViewport: true,
    polylineOptions: {
      strokeOpacity: 0,
      icons: [{
        icon: lineSymbol,
        offset: '0',
        repeat: '20px'
      }]}
  });
  directionsDisplay2 = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: true,
    preserveViewport: true,
    suppressBicyclingLayer: true
  });
  directionsDisplay3 = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: true,
    preserveViewport: true,
    polylineOptions: {
      strokeOpacity: 0,
      icons: [{
        icon: lineSymbol,
        offset: '0',
        repeat: '20px'
      }]}
  });
}

function geo_success(position) {
  var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  map.setCenter(pos);
  startLocation = new google.maps.Marker({position: pos, map: map});
}

function geo_error(err) {
  // set the location to Chicago
  console.warn('ERROR(' + err.code + '): ' + err.message);
  map.setCenter({lat: 41.88, lng: -87.62});
  map.setZoom(14);
}

var geo_options = {
  enableHighAccuracy: true,
  maximumAge        : Infinity
};

var lineSymbol = {
  path: 'M 0,-1 0,1',
  strokeOpacity: 1,
  scale: 4
};

function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function toggleStations() {
  if(stationsVisible) {
    setAllMap(null);
  } else {
  setAllMap(map);
  }
  stationsVisible = !stationsVisible;
}

function findNearestStation(position, start) {
  var closestStation;
  var shortestDistance;
  var limitingFactor;
  for (var i = 0; i < data.stationBeanList.length; ++i) {
    var curStation = data.stationBeanList[i];
    if (start) {
      limitingFactor = curStation.availableBikes;
    } else {
      limitingFactor = curStation.availableDocks;
    }
    if (limitingFactor > 0) {
      var dist = google.maps.geometry.spherical.computeDistanceBetween(position, markers[i].getPosition());
      if (closestStation == null || dist < shortestDistance) {
        closestStation = i;
        shortestDistance = dist;
      }
    }
  }
  return markers[closestStation].getPosition();
  // if(openWindow) {
  //   openWindow.close()
  // }
  // infoWindows[closestStation].open(map, markers[closestStation]);
  // openWindow = infoWindows[closestStation];
}

function getDirections() {
  var startPosition = startLocation.getPosition();
  console.log(startPosition);
  var endPosition = endLocation.getPosition();
  console.log(endPosition);
  var startStation = findNearestStation(startPosition, true);
  console.log(startStation);
  var endStation = findNearestStation(endPosition, false);
  console.log(endStation);
  startLocation.setIcon('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=1|FE6256|000000');
  endLocation.setIcon('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=4|FE6256|000000');
  var startStationMarker = new google.maps.Marker({
    position: startStation,
    map: map,
    icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=2|FE6256|000000'
  });
  var endStationMarker = new google.maps.Marker({
    position: endStation,
    map: map,
    icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=3|FE6256|000000'
  });

  var request1 = {
    origin: startPosition,
    destination: startStation,
    travelMode: google.maps.TravelMode.WALKING
  };
  directionsService.route(request1, function(result, status) {
    if(status == google.maps.DirectionsStatus.OK) {
      directionsDisplay1.setDirections(result);
    }
  });

  var request2 = {
    origin: startStation,
    destination: endStation,
    travelMode: google.maps.TravelMode.BICYCLING
  };
  directionsService.route(request2, function(result, status) {
    if(status == google.maps.DirectionsStatus.OK) {
      directionsDisplay2.setDirections(result);
    }
  });

  var request3 = {
    origin: endStation,
    destination: endPosition,
    travelMode: google.maps.TravelMode.WALKING
  };
  directionsService.route(request3, function(result, status) {
    if(status == google.maps.DirectionsStatus.OK) {
      directionsDisplay3.setDirections(result);
    }
  });
}


google.maps.event.addDomListener(window, 'load', initialize);
