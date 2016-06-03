'use strict';
var myModule = angular.module('app', ['uiGmapgoogle-maps']);
myModule.config(function (uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
});

    myModule.controller('treta', function ($scope, $log, $timeout, $http, uiGmapGoogleMapApi) {

        $scope.markers = '';
        $http.get('poly.json').success(function (data) {
            $scope.rotasall = data;
            generateRequests(data);
            $scope.markers = testando(data);
        });

        $scope.change = function () {
            $scope.markers = reverso($scope.markers);
             generateRequests($scope.markers);
            console.log($scope.markers);
        }

        //
        // if($scope.markers !='' || $scope.markers !=undefined) {
        //     $scope.$watch('markers', function () {
        //         alert('oi');
        //     });
        // }

        function testando (data) {
            var arrayJson =[];

            data.rotas.map(function (i) {
                arrayJson.push({coords:{latitude: i.latitude, longitude: i.longitude}, rota: i.rota, id: i.id,icon:i.icon,texto:i.texto});
            });
            return arrayJson;
        }

        $scope.map = {
            center: {
                latitude: -19.9512792,
                longitude: -43.9472115
            },
            control: {},
            zoom: 12,
            window: {
                model: {},
                show: false,
                options: {
                    pixelOffset: {width: -1, height: -20}
                }
            }

        };

        /*-------------------------------------- WINDOWS VIEW --------------------------------------*/
        $scope.windowOptions = {
            visible: false
        };

        $scope.onClick = function () {
            $scope.windowOptions.visible = !$scope.windowOptions.visible;
        };

        $scope.closeClick = function () {
            $scope.map.window.show = false;
        };
        /*-------------------------------------- WINDOWS VIEW --------------------------------------*/
        function generateRequests(dataJson) {
            var requestArray = [], renderArray = [];
            var directionsService = new google.maps.DirectionsService();
            var colourArray = ['blue', 'Green4', 'Firebrick3', 'DarkOrange', 'fuchsia', 'lime', 'maroon', 'purple', 'red', 'green', 'blue', 'yellow', 'teal', 'red', 'dark'];
            var contentString = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
            var jsonArray = {};

            //----Organiza a rota por nome----
            dataJson.rotas.map(function (i) {
                if (!jsonArray[i.rota]) {
                    jsonArray[i.rota] = [];
                }
                jsonArray[i.rota].push({latitude: i.latitude, longitude: i.longitude, rota: i.rota, id: i.id});
            });
            //----Organiza a rota por nome----

            for (var route in jsonArray) {
                var waypts = [];
                var start, finish;
                var lastpoint;
                var data = jsonArray[route];
                var limit = data.length;

                for (var waypoint = 0; waypoint < limit; waypoint++) {
                    if (data[waypoint] === lastpoint) {
                        // Duplicate of of the last waypoint - don't bother
                        continue;
                    }
                    lastpoint = data[waypoint]
                    waypts.push({
                        location: new window.google.maps.LatLng(data[waypoint].latitude, data[waypoint].longitude),
                        stopover: true
                    });
                }

                start = (waypts.shift()).location;

                finish = waypts.pop();

                if (finish === undefined) {
                    finish = start;
                } else {
                    finish = finish.location;
                }
                // Let's create the Google Maps request object
                var request = {
                    origin: start,
                    destination: finish,
                    waypoints: waypts,
                    optimizeWaypoints: false,
                    provideRouteAlternatives: true,
                    travelMode: google.maps.TravelMode.DRIVING
                };
                // and save it in our requestArray
                requestArray.push({"route": route, "request": request});
            }
            processRequests(directionsService, requestArray, renderArray, colourArray, contentString);
        }

        function processRequests(directionsService, requestArray, renderArray, colourArray, contentString) {
            var i = 0;

            function submitRequest() {
                directionsService.route(requestArray[i].request, directionResults);
            }

            function directionResults(result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    // Create a unique DirectionsRenderer 'i'
                    renderArray[i] = new google.maps.DirectionsRenderer();
                    renderArray[i].setMap($scope.map.control.getGMap());
                    renderArray[i].setOptions({
                        suppressInfoWindows: true,
                        preserveViewport: true,
                        suppressMarkers: true,
                        draggable: true,
                        polylineOptions: {
                            strokeWeight: 3,
                            strokeOpacity: 0.8,
                            strokeColor: colourArray[i]
                        },
                        markerOptions: {
                            title: contentString[i],
                        }
                    });

                    renderArray[i].setDirections(result);
                    nextRequest();
                }
            }

            function nextRequest() {
                i++;
                if (i >= requestArray.length) {
                    return;
                }
                submitRequest();
            }
            submitRequest();
        }

        $scope.reset = function () {
            $http.get('/reset').success(function (data) {
                alert(data);
            });
        }

        $scope.option = {
            "draggable": true,
            "animation": 0,
            "events": {
                click: function (marker, eventName, model, args) {
                   $scope.markerid = marker.key;
                    $scope.map.window.model = model;
                    $scope.map.window.show = true;
                }
            }
        }
    });


