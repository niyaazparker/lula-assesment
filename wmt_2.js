const CLIENT_ID = 'b256a0d2-54b8-4a1e-ac41-df8857b3cdb5';
const CLIENT_SECRET = 'bpV+92nlQB0o8VAfCq7dUiq9QfO/6bcl/GM7OXNsSig=';
const payload = {
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  grant_type: 'client_credentials'
};

let platform = new H.service.Platform({
  'app_id': 'FvX9oFvVIdpOTeuPdNrQ',
  'app_code': '6tb3xMl4THevlK8JIDzCrQ'
});



// create a client here: https://developer.whereismytransport.com/clients

  let authRequest = new XMLHttpRequest();
  authRequest.open('POST', 'https://identity.whereismytransport.com/connect/token', true);
  authRequest.addEventListener('load', function () {

    let authResponse = JSON.parse(this.responseText);
    let token = authResponse.access_token;

    //making the agency API call here
    //within the eventListener, because then you know the POST succeeded
    //so you have the access token to be able to make the GET request

    let agencyRequest = new XMLHttpRequest();
    agencyRequest.addEventListener('load', function () {
        let agencyResponse = JSON.parse(this.responseText);

        let coordinates = agencyResponse[0].geometry.coordinates;

        buildMap(coordinates[1], coordinates[0]);

        console.log(agencyResponse[0]);

       

    });
    agencyRequest.open('GET', 'https://platform.whereismytransport.com/api/stops?agencies=CVVPBFb_v0KzC6cFAJGOkw', true);
    agencyRequest.setRequestHeader('Accept', 'application/json');  
    agencyRequest.setRequestHeader('Authorization', 'Bearer ' + token);
    agencyRequest.send();

  });

  authRequest.setRequestHeader('Accept', 'application/json');
  let formData = new FormData();

  for (let key in payload) {
    formData.append(key, payload[key]);
  }

  authRequest.send(formData);



function buildMap(lat, long) {

  // Retrieve the target element for the map:
  var targetElement = document.getElementById('map');

  // Obtain the default map types from the platform object:
  let defaultLayers = platform.createDefaultLayers();

  // Instantiate (and display) a map object:
  let map = new H.Map(
    document.getElementById('map'),
    defaultLayers.normal.map,
    {
      zoom: 50,
      center: { lat: 9.51, lng: 13.4  }
    });

 // Create the parameters for the routing request:
var routingParameters = {
  // The routing mode:
  'mode': 'fastest;car',
  // The start point of the route:
  'waypoint0': 'geo!9.1020,6.68340740740811',
  // The end point of the route:
  'waypoint1': 'geo!13.5309916298853,10.3846220493377',
  // To retrieve the shape of the route we choose the route
  // representation mode 'display'
  'representation': 'display'
};

// Define a callback function to process the routing response:
var onResult = function(result) {
  var route,
    routeShape,
    startPoint,
    endPoint,
    linestring;
  if(result.response.route) {
  // Pick the first route from the response:
  route = result.response.route[0];
  // Pick the route's shape:
  routeShape = route.shape;

  // Create a linestring to use as a point source for the route line
  linestring = new H.geo.LineString();

  // Push all the points in the shape into the linestring:
  routeShape.forEach(function(point) {
    var parts = point.split(',');
    linestring.pushLatLngAlt(parts[0], parts[1]);
  });

  // Retrieve the mapped positions of the requested waypoints:
  startPoint = route.waypoint[0].mappedPosition;
  endPoint = route.waypoint[1].mappedPosition;

  // Create a polyline to display the route:
  var routeLine = new H.map.Polyline(linestring, {
    style: { strokeColor: 'blue', lineWidth: 10 }
  });

  // Create a marker for the start point:
  var startMarker = new H.map.Marker({
    lat: startPoint.latitude,
    lng: startPoint.longitude
  });

  // Create a marker for the end point:
  var endMarker = new H.map.Marker({
    lat: endPoint.latitude,
    lng: endPoint.longitude
  });

  // Add the route polyline and the two markers to the map:
  map.addObjects([routeLine, startMarker, endMarker]);

  // Set the map's viewport to make the whole route visible:
  map.setViewBounds(routeLine.getBounds());
  }
};

// Get an instance of the routing service:
var router = platform.getRoutingService();

// Call calculateRoute() with the routing parameters,
// the callback and an error callback function (called if a
// communication error occurs):
router.calculateRoute(routingParameters, onResult,
  function(error) {
    alert(error.message);
  });

}


