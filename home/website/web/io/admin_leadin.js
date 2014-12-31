
var paths = require($.paths),
tempModel = require(paths.models + '/template.js'),
LeadIn = require(paths.models + '/leadin.js'),
fs = require('fs');


exports.exec = function(socket){

     var current = null
//     currentIntervalMath = null,
//     htmlMath = '',
//     mathEltDisplay = require(paths.controllers + '/math/math-elt-display.js'),
//     isRefreshing = false;
    
//     socket.on('start',function(){
// 	fs.readFile(paths.html +'/math/math-elt.html','utf8',function(err, data){
// 	    if(err) throw err;
// 	    htmlMath = data
// 	})
// 	socket.emit('mathLoading');
//     })

     socket.on('list',function(){
 	buildList(function(list){
 	    socket.emit('list',list);
 	})
     });
    
     //mise en place de la connexion

     socket.on('new', function(){
 	newElt = new LeadIn();
 	newElt.addThis('',function(err,result){
	    if(err){
		socket.emit('warning','Adding failed: '+err.message);
 	    }else{
 		current = newElt;
 		buildList(function(list){
 		    socket.emit('list',list);
 		})
 		socket.emit('new', {content: current.content,
 				    bornDate: current.bornDate,
 				    lastUpdate: current.lastUpdate})
 	    }
 	})
     })
    
     socket.on('get', function(id){
	 var l = new LeadIn();
 	 var loadingElt = new LeadIn()
 	loadingElt.get(id, function(err){
 	    if(err){
 		socket.emit('warning', 'Loading  failed: '+err.message)
 	    }else{
 		buildList(function(list){
 		    socket.emit('list',list);
 		})
 		current = loadingElt;
// 		refreshDisplay()
 		    socket.emit('new', {content: current.content,
 					bornDate: current.bornDate,
 					lastUpdate: current.lastUpdate,
					sections: current.sections})

 	    }
 	})
     })

    socket.on('sectionsChange', function(ob){
	current.sectionsChange(ob.section,function(err){;})
    })
    
     var oldSectionKey = "",
     OldContent = " " ,
     isTipping = false

     socket.on('update', function(content){
 	 if(current != null){
	     OldContent = content    // on stocke
	     if(!isTipping){ // ca fait plus d'une sec

		 isTipping = true
		 setTimeout(function(){
		     isTipping = false
		     current.updateThis(OldContent,function(err){
			 //refreshDisplay()
			 if(err)
			     socket.emit('warning',"impossible to upadate the content  : "+ err.message)
			 else
			     socket.emit('subTreeUpdated')
		     })		
		 },1000)
	     }
	 }
     })
    
// 	}
//     })
    
//     var completContent = function(tree, type, content, cb){
// 	if(tree.type == type)
// 	    tree.content = content;
// 	var nbChildren = tree.children.length,
// 	indexChildren = 0;
// 	for(var child in tree.children){
// 	    completContent(tree.children[child], type, content, function(){
// 		indexChildren ++;
// 		if(nbChildren == indexChildren)
// 		    cb();
// 	    });
// 	}
// 	if(nbChildren == 0)
// 	    cb();
//     };

// }// end of function exec

 var buildList = function(cb){
     //listage
     var lIn = new LeadIn(),
     limitSize = 100000,
     query ={},
     projection = {content: 1 };
    
     lIn.findPlus(query, projection, { lastUpdate: -1 }, limitSize, function(docs){
 	var list = [],
 	cpt = 0;
 	 for(var elt in docs){
 	     list.push({content: docs[elt].content,
 			id: String(docs[elt]._id)});
 	     cpt++;
 	     if(cpt == docs.length)
 		cb(list)
	 }
	 if(docs.length == 0)
	     cb(list)
     })
 }

// var extractParentsList = function(mathElt,cb){
//     var parentsList =[],
//     cpt = 0
//     mathElt.content.parents.forEach(function(parentId){
// 	var parent = new MathOb()
// 	parent.getById(parentId, function(){
// 	    parentsList.push(parent.name)
// 	    cpt++
// 	    if(mathElt.content.parents.length == cpt)
// 		cb(parentsList)
// 	})
//     })
//     if(mathElt.content.parents.length == 0)
// 	cb(parentsList)
// }

// function clone(obj) {
//                 // Handle the 3 simple types, and null or undefined             
//     if (null == obj || "object" != typeof obj) return obj;

//                 // Handle Date                                                  
//     if (obj instanceof Date) {
// 	var copy = new Date();
//         copy.setTime(obj.getTime());
// 	return copy;
//     }

//                 // Handle Array                                                 
//     if (obj instanceof Array) {
//         var copy = [];
//         for (var i = 0, len = obj.length; i < len; i++) {
//             copy[i] = clone(obj[i]);
//         }
//         return copy;
//     }

//                 // Handle Object                                                
//     if (obj instanceof Object) {
//         var copy = {};
//         for (var attr in obj) {
//             if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
//         }
//         return copy;
//     }
}
