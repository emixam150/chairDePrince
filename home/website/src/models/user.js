/*
 * Model user
 */
var dbName = "main",
    enName = "user",
    MongoSession = require(__dirname +'/mongoSession.js'),
    bcrypt = $.require('bcrypt-nodejs');


module.exports = function User(name, avatar, password, email, locale, bornDate, salt) {
    
    MongoSession.call(this, enName, dbName);

    this.name = (typeof name !='undefined')? name : '';
    this.avatar = (typeof avatar !='undefined')? avatar : '';
    this.password = (typeof password !='undefined')? password : '';
    this.email = (typeof email !='undefined')?  email : '';
    this.locale = (typeof locale !='undefined')? locale : 'FR_fr';
    this.bornDate =(typeof bornDate !='undefined')? bornDate : new Date();
    this.salt = (typeof salt !='undefined')? salt : '';

    this.addThis = function(callback){ 
	var self = this,
	    query = { name: this.name};
	this.find(query, function(docs){
	    if(docs.length == 0){
		self.add(self, function(){
		    callback(self);
		});
	    }
	    else
		callback();
	});
    };
    
    this.updateThis = function(newuser, cb){
	var user = this,
	    query = { name: this.name};
	user.update(query, newuser, function(result){
	    if(result != 0)
		cb(user);
	    else
		cb();
	});
    };
    this.removeThis = function(){ this.remove({'name':this.name}); };

    this.setName = function(name){
	if(name != '')
	    this.name = String(name);
    };

    this.setPassword = function(password){
	this.password = password;
    };

    this.setEmail = function(email){
	this.email = (typeof email != 'undefined') ? String(email) : '';
    };

    this.setBornDate = function(date){
	this.date.setDate(date);
    };
    
    this.setSalt = function(salt){
	this.salt = (typeof salt != 'undefined') ? String(salt) : '';
    };    
    
    this.set = function(user,callback){
	this.setName(user.name);
	this.setPassword(user.password);
	this.setEmail(user.email);
	this.setSalt(user.salt);
	if(typeof user._id !='undefined') this._id = user._id;
	callback(this);
    };

    this.getByName = function(name,callback){
	var user = this,
	    query = {"name": name};
	this.find(query ,function(docs){
	    if(docs.length != 0)
		user.set(docs[0],callback);
	    else callback();
	});
    };

    this.hashPassword = function(cb){
	var user = this;
	bcrypt.genSalt(12, function(err, salt){
	    user.salt = salt;
	    bcrypt.hash(user.password, salt, null ,function(err, hash){
		user.password = hash;
		cb(user);
	    });
	});
    };

    this.authenticate = function(name, password, cb){
	this.getByName(name,function(user){
	    if(typeof user == "undefined") cb();
	    else
		bcrypt.compare(password, user.password, function(err, res){
		    if(res){
			cb(user);
		    }else cb();
		});
	});
    };
};
