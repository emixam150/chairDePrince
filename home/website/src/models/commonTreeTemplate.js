/*
 * Common Tree Template Model
 */

var fs = $.require('fs');

var paths = require($.paths);
var object = require(paths.config + '/commonTemplates.json'),
    root = "head"

var mapTree = function(temp, temps, queriesTemp, cb){
    var children = temp.children,
	childrenNumber = children.length,
	childrenCpt = 0,
	childrenObject = []
    if(childrenNumber == 0){
	constructTemp(temp, childrenObject, queriesTemp,function(object){
	    cb(object);
	})
    }
    children.forEach(function(childName){
	mapTree(temps[childName], temps, queriesTemp, function(childObject){
	    childrenCpt ++
	    childrenObject.push(childObject)
	    if(childrenCpt == childrenNumber){
		constructTemp(temp,childrenObject,  queriesTemp, function(object){
		    cb(object)
		})
	    }
	});
    });
}; 


var constructTemp = function(temp, childrenObject, queriesTemp, cb){
    fs.readFile(paths.html + '/' + temp.file, function (err, tempFile) {
	if (err) throw err;

	var object = temp;
	object.children = childrenObject;
	delete object.file;
	object.content = tempFile.toString();

	var queryNumber = Object.keys(temp.queries).length,
	    queryCpt = 0;

	for(var queryIndex in temp.queries){
	    queryCpt ++;
	    if(typeof queriesTemp[queryIndex] != "undefined"){
		switch(typeof temp.queries[queryIndex]){
		case "string" :
		    object.queries[queryIndex] = queriesTemp[queryIndex];
		    break;
		    case "boolean" :
		    object.queries[queryIndex] = queriesTemp[queryIndex];
		    break;
		case "object":
		    object.queries[queryIndex] = temp.queries[queryIndex].concat(queriesTemp[queryIndex]);
		    break;
		}
	    }

	    if(queryCpt == queryNumber)
		cb(object);
	    }

	    if( queryNumber == 0)
		cb(object);
    })
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

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

exports.constructTree = function(queriesTemp, cb){
    var temps = clone(object);
    
    mapTree(temps[root], temps, queriesTemp, function(temp){
	cb(temp);
    });
};
