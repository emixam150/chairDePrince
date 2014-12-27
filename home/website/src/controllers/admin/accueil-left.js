/*
 * Controller du panneau gauche de l'accueil admin
*/

var paths = require($.paths);
var fs = require('fs');


exports.exec = function(support,cb){
    fs.readFile(paths.html +'/admin/accueil-left.html',function(err, data){
	if(err) throw err;

	var leftAccueil = {
	    id:"left",
	    type:"part",
	    children:{},
	    queries:{
		title: "Navigation",
		links:[
		    {name: 'math',
		     link:'/admin/math'},
		    {name: 'accroche',
		     link:'/admin/leadin'},
		    {name: 'blog',
		     link:'/admin/blog'}
		]
	    },
	    content:data.toString()
	};
	
	cb(leftAccueil);
    });
}
