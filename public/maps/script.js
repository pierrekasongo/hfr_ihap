
//********Initializing the map ******/
var map = L.map( 'map', {
  //center:[-4.038333,21.758664],
  center:[-11.72162425,27.468263686188944],
  minZoom: 6,
  //zoom:6,
  zoom: 6
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
//*******End map initialization */

var toggleTable = () => {
  
  let text=$("#toggleText").text();

  if(text.includes("Masquer")){
    $("#toggleText").text("Afficher le tableau");
  }else{
    $("#toggleText").text("Masquer le tableau");
  }

  $('#table-div').toggle();
}

var loadDetails = (fosaCode) => {

  loadHoraire(fosaCode);

  loadResponsable(fosaCode);

  loadService(fosaCode);

  loadMapCoord(fosaCode);

  $.ajax({

    url: '/getDetails/'+fosaCode,
    type: 'get',

    beforeSend: function () {
      
    },
    success: function (obj) {
    },
    complete: function (data) {

      let facilities=data.responseJSON;

      if(facilities){

        facilities.forEach(fosa =>{
          $('#province').text(fosa.province);
          $('#zone').text(fosa.zone);
          $('#adresse').text(fosa.adresse);
          $('#procedure_soin').text(fosa.procedure_soin);
          $('#type_staff').text(fosa.type_staff);
        })
      }
    }
  });
}

var loadHoraire = (fosaCode) => {

  $.ajax({

    url: '/getHoraire/'+fosaCode,
    type: 'get',

    beforeSend: function () {
      
    },
    success: function (obj) {
    },
    complete: function (data) {

      let horaires=data.responseJSON;

      if(horaires){

        horaires.forEach(hr =>{
          $('#horaire').append('<li class="list-group-item">'+hr.jour+': '+hr.heure+'</li>');
        })
      }
    }
  });
}

var loadResponsable = (fosaCode) => {

  $.ajax({

    url: '/getResponsable/'+fosaCode,
    type: 'get',

    beforeSend: function () {
      
    },
    success: function (obj) {
    },
    complete: function (data) {

      let responsables=data.responseJSON;

      if(responsables){

        responsables.forEach(resp =>{
          if(resp.type == 'RESP'){
            $('#resp_nom').text(resp.noms);
            $('#resp_fonction').text(resp.fonction);
            $('#resp_phone').text(resp.telephone);
          }else if(resp.type == 'RESP_ADJ'){
            $('#resp_ad_nom').text(resp.noms);
            $('#resp_ad_fonction').text(resp.fonction);
            $('#resp_ad_phone').text(resp.telephone);
          }else{
            $('#pers_nom').text(resp.noms);
            $('#pers_fonction').text(resp.fonction);
            $('#pers_phone').text(resp.telephone);
          }  
        })
      }
    }
  });
}

var loadService = (fosaCode) => {

  $.ajax({

    url: '/getService/'+fosaCode,
    type: 'get',

    beforeSend: function () {
      
    },
    success: function (obj) {
    },
    complete: function (data) {

      let services=data.responseJSON;

      if(services){

        services.forEach(serv =>{
          $('#service').append('<li class="list-group-item"><b>'+serv.nom+'</b></li>');
        })
      }
    }
  });
}

var loadMapCoord = (fosaCode) => {
  
  $.ajax({

    url: '/geolocate/'+fosaCode,
    type: 'get',

    beforeSend: function () {
      
    },
    success: function (obj) {
    },
    complete: function (data) {

      let coord=data.responseJSON;

      let long=coord[0].longitude;

      let lat=coord[0].latitude;

      let facility=coord[0].facility;

      let type=coord[0].type;

      let staff=coord[0].staff;

      let procedure=coord[0].proc_soin;

      loadMap(facility,type,staff,procedure,lat,long);
    }
  });
}

var loadMap = (facility,type, staff, procedure,lat,long) => {
  
  var url = jQuery( 'script[src$="script.js"]' ).attr( 'src' ).replace( 'script.js', '' );
  
  var myIcon = L.icon({
    iconUrl: url + 'images/h48.png',
    iconRetinaUrl: url + 'images/h48.png',
    iconSize: [29, 24],
    iconAnchor: [9, 21],
    popupAnchor: [0, -14]
  });
  //var marker = L.marker([-11.72162425,27.468263686188944]).addTo(map);
  //var marker = L.marker([-11.72162425,27.468263686188944],{icon:myIcon}).addTo(map);
  
  var markers=[
    {
      "id":1,
      "name": facility+'<br>'+'Structure '+type+'<br>Soins '+procedure+'<br>Soins administrés par: '+staff,
      "url": "",
      "lat": lat,
      "lng": long
    }
  ];

  for ( var i=0; i < markers.length; ++i )
  {
   L.marker( [markers[i].lat, markers[i].lng], {icon: myIcon})
    .bindPopup( '<a onclick="request_facility_details('+markers[i].id+');">' + markers[i].name + '</a><br>'+markers[i].url )
    .addTo( map );
  }
}


//CONFIGURATION PAGE
var makeEditable = (id) =>{

  $('#edit_'+id).hide();

  let editable="editable_"+id;

  let content=$('#'+editable).html();

  $('#'+editable).html('<input id="input_'+editable+'" type="text" value="' + content + '"/>');
  
  $('#save_'+id).show();

  $('#cancel_'+id).show();
}

var cancelEdition = (id) =>{

  $('#edit_'+id).show();

  let container="editable_"+id;

  let editable="input_editable_"+id;

  let content=$('#'+editable).val();

  $('#'+container).html(content);
  
  $('#save_'+id).hide();

  $('#cancel_'+id).hide();
}

var saveEdition = (id) =>{

  let param=$("#editable_param_"+id).html();

  let value=$("#input_editable_"+id).val();

  $.ajax({

    url: '/updateConfig',

    type: 'post',

    data:{
      param:param,
      value:value
    },

    beforeSend: function () {
      
    },
    success: function (obj) {
    },
    complete: function (data) {

      cancelEdition(id);
    }
  });
}



