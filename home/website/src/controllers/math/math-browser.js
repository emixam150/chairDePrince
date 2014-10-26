/*
 *Index Controller
 */
var paths = require($.paths),
commonTreeTemplate = require( paths.models + '/commonTreeTemplate.js'),
tempModel = require(paths.models + '/template.js'),
Math = require(paths.models + '/math.js');

exports.exec = function(support) {
    //console.log(support.page.query.displayType,support.page.query.classification);
    var isDisplayGraph = typeof support.page.query.displayType == 'undefined' || support.page.query.displayType == 'graph',
    jsLinked =  (isDisplayGraph)? [{path:'https://cdn.socket.io/socket.io-1.0.3.js'},{path:'/js/sigma.min.js'}]:[];
        

    var queriesTemp = {
	title : "Mate les maths - Chere de prince",
	lang: "fr",
	figTitle: support.file.svg.figTitle_webCommon,
	topHeaderBar: support.file.svg.top_header_barCommon,
	banniereHeader :  {
	    link:"/svg/common/pimp_my_math_banniere.svg",
	    alt:"Pimp My Math"
	},
	links: [
	],
	sessionDisplay: typeof support.session.user != "undefined",
	userName:  (typeof support.session.user != "undefined")? support.session.user.name : '',
	cssLinked:[],
	jsLinked:jsLinked,
	jsSpe: false, //'<script type="application/javascript"></script>'
	cssSpe: support.file.css['math-browserSpe']
    };

    var MathBrowser = new Math(),
    limitSize = 1000;

    MathBrowser.findSort(null, { lastUpdate: -1 } ,limitSize, function(docs){
	displayMathElts(docs,function(listOfDisplayMath){
	    var section ={
		id: "section",
		type: "part",
		children:{},
		queries: {
		    isDisplayGraph: isDisplayGraph,
		    listOfResult: listOfDisplayMath
		},
		content: support.file.html.mathBrowser
	    };

	    commonTreeTemplate.constructTree( queriesTemp, function(tree){
		tree.children.section = section;
		tempModel.constructOutput(tree, function(output){
		    support.res.setHeader('Cache-Control','max-age=' + support.page.maxAge + ',public');
		    support.res.setHeader('Content-Type', 'text/html');
		    $.require('makeTextResponse').send(output, support.headers, support.res);
		});
	    });
	}); // end of displayMathElts
    }); // end of findSort
} ;

var translateTypeName = function(type){
    var result = '';
    switch(type){
    case 'prop': result = 'propriété'
	break;
    case 'th': result = 'théorème'
	break;
    case 'lem': result = 'lemme'
	break;
    case 'cor': result = 'corollaire'
	break;
    case 'def': result = 'définition'
	break;
    case 'axiom': result = 'axiome'
	break;
    case 'conj': result = 'conjecture'
	break;
    default: result = ''
	break;
    }
    return result;
};

var translateTypeColor = function(type){
    var result = 'black';
    switch(type){
    case 'prop': result = '#0D0FB6'
	break;
    case 'th': result = '#C20707'
	break;
    case 'lem': result = '#610DB6'
	break;
    case 'cor': result = '#0D0FB6'
	break;
    case 'def': result = '#0D0FB6'
	break;
    case 'axiom': result = '#CADC09'
	break;
    case 'conj': result = '#2C2C2C'
	break;
    default: result = 'pink'
	break;
    }
    return result;
};

var displayMathElts = function(mathElts, cb){
    var cpt = 0,
    listOfDisplayMath =[];
    
    function next(){
	cpt ++;
	if(cpt == mathElts.length)
	    cb(listOfDisplayMath);
    };

    if(mathElts.length == 0)
	cb(listOfDisplayMath);

    mathElts.forEach(function(eltMath){
	listOfDisplayMath.push({
	    name: eltMath.name,
	    title: eltMath.content.title,
	    colorOfType: translateTypeColor(eltMath.content.type)
	});
	next();
    });
}
