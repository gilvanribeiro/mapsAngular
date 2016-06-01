'use strict';
var myModule = angular.module('app', ['uiGmapgoogle-maps']);
myModule.config(function (uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
});

myModule.controller('treta', function ($scope, $log, $timeout, $http, uiGmapGoogleMapApi,$compile) {
        $scope.nomerota = [];
        $scope.allroute = [];
        $scope.teste = function () {
            alert('DEU MALUCO');
        }
        $http.get('poly.json').success(function (data) {
            generateRequests(data);
            $scope.markers = function (data) {
                var arrayJson =[];
                data.rotas.map(function (i) {
                    arrayJson.push({coords:{latitude: i.latitude, longitude: i.longitude}, rota: i.rota, id: i.id});
                });
                return arrayJson;
            }
        });


        $http.get('/bancodados').success(function (data) {
            $scope.markers = data[0];
            console.log(data[0]);
        });

        // $scope.$watch('rota', function (newValue, oldValue) {
        //     newValue = JSON.stringify(newValue);
        //     console.log(newValue);
        //     if(newValue != oldValue){
        //         $http.get('/salvar/'+newValue).success(function (data) {
        //             console.log(data);
        //         });
        //     }
        // }, true);

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
            var cont =0;
            //----Organiza a rota por nome----
            dataJson.rotas.map(function (i) {
                if (!jsonArray[i.rota]) {
                    jsonArray[i.rota] = [];
                    $scope.nomerota.push({'name':i.rota,'id':cont});
                    cont++;
                }
                jsonArray[i.rota].push({latitude: i.latitude, longitude: i.longitude, rota: i.rota, id: i.id});
            });
            //----Organiza a rota por nome----
            for (var route in jsonArray) {
                // This now deals with one of the people / routes

                // Somewhere to store the wayoints
                var waypts = [];

                // 'start' and 'finish' will be the routes origin and destination
                var start, finish;

                // lastpoint is used to ensure that duplicate waypoints are stripped
                var lastpoint;

                var data = jsonArray[route];
                var limit = data.length;
                for (var waypoint = 0; waypoint < limit; waypoint++) {
                    if (data[waypoint] === lastpoint) {
                        // Duplicate of of the last waypoint - don't bother
                        continue;
                    }

                    // Prepare the lastpoint for the next loop
                    lastpoint = data[waypoint]

                    // Add this to waypoint to the array for making the request
                    waypts.push({
                        location: new window.google.maps.LatLng(data[waypoint].latitude, data[waypoint].longitude),
                        stopover: true
                    });
                }

                // Grab the first waypoint for the 'start' location
                start = (waypts.shift()).location;

                // Grab the last waypoint for use as a 'finish' location
                finish = waypts.pop();

                if (finish === undefined) {
                    // Unless there was no finish location for some reason?
                    finish = start;
                } else {
                    finish = finish.location;
                }

                // Let's create the Google Maps request object
                var request = {
                    origin: start,
                    destination: finish,
                    waypoints: waypts,
                    optimizeWaypoints: true,
                    provideRouteAlternatives: true,
                    travelMode: google.maps.TravelMode.DRIVING
                };
                // and save it in our requestArray
                requestArray.push({"route": route, "request": request});
            }

            processRequests(directionsService, requestArray, renderArray, colourArray, contentString);
        }

        function processRequests(directionsService, requestArray, renderArray, colourArray, contentString) {
            // Counter to track request submission and process one at a time;
            var i = 0;
            // Used to submit the request 'i'
            function submitRequest() {
                directionsService.route(requestArray[i].request, directionResults);
            }

            // Used as callback for the above request for current 'i'
            function directionResults(result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    // Create a unique DirectionsRenderer 'i'
                    renderArray[i] = new google.maps.DirectionsRenderer();
                    renderArray[i].setMap($scope.map.control.getGMap());
                    showSteps(result, renderArray[i].map,i);
                    var image = 'marker/g.png';
                    // Some unique options from the colorArray so we can see the routes
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

                    // Use this new renderer with the result
                    renderArray[i].setDirections(result);
                    // and start the next request
                    nextRequest();
                }
            }

            function nextRequest() {
                // Increase the counter
                i++;
                // Make sure we are still waiting for a request
                if (i >= requestArray.length) {
                    // No more to do
                    return;
                }
                // Submit another request
                submitRequest();
            }

            // This request is just to kick start the whole process
            submitRequest();
        }

        function showSteps(directionResult, map,num) {
            var legs = directionResult.routes[0].legs.length;
            var myRoute = directionResult.routes[0].legs;
            var lastPoint = myRoute[legs - 1].steps.length;

            var content = '<div class="panel-primary">'
                +'<b>{{nomerota['+num+'].name}}</b>'
                +'<div class="panel-body"><input ng-model="g" type="text">{{g}}'
                +'<ol>'
                +'<li style="list-style: none">'
                +'<select  ng-model="x">'
                +'<option ng-repeat="z in nomerota" value="{{z.name}}">{{z.name}}</option>'
                +'</select>'
                +'</li>'
                +'</span>'
                +'</div>'
                +'</div>';

            var compiled = $compile(content)($scope);

            // for (var i = 0; i < legs; i++) {
            //     var icon = "https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=" + i + "|FF0000|000000";
            //     if (i == 0) {
            //         icon = "https://chart.googleapis.com/chart?chst=d_map_xpin_icon&chld=pin_star|car-dealer|00FFFF|FF0000";
            //     }
            //
            //     var marker = new google.maps.Marker({
            //         position: myRoute[i].steps[0].start_point,
            //         map: map,
            //         icon: icon,
            //         clickable: true
            //     });
            //
            //     marker.infowindow = new google.maps.InfoWindow();
            //     // marker.info = new google.maps.InfoWindow({
            //     //     content: '<div class="content" loucura> ' + myRoute[i].start_address + ' </div>'
            //     // });
            //     marker.addListener('click', function () {
            //         this.infowindow.setContent('<div>'+compiled[0].innerHTML +'</div>');
            //         this.infowindow.open(map, this);
            //     });
            //
            // }

            // var marker = new google.maps.Marker({
            //     position: myRoute[legs - 1].steps[lastPoint - 1].end_point,
            //     map: map,
            //     icon: "https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=flag|ADDE63",
            //     clickable: true
            // });
            //
            // marker.info = new google.maps.InfoWindow({
            //     content: '<div id="content">' + '<div id="grupo">' + myRoute[1].end_address + '<select ng-model="rota"> <option value="A">A</option>' +
            //     '<option value="B">B</option>' +
            //     '<option value="C">C</option>' +
            //     '<option value="D">D</option></select></div>'
            // });
            //
            // marker.addListener('click', function () {
            //     this.info.open(map, this);
            // });
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
                    $scope.map.window.model = model;
                    $scope.map.window.show = true;
                }
            }
        }
    })
    .controller('templateController', function ($scope) {
        $scope.i = $scope.parameter;
    });


controller:function ($scope) {
    $scope.rotas = {};
    $scope.$watch('id',function () {
        if(!$scope.id)
            return;
        $scope.clickrota =  $scope.model.filter(function (data) {
            if(data.id == $scope.id)
                return data;
        });
        console.log($scope.clickrota);
    })

    // function lou (data) {
    //     var arrayJson =[];
    //     data.map(function (i) {
    //         if (!$scope.rotas[i.rota]) {
    //             $scope.rotas[i.rota]=[];
    //             arrayJson.push(i.rota);
    //         }
    //     });
    //     return arrayJson;
    // }
// },