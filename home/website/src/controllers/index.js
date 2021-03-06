/*
 *Index Controller
 */
var paths = require($.paths),
    commonTreeTemplate = require( paths.models + '/commonTreeTemplate.js'),
    tempModel = require(paths.models + '/template.js'),
    LeadIn = require(paths.models + '/leadin.js'),
    Info = require(paths.controllers + '/blog/blog-info.js');

exports.exec = function(support) {

    console.log("accueil");

    var leadIn = new LeadIn();

    leadIn.getRandom('accueil', function(){
    Info.exec(2,function(listOfArticle,err){
	
	var queriesTemp = {
	    title : "Accueil - Chère de prince",
	    lang: "fr",
	    index: true,
	    leadIn: leadIn.content,
	    sessionDisplay: typeof support.session.user != "undefined",
	    userName:  (typeof support.session.user != "undefined")? support.session.user.name : '',
	    cssLinked:[],
	    jsLinked: [{path:'https://cdn.socket.io/socket.io-1.2.0.js'},{path:'/js/sigma.min.js'}],//[{path: /path.js}],
	    cssSpe: support.file.css.indexSpe,
	    jsSpe:  support.file.js['accueil-mathSpe'],
	    bannierePath :  "images/bannieres/accueil.png",
	    stat: true
	};
	
	var section ={
	    id: "section",
	    type: "part",
	    children:{},
	    queries: {
		banniereHeader: {
		    link: "/svg/bannieres/tunnel.svg",
		    alt: "Tunnel vers la becasserie"
		},
		listOfArticle : listOfArticle,
		jsSpe: 'l'
	    },
	    content: support.file.html.index
	};
	
	commonTreeTemplate.constructTree( queriesTemp, function(tree){
	    
	    tree.children.section = section;
	    support.res.setHeader('Cache-Control','max-age=' + support.page.maxAge + ',public');
	    support.res.setHeader('Content-Type', 'text/html');
	    tempModel.constructOutput(tree, function(output){
		$.require('makeTextResponse').send(output, support.headers, support.res);
	    });
	});
    }); //end of Info 
    });
};
