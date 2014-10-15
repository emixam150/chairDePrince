var path = require('path'),
    fs = require('fs');


/*
 ** Project's paths
 **/ 
var paths = require($.paths);

/*
 ** Load routes from routes config file
 */
var routes = require(paths.config + '/routes.json');

/*
 ** Load content of all ressources files when preloading true
 **/

var sessions = {};

var file = {};

exports.load = function(next) {

    console.log('loading ressources...');
    var commonTemp = require(paths.config + '/commonTemplates.json'),
    uglifyJs = $.require('uglify-js'),
    commonSvg = paths.svg + '/common',
    mainJs = paths.js + '/main',
    mainCss = paths.css + '/main',
    speCss = paths.css + '/spe';
    var loadingLevel = 0,
	nbFileToLoad = 0;


 //Chargement des svg
    fs.readdir(commonSvg, function(err,files){
	if(err) throw err;
	for(var file in files){
	    nbFileToLoad++;
	    loadFile(path.basename(files[file], '.svg') + 'Common',commonSvg+'/'+files[file], 'svg');
	}
    });

    //chargement des js principaux
    	file.js = {};
	var listMainJs = require(mainJs +'/listmainjs.json').map(function(name){return mainJs +'/'+ name;}),
	    mainFile = uglifyJs.minify(listMainJs);
	file.js.mainJs = mainFile.code;

 //Chargement des css spe
    fs.readdir(speCss, function(err,files){
	if(err) throw err;
	for(var file in files){
	    nbFileToLoad++;
	    loadFile(path.basename(files[file], '.css') +'Spe',speCss+'/'+files[file], 'css');
	}
    });
    //chargement des css principaux
/*    file.css = {};
    var listMainCss = require(mainCss +'/listmaincss.json').map(function(name){return mainCss +'/'+ name;}),
*/	

// Chargement des sessions

    fs.readFile(paths.config +'/'+ SessionsFile, function(err, data){
	if(err) throw err;
	if(data.toString().trim() != ''){
	    nbFileToLoad ++;
	    sessionsInit(sessions,JSON.parse(data), function(){
		loadingLevel++;
	    });
	}
    });

    //au cas où le fichier session ne soit pas chargé avant les temp
    setTimeout(function(){
	if(loadingLevel == nbFileToLoad)
	    next();
    },500);

    var loadFile = function(name, path, type) {
        var option = (type !== 'image') ? 'utf8' : 'binary';
	
	if(typeof file[type] !== 'undefined'){
	    file[type][name] = '';
	}else {
	    file[type] = {};
	    file[type][name] = ''; 
	}
	
        fs.stat(path, function (err,stat) {
	    if(err) {
		if('ENOENT' == err.code) {
                    console.log(path+ ' not found');
		    loadingLevel++;
		    if(loadingLevel != -1){
			loadingLevel++;
		    }
		} else {
                    console.log(path + ' error while finding');
		    if(loadingLevel != -1){
			loadingLevel++;
		    }
		}
            }else{ 
		var stream = fs.createReadStream(path);
		stream.setEncoding(option);
		
		stream.on('data', function(chunk) {
   		    file[type][name] += chunk; 
		});
		stream.on('end', function(){
			var watcher = fs.watch(path, function(event,filename){
			    console.log(filename + ' est modifié');
			    loadFile(name, path, type);
			    watcher.close();
			});
		    if(loadingLevel != -1){
			loadingLevel ++;
		    }

		    if(loadingLevel == nbFileToLoad){
			next();
			loadingLevel = -1;
		    }
		});
            }
        });
    };
    
    for (var i in routes) {
	var indexPaths;

	if(routes[i].type == 'image') {
	    indexPaths = 'images'; 
	}else {
	    indexPaths = routes[i].type; 
	}

        var filePath = paths[indexPaths] +'/'+ routes[i].ressource;
	if(routes[i].preloading){
	    nbFileToLoad ++;
	    
            loadFile(i, filePath, routes[i].type);
	}
    }

    

    for(var temp in commonTemp) {

	    nbFileToLoad ++;
            loadFile(commonTemp[temp].id, paths.html+ '/' +commonTemp[temp].file, 'html');
    }

    return this;
};        


/*
 **entry point
 */
exports.start = function(req, res, server,body) {
    var url = require("url"),
	querystring = require("querystring");

    var support = {}; 
    support.start = this;
    support.server = server;
    support.file = file;
    support.headers = $.require("header").parse(req);
    support.cookies = $.require("cookie").parse(req);
    support.session = getSession(req, res, 'FR_fr', support.cookies, support.headers);
    support.path = url.parse(req.url).pathname;
    support.page = $.require('router').get(routes, support.path);
    support.ressourcePath = constructRessourcePath(support.page);
    support.post = querystring.parse(body);
    support.content =  constructContent(support.page);
    support.res = res;
    support.req = req;
    support.paths = paths;
    //console.log(support.page);
    //var truc = new User("becasse");
    //truc.find({},function(tab){console.log(tab);});
    //truc.removeThis();
	
    if (typeof support.page.ctrl !== 'undefined' && typeof support.page.method !== 'undefined'){
	var controller = require(paths.controllers + '/' + support.page.ctrl);
	if(controller.exec){
	    if(support.page.method.split(',').indexOf(req.method) != -1){
		if( support.page.method == 'POST'){
		    controller.exec(support);
		}else {
		    controller.exec(support);
		}
	    }else {
		res.statusCode = 405;
		res.end('Bad Method');
	    }
	} else{
	    res.statusCode = 500;
	    res.end('Error Internal Server');
	}
    }else{
	res.statusCode = 500;
	res.end('Error Internal Server');
    }



};


function constructContent(page){
    var content = null;

    if (typeof file[page.type] !== 'undefined' && 
	typeof file[page.type][page.name] !== 'undefined') {
	content = file[page.type][page.name];
    }

    return content;
}

function constructRessourcePath(page){
    var join = require('path').join;
    var ressourcePath = null;

    switch(page.type){
    case 'image':
	ressourcePath = join(paths['images'],page.file);
	/*if((ressourcePath.indexOf(paths['images']) !== 0)){
	    ressourcePath = null;
	}*/	break;
    case 'svg':
	ressourcePath = join(paths['svg'],page.file);
	/*if((ressourcePath.indexOf(paths['svg']) !== 0)){
	    ressourcePath = null;
	}*/
	break;
    case 'html' :
	ressourcePath = join(paths['html'],page.file);
	/*if((ressourcePath.indexOf(paths['html']) !== 0)){
	    ressourcePath = null;
	}*/
	break;
    case 'share':
	ressourcePath = join(paths['share'], page.file);
	break;
    default:
	break;
    }
    return ressourcePath;
}


/*
 * Sessions
*/

var TimeOfValidity = 60 * 48, //en minutes 
    SessionLog = 'frequentation.txt',
    SessionsFile = 'sessions.json',
    User = require(paths['models'] + '/user.js'),
    createCookie = $.require('cookie').create,
    events = require('events'),
    eventEmitter = new events.EventEmitter(),
    bcrypt = $.require('bcrypt-nodejs'),
    Client = $.require('client').Client;

eventEmitter.on('addUser', saveSessions);

function sessionsInit(result, data, cb){
	for(var session in data){
	    result[session] = new Session(data[session].client, data[session].user, data[session].bornDate);
    };
    setTimeout(cb,100);
}



function Session(client, user, lastDate){

    this.lastDate = lastDate;
    this.client = new Client(client.sessionIndex, 
			     client.ip, 
			     client.locale, 
			     client.userAgent, 
			     client.nReq);
    this.user = (typeof user != 'undefined')? new User(user.name,
			user.avatar,
			user.password,
			user.email,
			user.locale,
			user.bornDate,
			user.salt): undefined;
    this.sessionsEvent = eventEmitter;

    this.setUser = function(user,cb){
	this.user = user;
	eventEmitter.emit('addUser');
	if(typeof cb != "undefined") cb(this);
    };
    
}

function getSession(req, res, locale, cookies, headers){
    var session = {},
	log = $.require('log').log;
							
    if(typeof cookies.index != "undefined"){
	if(typeof sessions[String(cookies.index)] != 'undefined'){
	    session = sessions[String(cookies.index)];
	    session.lastDate = new Date().getTime();
	    session.client.incReq();
	    createCookie(res,'truc', session.client.sessionIndex, TimeOfValidity);
    
	    return session;
	}else{
	    //si on admet que ça puisse arriver
	    var newIndex = Math.pow(10,9)*Object.keys(sessions).length + Math.floor(Math.pow(10,9)*Math.random());

	    var client = new Client(newIndex, req.connection.remoteAddress, locale, headers.userAgent, 0),
		user = undefined,
		lastDate = new Date().getTime();
	    session = new Session(client, user, lastDate);
	    sessions[newIndex] = session;
	    log('new session of index: ' + newIndex, paths['logs']+'/'+SessionLog);
	    saveSessions();

	    session.client.incReq();
	    createCookie(res,'index', newIndex, TimeOfValidity);
	    return session;
	}
    }else{
	var newIndex = Math.pow(10,9)*Object.keys(sessions).length + Math.floor(Math.pow(10,9)*Math.random());

	var client = new Client(newIndex, req.connection.remoteAddress, locale, headers.userAgent, 0),
	    user = undefined,
	    lastDate = new Date().getTime();
	session = new Session(client, user, lastDate);
	sessions[newIndex] = session;
	log('new session of index: ' + newIndex, paths['logs']+'/'+SessionLog);
saveSessions();

	session.client.incReq();
	createCookie(res,'index', newIndex, TimeOfValidity);
	return session;
    }  
}


function saveSessions(){
    fs.writeFile(paths.config +'/'+ SessionsFile, JSON.stringify(sessions, null, 4), function(err) {
	if(err) throw err;
    }); 
}


setInterval(function(){
    for(var session in sessions){
	if(new Date().getTime() - sessions[session].lastDate > TimeOfValidity * 60*1000)
	    delete sessions[session];
	}
    setTimeout(function(){
	console.log(sessions);
	saveSessions();
    },100);
},30*60*1000); //toute les demi heures
