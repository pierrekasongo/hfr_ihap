var  map;

$(document).ready(function() {
  initMap();
});

//********Initializing the map ******/
var initMap = () => {
  
    $('#map-div').empty();
    $('#map-div').append('<div  id="map" style="width: 130em; height: 400px;"></div>');
  //if(map == null){
    map = L.map( 'map', {
      //center:[-4.038333,21.758664],
      center:[-11.72162425,27.468263686188944],
      minZoom: 6,
      //zoom:6,
      zoom: 7
    });

    L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: ['a', 'b', 'c']
    }).addTo( map );
  
    L.geoJson(hk,{}).addTo(map);
  
    L.geoJson(llb,{}).addTo(map);
  
    L.geoJson(drc,{}).addTo(map);
    //*******End map initialization */
  //}
}

var toggleTable = () => {
  
  let text=$("#toggleText").text();

  if(text.includes("Masquer")){
    $("#toggleText").html("<i class='fa fa-caret-up'></i> Afficher le tableau");
  }else{
    $("#toggleText").html("<i class='fa fa-caret-down'></i> Masquer le tableau");
  }

  $('#table-div').toggle();
}

var loadDetails = (fosaCode) => {


  $('#selected_fosa').val(fosaCode);

  $("#waiting").show();

  loadHoraire(fosaCode);

  loadContacts(fosaCode);

  loadService(fosaCode);

  loadMapCoord(fosaCode,"","");

  loadTXNEW(fosaCode);

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
          $('#cn_province').text(fosa.province);
          $('#cn_zone').text(fosa.zone);
          $('#cn_adresse').text(fosa.adresse);
          $('#cn_procedure_soin').text(fosa.procedure_soin);
          $('#cn_type_staff').text(fosa.type_staff);
        })
      }
    }
  });
}

var loadTXNEW = (fosaCode) => {

  $.ajax({

    url: '/getTX_CURR/'+fosaCode,
    type: 'get',

    beforeSend: function () {
      
    },
    success: function (obj) {
    },
    complete: function (data) {

      let cohorte=parseInt(data.responseJSON);

      $("#waiting").hide();

      $('#cohorte_lbl').text('COHORTE ACTUELLE: '+cohorte);
    }
  });
}

var loadHoraire = (fosaCode) => {

  cancelHoraireEdit();

  $.ajax({

    url: '/getHoraire/'+fosaCode,
    type: 'get',

    beforeSend: function () {
      
    },
    success: function (obj) {
    },
    complete: function (data) {

      let horaires=data.responseJSON[0];

      if(horaires){
        writeHoraire(horaires.jour);
      }
    }
  });
}


var loadContacts = (fosaCode) => {

  cancelContactEdit('RESP');

  cancelContactEdit('RESP_ADJ');

  cancelContactEdit('PERS_CONTACT');

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
            $('#resp_contact_id').val(resp.id);
            $('#cn_resp_nom').text(resp.noms);
            $('#cn_resp_fonction').text(resp.fonction);
            $('#cn_resp_phone').text(resp.telephone);
          }else if(resp.type == 'RESP_ADJ'){
            $('#resp_ad_contact_id').val(resp.id);
            $('#cn_resp_ad_nom').text(resp.noms);
            $('#cn_resp_ad_fonction').text(resp.fonction);
            $('#cn_resp_ad_phone').text(resp.telephone);
          }else{
            $('#pers_contact_id').val(resp.id);
            $('#cn_pers_nom').text(resp.noms);
            $('#cn_pers_fonction').text(resp.fonction);
            $('#cn_pers_phone').text(resp.telephone);
          }  
        })
      }
    }
  });
}

var loadService = (fosaCode) => {

  cancelServiceEdit();

  $.ajax({

    url: '/getServices/'+fosaCode,
    type: 'get',

    beforeSend: function () {
      
    },
    success: function (obj) {
    },
    complete: function (data) {

      let services=data.responseJSON[0];

      servArr=services.nom.split(",");

      servArr.forEach(serv =>{
        $('#service_lbl').append('<li class="list-group-item"><b>'+serv+'</b></li>');
      })  
    }
  });
}

var loadMapCoord = (fosaCode, hzCode,districtID) => {

  if(fosaCode.length > 0){//Single facility clicked

    $.ajax({

      url: '/geolocateFacility/'+fosaCode,

      type: 'get',
  
      beforeSend: function () {
        
      },
      success: function (obj) {
      },
      complete: function (data) {
  
        let coord=data.responseJSON;
  
        if(coord[0]){
  
          let long=coord[0].longitude;
  
          let lat=coord[0].latitude;
  
          let facility=coord[0].facility;

          let code=coord[0].code;
  
          let type=coord[0].type;
  
          let staff=coord[0].staff;
  
          let procedure=coord[0].proc_soin;
  
          loadMap(facility,code,type,staff,procedure,lat,long,false);
        }
      }
    });

  }else if(hzCode.length > 0){//Search facilities for the clicked health zone

    $.ajax({

      url: '/geolocateByHealthZone/'+hzCode,

      type: 'get',
  
      beforeSend: function () {
        
      },
      success: function (obj) {
      },
      complete: function (data) {
  
        let facilities=data.responseJSON;
  
        loadMap(facilities,"","","","","","",true);
      }
    });
  }else if(districtID > 0 || districtID ==0){//Search facilities for the clicked district

    $.ajax({

      url: '/geolocateByDistrict/'+districtID,

      type: 'get',
  
      beforeSend: function () {
        
      },
      success: function (obj) {
      },
      complete: function (data) {
  
        let facilities=data.responseJSON;
  
        loadMap(facilities,"","","","","","",true);
      }
    });
  }
}

var loadMap = (facilities,code,type, staff, procedure,lat,long,showMultiple) => {

  initMap();
  var markers=[];
  
  var url = jQuery( 'script[src$="script.js"]' ).attr( 'src' ).replace( 'script.js', '' );
  
  var myIcon = L.icon({
    iconUrl: url + 'images/h48.png',
    iconRetinaUrl: url + 'images/h48.png',
    iconSize: [29, 24],
    iconAnchor: [9, 21],
    popupAnchor: [0, -14]
  });

  if(showMultiple == false){

    let codeFosa="'"+code+"'";

    markers=[
      {
        "id":code,
        "name": '<b><a href="#" onclick="loadDetails('+codeFosa+')">'+facilities+'</a></b><br>'+'Structure '+type+'<br>Soins '+procedure+'<br>Soins administrés par: '+staff,
        "url": "",
        "lat": lat,
        "lng": long
      }
    ];
  }else{

    facilities.forEach(fac => {

      let code="'"+fac.code+"'";

      markers.push({
        "id":fac.code,
        "name":'<b><a href="#" onclick="loadDetails('+code+')">'+fac.facility+'</a></b><br>'+'Structure '+fac.type+'<br>Soins '+fac.procedure+'<br>Soins administrés par: '+fac.staff,
        "url": "",
        "lat": fac.latitude,
        "lng": fac.longitude
      })
    });
  }
  
  for ( var i=0; i < markers.length; ++i )
  {
    let code="'"+markers[i].id+"'";
   L.marker( [markers[i].lat, markers[i].lng], {icon: myIcon})
    .bindPopup(markers[i].name + '</a><br>'+markers[i].url )
    .addTo( map );
  }
}

//CONFIGURATION PAGE

var makeEditable = (id) =>{

  alert(id);

  return;

  $('#'+id).hide();

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

var loadHealthZone = () => {
  
  $("#hz_combo").empty();

  $.ajax({

    url: '/loadHealthZones',

    type: 'get',

    beforeSend: function () {
      
    },
    success: function (obj) {
    },
    complete: function (data) {

      let zones=data.responseJSON;

      if(zones){

        $("#hz_combo").empty();

        $("#hz_combo").append(new Option("Sélectionner", "0"));

        zones.forEach(zs =>{

          $("#hz_combo").append(new Option(zs.name, zs.code));
        })
      }
    }
  });
}

$(document).ready(function() {

  loadHealthZones(0,0);
  loadMapCoord("","",0);

  $.ajax({

    url: '/loadDistricts',

    type: 'get',

    beforeSend: function () {
      
    },
    success: function (obj) {
    },
    complete: function (data) {

      let districts=data.responseJSON;

      if(districts){

        $("#dist_list").empty();

        $("#dist_list").append('<a href="#" class="dist-btn active" onclick="loadHealthZones(this,0,1)">Tous</a>');

        districts.forEach(dist =>{

          if(!dist.name.includes("Communi")){
            $("#dist_list").append('<a href="#" class="dist-btn" onclick="loadHealthZones(this,'+dist.id+',1)">'+dist.name+'</a>');
          }
        })
      }
    }
  });
});

function loadHealthZones(btn,districtID, load_fosa){

  //Shift the active link for district buttons
  $("#dist_list").children('a').each(function(){
    if(this.className == "dist-btn active"){
      this.className = this.className.replace(" active","");
    }
  })
  btn.className+=" active";

  $("#hz_combo").empty();

  if(load_fosa > 0){

    loadFacilitiesByDistrict(districtID);
  }

  $.ajax({

    url: '/loadHealthZones/'+districtID,

    type: 'get',

    beforeSend: function () {
      
    },
    success: function (obj) {
    },
    complete: function (data) {

      let districts=data.responseJSON;

      if(districts){

        $("#count_zones").text(districts.length+" zones");

        $("#hz_combo").empty();

        $("#hz_combo").append(new Option("Sélectionner", "0"));

        districts.forEach(dist =>{

          $("#hz_combo").append(new Option(dist.name, dist.code));
        })
      }
    }
  });
}
var loadFacilitiesByDistrict = (districtID) => {

  $.ajax({

    url: '/filterFacilitiesByDistrict/'+districtID,

    type: 'get',

    beforeSend: function () {
      
    },
    success: function (obj) {
    },
    complete: function (data) {

      let facilities=data.responseJSON;

      $('#table-data tbody').empty();

      $('#count_facilities').text(facilities.length+" structures trouvées");

      facilities.forEach(fac => {

        let code="'"+fac.code.trim()+"'";
        
        $('#table-data tbody').append(

          "<tr><td>"+
            '<a href="#" onclick="loadDetails('+code+')">'+
              fac.facility+
            "</a>"+
          "</td></tr>"
        );
      })
      loadMapCoord("","",districtID);
    }
  });
}

$('#hz_combo').on('change', function() {

  let healthZoneID=this.value;

  $.ajax({

    url: '/filterFacilitiesByZone/'+healthZoneID,

    type: 'get',

    beforeSend: function () {
      
    },
    success: function (obj) {
    },
    complete: function (data) {

      let facilities=data.responseJSON;

      $('#table-data tbody').empty();

      $('#count_facilities').text(facilities.length+" structures trouvées");

      facilities.forEach(fac => {

        let code="'"+fac.code.trim()+"'";
        
        $('#table-data tbody').append(                           
          "<tr><td>"+
            '<a href="#" onclick="loadDetails('+code+')">'+
              fac.facility+
            "</a>"+
          "</td></tr>"
        );
      })

      loadMapCoord("",healthZoneID,"");
    }
  });
});

/*******************EDITING VALUES***************/
/***********************************************/

var showInfoBaseEdit = () =>{

  var selected = $('#selected_fosa').val();

  if(selected.length > 0){

    $('#show_info_base_edit').css('display','none');

    $('#save_info_base').css('display','');

    $('#cancel_info_base').css('display','');
    
    var adresse=$('#cn_adresse').text();

    $('#cn_adresse').html('<input type="text" class="form-control" id="adresse" value="'+adresse+'">');

    var procedure=$('#cn_procedure_soin').text();

    var options=["GRATUIT","PAYANT"];

    var opString="";

    options.forEach(opt => {

      if(procedure == opt){
        opString+='<option value="'+opt+'" selected>'+opt+'</option>';
      }else{
        opString+='<option value="'+opt+'">'+opt+'</option>';
      }
      
    });

    $('#cn_procedure_soin').html('<select class="form-control" id="procedure_soin">'+
     opString+
    '</select>');
    
    var type_staff=$('#cn_type_staff').text();

    $('#cn_type_staff').html('<input type="text" class="form-control" id="type_staff" value="'+type_staff+'">');
  }
}

var cancelInfoBaseEdit = () => {

  $('#show_info_base_edit').css('display','');
  $('#save_info_base').css('display','none');
  $('#cancel_info_base').css('display','none');
  $('#cn_adresse').html($('#adresse').val());
  $('#cn_procedure_soin').html($('#procedure_soin').val());
  $('#cn_type_staff').html($('#type_staff').val());
}

var editInfoBase = () => {

  var fosaCode=$('#selected_fosa').val();
  var adresse = $('#adresse').val();
  var procedure = $('#procedure_soin').val();
  var type_staff = $('#type_staff').val();

  $.ajax({

    url: '/updateInfoBase',

    type: 'post',

    data:{
      fosa:fosaCode,
      adresse:adresse,
      procedure:procedure,
      type_staff:type_staff
    },

    beforeSend: function () {
      
    },
    success: function (obj) {

    },
    complete: function (data) {
      //cancelInfoBaseEdit();
    }
  });
  cancelInfoBaseEdit();
  
}

var showContactEdit = (type) => {

  var contact_id = $('#'+type+'_contact_id').val();

  //if(contact_id.length > 0){

    $('#show_contact_'+type+'_edit').css('display','none');

    $('#save_contact_'+type).css('display','');

    $('#cancel_contact_'+type).css('display','');
    
    var nom=$('#cn_'+type+'_nom').text();

    var fonction=$('#cn_'+type+'_fonction').text();

    var telephone=$('#cn_'+type+'_phone').text();

    $('#cn_'+type+'_nom').html('<input type="text" class="form-control" id="'+type+'_nom" value="'+nom+'">');

    $('#cn_'+type+'_fonction').html('<input type="text" class="form-control" id="'+type+'_fonction" value="'+fonction+'">');

    $('#cn_'+type+'_phone').html('<input type="text" class="form-control" id="'+type+'_phone" value="'+telephone+'">');
  //}
}

var cancelContactEdit = (type) =>{

  $('#show_contact_'+type+'_edit').css('display','');

  $('#save_contact_'+type).css('display','none');

  $('#cancel_contact_'+type).css('display','none');

  var nom=$('#'+type+'_nom').val();

  var fonction=$('#'+type+'_fonction').val();

  var telephone=$('#'+type+'_phone').val();

  $('#cn_'+type+'_nom').text(nom);

  $('#cn_'+type+'_fonction').text(fonction);

  $('#cn_'+type+'_phone').text(telephone);

}

var editContact = (type) => {

  var contact_id = $('#'+type+'_contact_id').val();

  var facility_code =$('#selected_fosa').val();

  var nom=$('#'+type+'_nom').val();

  var fonction=$('#'+type+'_fonction').val();

  var telephone=$('#'+type+'_phone').val();

  var type_contact='';

  var url='';

  switch(type){
    case 'resp':
      type_contact='RESP';
      break;
    case 'resp_ad':
      type_contact='RESP_ADJ';
      break;
    default:
      type_contact='PERS_CONTACT';
      break;
  }

  if(contact_id > 0){
    
    url='/updateContact';

    data={

      contactID:contact_id,

      type:type_contact,

      nom:nom,

      fonction:fonction,

      telephone:telephone
    };

    
    
  }else{

    url='/insertContact';
    data={
      facilityCode:facility_code,
      type:type_contact,
      nom:nom,
      fonction:fonction,
      telephone:telephone
    };
  }
  $.ajax({

    type: 'post',

    url: url,

    data:data,

    success: function(data){
    },
    error: function (data) {

      let res=data;   
    }
  });
  cancelContactEdit(type);
}

var showServiceEdit = () => {

  let value="";

  $('#service_lbl').find('li').each(function(){

    value+= $(this).text()+',';

  });

  $('#show_service_edit').css('display','none');

  $('#save_service').css('display','');

  $('#cancel_service').css('display','');

  //var serv = $('#service_lbl').text();

  $('#service_lbl').html('<input type="text" class="form-control" id="service_input" value="'+value+'">');
  
}

var cancelServiceEdit = () => {

  let services=$('#service_input').val();

  if(services){

    let servArr=services.split(",");

    $('#service_lbl').empty();

    servArr.forEach(serv =>{

      if(serv.length > 0){

        $('#service_lbl').append('<li class="list-group-item"><b>'+serv+'</b></li>');
      }   
    });  
  }

  //$('#service_lbl').html('<b>'+$('#service_input').val()+'</b>');

  $('#show_service_edit').css('display','');

  $('#save_service').css('display','none');

  $('#cancel_service').css('display','none');
}

var editService = () => {

  var services = $('#service_input').val();

  var fosa_code = $('#selected_fosa').val();

  $.ajax({

    type: 'post',

    url: '/updateServices',

    data:{

      fosaCode:fosa_code,

      services:services,
    },

    success: function(data){
    },
    error: function (data) {

      let res=data;   
    }
  });
  cancelServiceEdit();
} 

var showHoraireEdit = () =>{

  var value="";

  $('#horaire').find('li').each(function(){
    value+= $(this).text()+',';
  });

  $('#div-horaire').html(`<input type="text" class="form-control" id="horaire_input" value="${value}">`); 

  $('#show_horaire_edit').css('display','none');

  $('#save_horaire').css('display','');

  $('#cancel_horaire').css('display','');
  
}

var cancelHoraireEdit = () =>{

  $('#show_horaire_edit').css('display','');

  $('#save_horaire').css('display','none');

  $('#cancel_horaire').css('display','none');

  var value=$('#horaire_input').val();

  $('#div-horaire').html(`<ul class="list-group border-bottom" id="horaire"></ul>`);

  writeHoraire(value);
}

var editHoraire = () =>{

  var horaires = $('#horaire_input').val();

  var fosa_code = $('#selected_fosa').val();

  $.ajax({

    type: 'post',

    url: '/updateHoraires',

    data:{

      fosaCode:fosa_code,

      horaires:horaires,
    },

    success: function(data){
    },
    error: function (data) {

      let res=data;   
    }
  });
  cancelHoraireEdit();
}
var writeHoraire = (value) =>{

  let jours=[];

  if(value){

    jours=value.split(",");

    jours.forEach(jour =>{

      if(jour.length > 1){
        $('#horaire').append('<li class="list-group-item">'+jour+'</li>');
      }          
    })
  }
  
}