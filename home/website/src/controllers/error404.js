/*
* Error404 Controller
*/
var  paths = require($.paths),
    commonTreeTemplate = require( paths.models + '/commonTreeTemplate.js'),
    tempModel = require(paths.models + '/template.js');

exports.exec = function(support,errorType) {
    console.log("error",support.path);

    var queriesTemp = {
	title : "404 - Chere de prince",
	lang: "fr",
	sessionDisplay: typeof support.session.user != "undefined",
	userName:  (typeof support.session.user != "undefined")? support.session.user.name : '',
	cssLinked:[],
	jsLinked:[],
	cssSpe: false
    };

    var section ={
	id: "section",
	type: "part",
	children:{},
	queries: {
	    banniereHeader: {
		link: "/svg/bannieres/404.svg",
		alt: "La Bécasse en soucoupe volante !!! "
	    },
	    jsSpe: false
	},
	content: support.file.html.error404
    };

    commonTreeTemplate.constructTree( queriesTemp, function(tree){
	tree.children.section = section;
	tempModel.constructOutput(tree, function(output){
	    support.res.setHeader('Cache-Control','max-age=' + support.page.maxAge + ',public');
	    support.res.setHeader('Content-Type', 'text/html');
	    support.res.statusCode = 404;
	    $.require('makeTextResponse').send(output, support.headers, support.res);
	});
    });
} ;
