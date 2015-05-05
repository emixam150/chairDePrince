/*
 *Blog Controller
 */
var paths = require($.paths),
commonTreeTemplate = require( paths.models + '/commonTreeTemplate.js'),
tempModel = require(paths.models + '/template.js'),
Blog = require(paths.models + '/blog.js'),
LeadIn = require(paths.models + '/leadin.js');

exports.exec = function(support) {

    console.log("blog-elt",support.path);
    var lead = new LeadIn();

    lead.getRandom('blog',function(){
	var blogPage = new Blog();	

	blogPage.getByName(support.page.query.articleName, function(err,result){
	    next(support,lead,blogPage,result,err);
	})
	
    });
} ;


var next = function(support,lead,blogPage,docs,err){
    if(!err){
	var queriesTemp = {
	    title : blogPage.content.title + " - Blog - Chere de prince",
	    lang: "fr",
	    blog : true,
	    leadIn: lead.content,
	    sessionDisplay: typeof support.session.user != "undefined",
	    userName:  (typeof support.session.user != "undefined")? support.session.user.name : '',
	    cssLinked:[],//[{path:'math-elt.css'}],
	    jsLinked: [],//[{path:'http://cdn.mathjax.org/mathjax/latest/MathJax.js'}],
	    jsSpe:false,
	    bannierePath:  "images/bannieres/blog/petite_introduction.png",
	    stat: blogPage.published
	};

	var section ={
	    id: "section",
	    type: "part",
	    children: (typeof blogPage.content.tree != 'undefined')? blogPage.content.tree.children: {},
	    queries: {
		banniereHeader: {
		    link: blogPage.banniere.url,
		    alt: blogPage.banniere.alt
		},
		jsSpe: false,
		title: blogPage.content.title
	    },
	    content: support.file.html['blog-elt']
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

var publishedOrNot = function(support,lead,blogPage,docs,k){
    if(docs[k])
	blogPage.getByName(docs[k].name, function(err,result){
	    if(blogPage.published)
		next(support,lead,blogPage,docs,err);
	    else
		publishedOrNot(support,lead,blogPage,docs,k+1);
	})
    else
	next(support,lead,blogPage,docs,true);
}
