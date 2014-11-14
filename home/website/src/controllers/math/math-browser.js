/*
 *MathBrowser Controller
 */
var paths = require($.paths),
commonTreeTemplate = require( paths.models + '/commonTreeTemplate.js'),
tempModel = require(paths.models + '/template.js'),
Math = require(paths.models + '/math.js');

exports.exec = function(support) {
    //console.log(support.page.query.displayType,support.page.query.classification);
    var isDisplayGraph = typeof support.page.query.displayType == 'undefined' || support.page.query.displayType == 'graph',
    jsLinked =  (isDisplayGraph)? [{path:'https://cdn.socket.io/socket.io-1.2.0.js'},{path:'/js/sigma.min.js'}]:[];
        

    var queriesTemp = {
	title : "Mate les maths - Chere de prince",
	lang: "fr",
	figTitle: support.file.svg.logoCommon,
	banniereHeader :  {
	    link:"/svg/bannieres/pimp_my_math.svg",
	    alt:"Pimp My Math"
	},
	links: [
	],
	sessionDisplay: typeof support.session.user != "undefined",
	userName: (typeof support.session.user != "undefined")? support.session.user.name : '',
	cssLinked:[],
	jsLinked:jsLinked,
	jsSpe: false, //'<script type="application/javascript"></script>'
	cssSpe: support.file.css['math-browserSpe']
    };

    var MathBrowser = new Math(),
    limitSize = 1000,
    projection = {name: 1, 
		      'content.parents': 1, 
		      'content.children': 1,
		      'content.title': 1,
		      'content.type': 1
		     };;
    
    MathBrowser.findPlus({},projection, { lastUpdate: -1 } ,limitSize, function(docs){
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

var displayMathElts = function(mathElts, cb){
    var cpt = 0,
    listOfDisplayMath =[],
    mathStyle = new Math();
    
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
	    colorOfType: mathStyle.translateTypeColor(eltMath.content.type)
	});
	next();
    });
}
