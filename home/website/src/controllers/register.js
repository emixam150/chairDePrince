/*
 * Register Controller
 */
var paths = require($.paths),
    mustache = $.require('mustache'),
    log = $.require('log').log,
    User = require(paths.models + '/user.js'),
    commonTreeTemplate = require( paths.models + '/commonTreeTemplate.js'),
    tempModel = require(paths.models + '/template.js');

exports.exec = function(support) {

    post(support,get);

} ;

function post(support,getcall){
    if(typeof support.post != "undefined" && isValid(support.post)){
	var user = new User(support.post.name, 
			    undefined, 
			    support.post.password,
			    support.post.email,
			    undefined,
			    undefined,
			    undefined);

	/*user.setName(support.post.name);
	user.setPassword(support.post.password);
	user.setEmail(support.post.email);*/
	user.hashPassword(function(newuser){
	    newuser.addThis(function(added){
		if(typeof added != 'undefined')
		    log("new user " + user.name, support.paths['logs']+'/'+ 'registration.txt');
		support.session.setUser(added,function(){
		    getcall(support);
		});
	    });
	});
    }else getcall(support);
}

function get(support){
    var queriesTemp = {
	title : "Inscription - Chere de prince",
	lang: "fr",
	links: [
	],
	sessionDisplay: typeof support.session.user != "undefined",
	userName :  (typeof support.session.user != "undefined")? support.session.user.name : ''
    };
    
    var section ={
	id: "section",
	type: "part",
	children:[],
	queries: {
	},
	content: support.file.html.register
    };

    commonTreeTemplate.constructTree( queriesTemp, function(tree){
	tree.children.push(section);
	tempModel.constructOutput(tree, function(output){
	    support.res.setHeader('Cache-Control','max-age=' + support.page.maxAge + ',public');
	    support.res.setHeader('Content-Type', 'text/html');
	    $.require('makeTextResponse').send(output, support.headers, support.res);
	});
    });
}


function isValid(post){
    return typeof post.name != 'undefined' 
	&& post.name != ''
	&& typeof post.password != 'undefined' 
	&& post.password != ''
	&& post.password == post.confirmPass;
}
