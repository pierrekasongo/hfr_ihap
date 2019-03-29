var express = require('express');
var request=require('request-promise');
var router = express.Router();
var session=require('express-session');

var db=require('./dbconn');

const DHIS2_URL = 'http://localhost:8080/api/sqlViews/UArf3DEsGm7/data.json?paging=false';

const USER = 'admin';

const PASSWORD = 'district';

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
/* GET home page. */
router.get('/', function(req, res, next) {

  /*sql="SELECT fd.type_institution as type,fd.procedure_soin as proc_soin, pr.name as province,zs.name as zone,fa.code as fa_code,fa.name as facility"+
  " FROM province pr, zone_sante zs, facility fa, facility_details fd WHERE fa.code_zone=zs.code"+
  " AND zs.code_province=pr.code AND fa.code=fd.code_facility";*/
  sql="SELECT pr.name as province,zs.name as zone,fa.code as fa_code,fa.name as facility"+
  " FROM province pr, zone_sante zs, facility fa WHERE fa.code_zone=zs.code "+
  " AND zs.code_province=pr.code";


    db.query(sql,function(error,data){                                                                                                                                                                                                                
      if(error)throw error;
      res.render('index', 
      { 
        districts: data,
        username:req.session.user
      }
    );
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
        res.render('config', { configs: data });
      })
    })
});

router.get('/config',  (req, res, next) => {

  sql="SELECT id,param, value FROM config";

    db.query(sql,function(error,data){                                                                                                                                                                                                                
      if(error)throw error;
      res.render('config', {
        configs: data,
        username:req.session.user
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
         username:req.session.user
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
        username:req.session.user
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

  let sql="SELECT noms,fonction, telephone, type FROM contact WHERE code_facility='"+fosaCode+"'";

  db.query(sql,function(error,data){
    
    let resData=data;

    res.json(resData);
  })
});

router.get('/getHoraire/:fosaCode', function(req,res,next){

  let fosaCode=req.params.fosaCode;

  let sql="SELECT jour,heure FROM horaire WHERE code_facility='"+fosaCode+"'";

  db.query(sql,function(error,data){
    
    let resData=data;

    res.json(resData);
  })
});

router.get('/getService/:fosaCode', function(req,res,next){

  let fosaCode=req.params.fosaCode;

  let sql="SELECT nom FROM service WHERE code_facility='"+fosaCode+"'";

  db.query(sql,function(error,data){
    
    let resData=data;

    res.json(resData);
  })
});

router.get('/getService/:fosaCode', function(req,res,next){

  let fosaCode=req.params.fosaCode;

  let sql="SELECT nom FROM service WHERE code_facility='"+fosaCode+"'";

  db.query(sql,function(error,data){
    
    let resData=data;

    res.json(resData);
  })
});

router.get('/geolocate/:fosaCode', function(req,res,next){

  let fosaCode=req.params.fosaCode;

  let sql="SELECT name as facility, type_institution as type, procedure_soin as proc_soin,"+
          "type_staff as staff, latitude,longitude FROM facility_details fd,"+
          "facility fa WHERE fa.code=fd.code_facility AND code_facility='"+fosaCode+"'";

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

    url: DHIS2_URL,

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
