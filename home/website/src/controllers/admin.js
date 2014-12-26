/*
 * Admin Controller
 */
var paths = require($.paths),
    tempModel = require(paths.models + '/template.js'),
    bcrypt = $.require('bcrypt-nodejs');
var mustache = $.require('mustache'),
    log = $.require('log').log,
    error404 = require(paths.controllers + '/error404.js');

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
    accueil.children = {};
    
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
		accueil.children.left = child;
		require(__dirname +'/admin/accueil-right.js').exec(support,function(child){
		    accueil.children.right = child;
		    require(__dirname +'/admin/accueil-center.js').exec(support,function(child){
			accueil.children.center = child;
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
		accueil.children.left = left
		accueil.children.center = center
		accueil.children.right = right
		send(support,accueil);
	    });
	}else{
	    support.res.statusCode = '401';
	    send(support, accueil);
	}
	break;
    case 'leadin':
	if(accueil.acces){
	    require(__dirname+'/admin/leadin.js').exec(support,function(left,center,right,jsSpe){
		accueil.js = jsSpe;
		accueil.children.left = left
		accueil.children.center = center
		accueil.children.right = right
		send(support,accueil);
	    });
	}else{
	    support.res.statusCode = '401';
	    send(support, accueil);
	}
	break;

    default:
	error404.exec(support);
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
