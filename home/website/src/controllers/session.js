/*
 * Session Controller
 */
var mustache = $.require('mustache'),
    http = require('http');
var paths = require($.paths),
    commonTreeTemplate = require( paths.models + '/commonTreeTemplate.js'),
    tempModel = require(paths.models + '/template.js'),
    User = require(paths.models + '/user.js');

exports.exec = function(support) {
    if( typeof support.session.user !== 'undefined'){
	post(support, get);
    }else{
	support.content = support.file['html']['error404'];
	require(paths.controllers +'/error404.js').exec(support);
    }
};

function post(support, callget){
    if(typeof support.post && isValidModifPost(support.post)){
	var newUser = new User();
	if(support.post.password == ''){
	    newUser.getByName(support.session.user.name, function(){
		newUser.setName(support.post.name);
		newUser.setEmail(support.post.email);
		support.session.user.updateThis(newUser,function(){
		    support.session.setUser(newUser,function(){
			callget(support);
		    });
		});
	    });
	}else{
	    newUser.authenticate(support.session.user.name, support.post.oldPassword,function(auth){
		if(typeof auth != 'undefined'){
		    newUser.setName(support.post.name);
		    newUser.setEmail(support.post.email);
		    newUser.setPassword(support.post.password);
		    newUser.hashPassword(function(){
			support.session.user.updateThis(newUser,function(){
			    support.session.setUser(newUser,function(){
				callget(support);
			    });
			});
		    });
		}else
		    callget(support);
	    });
	}
    }else if(isValidDeco(support.post)){

	support.session.setUser(undefined,function(){
	    support.res.writeHead(301,
				  {Location: '/'}
				 );
	    support.res.end();
	});
    }else
	callget(support);
};

function isValidModifPost(post){
    return typeof post.name != 'undefined' 
	&& post.name != ''
	&& typeof post.email != 'undefined' 
	&& post.email != ''
	&& ((post.password =='' && post.oldPassword =='')
	    || (post.password != '' && post.password != ''))
	&& post.password == post.confirmPass;
};

function isValidDeco(post){
    return typeof post.deco != 'undefined';
};

function get(support){

    var queriesTemp = {
	title : "Votre compte - Chere de prince",
	lang: "fr",
	links: [
	],
	sessionDisplay: typeof support.session.user != "undefined",
	userName :  (typeof support.session.user != "undefined")? support.session.user.name : ''
    };

    var section ={
	id: "section",
	type: "part",
	children:{},
	queries: {
	    name: support.session.user.name,
	    email: support.session.user.email,
	    ip: support.session.client.ip,
	    userAgent: support.session.client.userAgent,
	    nbReq: support.session.client.nbReq
	},
	content: support.file.html.session
    };
    commonTreeTemplate.constructTree( queriesTemp, function(tree){
	tree.children.section = section ;
	tempModel.constructOutput(tree, function(output){
	    support.res.setHeader('Cache-Control','max-age=' + support.page.maxAge + ',public');
	    support.res.setHeader('Content-Type', 'text/html');
	    $.require('makeTextResponse').send(output, support.headers, support.res);
	});
    });

}
