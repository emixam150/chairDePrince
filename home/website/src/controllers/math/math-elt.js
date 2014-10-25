/*
 *Math Controller
 */
var paths = require($.paths),
commonTreeTemplate = require( paths.models + '/commonTreeTemplate.js'),
tempModel = require(paths.models + '/template.js'),
Math = require(paths.models + '/math.js'),
mathEltDisplay = require('./math-elt-display.js');

exports.exec = function(support) {
    var mathElt = new Math();
    mathElt.getByName(support.page.query.eltName, function(err,result){
	if(!err){

	    mathEltDisplay.exec(mathElt, support.file.html['math-elt'], function(section){
		var queriesTemp = {
		    title : mathElt.content.title + " - Math - Chere de prince",
		    lang: "fr",
		    figTitle: support.file.svg.figTitle_webCommon,
		    topHeaderBar: support.file.svg.top_header_barCommon,
		    banniereHeader: {
			link:"/svg/common/pimp_my_math_banniere.svg",
			alt:"Pimp My Math"
		    },
		    links: [
		    ],
		    sessionDisplay: typeof support.session.user != "undefined",
		    userName:  (typeof support.session.user != "undefined")? support.session.user.name : '',
		    cssLinked:[{path:'math.css'}],
		    jsLinked:[{path:'http://cdn.mathjax.org/mathjax/latest/MathJax.js'}],
		    jsSpe:false
		};


		commonTreeTemplate.constructTree( queriesTemp, function(tree){
		    tree.children.section = section;
		    tempModel.constructOutput(tree, function(output){
			support.res.setHeader('Cache-Control','max-age=' + support.page.maxAge + ',public');
			support.res.setHeader('Content-Type', 'text/html');
			$.require('makeTextResponse').send(output, support.headers, support.res);
		    });
		});
	    });

	}else{
	    require(paths.controllers +'/error404.js').exec(support);
	}

    }); // end of matheltDisplay
} ;

