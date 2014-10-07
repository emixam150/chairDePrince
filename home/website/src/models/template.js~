/*
 *Templates Model
 */

var Mustache = $.require('mustache');

var paths = require($.paths);


var mapNext = function(temp, mapTemp, cb){
    var children = temp.children;
    var childrenNumber = children.length,
	childrenCpt = 0;  
    if(childrenNumber == 0){
	mapTemp(temp, cb);
    }
    children.forEach(function(child){
	    child.parent = temp;
	    mapNext(child, mapTemp, function(){
		childrenCpt ++;
		if(childrenCpt == childrenNumber)
		    mapTemp(temp, cb);	
	    });
	});
}; 

var mapTemp = function(temp, cb){
    compileMustache(temp, function(output){
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
