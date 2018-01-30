var map;

function initMap() {
    var center;
    var geocoder =  new google.maps.Geocoder();

    var input_origin = document.getElementById('searchBox_origin');
    var input_dest = document.getElementById('searchBox_dest');
    var travel_mode = document.getElementById('travel_mode');
    var card = document.getElementById('low-panel');
    var dir_Btn = document.getElementById('dir_Btn');
    var map = document.getElementById('map');

    geocoder.geocode( { 'address': 'Pinkas St 1, Tel Aviv-Yafo'}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {

            center =  results[0].geometry.location;

            map = new google.maps.Map(map, {
                center: {lat: center.lat(), lng: center.lng()},
                zoom:17
            });

            google.maps.event.addListenerOnce(map, 'idle', function(){
                input_origin.classList.remove('hide');
                dir_Btn.classList.remove('hide');
            });

            var marker = new google.maps.Marker({
                position: {lat: center.lat(), lng: center.lng()},
                map: map,
                title: 'walla',
                animation: google.maps.Animation.DROP,
                icon: {
                    url: 'http://is2.mzstatic.com/image/thumb/Purple128/v4/60/42/d6/6042d606-d88d-051f-9d6d-0af970b531ea/source/256x256bb.jpg',
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                }
            });

            // Create the search box and link it to the UI element. var input_origin = document.getElementById('searchBox_origin');
            map.controls[google.maps.ControlPosition.TOP_CENTER].push(dir_Btn);

            var searchBox1 = new google.maps.places.SearchBox(input_origin);
            map.controls[google.maps.ControlPosition.TOP_CENTER].push(input_origin);

            var searchBox2 = new google.maps.places.SearchBox(input_dest);
            map.controls[google.maps.ControlPosition.TOP_CENTER].push(input_dest);

            map.controls[google.maps.ControlPosition.TOP_CENTER].push(travel_mode);
            map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(card);

            /*markers*/
            var markers = [];
            searchBox1.addListener('places_changed', function() {

                var places = searchBox1.getPlaces();

                if (places.length == 0) {
                    return;
                }

                // Clear out the old markers.
                markers.forEach(function(marker) {
                    marker.setMap(null);
                });
                markers = [];

                // For each place, get the icon, name and location.
                var bounds = new google.maps.LatLngBounds();
                places.forEach(function(place) {
                    if (!place.geometry) {
                        console.log("Returned place contains no geometry");
                        return;
                    }
                    var icon = {
                        url: place.icon,
                        size: new google.maps.Size(71, 71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(25, 25)
                    };

                    // Create a marker for each place.
                    markers.push(new google.maps.Marker({
                        map: map,
                        icon: icon,
                        title: place.name,
                        position: place.geometry.location
                    }));

                    if (place.geometry.viewport) {
                        // Only geocodes have viewport.
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                });
                map.fitBounds(bounds);
            });

            /*directions*/
            var directionsService = new google.maps.DirectionsService;
            var directionsDisplay = new google.maps.DirectionsRenderer;
            directionsDisplay.setMap(map);
            directionsDisplay.setPanel(document.getElementById('right-panel'));

            /*events handlers*/
            var onChangeHandler = function() {
                if(input_origin.value && input_dest.value){
                    calculateAndDisplayRoute(directionsService, directionsDisplay , input_origin.value ,  input_dest.value , travel_mode.value);
                }
            };
            var onClickHandler = function(){
                input_dest.classList.remove('hide');
                travel_mode.classList.remove('hide');
                dir_Btn.classList.add('hide');
            }

            searchBox1.addListener('places_changed', onChangeHandler);
            searchBox2.addListener('places_changed', onChangeHandler);
            travel_mode.addEventListener('change', onChangeHandler);
            dir_Btn.addEventListener('click' , onClickHandler);

        } else {
            alert("Something got wrong " + status);
        }
    });


}

function calculateAndDisplayRoute(directionsService, directionsDisplay , start , end , selectedMode) {
    directionsService.route({
        origin:start,
        destination: end,
        travelMode: selectedMode
    }, function(response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
            document.getElementById('right-panel').classList.remove('hide-right-panel');
            document.getElementById('right-panel').classList.add('show-right-panel');
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

