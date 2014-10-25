/*
 * Controller du panneau droit de l'accueil admin
*/

var paths = require($.paths);
var fs = require('fs');


exports.exec = function(support,cb){
    fs.readFile(paths.html +'/admin/accueil-center.html',function(err, data){
	if(err) throw err;
	fs.readFile(paths.logs +'/frequentation.txt',function(err,freq){
	    if(err) throw err;
	    fs.readFile(paths.logs +'/login.txt',function(err,login){
	    if(err) throw err;
		fs.readFile(paths.logs +'/registration.txt',function(err,inscrip){
	    if(err) throw err;
		    
	    var centerAccueil = {
		id:"center",
		type:"part",
		children:[],
		queries:{
		    title: "Logs",
		    frequentation: freq.toString().replace(/[\n]/gi,'<br/>'),
		    login:login.toString().replace(/[\n]/gi,'<br/>'),
		    registration: inscrip.toString()		    
		},
		content:data.toString()
	    };
	    
	    cb(centerAccueil);
		});
	    });
	});
    });
}
