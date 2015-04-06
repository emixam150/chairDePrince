/*
 * Blog's Model 
 */
var dbName = "main",
    enName = "blog",
    Publication = require(__dirname +'/publication.js');


module.exports = function Blog() {
    
    Publication.call(this, enName, dbName );

    this.content.tree =  {
     	"id": "section",
     	"content": "",
     	"children": {
	    "article": {
		"id": "article",
		"type": "part",
		"content":"",
		"children":{},
		"queries":{}
	    }
	},
     	"queries":{}
    }

this.content.advert = ""




    this.addIntro = function(cb){
	var blog = this
	blog.getById(blog._id, function(err){ //mise a jour 
	    if(err)
		cb(err)
	    else 
		//on ajoute une partie non présente
		if(!blog.content.tree.children.intro ){
		    blog.content.tree.children.intro = {
			"id": "intro",
			"type": "part",
			"content":"",
			"children":{},
			"queries":{}
		    }
		    blog.updateThis(cb)
		}else
		    cb(new Error("intro already exists or isn't correct"))
	})
    }

    this.rmIntro = function(cb){
	var blog = this
	blog.getById(blog._id, function(err){ //mise a jour 
	    if(err)
		cb(err)
	    else 
		//on supprime l'intro déjà présente
		if(blog.content.tree.children.intro ){
		    delete blog.content.tree.children.intro
		    blog.updateThis(cb)
		}else
		    cb(new Error("intro don't exists"))
	})
    }


    this.updateSubTree = function(sectionKey, newContent,cb){
	var blog = this
	blog.getById(blog._id, function(err){ //mise a jour 
	    if(err)
		cb(err)
	    else 
		if(blog.content.tree.children[sectionKey] && (newContent || typeof newContent == "string")){
		    blog.content.tree.children[sectionKey].content = String(newContent)
		    blog.updateThis(cb)
		}else
		    cb(new Error("Content or keySection isn't correct"))
	})
    }

    this.updateAdvert = function(newContent,cb){
	var blog = this
	blog.getById(blog._id, function(err){ //mise a jour 
	    if(err)
		cb(err)
	    else 
		if(newContent || typeof newContent == "string"){
		    blog.content.advert = String(newContent)
		    blog.updateThis(cb)
		}else
		    cb(new Error("Content or keySection isn't correct"))
	})
    }


};

var ObjIdArrToStrArr = function(objArr,cb){
    var strArr = [],
    cpt = 0
    objArr.forEach(function(ObjectId,index){
	strArr[index]=String(ObjectId)
	cpt++
	if(cpt == objArr.length)
	    cb(strArr)
    })
    if(objArr.length == 0)
	cb(strArr)
}
