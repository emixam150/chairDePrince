/*
 *Templates Model
 */

var Mustache = $.require('mustache');

var paths = require($.paths),
    domain = require('domain');


var mapNext = function(temp, mapTemp, cb){
    var children = temp.children;
    if(typeof children !='undefined'){
	var childrenNumber =  Object.keys(children).length,
	    childrenCpt = 0;
	if(childrenNumber == 0){
	    mapTemp(temp, cb);
	}

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

    compileMustache(temp, function(output){
//	console.log(output)
	if(typeof temp.parent != "undefined"){
	    temp.parent.queries[temp.id] = output; //l'id est indicateur dans le contenu 
	    cb();
	}else cb(output); //on est a la racine
    });
};

var compileMustache = function(temp, cb){
//    var d = domain.create();
//    d.on('error',function(err){
//	console.error("Mustache error", err);
//	cb("")
  //  })
   // d.run(function(){
	var output = Mustache.render(temp.content, temp.queries);
	cb(output);
   // })
};

exports.constructOutput = function(tempTree, cb){
    
    mapNext(tempTree, mapTemp, function(output){
	cb(output);
    });
};
