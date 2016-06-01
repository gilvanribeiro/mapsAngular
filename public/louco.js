'use strict';

var myApp = angular.module('app', ['uiGmapgoogle-maps']);

myApp.config(function (uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
});

myApp.controller('treta', function ($scope, uiGmapGoogleMapApi, uiGmapIsReady) {

    uiGmapGoogleMapApi.then(function (maps) {
        $scope.googlemap = {};
        $scope.map = {
            center: {
                latitude: 37.78,
                longitude: -122.41
            },
            zoom: 14,
            pan: 1,
            options: $scope.mapOptions,
            control: {},
            events: {
                tilesloaded: function (maps, eventName, args) {},
                dragend: function (maps, eventName, args) {},
                zoom_changed: function (maps, eventName, args) {}
            }
        };
    });

    $scope.windowOptions = {
        show: false
    };

    $scope.onClick = function (data) {
        $scope.windowOptions.show = !$scope.windowOptions.show;
        console.log('$scope.windowOptions.show: ', $scope.windowOptions.show);
        console.log('This is a ' + data);
        //alert('This is a ' + data);
    };

    $scope.closeClick = function () {
        $scope.windowOptions.show = false;
    };

    $scope.title = "Window Title!";

    uiGmapIsReady.promise() // if no value is put in promise() it defaults to promise(1)
        .then(function (instances) {
            console.log(instances[0].map); // get the current map
        })
        .then(function () {
            $scope.addMarkerClickFunction($scope.markers);
        });

    $scope.markers = [{
        id: 0,
        coords: {
            latitude: 37.7749295,
            longitude: -122.4194155
        },
        data: 'restaurant'
    }, {
        id: 1,
        coords: {
            latitude: 37.79,
            longitude: -122.42
        },
        data: 'house'
    }, {
        id: 2,
        coords: {
            latitude: 37.77,
            longitude: -122.41
        },
        data: 'hotel'
    }];

    $scope.addMarkerClickFunction = function (markersArray) {
        angular.forEach(markersArray, function (value, key) {
            value.onClick = function () {
                $scope.onClick(value.data);
                $scope.MapOptions.markers.selected = value;
            };
        });
    };


    $scope.MapOptions = {
        minZoom: 3,
        zoomControl: false,
        draggable: true,
        navigationControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        disableDoubleClickZoom: false,
        keyboardShortcuts: true,
        markers: {
            selected: {}
        },
        styles: [{
            featureType: "poi",
            elementType: "labels",
            stylers: [{
                visibility: "off"
            }]
        }, {
            featureType: "transit",
            elementType: "all",
            stylers: [{
                visibility: "off"
            }]
        }],
    };
});
