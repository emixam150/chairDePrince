var app = require('./app.js');

global.isload = 0; //0:no load,1:loaded,2:loading

function lancement(req,res,srv,body){
    if(isload == 1){
	app.start(req, res, srv, body);
    }else if(isload == 0){
	isload = 2;
	var next = function(){isload = 1;
			      console.log('ressources loaded');
			      app.start(req, res, srv,body);
			     };
	app.load(next);
    }else{
	res.end('Wait please and retry');
    }

}

exports.run = function(req, res, srv, ioServer) {
    //on s'occupe des methodes POST
    if(req.method == 'POST'){
	var body = '';
	req.on('data', function(data) {
	    body += data;
	    if(body.length > 1e6) {
		body = '';
		res.writeHead(413, {'Content-Type': 'text/plain'});
		res.end();
		req.connection.destroy();
	    }
	});
	req.on('end',function(){
	    lancement(req,res,srv,body);
	});
    }else {
	lancement(req,res,srv,null);
    }
};


/*
 * Socket IO
 */


var paths = require($.paths),
tempModel = require(paths.models + '/template.js'),
MathOb = require(paths.models + '/math.js'),
adminMath = require(paths.io + '/admin_math.js'),
graphMath = require(paths.io + '/graph_math.js'),
fs = require('fs');
var listMath = [];


 var list = new MathOb();

 // list.find({},function(listOfElt){
 //     var cpt =1
 //     listOfElt.forEach(function(elt){
 // 	 cpt ++
 // 	 var test = new  MathOb()
 // 	 setTimeout(function(){
 // 	 test.getByName(elt.name,function(){
 // 	     var parents =[],
 // 	     children =[]
	     
 // 	     test.content.children.forEach(function(childName){
 // 		 var child = new MathOb()
 // 		 child.getByName(childName,function(){
 // 		     children.push(String(child._id))
 // 		 })
 // 	     })
 // 	     test.content.parents.forEach(function(parentName){
 // 		 var parent =new MathOb()
 // 		 parent.getByName(parentName,function(){
 // 		     parents.push(String(parent._id))
 // 		 })
 // 	     })
	     
 // 	     setTimeout(function(){
 // 		 console.log(parents)
 // 		 console.log(children)
 // 		 test.content.parents = parents
 // 		 test.content.children = children
 // 		 test.updateThis()
 // 	     },1000)
 // 	 })
 // 	 },500*cpt)
 //     })
 // })

exports.execSocket= function(socket){

    switch(socket.request.headers.referer){
    case 'http://cheredeprince.net/admin/math':
	adminMath.exec(socket)
	break
    case 'http://cheredeprince.net/math-browser':
	graphMath.exec(socket)
	break
    default:
	break
    }

    }//end of socket function	      


	      function clone(obj) {
		  // Handle the 3 simple types, and null or undefined
		  if (null == obj || "object" != typeof obj) return obj;

		  // Handle Date
		  if (obj instanceof Date) {
		      var copy = new Date();
		      copy.setTime(obj.getTime());
		      return copy;
		  }

		  // Handle Array
		  if (obj instanceof Array) {
		      var copy = [];
		      for (var i = 0, len = obj.length; i < len; i++) {
			  copy[i] = clone(obj[i]);
		      }
		      return copy;
		  }

		  // Handle Object
		  if (obj instanceof Object) {
		      var copy = {};
		      for (var attr in obj) {
			  if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
		      }
		      return copy;
		  }

		  throw new Error("Unable to copy obj! Its type isn't supported.");
	      }
