/*
 * Login Controller
*/
var paths = require($.paths),
    commonTreeTemplate = require( paths.models + '/commonTreeTemplate.js'),
    tempModel = require(paths.models + '/template.js');
var mustache = $.require('mustache'),
    log = $.require('log').log,
    User = require('../models/user.js');

exports.exec = function(support) {
    post(support,get);
} ;

function post(support, getcall){
    if(typeof support.post != "undefined" && isValid(support.post)){
	var newUser = new User();
	//newUser.getByName("becasse",function(user){user.removeThis();});
	
	newUser.authenticate(support.post.name, support.post.password, function(user){
	    if(typeof user != "undefined"){
		support.session.setUser(user, function(){
		    getcall(support);
		});
		log("new login " + user.name, support.paths['logs']+'/'+ 'login.txt');
	    }else getcall(support);
	});			 
    }else getcall(support);
}

function get(support){

    var queriesTemp = {
	title : "Connection - Chere de prince",
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
	},
	content: support.file.html.login
    };

    commonTreeTemplate.constructTree(queriesTemp, function(tree){

	tree.children.section = section;
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
	&& post.password != '';
}
