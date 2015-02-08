/*
 * Controller du panneau droit de l'accueil admin
*/

var paths = require($.paths);
var fs = require('fs');


exports.exec = function(support,cb){
    fs.readFile(paths.html +'/admin/blog-left.html',function(err, left){
	if(err) throw err;
	fs.readFile(paths.html +'/admin/blog-center.html',function(err,center){
	    if(err) throw err;
	    fs.readFile(paths.html +'/admin/blog-right.html',function(err,right){
		if(err) throw err;
	    fs.readFile(paths.js +'/admin/blog.js',function(err,mathJs){
		if(err) throw err;		    

		var mathLeft = {
		    id:"left",
		    type:"part",
		    children:{},
		    queries:{
		    },
		    content:left.toString()
		},
		    mathCenter = {
			id:"center",
			type:"part",
			children:{},
			queries:{
			},
			content:center.toString()
		    },	    
		    mathRight = {
			id:"right",
			type:"part",
			children:{},
			queries:{
			},
			content:right.toString()
		    };
		
		cb(mathLeft,mathCenter,mathRight,mathJs);
	    });
	});
    });
    });
}
