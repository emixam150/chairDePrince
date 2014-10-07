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
    Math = require(paths.models + '/math.js'),
    fs = require('fs');
var listMath = [];
exports.execSocket= function(socket){


    var currentMath = null;
    socket.on('math',function(){
	//mise en place de la connexion
	socket.emit('math',currentMath.content:null);
	socket.on('newTitleMath', function(title){
	    currentMath = new Math(title);
	    currentMath.addThis(function(result){
		if(typeof result != 'undefined'){
		    socket.emit('newContentMath', currentMath.content);
		    setInterval(function(){currentMath.updateThis(currentMath.content);},1000);
		}else{
		    currentMath = null;
		    socket.emit('math',null);
		}
	    });
	});
	
	socket.on('loadName', function(name){
	    currentMath = new Math();
	    currentMath.getByName(name, function(result){
		if(typeof result != 'undefined'){
		    socket.emit('newContentMath', currentMath.content);
		    setInterval(function(){currentMath.updateThis(currentMath.content);},1000);
		}else{
		    currentMath = null;
		    socket.emit('math', null);
		}
	    });
	});

	socket.on('refreshMath',function(content){console.log(currentMath);

	    var len = content.tree.children.length;
	    for(var i = 0; i < len; i++ )
		content.tree.children[i] &&  content.tree.children.push( content.tree.children[i]);
	    content.tree.children.splice(0 , len);

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

	    // creation du rendu html
	    
	    var completContent = function(tree, type, content, cb){
		if(tree.type == type)
		    tree.content = content;
		var nbChildren = tree.children.length,
		    indexChildren = 0;
		for(var child in tree.children){
		    completContent(tree.children[child], type, content, function(){
			indexChildren ++;
			if(nbChildren == indexChildren)
			    cb();
		    });
		}
		if(nbChildren == 0)
		    cb();
	    };

	    currentMath.content = clone(content);
	    fs.readFile(paths.html +'/math/section.html',function(err, section){
		if(err) throw err;
		content.tree.queries = content.title;
		content.tree.content = section.toString();
		fs.readFile(paths.html +'/template/figure.html',function(err, figTemp){
		    if(err) throw err;
		    completContent(content.tree, 'figure', figTemp.toString(), function(){
			tempModel.constructOutput(content.tree, function(output){
			    socket.emit('refreshMath',output);
			});
		    });
		});
	    });
	});
    });

    socket.on('listOfMath',function(){
	currentMath.find({},function(listOfElt){
	    var listOfMath = [],
		cpt = 0;
	    for(var elt in listOfElt){
		if( String(listOfElt[elt]._id) != String(currentMath._id)
		   && typeof listOfElt[elt].content.title != 'undefined'){
		listOfMath.push({name: listOfElt[elt].name,
				 title: listOfElt[elt].content.title});
		}
		cpt++;
		if(cpt == listOfElt.length)
		    socket.emit('listOfMath',listOfMath);
	    }
	});
    });
}
