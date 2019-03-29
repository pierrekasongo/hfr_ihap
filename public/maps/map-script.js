// See post: http://asmaloney.com/2014/01/code/creating-an-interactive-map-with-leaflet-and-openstreetmap/
/************************************************************************** */
/*******************CONVERTING TO GEOJSONS****************************** */
/*https://www.openstreetmap.org/relation/192795*/
/*http://polygons.openstreetmap.fr/?id=192795*/
var map = L.map( 'map', {
  //center:[-4.038333,21.758664],
  center:[-11.72162425,27.468263686188944],
  minZoom: 6,
  //zoom:6,
  zoom: 12
})

L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: ['a', 'b', 'c']
}).addTo( map );

function callPopup(feature,layer){
    layer.bindPopup("<h2>Hi there</h2>");
};

L.geoJson(hk,{
  onEachFeature:callPopup
}).addTo(map);

L.geoJson(llb,{
  onEachFeature:callPopup
}).addTo(map);

L.geoJson(drc,{
  //onEachFeature:callPopup
}).addTo(map);

var url = jQuery( 'script[src$="script.js"]' ).attr( 'src' ).replace( 'script.js', '' );


var myIcon = L.icon({
  iconUrl: url + 'images/pin48.png',
  iconRetinaUrl: url + 'images/pin48.png',
  iconSize: [29, 24],
  iconAnchor: [9, 21],
  popupAnchor: [0, -14]
});
//var marker = L.marker([-11.72162425,27.468263686188944]).addTo(map);
//var marker = L.marker([-11.72162425,27.468263686188944],{icon:myIcon}).addTo(map);

var markers = [
  {
    "id":1,
    "name": "HGR Bunkeya",
    "url": "https://en.wikipedia.org/wiki/Canada",
    "lat": -11.72162425,
    "lng": 27.468263686188944
  },
  {
    "id":2,
    "name": "Katuba",
    "url": "https://en.wikipedia.org/wiki/Anguilla",
    "lat": -11.70946015,
    "lng": 27.463397725226116
  },
  {
    "id":3,
    "name": "Kamalondo",
    "url": "https://en.wikipedia.org/wiki/Anguilla",
    "lat": -11.68417745,
    "lng": 27.486228029345085
  },
  {
    "id":4,
    "name": "Kampemba",
    "url": "https://en.wikipedia.org/wiki/Anguilla",
    "lat": -11.6573388,
    "lng": 27.510476977100247
  }
];

function test(id){
  alert("Tu as cliqué sur "+id);
}

for ( var i=0; i < markers.length; ++i )
{
 L.marker( [markers[i].lat, markers[i].lng]/*, {icon: myIcon} */)
  //.bindPopup( '<a href="' + markers[i].url +'?id='+markers[i].id+'" target="_blank">' + markers[i].name + '</a><br>'+markers[i].url )
  .bindPopup( '<a onclick="request_facility_details('+markers[i].id+');">' + markers[i].name + '</a><br>'+markers[i].url )
  .addTo( map );
}



