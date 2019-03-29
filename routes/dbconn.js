const mysql=require('mysql');

const connection=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"capuccino@",
    database:"fhr_ihap",
    multipleStatements:true
});

connection.connect(function(err){
    if(err)throw err
    console.log('You are connected');
});

module.exports=connection;