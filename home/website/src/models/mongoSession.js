/*
 *Fonctions mongo
*/

var Db = $.require('mongodb').Db,
    MongoClient = $.require('mongodb').MongoClient,
    Server = $.require('mongodb').Server,
    ReplSetServers = $.require('mongodb').ReplSetServers,
    ObjectID = $.require('mongodb').ObjectID,
    Binary = $.require('mongodb').Binary,
    GridStore = $.require('mongodb').GridStore,
    Grid = $.require('mongodb').Grid,
    Code = $.require('mongodb').Code,
    BSON = $.require('mongodb').pure().BSON,
    assert = require('assert'),

    paths = require($.paths),
    enConf = require(paths.config + '/entities.json'),
    dbConf = require(paths.config + '/db.json');


module.exports = function(enName,dbName){
    this.add = function(objet, callback){
	add(objet, enName, dbName, callback);
    };

    this.find = function(query, callback){
	find(query,enName,dbName, callback);
    };

    this.findSort = function(query, sortQuery, limit, cb){
	findSort(query, sortQuery, limit,enName, dbName, cb)
    }
    this.remove = function(query){
	remove(query,enName,dbName);
    };

    this.update = function(selector, document, cb){
	update(selector,document,enName,dbName,cb);
    }; 
}

function add(objet,enName, dbName, callback){
    var db = new Db(enConf[enName].base, new Server(dbConf[dbName].host, dbConf[dbName].port), {safe: true});

    db.open(function(err, db) {
	assert.equal(null,err);
	    var collection = db.collection(enConf[enName].collection);
	    
	    collection.insert(objet,function(err, inserted){
		if(err) throw err;
		db.close();
		if(typeof callback !== "undefined") callback();
	    });
	});
};

function update(selector, document, enName, dbName, callback){
    var db = new Db(enConf[enName].base, new Server(dbConf[dbName].host, dbConf[dbName].port), {safe: true});

    db.open(function(err, db) {
	assert.equal(null,err);
	    var collection = db.collection(enConf[enName].collection);
	    collection.count(selector, function(err, count){
		if(err) throw err;
		if(count == 1){
		    collection.update(selector, document, function(err, result){
			if(err) throw err;
			db.close();
			if(typeof callback !== "undefined") callback(result);
		    });
		}else
		    if(typeof callback !== "undefined") callback(0);
	    });
	});
};

function remove(query,enName, dbName){
    var db = new Db(enConf[enName].base, new Server(dbConf[dbName].host, dbConf[dbName].port), {safe: true});

    db.open(function(err, db) {
	assert.equal(null,err);
	    var collection = db.collection(enConf[enName].collection);
	    
	    collection.findAndRemove(query,function(err, result){
		if(err) throw err;
		db.close();
	    });
	});
};

function find(query, enName, dbName,callback){
    var db = new Db(enConf[enName].base, new Server(dbConf[dbName].host, dbConf[dbName].port), {safe: true});

    db.open(function(err, db) {
	assert.equal(null,err);
	var collection = db.collection(enConf[enName].collection);
	
	collection.find(query).toArray(function(err, docs) { 
	    if(err) throw err;
	    db.close();
	    callback(docs);
	});
    });
};

function findSort(query, sortQuery, limitSize,  enName, dbName, callback){
    var db = new Db(enConf[enName].base, new Server(dbConf[dbName].host, dbConf[dbName].port), {safe: true});

    db.open(function(err, db) {
	assert.equal(null,err);
	var collection = db.collection(enConf[enName].collection);
	
	collection.find(query).sort(sortQuery).limit(limitSize).toArray(function(err, docs) { 
	    if(err) throw err;
	    db.close();
	    callback(docs);
	});
    });
};

function reIndex(enName, dbName){
    var db = new Db(enConf[enName].base, new Server(dbConf[dbName].host, dbConf[dbName].port), {safe: true});

    db.open(function(err, db) {
	assert.equal(null,err);
	db.reIndex(enConf[enName].collection, function(error, result){
	    assert.equal(null, err);
            assert.equal(true, result); 
	});
    });
};
