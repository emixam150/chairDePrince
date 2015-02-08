/*
 *Math Controller
 */
var paths = require($.paths),
    commonTreeTemplate = require( paths.models + '/commonTreeTemplate.js'),
    tempModel = require(paths.models + '/template.js'),
    Math = require(paths.models + '/math.js'),
    mathEltDisplay = require('./math-elt-display.js'),
    LeadIn = require(paths.models + '/leadin.js');

exports.exec = function(support) {

    console.log(support.path);

    var lead = new LeadIn();

    lead.getRandom('math',function(){

	console.log('outLead')

	var mathElt = new Math();
	mathElt.getByName(support.page.query.eltName, function(err,result){
	    if(!err){
console.log(result);
		mathEltDisplay.exec(mathElt, support.file.html['math-elt'], function(section){
		    var queriesTemp = {
			title : mathElt.content.title + " - Math - Chere de prince",
			lang: "fr",
			math: true,
			leadIn: lead.content,
			sessionDisplay: typeof support.session.user != "undefined",
			userName:  (typeof support.session.user != "undefined")? support.session.user.name : '',
			cssLinked:[{path:'math-elt.css'}],
			jsLinked:[{path:'http://cdn.mathjax.org/mathjax/latest/MathJax.js'}],
			jsSpe:false,
			bannierePath :  "images/bannieres/math.png"
		    };


		    commonTreeTemplate.constructTree( queriesTemp, function(tree){
			tree.children.section = section;
			support.res.setHeader('Cache-Control','max-age=' + support.page.maxAge + ',public');
			support.res.setHeader('Content-Type', 'text/html');
			tempModel.constructOutput(tree, function(output){
			    $.require('makeTextResponse').send(output, support.headers, support.res);
			});
		    });
		});

	    }else{
		require(paths.controllers +'/error404.js').exec(support);
	    }

	}); // end of matheltDisplay
    });
} ;

