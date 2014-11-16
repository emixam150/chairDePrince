
var paths = require($.paths),
tempModel = require(paths.models + '/template.js'),
MathOb = require(paths.models + '/math.js'),
fs = require('fs');
var listMath = [];


exports.exec = function(socket){

    var currentMath = null,
    currentIntervalMath = null,
    htmlMath = '',
    mathEltDisplay = require(paths.controllers + '/math/math-elt-display.js'),
    isRefreshing = false;
    
    socket.on('math',function(){
	fs.readFile(paths.html +'/math/math-elt.html','utf8',function(err, data){
	    if(err) throw err;
	    htmlMath = data
	})
	socket.emit('mathLoading');
    })

    socket.on('listOfMath',function(){
	emitListOfMath(function(listOfMath){
	    socket.emit('listOfMath',listOfMath);
	})
    });
    
    //mise en place de la connexion
    socket.on('newTitleMath', function(title){
	newMath = new MathOb();
	newMath.addByTitle(title,function(err,result){
	    if(err){
		socket.emit('warning','Adding '+ title +' failed: '+err.message);
	    }else{
		console.log('newElementMath :' + title);
		currentMath = newMath
		emitListOfMath(function(listOfMath){
		    socket.emit('listOfMath',listOfMath);
		})
		socket.emit('newContentMath', {content: currentMath.content,
					       parents: [],
					       bornDate: currentMath.bornDate,
					       lastUpdate: currentMath.lastUpdate})
	    }
	})
    })
    
    socket.on('loadNameMath', function(name){
	loadingMath = new MathOb()
	loadingMath.getByName(name, function(err,result){
	    if(err){
		socket.emit('warning', 'Loading  '+ name + ' failed: '+err.message)
	    }else{
		emitListOfMath(function(listOfMath){
		    socket.emit('listOfMath',listOfMath);
		})
		currentMath = loadingMath
		refreshDisplay()
		extractParentsList(currentMath,function(parentsList){
		    socket.emit('newContentMath', {content: currentMath.content,
						   parents: parentsList,
						   bornDate: currentMath.bornDate,
						   lastUpdate: currentMath.lastUpdate})
		})
	    }
	})
    })

    var refreshDisplay = function(){

     	if(currentMath != null){
     	    // creation du rendu html
     	    var mathToWork = clone(currentMath);
     		 mathEltDisplay.exec(mathToWork, htmlMath, function(section){
     		     //fs.readFile(paths.html +'/template/figure.html',function(err, figTemp){
     		     //if(err) throw err;
    		     //completContent(mathToWork.content.tree, 'figure', figTemp.toString(), function(){
     		     tempModel.constructOutput(section, function(output){
     			 socket.emit('refreshDisplay',output);
     		     });
     		 });
	    // 				//		});
	    // 			    });
	    // 			}
	    // 		    });
	    // 	    });
     	}
    };
    
    socket.on('addSubTree', function(sectionKey){
	if(currentMath != null){
	    currentMath.addSubTree(sectionKey,function(err){
		refreshDisplay()
		if(err)
		    socket.emit('warning',"impossible to add the subTree "+ sectionKey + " : " + err.message)
		else
		    socket.emit('subTreeAdded',sectionKey)
	    })
	}
    })

    socket.on('rmSubTree', function(sectionKey){
	if(currentMath != null){
	    currentMath.rmSubTree(sectionKey,function(err){
		refreshDisplay()
		if(err)
		    socket.emit('warning',"impossible to remove the subTree "+ sectionKey + " : " + err.message)
		else
		    socket.emit('subTreeRemoved',sectionKey)
	    })
	}
    })

    var oldSectionKey = "",
    OldContent = " " ,
    isTipping = false

    socket.on('updateSubTree', function(sectionKey, newContent){
	if(currentMath != null){
	    if(oldSectionKey != sectionKey){ // on a changé de subTree
		if(oldSectionKey != ""){ // si on a pas init
		    currentMath.updateSubTree(oldSectionKey, OldContent,function(err){
			refreshDisplay()
			if(err)
			    socket.emit('warning',"impossible to upadate the subTree " + oldSectionKey+ " : "+ err.message)
			else
			socket.emit('subTreeUpdated')
		    })
		}
		currentMath.updateSubTree(sectionKey, newContent,function(err){
		    refreshDisplay()
		    oldContent = newContent // initialisation
		    oldSectionKey = sectionKey
		    if(err)
			socket.emit('warning',"impossible to upadate the subTree " + oldSectionKey+ " : "+ err.message)
		    else
			socket.emit('subTreeUpdated')
		})
	    }else{
		oldContent = newContent    // on stocke
		if(!isTipping){ // ca fait plus d'une sec
		    isTipping = true
		    setTimeout(function(){
			isTipping = false
			currentMath.updateSubTree(oldSectionKey, oldContent,function(err){
			    refreshDisplay()
			    if(err)
				socket.emit('warning',"impossible to upadate the subTree " + sectionKey+ " : "+ err.message)
			    else
				socket.emit('subTreeUpdated')
			})		
		    },1000)
		}
	    }
	}
    })

    socket.on('removeParent',function(parentName){
	if(currentMath != null){
	    currentMath.removeParentByName(parentName,function(err){
		refreshDisplay()
		if(err)
		    socket.emit('warning', 'impossible to remove parent ' + parentName + ': '+ err.message)
		else
		    socket.emit('parentRemoved',parentName)
	    })
	}
    })
    
    socket.on('addParent', function(parentName){
	if(!currentMath != null){
	    currentMath.addParentByName(parentName, function(err){
		refreshDisplay()
		if(err)
		    socket.emit('warning', 'impossible to add parent ' + parentName + ': '+ err.message)
		else
		    socket.emit('parentAdded',parentName)
	    })
	}
    })

    socket.on('changeTitle', function(title){
	var oldTitle  = currentMath.content.title
	if(currentMath != null){
	    currentMath.setTitle(title, function(err){
		refreshDisplay()
		if(err)
		    socket.emit('warning', 'impossible to change title of '+ oldTitle+ ' to '+title+' : '+ err.message)
		else
		    socket.emit('titleChanged',title)
	    })
	}
    })

    socket.on('changeType',function(type){
	var oldType = currentMath.content.type
	if(currentMath !=null){
	    currentMath.changeType(type,function(err){
		refreshDisplay()
		if(err)
		    socket.emit('warning', 'impossible to change type from '+oldType + ' to ' + type +' : '+ err.message)
		else
		    socket.emit('typeChanged',type)
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

}// end of function exec

var emitListOfMath = function(cb){
    //listage des éléments mathématiques
    var MathUseList = new MathOb(),
    limitSize = 100000,
    query ={},
    projection = {name: 1,
		  'content.title': 1
		 };
    
    MathUseList.findPlus(query, projection, { lastUpdate: -1 }, limitSize, function(listOfElt){
	var listOfMath = [],
	cpt = 0;
	for(var elt in listOfElt){
	    if( typeof listOfElt[elt].content.title != 'undefined'){
		listOfMath.push({name: listOfElt[elt].name,
				 title: listOfElt[elt].content.title});
	    }
	    cpt++;
	    if(cpt == listOfElt.length)
		cb(listOfMath)
	}
	if(listOfElt.length == 0)
	    cb(listOfMath)
    })
}

var extractParentsList = function(mathElt,cb){
    var parentsList =[],
    cpt = 0
    mathElt.content.parents.forEach(function(parentId){
	var parent = new MathOb()
	parent.getById(parentId, function(){
	    parentsList.push(parent.name)
	    cpt++
	    if(mathElt.content.parents.length == cpt)
		cb(parentsList)
	})
    })
    if(mathElt.content.parents.length == 0)
	cb(parentsList)
}

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
}