/*
 *Templates Model
 */

var Mustache = $.require('mustache');

var paths = require($.paths);


var mapNext = function(temp, mapTemp, cb){
    var children = temp.children;
    if(typeof children !='undefined'){
	var childrenNumber =  Object.keys(children).length,
	    childrenCpt = 0;
	if(childrenNumber == 0){
	    mapTemp(temp, cb);
	}
//	    console.log(children)
	Object.keys(children).forEach(function(childName){
	    children[childName].parent = temp;
	    mapNext(children[childName], mapTemp, function(){
		childrenCpt ++;
		if(childrenCpt == childrenNumber)
		    mapTemp(temp, cb);	
	    });
	});
    }else
	mapTemp(temp,cb);
}; 

var mapTemp = function(temp, cb){
//    console.log(temp)
    compileMustache(temp, function(output){
//	console.log(output)
	if(typeof temp.parent != "undefined"){
	    temp.parent.queries[temp.id] = output; //l'id est indicateur dans le contenu 
	    cb();
	}else cb(output); //on est a la racine
    });
};

var compileMustache = function(temp, cb){
	var output = Mustache.render(temp.content, temp.queries);
	cb(output);
};

exports.constructOutput = function(tempTree, cb){
    
    mapNext(tempTree, mapTemp, function(output){
	cb(output);
    });
};
