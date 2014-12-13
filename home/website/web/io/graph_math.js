
// Browser of Math

var paths = require($.paths),
MathOb = require(paths.models + '/math.js')

exports.exec = function(socket){

    socket.on('reqMB', function(req){

	var MathBrowser = new MathOb(),
	limitSize = 1997,
	projection = {name: 1, 
		      'content.parents': 1, 
		      'content.children': 1,
		      'content.title': 1,
		      'content.type': 1
		     };
	buildQuery(req, function(query){

	    MathBrowser.findPlus(query, projection, { lastUpdate: 1 }, limitSize, function(docs){
		responseCreator(docs, function(res){
		    socket.emit('resMB',res);
		}); //end of constructGraphObjet
	    }); //end of MathOb.findSort
	}); //end of onGraphMath
    }); //end of buildQuery
}


function buildQuery(req,cb){
    var query ={};
    query['content.type'] = {$in: req.types};
    console.log(query);
    cb(query);
}

function responseCreator(docs, cb){
    var res = {}, nameFromId = {}, cpt = 0, mathStyle = new MathOb();
    
    docs.forEach(function(mathElt){
	nameFromId[String(mathElt._id)] = mathElt.name
	res[mathElt.name] = {}
	res[mathElt.name].title = mathElt.content.title
	res[mathElt.name].type = mathStyle.translateTypeColor(mathElt.content.type)
	res[mathElt.name].children = mathElt.content.children
	cpt++;
	if(docs.length == cpt)
	    responseCleaner(res,nameFromId,cb)
    })
    if(docs.length == 0)
	cb(res);
}

function responseCleaner(res, nameFromId, cb){
    
    var cpt= 0;
    
    Object.keys(res).forEach(function(key){
	checkGenerations(res[key],nameFromId ,function(){
	    cpt ++;
	    if(Object.keys(res).length == cpt)
		cb(res)
	})
    }); // end of forEach mathCont
}

function checkGenerations(content, nameFromId, cb){
    var cpt = 0;
    content.children.forEach( function(childId,index){
	if(nameFromId[String(childId)])
	    content.children[index] = nameFromId[String(childId)];
	cpt++
	if(cpt == content.children.length){
	    cb();
	}
    })
    if(content.children.length == 0)
	cb();
}


