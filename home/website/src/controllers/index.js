/*
 *Index Controller
 */
var paths = require($.paths),
    commonTreeTemplate = require( paths.models + '/commonTreeTemplate.js'),
    tempModel = require(paths.models + '/template.js');

exports.exec = function(support) {
    var queriesTemp = {
	title : "index - Chere de prince",
	lang: "fr",
	figTitle: support.file.svg.figTitle_webCommon,
	topHeaderBar: support.file.svg.top_header_barCommon,
	banniereHeader : false,
	links: [
	],
	sessionDisplay: typeof support.session.user != "undefined",
	userName:  (typeof support.session.user != "undefined")? support.session.user.name : '',
	cssLinked:[],
	jsLinked:[],
	jsSpe: false,// '<script type="application/javascript"></script>'
	cssSpe: support.file.css.indexSpe
    };

    var section ={
	id: "section",
	type: "part",
	children:{},
	queries: {
	},
	content: support.file.html.index
    };
    commonTreeTemplate.constructTree( queriesTemp, function(tree){
	tree.children.section = section;
	tempModel.constructOutput(tree, function(output){
	    support.res.setHeader('Cache-Control','max-age=' + support.page.maxAge + ',public');
	    support.res.setHeader('Content-Type', 'text/html');
	    $.require('makeTextResponse').send(output, support.headers, support.res);
	});
    });
} ;
