/*
 * Admin Controller
 */
var paths = require($.paths),
    tempModel = require(paths.models + '/template.js'),
    bcrypt = $.require('bcrypt-nodejs');
var mustache = $.require('mustache'),
    log = $.require('log').log;

exports.exec = function(support) {
    post(support,get);
} ;

function post(support, getcall){
    if(typeof support.post != "undefined" && isValid(support.post)){
	if(support.post.user == 'admin' && support.post.password == 'key'){
	    support.session.admin = true;
		getcall(support);	
	    }else getcall(support);
    }else getcall(support);
    
}

function get(support){
    var accueil = {};
    accueil.acces = typeof support.session.admin != 'undefined';
    accueil.title ='';
    accueil.children = [];
    
    if(accueil.acces){
	if(support.page.query.page != '')
	    accueil.title = support.page.query.page + ' - Admin';
	else 
	    accueil.title = 'Accueil - Admin';
    }else
	accueil.title = 'Connexion - Admin';
    
    switch(support.page.query.page){
    case '': 
	if(accueil.acces){
	    require(__dirname +'/admin/accueil-left.js').exec(support,function(child){
		accueil.children.push(child);
		require(__dirname +'/admin/accueil-right.js').exec(support,function(child){
		    accueil.children.push(child);
		    require(__dirname +'/admin/accueil-center.js').exec(support,function(child){
			accueil.children.push(child);
			send(support, accueil);
		    });
		});
	    });
	}else
	    send(support, accueil);
	break;
    case 'math':
	if(accueil.acces){
	    require(__dirname+'/admin/math.js').exec(support,function(left,center,right,jsSpe){
		accueil.js = jsSpe;
		accueil.children.push(left,center,right);
		send(support,accueil);
	    });
	}else
	    send(support, accueil);
	
    }
}

function isValid(post){
    return typeof post.user != 'undefined' 
	&& post.user != ''
	&& typeof post.password != 'undefined' 
	&& post.password != '';
}

function send(support, accueil){
    var adminPage ={
	id: "head",
	type: "part",
	children: accueil.children,
	queries: {
	    title: accueil.title,
	    acces: accueil.acces,
	    jsSpe: accueil.js
	},
	content:  support.file.html.admin
		};
    
    tempModel.constructOutput(adminPage, function(output){
	support.res.setHeader('Cache-Control','max-age=' + support.page.maxAge + ',public');
	support.res.setHeader('Content-Type', 'text/html');
	$.require('makeTextResponse').send(output, support.headers, support.res);
    });
}
