/*
 * Banniere Module
*/

var paths = require($.paths),
    fs = require('fs'),
    local = paths.svg +'/bannieres'; 

    var DEFAULT = {path: local + 'banniere/math/DEFAULT.svg',
		   url: '/svg/bannieres/math/DEFAULT.svg',
		   alt: "Pimp My Math"};

/* require name and the type of the publication
*/

module.exports = function Banniere(type){
    var banniere = this;
    
    this.name = "DEFAULT";
    this.type = type;
    this.path = DEFAULT.path
    this.url = DEFAULT.url
    this.alt = DEFAULT.alt

    this.get = function(name,cb){

	isHere(local + '/' + type + '/' + name + '.svg', function(response){
	    if(response){
		banniere.path = local + '/' + type + '/' + name + '.svg';
		banniere.alt = "";
		banniere.url = '/svg/bannieres/' + type + '/' + name + '.svg';
		cb();
	    }else
		cb();
	})
    }


    this.changeName = function(newName, cb){
	var newPath  = local + '/' + banniere.type + '/' + newName + '.svg';
	if(banniere.path !== DEFAULT.path){
	    fs.rename(banniere.path, newPath, function(err){
		if(err)
		    cb(err)
		else{
		    banniere.name = newName;
		    banniere.path = newPath;
		    banniere.url = '/svg/bannieres/' + type + '/' + newName + '.svg';
		    cb();
		}
	    })
	}else
	    cb();
    }

 }

var isHere = function(path,cb){
	fs.stat(path, function(err,stat){
	    if(err)
		cb(false)
	    else
		cb(true)
	})
    }
