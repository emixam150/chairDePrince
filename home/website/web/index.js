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
fs = require('fs');
var listMath = [];


var list = new MathOb();

// list.find({},function(listOfElt){
//     var eq = {};
//     listOfElt.forEach(function(elt){
// 	    eq[elt.name] = elt._id;
//     })
//     setTimeout(function(){
// 	listOfElt.forEach(function(elt){
// 	    if(typeof elt.content.children != 'undefined'){
// 		elt.content.children.forEach(function(parent,index){
// 		    elt.content.children[index] = eq[parent]
// 		})
// 	    }
// 	})
// 	setTimeout(function(){  
// 	    listOfElt.forEach(function(elt){
// 		console.log(elt.content.children);
// 	    })},2000)
//     },2000)
// })

exports.execSocket= function(socket){

    var currentMath = null,
    currentIntervalMath = null,
    htmlMath = '',
    mathEltDisplay = require(paths.controllers + '/math/math-elt-display.js');
    
    socket.on('math',function(){
	fs.readFile(paths.html +'/math/math-elt.html','utf8',function(err, data){
	    if(err) throw err;
	    htmlMath = data
	})
	socket.emit('mathLoading');
    })

    var emitListOfMath = function(){
	//listage des éléments mathématiques
	var MathUseList = new MathOb();
	MathUseList.find({},function(listOfElt){
	    var listOfMath = [],
	    cpt = 0;
	    for(var elt in listOfElt){
		if( typeof listOfElt[elt].content.title != 'undefined'){
		    listOfMath.push({name: listOfElt[elt].name,
				     title: listOfElt[elt].content.title});
		}
		cpt++;
		if(cpt == listOfElt.length)
		    socket.emit('listOfMath',listOfMath);
	    }
	    if(listOfElt.length == 0)
		socket.emit('listOfMath',listOfMath);
	})
    }

    socket.on('listOfMath',function(){
	emitListOfMath()
    });
    
    //mise en place de la connexion
    socket.on('newTitleMath', function(title){
	newMath = new MathOb(title);
	newMath.addThis(function(err,result){
	    if(err){
		socket.emit('mathWarning','Adding '+ title +' failed: '+err.message);
	    }else{
		console.log('newElementMath :' + title);
		currentMath = newMath
		emitListOfMath()
		socket.emit('newContentMath', {content: currentMath.content,
					       bornDate: currentMath.bornDate,
					       lastUpdate: currentMath.lastUpdate})
	    }
	})
    })
    
    socket.on('loadNameMath', function(name){
	loadingMath = new MathOb();
	loadingMath.getByName(name, function(err,result){
	    if(err){
		socket.emit('mathWarning', 'Loading  '+ name + ' failed: '+err.message)
	    }else{
		emitListOfMath()
		currentMath = loadingMath
		socket.emit('newContentMath', {content: currentMath.content,
					       bornDate: currentMath.bornDate,
					       lastUpdate: currentMath.lastUpdate})
	    }
	})
    })

    socket.on('refreshMath',function(container){
	if(currentMath != null){
	    //mise à jour dans la base de donnée
	    currentMath.changeTree(container.tree,function(err){
		if(err)
		    socket.emit('mathWarning', 'errors during saving the tree : ' + err.message)
		else
		    currentMath.changeType(container.type,function(err){
			if(err)
			    socket.emit('mathWarning', 'errors during saving the type : ' + err.message)
			else{
			    // creation du rendu html
			    var mathToWork = clone(currentMath);
			    mathEltDisplay.exec(mathToWork, htmlMath, function(section){
				//		fs.readFile(paths.html +'/template/figure.html',function(err, figTemp){
				//		    if(err) throw err;
				//		    completContent(mathToWork.content.tree, 'figure', figTemp.toString(), function(){
				tempModel.constructOutput(section, function(output){
				    socket.emit('refreshMath',output);
				});
				//		    });
				//		});
			    });
			}
		    });
	    });
	}
    });
	
	socket.on('removeParentMath',function(parentName){
	    if(currentMath != null){
		currentMath.removeParentByName(parentName,function(err){
		    if(err){
			socket.emit('mathWarning', 'impossible to remove parent ' + parentName + ': '+ err.message)
		    }	    
		})
	    }
	})
	
	
	socket.on('addParentMath', function(parentName){
	    if(!currentMath != null){
		currentMath.addParentByName(parentName, function(err){
		    if(err)
			socket.emit('mathWarning', 'impossible to add parent ' + parentName + ': '+ err.message)
		})
	    }
	})

	socket.on('changeTitle', function(title){
	    if(currentMath != null){
		currentMath.changeTitle(title, function(err){
		    if(err)
			socket.emit('mathWarning', 'impossible to change title of '+ currentMath.content.title+ ' to '+title+' : '+ err.message)
		})
	    }
	})
	
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

	// Browser of Math

	socket.on('graphMath', function(){
	    var MathBrowser = new MathOb(),
	    limitSize = 1000;

	    MathBrowser.findSort(null, { _id: 1 } ,limitSize, function(docs){
		
		constructGraphObject(docs, function(graphObject){
		    socket.emit('dataGraphMath',graphObject);
		}); //end of constructGraphObjet
	    }); //end of MathOb.findSort
	}); //end of onGraphMath

    }//end of socket function

	      
	      function constructGraphObject(docs, cb){
		  var graphObject ={
		      nodes: [],
		      edges:[]
		  },
		  cpt= 0,
		  mathStyle = new MathOb();


		  docs.forEach(function(mathElt){
		      graphObject.nodes.push({
			  id: mathElt.name,
			  label: mathElt.content.title,
			  x: Math.random(),
			  y: Math.random(),
			  size: (typeof mathElt.content.children != 'undefined')? mathElt.content.children.length+1:1,
			  color: mathStyle.translateTypeColor(mathElt.content.type)
		      });
		      if(typeof mathElt.content.children != 'undefined'){
			  var subcpt = 0;
			  mathElt.content.children.forEach(function(childName){
			      graphObject.edges.push({
				  id: childName +'-'+ mathElt.name,
				  source : childName,
				  target: mathElt.name,
				  size: 1,
				  color: mathStyle.translateTypeColor(mathElt.content.type)
			      });
			      subcpt ++;
			      if(mathElt.content.children.length == subcpt)
				  next();
			  }); // end of forEach children

			  if(mathElt.content.children.length == 0)
			      next();
		      }// end of if children
		      else
			  next();
		  }); // end of forEach docs
		  
		  function next(){
		      cpt ++;
		      if(cpt == docs.length)
			  cb(graphObject);
		  }
		  if(docs.length == 0)
		      cb(graphObject);
	      };

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