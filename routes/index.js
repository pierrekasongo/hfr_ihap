var express = require('express');
var request=require('request-promise');
var router = express.Router();
var session=require('express-session');

var db=require('./dbconn');

const DHIS2_URL = 'http://vps428218.ovh.net:8080/api/';//'http://localhost:8080/api/';

const USER = 'Pierre';//'admin';

const PASSWORD = 'Capuccino@8891';//'district';

var getParamValue = (param) => {

  sql="SELECT value FROM config WHERE param ='"+param+"'";

  db.query(sql,function(error,data){

    if(error)throw error;
    let res= JSON.stringify(data[0]);
    let value = JSON.parse(res).value;
   
    return value;
  });
}

router.get('/form/:facilityCode',function(req,res,next){

  let facilityCode=req.request.facilityCode;

  res.render('form');
})
router.get('/', function(req, res, next) {

  sql="SELECT * FROM province";
  db.query(sql,function(error,data){
    if(error)throw error;
    res.render('index',{
      districts:data,
      username:req.session.user,
      path:'/'
    });
  });
});
    
router.get('/geolocateAll', function(req,res,next){

  let sql="SELECT fa.code as code, fa.id as id, name as facility, type_institution as type, procedure_soin as proc_soin,"+
          "type_staff as staff, latitude,longitude FROM facility_details fd,"+
          "facility fa WHERE fa.code=fd.code_facility)";

  db.query(sql,function(error,data){
    
    if(error)throw error;
    let resData=data;
    res.json(resData);
  })
});
router.get('/map', function(req, res, next) {

  /*sql="SELECT pr.name as province,zs.name as zone,fa.code as fa_code,fa.name as facility"+
  " FROM province pr, zone_sante zs, facility fa WHERE fa.code_zone=zs.code "+
  " AND zs.code_province=pr.code";*/
  let sql="SELECT code,name as facility FROM facility";

    db.query(sql,function(error,data){                                                                                                                                                                                                                
      if(error)throw error;
      res.render('map', 
        { 
          facilities: data,
          username:req.session.user,
          path:'map'
        }
      );
    })
});

router.get('/filterFacilitiesByZone/:healthZoneID', function(req, res, next) {

  let healthZoneID=req.params.healthZoneID;

  sql="SELECT code, name as facility FROM facility  WHERE code_zone='"+healthZoneID+"'";

    db.query(sql,function(error,data){                                                                                                                                                                                                                
      if(error)throw error;
      let resData=data;
      res.json(resData);
    })
});

router.get('/filterFacilitiesByDistrict/:districtID', function(req, res, next) {

  let districtID=req.params.districtID;

  let sql="SELECT code,name as facility FROM facility";

  if(districtID > 0){
    sql="SELECT code, name as facility FROM facility "+
      "WHERE code_zone IN (SELECT zs.code FROM zone_sante zs, province pr WHERE pr.code=zs.code_province AND pr.id="+districtID+")";
  }

  db.query(sql,function(error,data){                                                                                                                                                                                                                
      if(error)throw error;
      let resData=data;
      res.json(resData);
    })
});

router.get('/loadHealthZones/:districtID', function(req, res, next) {

  let districtID=req.params.districtID;

  let sql="SELECT code, name FROM zone_sante";

  if(districtID > 0){

    sql="SELECT code, name FROM zone_sante WHERE code_province=(SELECT code FROM province WHERE id="+districtID+")";
  }
  db.query(sql,function(error,data){                                                                                                                                                                                                                
      if(error)throw error;
      let resData=data;
      res.json(resData);
    })
});

router.get('/loadDistricts', function(req, res, next) {

  sql="SELECT id, code, name FROM province";
    db.query(sql,function(error,data){                                                                                                                                                                                                                
      if(error)throw error;
      let resData=data;
      res.json(resData);
    })
});

router.post('/updateConfig', function(req, res, next) {

  let param=req.body.param;
  let value=req.body.value;

  sql="UPDATE config SET value='"+value+"' WHERE param='"+param+"'";

    db.query(sql,function(error,data){                                                                                                                                                                                                                
      if(error)throw error;

      sql="SELECT id,param, value FROM config";

      db.query(sql,function(error,data){                                                                                                                                                                                                                
        if(error)throw error;
        res.render('config', { 
          configs: data,
          path:'config'
        });
      })
    })
});

router.post('/updateContact', function(req, res, next) {

  let contactID=req.body.contactID;
  let type=req.body.type;
  let nom=req.body.nom;
  let fonction=req.body.fonction;
  let telephone=req.body.telephone;

  sql=`UPDATE contact SET noms="${nom}",fonction="${fonction}", telephone="${telephone}", type="${type}" WHERE id=${contactID}`;

  db.query(sql,function(error,data){                                                                                                                                                                                                                
      if(error)throw error;
  })
});

router.post('/updateInfoBase', function(req, res, next) {

  let fosaCode=req.body.fosa;
  let adresse=req.body.adresse;
  let procedure=req.body.procedure;
  let type_staff=req.body.type_staff;

  sql=`UPDATE facility_details SET adresse="${adresse}",
      procedure_soin="${procedure}",type_staff="${type_staff}" WHERE code_facility="${fosaCode}"`;
  
  db.query(sql,function(error,data){                                                                                                                                                                                                                
      if(error)throw error;
  })
});

router.get('/config',  (req, res, next) => {

  sql="SELECT id,param, value FROM config";

    db.query(sql,function(error,data){                                                                                                                                                                                                                
      if(error)throw error;
      res.render('config', {
        configs: data,
        username:req.session.user,
        path:'config'
      });
    })
});

router.get('/login', function(req, res, next) {

  res.render('login');
});

router.post('/login',function(req,res,next){
  
  let username=req.body.username;

  let password=req.body.password;

  let logedinUser="";

  sql="SELECT username FROM user WHERE username='"+username+"' AND password='"+password+"'";

  db.query(sql,function(error,data){

    if(error)throw error;

    let value=JSON.stringify(data[0]);

    let logedinUser=JSON.parse(value).username;

    if(logedinUser == ""){

      res.redirect("/login");

      return;
    }else{

      if(!req.session.user)
        req.session.user=logedinUser;

      res.redirect("/");
    }
    
  })
})

router.get('/logout', function(req, res, next) {
  req.session.destroy();
  res.render('login');
});

router.get('/user', function(req, res, next) {

  sql="SELECT id,username,password FROM user";

    db.query(sql,function(error,data){                                                                                                                                                                                                                
      if(error)throw error;
      res.render('user', {
         users: data,
         username:req.session.user,
         path:'user'
        });
    })
});

router.post('/updateUser', function(req, res, next) {

  let id=req.body.id;
  let password=req.body.password;

  sql="UPDATE user SET password='"+password+"' WHERE id="+id;

    db.query(sql,function(error,data){                                                                                                                                                                                                                
      if(error)throw error;
      res.status(200);
    })
});
router.get('/sync', function(req, res, next) {

    sql="SELECT sync_date FROM sync WHERE id=(SELECT MAX(id) FROM sync)";

    db.query(sql,function(error,data){ 

      if(error)throw error;

      res.render('sync', {
        sync: data,
        username:req.session.user,
        path:'user'
      });
    })
});

router.get('/getChildren/:parent/:childTable', function(req,res,next){

  let tbl=req.params.childTable;

  let codeParent=req.params.parent;

  let sql="";

  if(tbl.includes("province")){

    sql="SELECT * FROM province";

  }

  db.query(sql,function(error,data){
  
    res.json(data);
  })
});

router.get('/getDetails/:fosaCode', function(req,res,next){

  let fosaCode=req.params.fosaCode;

  let sql="SELECT fa.name as facility, zs.name as zone, pr.name as province,fd.acronyme as acro, fd.adresse as adresse"+
  ",fd.type_institution as type_institution, fd.procedure_soin as procedure_soin, fd.type_staff as type_staff, fd.latitude as latitude,"+
  "fd.longitude as longitude FROM facility fa, facility_details fd, zone_sante zs, province pr WHERE fa.code=fd.code_facility AND "+
  "fa.code_zone=zs.code AND zs.code_province=pr.code AND fa.code='"+fosaCode+"'";

  db.query(sql,function(error,data){
    
    let resData=data;

    res.json(resData);
  })
});

router.get('/getResponsable/:fosaCode', function(req,res,next){

  let fosaCode=req.params.fosaCode;

  let sql="SELECT id,noms,fonction, telephone, type FROM contact WHERE code_facility='"+fosaCode+"'";

  db.query(sql,function(error,data){
    
    let resData=data;

    res.json(resData);
  })
});

router.get('/getHoraire/:fosaCode', function(req,res,next){

  let fosaCode=req.params.fosaCode;

  let sql="SELECT id,jour,heure FROM horaire WHERE code_facility='"+fosaCode+"'";

  db.query(sql,function(error,data){
    
    let resData=data;

    res.json(resData);
  })
});

router.get('/getService/:fosaCode', function(req,res,next){

  let fosaCode=req.params.fosaCode;

  let sql=`SELECT code_facility,nom FROM service WHERE code_facility="${fosaCode}"`;

  db.query(sql,function(error,data){
    
    let resData=data;

    res.json(resData);
  })
});

router.post('/updateServices', function(req,res,next){

  let fosaCode = req.body.fosaCode;

  let services = req.body.services;

  let sql=`INSERT INTO service (code_facility, nom) VALUES ("${fosaCode}","${services}") 
           ON DUPLICATE KEY UPDATE nom = "${services}"`;

  db.query(sql,function(error,data){
    
    let resData=data;

    res.json(resData);
  })
});

router.get('/geolocateFacility/:fosaCode', function(req,res,next){

  let fosaCode=req.params.fosaCode;

  let sql="SELECT fa.code as code, fa.id as id, name as facility, type_institution as type, procedure_soin as proc_soin,"+
          "type_staff as staff, latitude,longitude FROM facility_details fd,"+
          "facility fa WHERE fa.code=fd.code_facility AND code_facility='"+fosaCode+"'";

  db.query(sql,function(error,data){
    
    if(error)throw error;
    let resData=data;
    res.json(resData);
  })
});

router.get('/geolocateByHealthZone/:hzCode', function(req,res,next){

  let hzCode=req.params.hzCode;

  let sql="SELECT fa.code as code, fa.id as id, name as facility, type_institution as type, procedure_soin as proc_soin,"+
          "type_staff as staff, latitude,longitude FROM facility_details fd,"+
          "facility fa WHERE fa.code=fd.code_facility AND fa.code_zone='"+hzCode+"'";

  db.query(sql,function(error,data){
    
    if(error)throw error;
    let resData=data;
    res.json(resData);
  })
});

router.get('/geolocateByDistrict/:districtID', function(req,res,next){

  let districtID=req.params.districtID;

  let sql="SELECT fa.code as code, fa.id as id, name as facility, type_institution as type, procedure_soin as proc_soin,"+
          "type_staff as staff, latitude,longitude FROM facility_details fd,"+
          "facility fa WHERE fa.code=fd.code_facility AND fa.code_zone IN (SELECT zs.code FROM zone_sante zs, province pr WHERE pr.code=zs.code_province AND pr.id="+districtID+")";

  if(districtID == 0){
    sql="SELECT fa.code as code, fa.id as id, name as facility, type_institution as type, procedure_soin as proc_soin,"+
          "type_staff as staff, latitude,longitude FROM facility_details fd,"+
          "facility fa WHERE fa.code=fd.code_facility";
  }

  db.query(sql,function(error,data){
    
    if(error)throw error;
    let resData=data;
    res.json(resData);
  })
});


router.get('/loadData', function(req, res, next) {

  var username = USER;

  var password = PASSWORD;

  var options = {

    url: DHIS2_URL+'sqlViews/UArf3DEsGm7/data.json?paging=false',

    auth: {

      user: username,

      password: password
    }
  };

  let sql_district="";

  let sql_zone="";

  let sql_facility="";

  request(options, function (err, res, body) {
    if (err) {
      error(err);
      return;
    }

  }).then(function(data){

    let datas=JSON.parse(data);

    sql_district='TRUNCATE province;';

    sql_zone='TRUNCATE zone_sante;';

    sql_facility='TRUNCATE facility;';

    datas['rows'].forEach(row => {

      let fa_code=row[1];

      let facility=row[6];

      let path=row[9];

      let level=row[10];

      let fa_coord=row[16];

   
      let pathElt=path.split("/");

      let dist_code;

      let zs_code;

      if(level ==2){//District level

        sql_district += 'INSERT INTO province(code,name) VALUES("'+fa_code+'","'+facility+'");'
      }
      else if(level == 3){//Health zone level

        pathElt.shift();//Remove country level

        let code_province=pathElt[1];

        sql_zone += 'INSERT INTO zone_sante(code,code_province,name) VALUES("'+fa_code+'","'+code_province+'","'+facility+'");'
      }else{//Facility level

        pathElt.shift();//Remove country level
        
        let code_zone=pathElt[2];

        sql_facility += 'INSERT INTO facility(code,code_zone,name) VALUES("'+
                        fa_code+'","'+code_zone+'","'+facility+'");'
      }
      
    });

    db.query(`${sql_district}  ${sql_zone} ${sql_facility}`,function(error,results){

      if(error)throw error;

      sql="INSERT INTO sync(sync_date) VALUES(NOW())";

      db.query(sql,function(error,data){ 

        if(error)throw error;

        res.status(200);

      });
      //res.redirect('/sync');
      /*res.status(200);*/
    });
   
  })
});

router.get('/getTX_CURR/:fosa_code', function(req, res, next) {

  res.json({'cohorte':'0'});
  return;

  let org_unit=req.params.fosa_code;

  let cohorte=0;

  let username = USER;

  let password = PASSWORD;

  let currDate=new Date();

  let year=currDate.getFullYear();

  let month=currDate.getMonth()+1;

  let pe=year+""+month;

  //console.log(period);

  let period="201810";

  let dataset="vgbKdGif2Vj";

  let dataElement="HSTM4lrJ08N";

  let options = {

    url: DHIS2_URL+'dataValueSets.json?dataSet='+dataset+'&period='+period+'&orgUnit='+org_unit,

    auth: {

      user: username,

      password: password
    }
  };

  request(options, function (err, res, body) {
    if (err) {
      error(err);
      console.log("ERROR "+error);
      //return;
    }

  }).then(function(data){

    let datas;

    if(data){

      datas=JSON.parse(data);
    }
    if(datas['dataValues']){

      datas['dataValues'].forEach(row => {

        let de=row.dataElement;
  
        let dv=row.value;
  
        if(de == dataElement){
  
          cohorte+= parseInt(dv);
        }
      })
      res.json(cohorte);
    }
  });
  
});

function requestTest(api_url, user_name, password, success, error) {

  var request = require('request');
  var username = user_name;
  var password = password;
  var options = {
    url: api_url,
    auth: {
      user: username,
      password: password
    }
  };

  request(options, function (err, res, body) {
    if (err) {
      error(err);
      return;
    }
    success(body);
    return;
  });
}
module.exports = router;
