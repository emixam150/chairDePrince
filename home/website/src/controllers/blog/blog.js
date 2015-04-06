/*
 *Blog Controller
 */
var paths = require($.paths),
    commonTreeTemplate = require( paths.models + '/commonTreeTemplate.js'),
    tempModel = require(paths.models + '/template.js'),
    Blog = require(paths.models + '/blog.js'),
    LeadIn = require(paths.models + '/leadin.js'),
    Info = require(paths.controllers + '/blog/blog-info.js');

exports.exec = function(support) {

    var lead = new LeadIn();

    lead.getRandom('blog',function(){
	Info.exec(10,function(listOfArticle,err){
	    next(support,lead,listOfArticle,err);
	});
    });
} ;


var next = function(support,lead,listOfArticle,err){
    if(!err){
	var queriesTemp = {
	    title : "Blog - Chere de prince",
	    lang: "fr",
	    blog : true,
	    leadIn: lead.content,
	    sessionDisplay: typeof support.session.user != "undefined",
	    userName:  (typeof support.session.user != "undefined")? support.session.user.name : '',
	    cssLinked:[],//[{path:'math-elt.css'}],
	    jsLinked: [],//[{path:'http://cdn.mathjax.org/mathjax/latest/MathJax.js'}],
	    jsSpe:false
	    //bannierePath :  "images/bannieres/math.png"
	};



	var section ={
	    id: "section",
	    type: "part",
	    children: {},
	    queries: {
		listOfArticle: listOfArticle,
		jsSpe: false
	    },
	    content: support.file.html.blog
	};


	commonTreeTemplate.constructTree( queriesTemp, function(tree){
	    tree.children.section = section;
	    support.res.setHeader('Cache-Control','max-age=' + support.page.maxAge + ',public');
	    support.res.setHeader('Content-Type', 'text/html');
	    tempModel.constructOutput(tree, function(output){
		$.require('makeTextResponse').send(output, support.headers, support.res);
	    });
	});

    }else{
	require(paths.controllers +'/error404.js').exec(support);
    }

}


