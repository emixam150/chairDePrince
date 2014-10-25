/*
 * Controller du panneau droit de l'accueil admin
*/

var paths = require($.paths);
var fs = require('fs');


exports.exec = function(support,cb){
    fs.readFile(paths.html +'/admin/accueil-right.html',function(err, data){
	if(err) throw err;
	fs.readFile(paths.html +'/message.txt',function(err,messages){
	    if(err) throw err;

	    var rightAccueil = {
		id:"right",
		type:"part",
		children:{},
		queries:{
		    title: "Messages",
		    messages: messages.toString()
		},
		content:data.toString()
	    };
	    
	    cb(rightAccueil);
	});
    });
}
