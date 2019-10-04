(function ($, Drupal, drupalSettings) {

    'use strict';

        
    var map;
    var terminalsInfo = $.getJSON("/modules/custom/map_filter/js/site.json", function() {});
    var mapstyleInfo = $.getJSON("/modules/custom/map_filter/js/mapstyled.json", function() {});

    var markers = [];
    var Circle;
    var CurLatLng;
    var markerCur;
    var StatusInput = [{"enabled":'', "buy":'', "sell":'', "search":''}];
    var Radius = 33000;
    var iconsPNG = {'buy':'/modules/custom/map_filter/js/icons/buy.png', 'sell':'/modules/custom/map_filter/js/icons/sell.png', 'closed':'/modules/custom/map_filter/js/icons/closed.png', 'my_position':'/modules/custom/map_filter/js/icons/my_position.png'};
    var markerCluster;  

    
    function initMap() {
        /**
        * Vars
        */
        var styledMapType = new google.maps.StyledMapType(
            [
              {
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#f5f5f5"
                  }
                ]
              },
              {
                "elementType": "labels.icon",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "elementType": "labels.text.fill",
                "stylers": [
                  {
                    "color": "#616161"
                  }
                ]
              },
              {
                "elementType": "labels.text.stroke",
                "stylers": [
                  {
                    "color": "#f5f5f5"
                  }
                ]
              },
              {
                "featureType": "administrative.land_parcel",
                "elementType": "labels",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [
                  {
                    "color": "#bdbdbd"
                  }
                ]
              },
              {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#eeeeee"
                  }
                ]
              },
              {
                "featureType": "poi",
                "elementType": "labels.text",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [
                  {
                    "color": "#757575"
                  }
                ]
              },
              {
                "featureType": "poi.business",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#e5e5e5"
                  }
                ]
              },
              {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [
                  {
                    "color": "#9e9e9e"
                  }
                ]
              },
              {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#ffffff"
                  }
                ]
              },
              {
                "featureType": "road",
                "elementType": "labels.icon",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "featureType": "road.arterial",
                "elementType": "labels.text.fill",
                "stylers": [
                  {
                    "color": "#757575"
                  }
                ]
              },
              {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#dadada"
                  }
                ]
              },
              {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [
                  {
                    "color": "#616161"
                  }
                ]
              },
              {
                "featureType": "road.local",
                "elementType": "labels",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "featureType": "road.local",
                "elementType": "labels.text.fill",
                "stylers": [
                  {
                    "color": "#9e9e9e"
                  }
                ]
              },
              {
                "featureType": "transit",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "featureType": "transit.line",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#e5e5e5"
                  }
                ]
              },
              {
                "featureType": "transit.station",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#eeeeee"
                  }
                ]
              },
              {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#45B9E8"
                  }
                ]
              },
              {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [
                  {
                    "color": "#9e9e9e"
                  }
                ]
              }
            ],
            {name: 'Styled Map'}
        );  
        var myPosition = {};

        /**
        * Functions
        */
        function DeleteAllMarkers() {
            markerCluster.removeMarkers(markers);
            for (var i = 0; i < markers.length; i++) {
              markers[i].setMap(null);
            }
            markers = [];
        }
        function addMarkerItemHtml(terminal){
            var support = '';

            try{
              if (terminal.tiered_prices.bitcoin.aggregate.buy.weighted_price !== undefined){
                  support += 'buy ';
              }
            }
            catch(e){
            }

            try{
              if (terminal.tiered_prices.bitcoin.aggregate.sell.weighted_price !== undefined){
                  support += 'sell ';
              }
            }
            catch(e){
            }
            try{
              var tempPrice = terminal.tiered_prices.bitcoin.aggregate.buy.weighted_price;
            }
            catch(e){
              var tempPrice = 'Unknown';
            }
            try{
              var tempPriceMin = terminal.tiered_prices.bitcoin.aggregate.buy.min_price;
            }
            catch(e){
              var tempPriceMin = 'Unknown';
            }
            try{
              var tempPriceMax = terminal.tiered_prices.bitcoin.aggregate.buy.max_price;
            }
            catch(e){
              var tempPriceMax = 'Unknown';
            }
            var Html = '<div class="popUpMap">'+
                '<div class="popUpMap__row"><span class="popUpMap__label">Location</span><div class="popUpMap__value">'+terminal.name+'</div></div>'+
                '<div class="popUpMap__row"><span class="popUpMap__label">Address</span><div class="popUpMap__value">'+terminal.location.street+'</div></div>'+
                '<div class="popUpMap__row -end-group"><span class="popUpMap__label">Supported operations</span><div class="popUpMap__value -highlighted">'+support+'</div></div>'+
                '<div class="popUpMap__row"><span class="popUpMap__label">UP TO $1500</span><div class="popUpMap__value -highlighted"><span class="-grey">1 BTC = </span>'+tempPriceMax+' <span class="popUpMap__currency">USD</span></div></div>'+
                '<div class="popUpMap__row"><span class="popUpMap__label">UP TO $2500</span><div class="popUpMap__value -highlighted"><span class="-grey">1 BTC = </span>'+tempPrice+' <span class="popUpMap__currency">USD</span></div></div>'+
                '<div class="popUpMap__row"><span class="popUpMap__label">FROM $2500</span><div class="popUpMap__value -highlighted"><span class="-grey">1 BTC = </span>'+tempPriceMin+' <span class="popUpMap__currency">USD</span></div></div>'+
            '</div>';
            return Html;
        }
        function statusTerminal(terminal){
            var status;
            var enabled = terminal.is_enabled;
            try{
              var buy = terminal.tiered_prices.bitcoin.aggregate.buy.weighted_price;
            }
            catch(e){
              var buy = undefined;
            }
            try{
              var sell = terminal.tiered_prices.bitcoin.aggregate.sell.weighted_price;
            }
            catch(e){
              var sell = undefined;
            }
            if (enabled === "true" && buy !== undefined && sell !== undefined) {
                status = 'sell';
            } else if (enabled === "true" && buy !== undefined){
                status = "buy";
            } else if (enabled !== "true") {
                status = "close";
            }
            return status;        
        }
        function PostalCode(address){
            address = address.replace(/, /g, ',');
            var AddressArr = address.split(',');
            if (AddressArr[2]){
                var PostCode = AddressArr[2].split(' ');
                return PostCode[1];
            }
        }   
        function MarkersAll() {
            //DeleteAllMarkers(null);
            var prev_infowindow = false; 

            terminalsInfo.done(function (terminals) {
                // Create markers.
                terminals.forEach(function(terminal) {
                    var status = statusTerminal(terminal);
                    var infowindow = new google.maps.InfoWindow({
                        pixelOffset: new google.maps.Size(0,50),
                        content: addMarkerItemHtml(terminal)
                    });
                    var markerIcon = {
                          url: iconsPNG[status],
                          anchor: new google.maps.Point(65, 66)
                    };  
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(terminal.location.latitude, terminal.location.longitude),
                        icon: markerIcon,
                        map: map,
                    });
                    markers.push(marker);
                    marker.addListener('click', function() {
                        // i dont know why it's working
                        if( prev_infowindow ) {
                           prev_infowindow.close();
                        }
                        prev_infowindow = infowindow;
                        infowindow.open(map, marker);
                        map.setCenter(marker.getPosition());
                        
                    });
                });
              markerCluster = new MarkerClusterer(map, markers,{imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});        
            });   
        }
        function MarkersFilter(){
            DeleteAllMarkers(null);
            var prev_infowindow = false; 

            var PostCodeUser = $('#postcode').val();
            $('#filter input[type="checkbox"]').each(function () {
                var name = $(this).attr('name');
                var val = $(this).prop('checked');
                if (val === true){
                    switch (name) {
                        case "enabled":
                            StatusInput[name] = "false"
                            break;
                        case 'buy':
                            StatusInput[name] = undefined;
                            break;
                        case 'sell':
                            StatusInput[name] = undefined;
                            break;
                        case 'nears':
                            StatusInput['search'] = name;
                            break;
                    }
                } else {
                    if (name !== 'nears'){
                        StatusInput[name] = "";
                    } else {
                        StatusInput['search'] = '';
                    }
                }

            });
            if (PostCodeUser !== ''){
                StatusInput['search'] = 'postcode'
            } else if (PostCodeUser === '' && $('#nears').prop('checked') === false) {
                StatusInput['search'] = '';
            }
            terminalsInfo.done(function (terminals) {
                // Create markers.
                terminals.forEach(function(terminal) {
                    var PosLatLng = new google.maps.LatLng(terminal.location.latitude, terminal.location.longitude);
                    try{
                      var buy = terminal.tiered_prices.bitcoin.aggregate.buy.weighted_price;
                    }
                    catch(e){
                      var buy = undefined;
                    }
                    var EnabledTerm = terminal.is_enabled;
                    try{
                      var Sell = terminal.tiered_prices.bitcoin.aggregate.sell.weighted_price;
                    }
                    catch(e){
                      var Sell = undefined;
                    }
                    var PostalCodeAddress = PostalCode(terminal.location.street)
                    if (CurLatLng !== undefined){
                        var Distance = google.maps.geometry.spherical.computeDistanceBetween(CurLatLng, PosLatLng);                 
                    }
                    //var Distance = google.maps.geometry.spherical.computeDistanceBetween(CurLatLng, PosLatLng);
                    if (buy !== StatusInput.buy && EnabledTerm !== StatusInput.enabled && Sell !== StatusInput.sell){
                        if (StatusInput.search === 'postcode' && PostalCodeAddress === PostCodeUser || StatusInput.search === 'nears' && Distance <= Radius || StatusInput.search === ''){
                            var status = statusTerminal(terminal);
                            var infowindow = new google.maps.InfoWindow({
                                content: addMarkerItemHtml(terminal)
                            });
                            var markerIcon = {
                                  url: iconsPNG[status],
                                  anchor: new google.maps.Point(65, 66)
                            };  
                            var marker = new google.maps.Marker({
                                position: PosLatLng,
                                icon: markerIcon,
                                map: map,
                            });
                            markers.push(marker);
                            marker.addListener('click', function() {
                                // i dont know why it's working
                                if( prev_infowindow ) {
                                   prev_infowindow.close();
                                }
                                prev_infowindow = infowindow;
                                infowindow.open(map, marker);
                                map.setCenter(marker.getPosition());
                            });
                            if (StatusInput.search === 'postcode'){
                                map.setCenter(PosLatLng);
                                map.setZoom(12);
                            }
                        }
    
                    }
                });
            });
            markerCluster = new MarkerClusterer(map, markers,{imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});        
        }

        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 4,
            center: new google.maps.LatLng(26.097643999999999, -80.201627000000002),
            mapTypeId: 'styled_map',
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false
        });
        map.mapTypes.set('styled_map', styledMapType);
        var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';

        MarkersAll();
        /**
        * Events
        */
        $('input').change(function () {
            var name = $(this).attr('name');
            if (name === "nears" && navigator.geolocation){ 
                if ($(this).prop('checked') === true){
                    $('#postcode').val('');
                    navigator.geolocation.getCurrentPosition(function(position) {
                        myPosition = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        var myIcon = {
                          url: iconsPNG['my_position'],
                          anchor: new google.maps.Point(65, 66)
                        };
                        var MyCurrentPos = new google.maps.LatLng(myPosition.lat, myPosition.lng)
                        markerCur = new google.maps.Marker({
                            position: MyCurrentPos,
                            icon: myIcon,
                            map: map,
                        });
                        CurLatLng = MyCurrentPos;                   
                        map.setCenter(MyCurrentPos);
                        map.setZoom(11);
                        Circle = new google.maps.Circle({
                            strokeColor: '#666666',
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: '#ABABAB',
                            fillOpacity: 0.35,
                            map: map,
                            center: CurLatLng,
                            radius: Radius
                        });                 
                    });
                } else {
                    if (Circle){
                        Circle.setMap(null);
                    }
                    try{
                      markerCur.setMap(null);
                    }
                    catch(e){}
                }   
    
            }
            MarkersFilter();
        });
        $('#search').click(function () {
            $('#nears').prop('checked', true);
            $('#nears').click();
            MarkersFilter();
            $(mobileFilterButton).click();
        });
        $('#test').click(function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    myPosition = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    var MyCurrentPos = new google.maps.LatLng(myPosition.lat, myPosition.lng)
                    MarkersNear(MyCurrentPos);
                    var marker = new google.maps.Marker({
                        position: MyCurrentPos,
                        //icon: icons[feature.type].icon,
                        map: map,
                    });
                    CurLatLng = MyCurrentPos
                    map.setCenter(MyCurrentPos);
                    map.setZoom(11);
                });
            }       
        });    
    }
 
    $(document).ready(function () {
        initMap();        
    });
    
    var mobileFilterButton = '.mapFilter__mobileButton';
    var mobileFilterContent = '.mapFilter__content';
    
    $(mobileFilterButton).click(function(){
      $(this).toggleClass('active');
      $(mobileFilterContent).toggleClass('active');
    })
    $('#nears').click(function(){
        $(mobileFilterButton).click();
    });
    $('#postcode').keypress(function(e) {
      if(e.which == 13) {
        $(mobileFilterButton).click();
      }
    });
    $('#postcode').keyup(function(e) {
      if ($('#nears').prop('checked') === true){
        $('.slideCheckbox__label[for="nears"]').click();
        $(this).focus();
      }
    });
    $('#search').click(function(){
        $(mobileFilterButton).click();
    });

})(jQuery, Drupal, drupalSettings);
