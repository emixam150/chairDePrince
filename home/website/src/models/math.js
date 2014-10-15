/*
 * Model user
 */
var dbName = "main",
enName = "math",
MongoSession = require(__dirname +'/mongoSession.js');


module.exports = function Math(title, bornDate, lastUpdate, content) {
    
    MongoSession.call(this, enName, dbName);

    this.name = (typeof title !='undefined')? simplify(title) : '';
    this.bornDate =(typeof bornDate !='undefined')? bornDate : new Date();
    this.lastUpdate =(typeof lastUpdate !='undefined')? lastUpdate : new Date();
    this.content = (typeof content !='undefined')?content: {title:title};

    this.addThis = function(callback){ 
	var math = this,
	query = { name: this.name};
	this.find(query, function(docs){
	    if(docs.length == 0){
		math.add(math, function(){
		    callback(math);
		});
	    }
	    else
		callback();
	});
    };
    
    this.updateThis = function(newContent, cb){
	if(typeof newContent.title != "undefined" && newContent.title != "" && newContent.title != null){
	    var math = this,
	    query = { _id: this._id},
	    queryTest = { name: simplify(newContent.title)};
	    math.find(queryTest, function(docs){
		if(docs.length == 0 || String(docs[0]._id) == String(math._id)){
		    math.content = newContent;
		    math.lastUpdate = new Date();
		    math.name = simplify(newContent.title);
		    math.update(query, math, function(result){
			if(result != 0)
			    if(typeof cb != 'undefined') 
				cb(math);
			else
			    if(typeof cb != 'undefined')
				cb();
		    });
		}else
		    if(typeof cb != 'undefined')
			cb();
	    });
	}
    };

    this.removeThis = function(){ this.remove({_id :this._id}); };

    this.getByName = function(name,callback){
	var math = this,
	query = {"name": name};
	this.find(query ,function(docs){
	    if(docs.length == 1){
		math.name = docs[0].name;
		math.bornDate = docs[0].bornDate;
		math.lastUpdate = docs[0].lastUpdate;
		math.content = docs[0].content;
		math._id = docs[0]._id;
		callback(math);
	    }else callback();
	});
    };
    this.translateTypeColor = function(type){
	var result = 'black';
	switch(type){
	case 'prop': result = '#0D0FB6'
	    break;
	case 'th': result = '#C20707'
	    break;
	case 'lem': result = '#610DB6'
	    break;
	case 'cor': result = '#FF4000'
	    break;
	case 'def': result = '#01DF01'
	    break;
	case 'axiom': result = '#CADC09'
	    break;
	case 'conj': result = '#2C2C2C'
	    break;
	default: result = 'pink'
	    break;
	}
	return result;
    };

    this.translateTypeName = function(type){
	var result = '';
	switch(type){
	case 'prop': result = 'propriété'
	    break;
	case 'th': result = 'théorème'
	    break;
	case 'lem': result = 'lemme'
	    break;
	case 'cor': result = 'corollaire'
	    break;
	case 'def': result = 'définition'
	    break;
	case 'axiom': result = 'axiome'
	    break;
	case 'conj': result = 'conjecture'
	    break;
	default: result = ''
	    break;
	}
	return result;
    };
};


function simplify(title){
    var simpleName = title.trim();

    simpleName = simpleName.replace(/ /g,'_');
    simpleName = simpleName.replace(/[èéêë]/g,"e");
    simpleName = simpleName.replace(/[àâä]/g,"a");
    simpleName = simpleName.replace(/[ûüù]/g,"u");
    simpleName = simpleName.replace(/ç/g,"c");
    simpleName = simpleName.replace(/[ôö]/g,"o");
    simpleName = simpleName.replace(/[ïî]/g,"i");
    simpleName = simpleName.replace(/['\\$:;,\?\.\!]/g,"");
    return simpleName.toLowerCase();
}
