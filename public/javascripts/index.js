var map;
var markers = [];
var infoWindows = [];
var openWindow;
var startLocation;
var stationsVisible = true;

function initialize() {
  map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 16 });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geo_success, geo_error, geo_options);
  } else {
    alert("HTML5 location failed");
    geo_error();
  }

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

function findNearestStation(position) {
  var closestStation;
  var shortestDistance;
  for (var i = 0; i < data.stationBeanList.length; ++i) {
    var curStation = data.stationBeanList[i];
    if (curStation.availableBikes > 0) {
      var dist = google.maps.geometry.spherical.computeDistanceBetween(position, markers[i].getPosition());
      if (closestStation == null || dist < shortestDistance) {
        closestStation = i;
        shortestDistance = dist;
      }
    }
  }
  if(openWindow) {
    openWindow.close()
  }
  infoWindows[closestStation].open(map, markers[closestStation]);
  openWindow = infoWindows[closestStation];
}


google.maps.event.addDomListener(window, 'load', initialize);