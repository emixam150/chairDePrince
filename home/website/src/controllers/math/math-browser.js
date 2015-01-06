/*
 *MathBrowser Controller
 */
var paths = require($.paths),
    commonTreeTemplate = require( paths.models + '/commonTreeTemplate.js'),
    tempModel = require(paths.models + '/template.js'),
    Math = require(paths.models + '/math.js'),
    LeadIn = require(paths.models + '/leadin.js');

exports.exec = function(support) {

    console.log(support.path);

    var leadIn = new LeadIn();

    leadIn.getRandom('math',function(){

	var isDisplayGraph = typeof support.page.query.displayType == 'undefined' || support.page.query.displayType == 'graph',
	    jsLinked =  (isDisplayGraph)? [{path:'https://cdn.socket.io/socket.io-1.2.0.js'},{path:'/js/sigma.min.js'}]:[];
        

	var queriesTemp = {
	    title : "Graphe tes Maths - Chère de prince",
	    lang: "fr",
	    math: true,
	    leadIn: leadIn.content,
	    sessionDisplay: typeof support.session.user != "undefined",
	    userName: (typeof support.session.user != "undefined")? support.session.user.name : '',
	    cssLinked: [],
	    jsLinked: jsLinked,
	    jsSpe:  support.file.js['math-browserSpe']
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
			banniereHeader: {
			    link:"/svg/bannieres/pimp_my_math.svg",
			    alt:"Pimp My Math"
			},
			cssSpe: support.file.css['math-browserSpe'],
			isDisplayGraph: isDisplayGraph,
			listOfResult: listOfDisplayMath
		    },
		    content: support.file.html.mathBrowser
		};

		commonTreeTemplate.constructTree( queriesTemp, function(tree){
		    tree.children.section = section;
		    support.res.setHeader('Cache-Control','max-age=' + support.page.maxAge + ',public');
		    support.res.setHeader('Content-Type', 'text/html');
		    tempModel.constructOutput(tree, function(output){
			$.require('makeTextResponse').send(output, support.headers, support.res);
		    });
		});
	    }); // end of displayMathElts
	}); // end of findSort
    });
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
