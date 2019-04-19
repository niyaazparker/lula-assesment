const CLIENT_ID = 'b256a0d2-54b8-4a1e-ac41-df8857b3cdb5';
const CLIENT_SECRET = 'bpV+92nlQB0o8VAfCq7dUiq9QfO/6bcl/GM7OXNsSig=';
const payload = {
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  grant_type: 'client_credentials'
};

let platform = new H.service.Platform({
  'app_id': 'pk74mejymjjlsBxnB118',
  'app_code': 'd-oNL1daD4bNceIgT6h9yw'
});

document.getElementById("journey").addEventListener("click", function(){

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

        document.getElementById("details").innerHTML = 
        '<p>' + agencyResponse[0].name + '<br>' +
        '<p>' + agencyResponse[0].agency.name + '<br>' +
        '</p>';

    });
    agencyRequest.open('GET', 'https://platform.whereismytransport.com/api/stops?agencies=CVVPBFb_v0KzC6cFAJGOkw', true);
    agencyRequest.setRequestHeader('Accept', 'application/json');  
    agencyRequest.setRequestHeader('Authorization', 'Bearer ' + token);
    agencyRequest.send();


    //POST below
    let routeRequest = new XMLHttpRequest();
    routeRequest.addEventListener('load', function() {
        let routeResponse = JSON.parse(this.responseText);

        console.log(routeResponse.itineraries[0].legs[0].geometry.coordinates);
        
        let coordinateString = '';

        for(let i = 0; i < routeResponse.itineraries[0].legs.length; i++) {
            let coordinates = routeResponse.itineraries[0].legs[i].geometry.coordinates;
            for(let x = 0; x < coordinates.length; x++) {
                coordinateString += JSON.stringify(coordinates[x][1]) + ',' + JSON.stringify(coordinates[x][0]) + ',';
            }
        }

        document.getElementById('basic-maps-image').src = 'https://image.maps.api.here.com/mia/1.6/route?app_id=pk74mejymjjlsBxnB118&app_code=d-oNL1daD4bNceIgT6h9yw&r0='+coordinateString;
    });

    // json body example to return the journey from
    // wheres my transport
    // this will return the data required to build the route that I ask here for an image
    let journey = {
        "geometry": {
            "type": "MultiPoint",
            "coordinates": [
                [
                    18.37755,
                    -33.94393
                ],
                [
                    18.41489,
                    -33.91252
                ]
            ]
        },
        "maxItineraries": 1
    };

    routeRequest.open('POST', 'https://platform.whereismytransport.com/api/journeys', true);
    routeRequest.setRequestHeader('Content-type', 'application/json');
    routeRequest.setRequestHeader('Accept', 'application/json');  
    routeRequest.setRequestHeader('Authorization', 'Bearer ' + token);
    routeRequest.send(JSON.stringify(journey));
    // https://platform.whereismytransport.com/api/journeys


  });

  authRequest.setRequestHeader('Accept', 'application/json');
  let formData = new FormData();

  for (let key in payload) {
    formData.append(key, payload[key]);
  }

  authRequest.send(formData);

});

function buildMap(lat, long) {


  // Obtain the default map types from the platform object:
  let defaultLayers = platform.createDefaultLayers();

  // Instantiate (and display) a map object:
  let map = new H.Map(
    document.getElementById('map'),
    defaultLayers.normal.map,
    {
      zoom: 15,
      center: { lat:lat, lng:long }
    });

  let marker = new H.map.Marker({lat:lat, lng:long});
  map.addObject(marker);
}

function getJourney() {
  //empty for now
}