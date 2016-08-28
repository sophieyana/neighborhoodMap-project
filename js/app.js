var map;
var bounds;
var infoWindow;
var defaultIcon;
var highlightedIcon;

/* source: Google Maps API -- Udacity Course -- Project */
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' +
        markerColor + '|40|_|%E2%80%A2', new google.maps.Size(21, 34),
        new google.maps.Point(0, 0), new google.maps.Point(10, 34), new google
        .maps.Size(21, 34));
    return markerImage;
}

var initialLocations = [{
    title: 'British Museum',
    location: {
        lat: 51.519593,
        lng: -0.126946
    }
}, {
    title: 'National Gallery',
    location: {
        lat: 51.509149,
        lng: -0.128278
    }
}, {
    title: 'National Portrait Gallery, London',
    location: {
        lat: 51.509410,
        lng: -0.128143
    }
}, {
    title: 'Royal Academy of Arts',
    location: {
        lat: 51.509643,
        lng: -0.139847
    }
}, {
    title: 'Sherlock Holmes Museum',
    location: {
        lat: 51.523923,
        lng: -0.158525
    }
}, {
    title: 'Prince Charles Cinema',
    location: {
        lat: 51.511668,
        lng: -0.130256
    }
}, {
    title: 'Russell Square',
    location: {
        lat: 51.521730,
        lng: -0.126115
    }
}, {
    title: 'Neal\'s Yard',
    location: {
        lat: 51.5143187,
        lng: -0.1287639
    }
}, {
    title: 'Royal Opera House',
    location: {
        lat: 51.513101,
        lng: -0.122155
    }
}];

function initMap() {
    /* source for styles: Google Maps API -- Udacity Course -- Project */
    var styles = [{
        featureType: 'water',
        stylers: [{
            color: '#19a0d8'
        }]
    }, {
        featureType: 'administrative',
        elementType: 'labels.text.stroke',
        stylers: [{
            color: '#ffffff'
        }, {
            weight: 6
        }]
    }, {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#e85113'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{
            color: '#efe9e4'
        }, {
            lightness: -40
        }]
    }, {
        featureType: 'transit.station',
        stylers: [{
            weight: 9
        }, {
            hue: '#e85113'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'labels.icon',
        stylers: [{
            visibility: 'off'
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{
            lightness: 100
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{
            lightness: -100
        }]
    }, {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{
            visibility: 'on'
        }, {
            color: '#f0e4d3'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [{
            color: '#efe9e4'
        }, {
            lightness: -25
        }]
    }];
    // map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 51.5160563,
            lng: -0.1271484
        },
        zoom: 15,
        styles: styles,
        mapTypeControl: false
    });
    infoWindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();
    /* Source: Google Maps API -- Udacity Course -- Project */
    defaultIcon = makeMarkerIcon('0091ff');
    highlightedIcon = makeMarkerIcon('FFFF24');
    for (var i = 0; i < initialLocations.length; i++) {
        loadWikiData(i);
    }
    ko.applyBindings(new ViewModel());
}

var ViewModel = function() {
    var self = this;
    self.viewList = ko.observableArray(initialLocations);
    self.query = ko.observable('');

    self.viewList().forEach(function(item) {
        var marker = new google.maps.Marker({
            position: item.location,
            title: item.title,
            map: map,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon
        });
        item.marker = marker;
        bounds.extend(marker.position);
        marker.addListener('click', function(event) {
            var content;
            if (item.wikiErrorMessage === '') {
                content = '<h3><a href="' + item.wikiURL +
                    '" target="_blank">' + item.wikiTitle +
                    '</a></h3>' + '<div><img src=' + item.wikiImgSrc +
                    ' alt="NO IMAGE TO DISPLAY"></div>' +
                    '<div>' + item.wikiExtract + '</div>';
            } else {
                content = '<div>' + item.wikiErrorMessage +
                    '</div>';
            }
            infoWindow.setContent(content);
            infoWindow.open(map, this);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            marker.setIcon(highlightedIcon);
            stopAnimation(this);
        });

        self.animateMarker = function(item) {
            google.maps.event.trigger(item.marker, 'click');
        };

    });
    map.fitBounds(bounds);

    self.search = ko.computed(function() {
        return ko.utils.arrayFilter(self.viewList(), function(
            location) {
            var match = location.title.toLowerCase().indexOf(
                self.query().toLowerCase()) >= 0;
            location.marker.setVisible(match);
            return match;
        });
    });

    /* Stop the animation of the marker after 3 sec et goes back to default marker (blue marker)
       source: from the udacity forum, https://github.com/JimRhead/Udacity-Maps-Api */
    function stopAnimation(marker) {
            setTimeout(function() {
                marker.setAnimation(null);
                marker.setIcon(defaultIcon);
            }, 3000);
        }
        /* Show/hide the slide menu */
    self.toggleMenu = function() {
        $(".filter-box").toggle();
    };
};

/* Wikipedia API */
function loadWikiData(i) {

    var wikiUrl = "https://en.wikipedia.org/w/api.php";
    wikiUrl += '?' + $.param({
        'action': "query",
        'titles': initialLocations[i].title,
        'format': "json",
        'prop': "extracts|pageimages",
        'exsentences': 1,
        'callback': 'wikiCallback'
    });

    initialLocations[i].wikiErrorMessage = '';
    var wikiRequestTimeout = setTimeout(function() {
        initialLocations[i].wikiErrorMessage = 'Error';
    }, 8000);

    console.log(initialLocations[i].title);
    console.log(wikiUrl);

    $.ajax(wikiUrl, {
        dataType: 'jsonp',
        success: function(data) {
            var pages = data.query.pages;
            $.map(pages, function(page) {
                initialLocations[i].wikiTitle = page.title;
                if (page.extract) {
                    initialLocations[i].wikiExtract =
                        page.extract;
                } else {
                    initialLocations[i].wikiExtract =
                        "No snippets - cf link above";
                }
                if (page.thumbnail) {
                    initialLocations[i].wikiImgSrc =
                        page.thumbnail.source;
                } else {
                    /* if thumbnail does not exist (no image on the Wiki Page) */
                    initialLocations[i].wikiImgSrc =
                        "ERROR";
                }
                initialLocations[i].wikiURL =
                    "https://en.wikipedia.org/wiki/" +
                    page.title;
            });
            clearTimeout(wikiRequestTimeout);
        }
    });

    console.log(initialLocations[i].wikiErrorMessage);
}