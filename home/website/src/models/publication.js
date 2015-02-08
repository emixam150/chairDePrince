/*
 * Publication's Model 
 */
var MongoSession = require(__dirname +'/mongoSession.js'),
    Banniere  = require(__dirname +'/banniere.js');


module.exports = function Publication(enName, dbName) {
    
    MongoSession.call(this, enName, dbName);
    
    var pub = this;

    this.name = '';
    this.bornDate =  new Date();
    this.lastUpdate =  new Date();
    this.published = true;
    this.content =  {title: ""};
    this.banniere =  new Banniere(enName);

    // on ajout une publication à la base de donnée
    this.addByTitle = function(title,cb){ 
	if(title && title != ""){
	    var pub = this,
	    nameTest = simplify(String(title)),
	    query = { name: nameTest};
	    this.find(query, function(docs){
		if(docs.length == 0){
		    pub.content.title = title
		    pub.name = nameTest
		    pub.banniere.changeName(pub.name, function(err){
			pub.add(pub, function(){
			    cb(null,pub);
			})
		    })
		}else
		    cb(new Error("title already exists"));
	    })
	}else
	    cb(new Error("title is not valid"))
    };
    
    //met à jour le contenu de la publication suivant l'id sans vérification du contenu
    this.updateThis = function(cb){
	var pub = this,
	query = { _id: this._id} 
	pub.lastUpdate = new Date();
	pub.update(query, pub, function(result){
	    if(result != 0)
		if(typeof cb != 'undefined'){ 
		    cb(null,pub);
		}else
		    if(typeof cb != 'undefined')
			cb(new Error('no result for update'));
	})
    }

    this.removeThis = function(){ this.remove({_id :this._id}); };

    this.getByName = function(name,cb){
	var pub = this,
	query = {"name": name};
	this.find(query ,function(docs){
//	    console.log(docs[0].content.tree);
	    if(docs.length == 1){
		pub.name = docs[0].name;
		pub.bornDate = docs[0].bornDate;
		pub.lastUpdate = docs[0].lastUpdate;
		pub.published = (typeof docs[0].published == "boolean")? docs[0].published : true
		pub.content = docs[0].content;
		pub._id = docs[0]._id;
		pub.banniere.get(docs[0].name,function(err){    
		    cb(null,pub);
		})
	    }else
		if(docs.length == 0)
		    cb(new Error('no elt with this name :' + name))
	    else
		cb(new Error('several elts with this name'))
	});
    };

    this.getById = function(id,cb){
	var pub = this,
	query = { _id: pub.ObjectId(id)};
	this.find(query ,function(docs){
	    if(docs.length == 1){
		pub.name = docs[0].name;
		pub.bornDate = docs[0].bornDate;
		pub.lastUpdate = docs[0].lastUpdate;
		pub.published = (typeof docs[0].published == "boolean")? docs[0].published : true;
		pub.content = docs[0].content;
		pub._id = docs[0]._id;
		pub.banniere.get(docs[0].name, function(err){    
		    cb(null,pub);
		})
	    }else
		if(docs.length == 0)
		    cb(new Error('no elt with this id'))
	    else
		cb(new Error('several elts with this id!!'))
	});
    };

    this.setTitle = function(title, cb){
	if(title && title != ''){
	    var pub = this,
	    query = {name: simplify(String(title))}
	    pub.getById(pub._id,function(err){
		if(err)
		    cb(err)
		else{
		    if(pub.name == simplify(String(title))){
			pub.content.title = String(title)
			pub.updateThis(cb)
		    }else
		pub.find(query,function(docs){
			    if(docs.length == 0){
				pub.name = simplify(String(title))
				pub.content.title = String(title)
				pub.banniere.changeName(pub.name, function(err){
				    pub.updateThis(cb)
				})
			    }else
				cb(new Error("title is linked to a already used name"))
			})
		}
	    })
	}else 
	    cb(new Error("title's format is invalid"))
    }

    this.setPublishState = function(state,cb){
	var pub = this;
	if(typeof state == "boolean"){
	    pub.published  = state;
	    pub.updateThis(cb);
	}else
	    cb(new Error("publish's state must be a boolean"))
    }
    
}//end of model

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
